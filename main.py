from pathlib import Path
from typing import Annotated, Any, Dict, Optional

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from pymongo import MongoClient
import os

from providers import google_routes, tm_get_event, tm_search_events

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "projekt_db")

app= FastAPI()
client = MongoClient(MONGO_URI)
try:
    client.admin.command("ping")
    print("MongoDB connected")
except Exception as e:
    print(f"MongoDB connection error: {e}")


db = client[MONGO_DB]
users_collection = db["users"]
events_collection = db["events"]

users_collection.create_index("username", unique=True)

def fake_hash_password(password:str):
    return "hash" + password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class UserInput(BaseModel):
    username: str
    password: str
    fullname: Optional[str] = None
    email: Optional[str] = None

class UserInDB(BaseModel):
    username: str
    fullname: Optional[str] = None
    email: Optional[str] = None
    disabled: bool = False
    hashed_password: str

class DeleteUserRequest(BaseModel):
    password: str

class TransportSearchRequest(BaseModel):
    from_city: str
    to_city: str
    depart_date: str


#CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() == "true"
    return bool(value)

def _doc_to_user(user_doc: Dict[str, Any]) -> UserInDB:
    return UserInDB(
        username=user_doc["username"],
        fullname=user_doc.get("fullname"),
        email=user_doc.get("email"),
        disabled=_to_bool(user_doc.get("disabled", False)),
        hashed_password=user_doc["hashed_password"],
    )

def _next_user_id() -> str:
    max_id = 0
    for doc in users_collection.find({}, {"_id": 1}):
        try:
            max_id = max(max_id, int(str(doc["_id"])))
        except (ValueError, TypeError):
            continue
    return str(max_id + 1)

def get_user_by_id(user_id: str):
    user_dict = users_collection.find_one({"_id": user_id})
    if not user_dict:
        return None
    return _doc_to_user(user_dict)

def find_user_id_by_username(username: str) -> Optional[str]:
    user_doc = users_collection.find_one({"username": username}, {"_id": 1})
    if not user_doc:
        return None
    return str(user_doc["_id"])

def username_taken(username: str) -> bool:
    _, u = get_user_by_username(username)
    return u is not None

def get_user_by_username(username: str):
    user_doc = users_collection.find_one({"username": username})
    if not user_doc:
        return None, None
    return str(user_doc["_id"]), _doc_to_user(user_doc)

def fake_decode_token(token: str) -> Optional[UserInDB]:
    return get_user_by_id(token)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserInDB:
    user = fake_decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_active_user(
        current_user: Annotated[UserInDB, Depends(get_current_user)],
) -> UserInDB:
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user_id = find_user_id_by_username(form_data.username)
    if not user_id:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    user_doc = users_collection.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    user = _doc_to_user(user_doc)
    if fake_hash_password(form_data.password) != user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": user_id, "token_type": "bearer"}

@app.get("/user")
async def read_user_me(current_user: Annotated[UserInDB, Depends(get_current_active_user)]):
    data = current_user.model_dump()
    data.pop("hashed_password", None)
    return data

async def _safe_tm_call(coro):
    try:
        return await coro
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Wydarzenie nie znalezione")
        raise HTTPException(status_code=502, detail=f"Blad Ticketmaster: {e.response.status_code}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Ticketmaster nieosiagalny: {e}")


@app.get("/events")
async def read_events(
    city: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    country: Optional[str] = Query("PL"),
    size: int = Query(12, ge=1, le=50),
):
    events = await _safe_tm_call(
        tm_search_events(city=city, keyword=keyword, country_code=country, size=size)
    )
    return {"events": events}


@app.get("/events/search")
async def read_events_search(
    city: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    country: Optional[str] = Query("PL"),
    size: int = Query(20, ge=1, le=50),
):
    if not (city or keyword or date):
        raise HTTPException(status_code=400, detail="Podaj miasto, date lub fraze")
    events = await _safe_tm_call(
        tm_search_events(city=city, date_iso=date, keyword=keyword, country_code=country, size=size)
    )
    return {"events": events}


@app.get("/events/{event_id}")
async def read_one_event(event_id: str):
    return await _safe_tm_call(tm_get_event(event_id))


@app.post("/travel/transport/search")
async def search_transport(req: TransportSearchRequest):
    if not req.from_city or not req.to_city or not req.depart_date:
        raise HTTPException(status_code=400, detail="from_city, to_city i depart_date sa wymagane")
    try:
        offers = await google_routes(req.from_city, req.to_city, req.depart_date)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Blad Google: {e.response.status_code}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Google nieosiagalny: {e}")
    return {"options": offers}


@app.post("/register")
async def register_user(user: UserInput):
    if username_taken(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    new_id = _next_user_id()
    user_doc = {
        "_id": new_id,
        "username": user.username,
        "fullname": user.fullname,
        "email": user.email,
        "disabled": False,
        "hashed_password": fake_hash_password(user.password),
    }
    users_collection.insert_one(user_doc)
    return {"status": "User registered successfully", "user_id": new_id}

@app.delete("/delete_user")
async def delete_user(password: DeleteUserRequest, token: Annotated[str, Depends(oauth2_scheme)]):
    user_id = token
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if fake_hash_password(password.password) != user.get("hashed_password"):
        raise HTTPException(status_code=400, detail="Incorrect password")

    users_collection.delete_one({"_id": user_id})

    return {"status": "User deleted successfully"}

@app.put("/update_user")
async def update_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        user_input: UserInput,
):
    user_id = token
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_input.username:
        user["username"] = user_input.username
    if user_input.fullname:
        user["fullname"] = user_input.fullname
    if user_input.email:
        user["email"] = user_input.email
    if user_input.password:
        user["hashed_password"] = fake_hash_password(user_input.password)

    users_collection.replace_one({"_id": user_id}, user)

    return {"status": "User updated successfully"}
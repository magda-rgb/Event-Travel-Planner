import json
from pathlib import Path
from typing import Annotated, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, status, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import HTTPException, status
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Always load .env from the project directory (same folder as main.py).
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

EVENTS_FILE = "events.json"

def load_events() -> Dict[str, Dict[str, Any]]:
    with open(EVENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_events(events: Dict[str, Dict[str, Any]]):
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2)

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

def matches(event_name:str, data: Dict[str, Any], q: str) -> bool:
    haystack = " ".join([
        event_name,
        str(data.get("miejsce","")),
        str(data.get("data","")),
        str(data.get("rodzaj","")),
        str(data.get("organizator","")),
    ]).lower()
    return q in haystack


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

@app.get("/events")
async def read_events():
    return load_events()

@app.get("/events/search")
async def read_events_search(q: str =Query(...,min_length=1)):
    q_norm = q.strip().lower()
    events = load_events()

    filtered_events = {
        name: data
        for name, data in events.items()
        if matches(name,data, q_norm)
    }
    return filtered_events

@app.get("/event")
async def read_one_event(q: str = Query(..., min_length=1)):
    events = load_events()
    event = events.get(q)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

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
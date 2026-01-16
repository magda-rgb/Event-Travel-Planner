import json
from typing import Annotated, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, Depends, status, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import HTTPException, status


app= FastAPI()

USERS_FILE = "users.json"
EVENTS_FILE = "events.json"

def load_users() -> Dict[str, Dict[str, Any]]:
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_users(users: Dict[str, Dict[str, Any]]):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

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


def get_user_by_id(db: Dict[str, Dict[str, Any]], user_id: str):
    user_dict = db.get(user_id)
    if not user_dict:
        return None
    return UserInDB(**user_dict)

def find_user_id_by_username(db: Dict[str, Dict[str, Any]], username: str) -> Optional[str]:
    return next((uid for uid, u in db.items() if u.get("username") == username), None)

def username_taken(db: Dict[str, Dict[str, Any]], username: str) -> bool:
    _, u = get_user_by_username(db, username)
    return u is not None

def get_user_by_username(db, username:str):
    for user_id, user_dict in db.items():
        if user_dict.get("username") == username:
            return user_id, UserInDB(**user_dict)
    return None, None

def fake_decode_token(token: str) -> Optional[UserInDB]:
    db = load_users()
    return get_user_by_id(db, token)

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
    db = load_users()

    user_id = find_user_id_by_username(db, form_data.username)
    if not user_id:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    user = UserInDB(**db[user_id])
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
    db = load_users()

    if username_taken(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    new_id = str(max([int(k) for k in db.keys()]+[0]) + 1)

    db[new_id] = {
        "username": user.username,
        "fullname": user.fullname,
        "email": user.email,
        "disabled": False,
        "hashed_password": fake_hash_password(user.password),
    }

    save_users(db)
    return {"status": "User registered successfully", "user_id": new_id}

@app.delete("/delete_user")
async def delete_user(password: DeleteUserRequest, token: Annotated[str, Depends(oauth2_scheme)]):
    db = load_users()

    user_id = token
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")

    user = db[user_id]
    if fake_hash_password(password.password) != user.get("hashed_password"):
        raise HTTPException(status_code=400, detail="Incorrect password")

    del db[user_id]
    save_users(db)

    return {"status": "User deleted successfully"}

@app.put("/update_user")
async def update_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        user_input: UserInput,
):
    db = load_users()

    user_id = token
    if user_id not in db:
        raise HTTPException(status_code=404, detail="User not found")

    user = db[user_id]

    if user_input.username:
        user["username"] = user_input.username
    if user_input.fullname:
        user["fullname"] = user_input.fullname
    if user_input.email:
        user["email"] = user_input.email
    if user_input.password:
        user["hashed_password"] = fake_hash_password(user_input.password)

    db[user_id] = user
    save_users(db)

    return {"status": "User updated successfully"}
import json
from typing import Annotated, Dict, Any

from fastapi import FastAPI, HTTPException, Depends, status, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pygments.lexers import data

app= FastAPI()


def fake_hash_password(password:str):
    return "hash" + password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class User(BaseModel):
    username: str
    password: str
    fullname: str | None = None
    email: str | None = None
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

def match_user(db,username:str) -> bool:
    return username in db

def get_user(db, username:str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fake_decode_token(token):
    with open("users.json", "r", encoding="utf-8") as fx:
        fake_users_db: Dict[str, Dict[str, Any]] = json.load(fx)
    user = get_user(fake_users_db, token)
    return user

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    user = fake_decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_active_user(
        current_user: Annotated[User, Depends(get_current_user)],
):
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
    with open("users.json", "r", encoding="utf-8") as fx:
        fake_users_db: Dict[str, Dict[str, Any]] = json.load(fx)
    user_dict=fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    user= UserInDB(**user_dict)
    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {"access_token": user.username, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(
        current_user: Annotated[User, Depends(get_current_user)]
):
    return current_user

@app.get("/events")
async def read_events():
    with open("events.json", "r", encoding="utf-8") as f:
        events: Dict[str, Dict[str, Any]] = json.load(f)
    return events

@app.get("/search")
async def read_search():
    with open("events.json", "r", encoding="utf-8") as f:
        events: Dict[str, Dict[str, Any]] = json.load(f)
    return events

@app.get("/events/search")
async def read_events_search(q: str =Query(...,min_lenght=1)):
    q_norm = q.strip().lower()
    with open("events.json", "r", encoding="utf-8") as f:
        events: Dict[str, Dict[str, Any]] = json.load(f)

    filtered_events = {
        name: data
        for name, data in events.items()
        if matches(name,data, q_norm)
    }

    return filtered_events

@app.get("/event")
async def read_one_event(q: str =Query(...,min_lenght=1)):
    with open("events.json", "r", encoding="utf-8") as f:
        events: Dict[str, Dict[str, Any]] = json.load(f)
    event = events.get(q)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@app.post("/register")
async def regidter(user: User):
    with open("users.json", "r", encoding="utf-8") as fx:
        fake_users_db: Dict[str, Dict[str, Any]] = json.load(fx)
    if match_user(fake_users_db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed = fake_hash_password(user.password)

    fake_users_db[user.username] = {
        "username": user.username,
        "fullname": user.fullname,
        "email": user.email,
        "disabled": False,
        "hashed_password": hashed,
    }

    with open("users.json", "w", encoding="utf-8") as fy:
        json.dump(fake_users_db, fy, indent=2)

    return {"status": "User registered successfully"}

@app.delete("/delete_user")
async def delete_user(username: str):
    with open("users.json", "r", encoding="utf-8") as fx:
        fake_users_db: Dict[str, Dict[str, Any]] = json.load(fx)
    if not match_user(fake_users_db, username):
        raise HTTPException(status_code=404, detail="Username not found")

    del fake_users_db[username]

    with open("users.json", "w", encoding="utf-8") as fz:
        json.dump(fake_users_db, fz, indent=2)

    return {"status": "User deleted successfully"}

@app.put("/update_user")
async def update_user(username: str, user: User):
    with open("users.json", "r", encoding="utf-8") as fx:
        fake_users_db: Dict[str, Dict[str, Any]] = json.load(fx)
    if not match_user(fake_users_db, username):
        raise HTTPException(status_code=404, detail="Username not found")

    hashed = fake_hash_password(user.password)

    fake_users_db[username] = {
        "username": user.username,
        "fullname": user.fullname,
        "email": user.email,
        "disabled": False,
        "hashed_password": hashed,
    }

    with open("users.json", "w", encoding="utf-8") as fy:
        json.dump(fake_users_db, fy, indent=2)

    return {"status": "User updated successfully"}



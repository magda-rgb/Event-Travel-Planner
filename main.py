from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app= FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

events = {
    "event1": "Event 1 details",
    "event2": "Event 2 details",
    "event3": "Event 3 details",
    "event4": "Event 4 details",}

@app.get("/events")
async def read_events():
    return events

@app.get("/search")
async def read_search():
    return events

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

TM_BASE = "https://app.ticketmaster.com/discovery/v2"
TIMEOUT = 8.0


def _key() -> str:
    k = os.getenv("TICKETMASTER_API_KEY", "").strip()
    if not k:
        raise RuntimeError("Brak TICKETMASTER_API_KEY w .env")
    return k


def _normalize(ev: Dict[str, Any]) -> Dict[str, Any]:
    images = ev.get("images") or []
    image = ""
    if images:
        wide = [i for i in images if i.get("ratio") == "16_9"]
        image = (wide[0] if wide else images[0]).get("url", "")

    venues = (ev.get("_embedded") or {}).get("venues") or []
    venue = venues[0] if venues else {}

    start = (ev.get("dates") or {}).get("start") or {}
    price = (ev.get("priceRanges") or [{}])[0]
    cls = (ev.get("classifications") or [{}])[0]

    return {
        "id": ev.get("id", ""),
        "name": ev.get("name", ""),
        "url": ev.get("url", ""),
        "image": image,
        "date": start.get("localDate", ""),
        "time": start.get("localTime", ""),
        "venue": venue.get("name", ""),
        "city": (venue.get("city") or {}).get("name", ""),
        "address": (venue.get("address") or {}).get("line1", ""),
        "country": (venue.get("country") or {}).get("name", ""),
        "price_min": price.get("min"),
        "price_max": price.get("max"),
        "price_currency": price.get("currency"),
        "segment": (cls.get("segment") or {}).get("name", ""),
        "genre": (cls.get("genre") or {}).get("name", ""),
        "info": ev.get("info", ""),
        "please_note": ev.get("pleaseNote", ""),
    }


async def tm_search_events(
    city: Optional[str] = None,
    date_iso: Optional[str] = None,
    keyword: Optional[str] = None,
    country_code: Optional[str] = None,
    size: int = 20,
) -> List[Dict[str, Any]]:
    params: Dict[str, Any] = {
        "apikey": _key(),
        "size": size,
        "sort": "date,asc",
        "locale": "*",
    }
    if city:
        params["city"] = city
    if keyword:
        params["keyword"] = keyword
    if country_code:
        params["countryCode"] = country_code

    if date_iso:
        params["startDateTime"] = f"{date_iso}T00:00:00Z"
    else:
        params["startDateTime"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.get(f"{TM_BASE}/events.json", params=params)
        r.raise_for_status()
        data = r.json()

    return [_normalize(e) for e in (data.get("_embedded") or {}).get("events", [])]


async def tm_get_event(event_id: str) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.get(
            f"{TM_BASE}/events/{event_id}.json",
            params={"apikey": _key(), "locale": "*"},
        )
        r.raise_for_status()
        return _normalize(r.json())

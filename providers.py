from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import httpx

TM_BASE = "https://app.ticketmaster.com/discovery/v2"
GOOGLE_BASE = "https://maps.googleapis.com/maps/api"
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
        params["city"] = "Warsaw" if city.strip().lower() == "warszawa" else city
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


def _gkey() -> str:
    k = os.getenv("GOOGLE_MAPS_API_KEY", "").strip()
    if not k:
        raise RuntimeError("Brak GOOGLE_MAPS_API_KEY w .env")
    return k


def _normalize_route(route: Dict[str, Any], idx: int) -> Dict[str, Any]:
    leg = (route.get("legs") or [{}])[0]

    operators: List[str] = []
    operator_url: Optional[str] = None
    for s in leg.get("steps") or []:
        td = s.get("transit_details") or {}
        line = td.get("line") or {}
        for ag in line.get("agencies") or []:
            name = ag.get("name")
            url = ag.get("url")
            if name and name not in operators:
                operators.append(name)
                if operator_url is None and url:
                    operator_url = url

    return {
        "id": str(idx),
        "summary": ", ".join(operators) if operators else "Komunikacja publiczna",
        "duration_text": (leg.get("duration") or {}).get("text", ""),
        "depart": (leg.get("departure_time") or {}).get("text", ""),
        "arrive": (leg.get("arrival_time") or {}).get("text", ""),
        "url": operator_url,
    }


async def google_routes(
    from_city: str,
    to_city: str,
    depart_date: str,
) -> List[Dict[str, Any]]:
    key = _gkey()
    departure_ts = int(
        datetime.fromisoformat(f"{depart_date}T12:00:00")
        .replace(tzinfo=timezone.utc)
        .timestamp()
    )
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        r = await c.get(
            f"{GOOGLE_BASE}/directions/json",
            params={
                "origin": from_city,
                "destination": to_city,
                "mode": "transit",
                "alternatives": "true",
                "departure_time": departure_ts,
                "language": "pl",
                "key": key,
            },
        )
        r.raise_for_status()
        data = r.json()

    return [
        _normalize_route(route, i)
        for i, route in enumerate((data.get("routes") or [])[:5])
    ]

"""Testy GET /events i GET /events/{id} z zamockowanym Ticketmaster (respx)."""

import httpx
import pytest
import respx

from providers import TM_BASE


def _pokaz_odpowiedz(response) -> None:
    print(f"\nHTTP {response.status_code}")
    print(f"Odpowiedź: {response.json()}")


def _tm_event_raw(event_id: str = "evt-1", name: str = "Koncert Test") -> dict:
    return {
        "id": event_id,
        "name": name,
        "url": "https://ticketmaster.example/evt-1",
        "images": [{"url": "https://img.example/1.jpg", "ratio": "16_9"}],
        "dates": {"start": {"localDate": "2026-06-01", "localTime": "20:00:00"}},
        "_embedded": {
            "venues": [
                {
                    "name": "Arena",
                    "city": {"name": "Warszawa"},
                    "address": {"line1": "ul. Test 1"},
                    "country": {"name": "Polska"},
                }
            ]
        },
        "priceRanges": [{"min": 50, "max": 200, "currency": "PLN"}],
        "classifications": [{"segment": {"name": "Music"}, "genre": {"name": "Rock"}}],
        "info": "Info",
        "pleaseNote": "Note",
    }


def _tm_list_response(events: list | None = None) -> dict:
    return {"_embedded": {"events": events or [_tm_event_raw()]}}


@respx.mock
def test_events_list_200(client):
    respx.get(f"{TM_BASE}/events.json").mock(
        return_value=httpx.Response(200, json=_tm_list_response())
    )

    response = client.get("/events", params={"city": "Warszawa"})

    _pokaz_odpowiedz(response)
    assert response.status_code == 200
    body = response.json()
    assert len(body["events"]) == 1
    assert body["events"][0]["id"] == "evt-1"
    assert body["events"][0]["name"] == "Koncert Test"
    assert body["events"][0]["city"] == "Warszawa"


@respx.mock
def test_events_list_502_on_tm_server_error(client):
    respx.get(f"{TM_BASE}/events.json").mock(return_value=httpx.Response(500))

    response = client.get("/events")

    _pokaz_odpowiedz(response)
    assert response.status_code == 502
    assert "Blad Ticketmaster: 500" in response.json()["detail"]


@respx.mock
def test_events_list_502_on_timeout(client):
    respx.get(f"{TM_BASE}/events.json").mock(side_effect=httpx.TimeoutException("timeout"))

    response = client.get("/events")

    _pokaz_odpowiedz(response)
    assert response.status_code == 502
    assert "Ticketmaster nieosiagalny" in response.json()["detail"]


@respx.mock
def test_event_detail_200(client):
    respx.get(f"{TM_BASE}/events/evt-42.json").mock(
        return_value=httpx.Response(200, json=_tm_event_raw("evt-42", "Festiwal"))
    )

    response = client.get("/events/evt-42")

    _pokaz_odpowiedz(response)
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "evt-42"
    assert body["name"] == "Festiwal"


@respx.mock
def test_event_detail_404(client):
    respx.get(f"{TM_BASE}/events/brak.json").mock(return_value=httpx.Response(404))

    response = client.get("/events/brak")

    _pokaz_odpowiedz(response)
    assert response.status_code == 404
    assert response.json()["detail"] == "Wydarzenie nie znalezione"


@respx.mock
def test_event_detail_502_on_timeout(client):
    respx.get(url__regex=rf"{TM_BASE}/events/.+\.json").mock(
        side_effect=httpx.ConnectError("connection refused")
    )

    response = client.get("/events/evt-1")

    _pokaz_odpowiedz(response)
    assert response.status_code == 502
    assert "Ticketmaster nieosiagalny" in response.json()["detail"]


def test_events_list_503_without_api_key(client, monkeypatch):
    monkeypatch.delenv("TICKETMASTER_API_KEY", raising=False)

    response = client.get("/events")

    _pokaz_odpowiedz(response)
    assert response.status_code == 503
    assert "TICKETMASTER_API_KEY" in response.json()["detail"]

"""Testy POST /travel/transport/search z zamockowanym Google Directions (respx)."""

import httpx
import respx

from providers import GOOGLE_BASE


def _pokaz_odpowiedz(response) -> None:
    print(f"\nHTTP {response.status_code}")
    print(f"Odpowiedź: {response.json()}")


def _google_routes_response() -> dict:
    return {
        "routes": [
            {
                "legs": [
                    {
                        "duration": {"text": "1 godz. 20 min"},
                        "departure_time": {"text": "10:00"},
                        "arrival_time": {"text": "11:20"},
                        "steps": [
                            {
                                "transit_details": {
                                    "line": {
                                        "agencies": [
                                            {"name": "PKP Intercity", "url": "https://pkp.pl"}
                                        ]
                                    }
                                }
                            }
                        ],
                    }
                ]
            }
        ]
    }


def test_transport_search_400_empty_fields(client):
    response = client.post(
        "/travel/transport/search",
        json={"from_city": "", "to_city": "Warszawa", "depart_date": "2026-06-15"},
    )

    _pokaz_odpowiedz(response)
    assert response.status_code == 400
    assert "from_city, to_city i depart_date" in response.json()["detail"]


@respx.mock
def test_transport_search_200(client):
    respx.get(f"{GOOGLE_BASE}/directions/json").mock(
        return_value=httpx.Response(200, json=_google_routes_response())
    )

    response = client.post(
        "/travel/transport/search",
        json={
            "from_city": "Krakow",
            "to_city": "Warszawa",
            "depart_date": "2026-06-15",
        },
    )

    _pokaz_odpowiedz(response)
    assert response.status_code == 200
    options = response.json()["options"]
    assert len(options) == 1
    assert options[0]["summary"] == "PKP Intercity"
    assert options[0]["duration_text"] == "1 godz. 20 min"
    assert options[0]["url"] == "https://pkp.pl"


@respx.mock
def test_transport_search_502_on_google_error(client):
    respx.get(f"{GOOGLE_BASE}/directions/json").mock(return_value=httpx.Response(403))

    response = client.post(
        "/travel/transport/search",
        json={
            "from_city": "Krakow",
            "to_city": "Warszawa",
            "depart_date": "2026-06-15",
        },
    )

    _pokaz_odpowiedz(response)
    assert response.status_code == 502
    assert "Blad Google: 403" in response.json()["detail"]


@respx.mock
def test_transport_search_502_on_timeout(client):
    respx.get(f"{GOOGLE_BASE}/directions/json").mock(
        side_effect=httpx.TimeoutException("timeout")
    )

    response = client.post(
        "/travel/transport/search",
        json={
            "from_city": "Krakow",
            "to_city": "Warszawa",
            "depart_date": "2026-06-15",
        },
    )

    _pokaz_odpowiedz(response)
    assert response.status_code == 502
    assert "Google nieosiagalny" in response.json()["detail"]


def test_transport_search_503_without_api_key(client, monkeypatch):
    monkeypatch.delenv("GOOGLE_MAPS_API_KEY", raising=False)

    response = client.post(
        "/travel/transport/search",
        json={
            "from_city": "Krakow",
            "to_city": "Warszawa",
            "depart_date": "2026-06-15",
        },
    )

    _pokaz_odpowiedz(response)
    assert response.status_code == 503
    assert "GOOGLE_MAPS_API_KEY" in response.json()["detail"]

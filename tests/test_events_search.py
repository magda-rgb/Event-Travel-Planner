def _pokaz_odpowiedz(response) -> None:
    
    print(f"\nHTTP {response.status_code}")
    print(f"Odpowiedź: {response.json()}")

def test_events_search_missing_params(client):
    response = client.get("/events/search")
    _pokaz_odpowiedz(response)
    assert response.status_code == 400
    assert response.json()["detail"] == "Podaj miasto, date lub fraze"

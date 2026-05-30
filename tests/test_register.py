from tests.conftest import register_user

def _pokaz_odpowiedz(response) -> None:
    
    print(f"\nHTTP {response.status_code}")
    print(f"Odpowiedź: {response.json()}")

def test_register_success(client):
    response = register_user(
        client,
        username="anna",
        password="pass123",
        fullname="Anna Kowalska",
        email="anna@example.com",
    )
    _pokaz_odpowiedz(response)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "User registered successfully"
    assert body["user_id"]


def test_register_duplicate_username(client):
    register_user(client, username="dup", password="pass1")
    response = register_user(client, username="dup", password="pass2")
    _pokaz_odpowiedz(response)
    assert response.status_code == 400
    assert response.json()["detail"] == "Username already registered"

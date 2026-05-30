from tests.conftest import auth_headers, login, register_user

def _pokaz_odpowiedz(response) -> None:
    
    print(f"\nHTTP {response.status_code}")
    print(f"Odpowiedź: {response.json()}")


def test_login_success(client):
    register_user(client, username="jan", password="ok123")
    response = login(client, "jan", "ok123")
    assert response.status_code == 200
    body = response.json()
    _pokaz_odpowiedz(response)
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_login_wrong_password(client):
    register_user(client, username="jan", password="ok123")
    response = login(client, "jan", "zle_haslo")
    _pokaz_odpowiedz(response)
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect username or password"


def test_get_user_with_token(client):
    register_user(client, username="jan", password="ok123", fullname="Jan")
    token = login(client, "jan", "ok123").json()["access_token"]
    response = client.get("/user", headers=auth_headers(token))
    assert response.status_code == 200
    body = response.json()
    _pokaz_odpowiedz(response)
    assert body["username"] == "jan"
    assert body["fullname"] == "Jan"
    assert "hashed_password" not in body


def test_get_user_without_token(client):
    response = client.get("/user")
    _pokaz_odpowiedz(response)
    assert response.status_code == 401

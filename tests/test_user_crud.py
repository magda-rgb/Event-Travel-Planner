from main import users_collection
from tests.conftest import auth_headers, login, register_user

def _pokaz_odpowiedz(response) -> None:
    
    print(f"\nHTTP {response.status_code}")
    print(f"Odpowiedź: {response.json()}")

def test_update_user_profile(client):
    register_user(client, username="jan", password="ok123", fullname="Stare")
    token = login(client, "jan", "ok123").json()["access_token"]
    headers = auth_headers(token)

    response = client.put(
        "/update_user",
        headers=headers,
        json={
            "username": "jan",
            "password": "ok123",
            "fullname": "Nowe imie",
            "email": "jan@example.com",
        },
    )
    _pokaz_odpowiedz(response)
    assert response.status_code == 200
    assert response.json()["status"] == "User updated successfully"

    profile = client.get("/user", headers=headers).json()
    _pokaz_odpowiedz(response)
    assert profile["fullname"] == "Nowe imie"
    assert profile["email"] == "jan@example.com"


def test_update_user_not_found(client):
    register_user(client, username="ghost", password="ok123")
    token = login(client, "ghost", "ok123").json()["access_token"]
    users_collection.delete_one({"_id": token})

    response = client.put(
        "/update_user",
        headers=auth_headers(token),
        json={"username": "ghost", "password": "ok123", "fullname": "X"},
    )
    _pokaz_odpowiedz(response)
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_delete_user_success(client):
    register_user(client, username="jan", password="ok123")
    token = login(client, "jan", "ok123").json()["access_token"]
    headers = auth_headers(token)

    response = client.request(
        "DELETE",
        "/delete_user",
        headers=headers,
        json={"password": "ok123"},
    )
    _pokaz_odpowiedz(response)
    assert response.status_code == 200
    assert response.json()["status"] == "User deleted successfully"
    assert client.get("/user", headers=headers).status_code == 401


def test_delete_user_wrong_password(client):
    register_user(client, username="jan", password="ok123")
    token = login(client, "jan", "ok123").json()["access_token"]

    response = client.request(
        "DELETE",
        "/delete_user",
        headers=auth_headers(token),
        json={"password": "zle_haslo"},
    )
    _pokaz_odpowiedz(response)
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect password"

from tests.conftest import auth_headers, login, register_user


def test_critical_user_journey(client):
    """Rejestracja → login → profil → edycja → usunięcie konta."""
    assert register_user(client, username="journey", password="pass1").status_code == 200

    token = login(client, "journey", "pass1").json()["access_token"]
    headers = auth_headers(token)

    profile = client.get("/user", headers=headers)
    assert profile.status_code == 200
    assert profile.json()["username"] == "journey"

    update = client.put(
        "/update_user",
        headers=headers,
        json={"username": "journey", "password": "pass1", "fullname": "Podroznik"},
    )
    assert update.status_code == 200
    assert client.get("/user", headers=headers).json()["fullname"] == "Podroznik"

    delete = client.request(
        "DELETE",
        "/delete_user",
        headers=headers,
        json={"password": "pass1"},
    )
    assert delete.status_code == 200
    assert client.get("/user", headers=headers).status_code == 401

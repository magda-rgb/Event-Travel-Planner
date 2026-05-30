"""
Wspólna konfiguracja testów integracyjnych API.

"""
import os

os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
os.environ["MONGO_DB"] = "projekt_test"
os.environ.setdefault("TICKETMASTER_API_KEY", "test-tm-key")
os.environ.setdefault("GOOGLE_MAPS_API_KEY", "test-google-key")

import pytest
from fastapi.testclient import TestClient

from main import app, users_collection


@pytest.fixture
def client():
    """Sztuczny klient HTTP — woła endpointy bez uruchamiania serwera na porcie 8000."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def clean_users():
    """Przed i po każdym teście: pusta kolekcja users (testy nie wpływają na siebie)."""
    users_collection.delete_many({})
    yield
    users_collection.delete_many({})


def register_user(client, username="jan", password="secret123", **extra):
    payload = {"username": username, "password": password, **extra}
    return client.post("/register", json=payload)


def login(client, username, password):
    # OAuth2 wymaga formularza (data=), nie JSON (json=)
    return client.post("/token", data={"username": username, "password": password})


def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}

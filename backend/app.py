from flask import Flask, session
from flask_socketio import SocketIO

import os
import base64

from dotenv import load_dotenv

import gnupg
import pathlib

load_dotenv()

ROOT = pathlib.Path(__file__).parent.resolve()
KEYRING = ROOT / ".gpg_keys"

gpg = gnupg.GPG(gnupghome=KEYRING)
gpg.encoding = "utf-8"

# Path to your public key file
public_key_file = ROOT / "public.asc"

# Import the public key from the file
with open(public_key_file, "r") as key_file:
    key_data = key_file.read()
    gpg.import_keys(key_data)


app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")

socketio = SocketIO(app)


@app.route("/")
def index():
    return "Flask server is running with Socket.IO"


@socketio.on("connect")
def handle_connect():
    print("Connected")
    socketio.emit("server_message", {"data": "Connected to the Flask server"})


@socketio.on("client_response")
def handle_client_response(data):
    print("Message received", data)


@socketio.on("challenge_response")
def handle_challenge_response(data):
    response = data.get("data")
    verification = gpg.verify(response)
    if verification.valid:
        session["username"] = "test"
    print(session.get("username"))


@socketio.on("login")
def login(data):
    challenge = base64.b64encode(os.urandom(32)).decode("utf-8")
    print(challenge)
    socketio.emit("challenge", challenge)


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


if __name__ == "__main__":
    socketio.run(app, debug=True)

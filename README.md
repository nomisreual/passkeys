# Passkeys
This is a learning project in which I implement a version of passkeys for authentication. As for *regular* passkeys, it utilizes public key encryption to enable passwordless authentication.

Web sockets are used to handle the client/server communication. Currently, the server is a Flask application, and the client a JS script emulating a browser client.

The goal is to expand on this as follows:

- Enable user registration and the usage of *passkeys* in the Flask application.
- Turn the JS script into a browser extension enabling the creation of site-specific *passkeys*.

## Set Up

Create a pgp keypair and export both, the private and public, keys (include the `--armor` flag).

The private key needs to be named `private.asc` and is to be placed in `./frontend`. The public key needs to be placed in `./backend`.

For the passphrase, create a `.env` in the `./frontend` with one value `PASSPHRASE` equal to the passphrase for the key.

Also, create a `.env` file in `./backend` containing a value for `SECRET_KEY`.

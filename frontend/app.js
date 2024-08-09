// Import the Socket.IO client library
const io = require("socket.io-client");

// Import fs and openpgp
const fs = require("fs");
const openpgp = require("openpgp");

// Dotenv
require("dotenv").config();

// Connect to the Flask server
const socket = io.connect("http://localhost:5000");

async function importPrivateKey(filePath) {
  const privateKeyArmored = fs.readFileSync(filePath, "utf8");
  const privateKey = await openpgp.readPrivateKey({
    armoredKey: privateKeyArmored,
  });
  return privateKey;
}

async function decryptPrivateKey(privateKey, passphrase) {
  // Decrypt the private key using the correct method
  const decryptedKey = await openpgp.decryptKey({
    privateKey: privateKey,
    passphrase: passphrase,
  });
  return decryptedKey;
}

async function signMessageWithDecryptedKey(decryptedKey, message) {
  const signedMessage = await openpgp.sign({
    message: await openpgp.createMessage({ text: message }),
    signingKeys: decryptedKey,
  });
  return signedMessage;
}

const privateKeyPath = "private.asc";
// const passphrase = "password";
const passphrase = process.env.PASSPHRASE;

// Listen for the connection event
socket.on("connect", () => {
  console.log("Connected to the Flask server");

  socket.emit("login", { data: "I am want to log in" });

  // Disconnect after connecting (optional, for demonstration purposes)
  setTimeout(() => {
    socket.disconnect();
  }, 3000);
});

socket.on("challenge", (data) => {
  console.log("Received the challenge:", data);

  importPrivateKey(privateKeyPath).then((privateKey) => {
    decryptPrivateKey(privateKey, passphrase).then((decryptedKey) => {
      signMessageWithDecryptedKey(decryptedKey, data).then((signedMessage) => {
        // console.log("Signed Message:", signedMessage);
        socket.emit("challenge_response", {
          data: signedMessage,
        });
      });
    });
  });
});

// Optionally, listen for messages from the server
socket.on("server_message", (data) => {
  console.log("Received message from server:", data);
  socket.emit("client_response", { data: "Message received loud and clear!" });
});

// Listen for the disconnect event
socket.on("disconnect", () => {
  console.log("Disconnected from the Flask server");
});

// Example usage
const message = "This is a test message";

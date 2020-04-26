var admin = require("firebase-admin");

var serviceAccount = require("../key/serviceAccountKey.json");

//intialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialape-93155.firebaseio.com"
});

const db = admin.firestore();

module.exports = { admin, db };

//set up firebase Admin SDK to access to firebase DB, storage and auth. 
var admin = require("firebase-admin");

var serviceAccount = require("../config/fbServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecommerce-beb82.firebaseio.com"
});

module.exports = admin;
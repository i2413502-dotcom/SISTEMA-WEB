//const admin = require('firebase-admin');
//const serviceAccount = require('./serviceAccountKey.json');

//admin.initializeApp({
  //  credential: admin.credential.cert(serviceAccount)
//});

//module.exports = admin;
//holaaa
// Firebase desactivado temporalmente
// Se activa cuando tengas el serviceAccountKey.json
module.exports = null;const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = admin;
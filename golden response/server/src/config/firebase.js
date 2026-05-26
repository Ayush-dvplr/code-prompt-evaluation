// firebase.js — lazy Firebase Admin SDK initialization
// Initialization is deferred until the first call to getAdmin() so the server
// can start without FIREBASE_* env vars set (e.g. during local dev without Google OAuth).
// The Google OAuth route will return a clear 503 instead of crashing the process.
const admin = require('firebase-admin')

function getAdmin() {
  // Already initialized — return the existing app
  if (admin.apps.length) return admin

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error(
      'Firebase Admin SDK is not configured. ' +
      'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your .env file.'
    )
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      // The private key arrives as a JSON string with literal \n — convert to real newlines
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })

  return admin
}

module.exports = { getAdmin }

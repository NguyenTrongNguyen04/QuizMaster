/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Set admin role for a user
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = data;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID is required');
  }

  try {
    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(uid, {
      role: 'admin'
    });
    
    console.log(`Admin role set successfully for user: ${uid}`);
    return { 
      success: true, 
      message: 'Admin role set successfully',
      uid: uid
    };
  } catch (error) {
    console.error('Error setting admin role:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Remove admin role from a user
exports.removeAdminRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = data;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID is required');
  }

  try {
    // Remove admin role (set as viewer)
    await admin.auth().setCustomUserClaims(uid, {
      role: 'viewer'
    });
    
    console.log(`Admin role removed successfully for user: ${uid}`);
    return { 
      success: true, 
      message: 'Admin role removed successfully',
      uid: uid
    };
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get user role
exports.getUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = data;
  
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID is required');
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    return {
      success: true,
      uid: uid,
      role: customClaims.role || 'viewer',
      email: userRecord.email
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// List all users with their roles
exports.listUsersWithRoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || 'viewer',
      displayName: user.displayName,
      disabled: user.disabled
    }));
    
    return {
      success: true,
      users: users
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

const config = {
  databaseURL: process.env.APP_DATA_BASE_URL,
  apiKey: process.env.APP_API_KEY,
  authDomain: process.env.APP_AUTH_DOMAIN,
  databaseURL: process.env.APP_DATA_BASE_URL,
  projectId: process.env.APP_AUTH_PROJECT_ID,
  storageBucket: process.env.APP_STORAGE_BUCKET,
  messagingSenderId: process.env.APP_MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

module.exports = config;

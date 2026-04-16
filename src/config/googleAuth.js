// Google OAuth Configuration
// For production: Get your CLIENT_ID from Google Cloud Console
// https://console.cloud.google.com/apis/credentials

// Demo Client ID (not working without proper setup)
// To use with real OAuth:
// 1. Go to Google Cloud Console
// 2. Create a new project or select existing
// 3. Enable Google+ API
// 4. Create OAuth 2.0 Credentials (Web Application)
// 5. Add http://localhost:5173 to Authorized JavaScript origins
// 6. Copy the Client ID below

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

export const googleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scope: 'openid profile email',
};

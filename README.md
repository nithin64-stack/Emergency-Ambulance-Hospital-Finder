# Emergency Ambulance & Hospital Finder

This project is a Node.js + Express application for emergency ambulance routing, hospital discovery, and user management. It includes local email/password login, role-based dashboards, and Google OAuth 2.0 sign-in.

## Features

- User registration and login
- Dashboard access after authentication
- Hospital finder and ambulance finder
- SOS emergency requests
- Driver dashboard
- Admin features
- Emergency history
- Google Sign-In with Passport.js
- Google users can create a bcrypt-protected local password and use either login method

## Prerequisites

- Node.js 18+
- npm
- MySQL or SQLite database support (this project currently uses SQLite by default)
- A Google Cloud account

## Environment Variables

Create a `.env` file in the project root with the following values:

```env
SESSION_SECRET=your_session_secret
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

If you are using a different database location, also set:

```env
DB_PATH=./database/emergency_system.sqlite
```

## Google Cloud Setup

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one.
3. Enable the Google+ API or use the OAuth consent screen and OAuth client setup.
4. Open APIs & Services > Credentials.
5. Click Create Credentials > OAuth client ID.
6. Choose Web application as the application type.
7. Add the authorized redirect URI:
   - http://localhost:3000/auth/google/callback
8. Copy the generated Client ID and Client Secret into your `.env` file.

## OAuth Consent Screen Setup

1. In Google Cloud Console, open APIs & Services > OAuth consent screen.
2. Choose External if you are testing locally.
3. Add the app name, support email, and developer contact information.
4. Add the scopes required for login:
   - email
   - profile
5. Save and publish the app when ready for broader use.

## Localhost Testing

1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open http://localhost:3000/login
4. Click Continue with Google
5. Complete the Google sign-in flow
6. Confirm the app redirects to the dashboard after successful authentication
7. On the dashboard, choose Create Local Password and submit a password
8. Log out, then verify Email + Password and Continue with Google both work
9. Test logout by visiting /logout

## Database Notes

The SQLite schema is initialized automatically when the app starts. A safety migration is included to add `google_id` and `profile_picture` columns to the `users` table if they do not already exist. Existing user data is preserved.

## Important Notes

- Existing email/password users will continue to work without modification.
- New Google users are created automatically with the default role of `patient`.
- New Google users start without a local password and can create one from the dashboard.
- Existing users can be linked to their Google account when the same email is found.
- Existing Google-only accounts created before this password flow are migrated to have no local password.
- The app keeps the current session-based Passport authentication compatible with the project’s existing routes and middleware.

## Troubleshooting

- If Google login fails, confirm the redirect URI exactly matches the OAuth client config.
- If `/auth/google` returns an error, verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly.
- If the app cannot find the database, ensure `DB_PATH` points to a valid writable folder.
- If you changed credentials in Google Cloud, restart the Node.js server to reload environment variables.

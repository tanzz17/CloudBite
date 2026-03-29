# CloudBite Frontend

This frontend is a Vite + React app that talks to the deployed CloudBite backend on Render.

## Local development

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env` file from `.env.example`.

3. Start the dev server:

```powershell
npm run dev
```

If `VITE_API_BASE_URL` is not set locally, the app uses relative `/api` requests. For production builds, it falls back to `https://cloudbite-backend.onrender.com` unless you override it.

## Vercel deployment

Use the `frontend/cloudbite` folder as the project root in Vercel.

Set this environment variable in Vercel:

```text
VITE_API_BASE_URL=https://cloudbite-backend.onrender.com
```

Recommended Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

This project already includes [vercel.json](C:\Users\TANAVI\OneDrive\Desktop\CloudBite\frontend\cloudbite\vercel.json) for SPA rewrites, so direct route refreshes should work.

## Backend integration checklist

- Backend API base: `https://cloudbite-backend.onrender.com/api`
- WebSocket endpoint: `https://cloudbite-backend.onrender.com/ws`
- Frontend env value should be the backend root URL, not the `/api` URL. The app appends `/api` automatically.
- After deploying the frontend, add the final Vercel domain to the backend `APP_CORS_ALLOWED_ORIGINS` on Render if your current allowlist does not already include it.

## Quick verification after deploy

1. Open the deployed frontend.
2. Confirm the home page loads with no blank screen.
3. Test signup/signin.
4. Open a page that loads kitchens or dishes and confirm API data appears.
5. Test any live order tracking flow that depends on WebSockets.

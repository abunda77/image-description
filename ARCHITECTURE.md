# Request Flow Diagram

## BEFORE (Not Working) ❌

```
Browser
  │
  ├─> GET https://imgdesc.produkmastah.com/
  │   └─> OLS serves: /public_html/dist/index.html ✅
  │
  └─> POST https://imgdesc.produkmastah.com/api/generate-description
      └─> OLS looks for: /public_html/dist/api/generate-description
          └─> 404 NOT FOUND ❌ (File doesn't exist!)
```

**Problem:** OLS hanya serve static files, tidak tahu tentang Node.js backend!

---

## AFTER (Working) ✅

```
Browser
  │
  ├─> GET https://imgdesc.produkmastah.com/
  │   └─> OLS serves: /public_html/dist/index.html ✅
  │
  └─> POST https://imgdesc.produkmastah.com/api/generate-description
      └─> OLS sees "/api" prefix
          └─> Proxies to: http://localhost:3001/api/generate-description
              └─> Node.js Backend handles request ✅
                  └─> Calls Gemini API
                      └─> Returns description
```

**Solution:** OLS acts as reverse proxy for `/api/*` requests!

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Internet (HTTPS)                   │
└───────────────────────┬─────────────────────────────┘
                        │
                        │ Port 443 (HTTPS)
                        │
                        ▼
        ┌───────────────────────────┐
        │   OpenLiteSpeed (OLS)     │
        │   imgdesc.produkmastah.com│
        └───────────┬───────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌─────────────────┐
│ Static Files │      │  Reverse Proxy  │
│              │      │                 │
│ /dist/       │      │  /api/* →       │
│ - index.html │      │  localhost:3001 │
│ - *.js       │      └────────┬────────┘
│ - *.css      │               │
│ - assets/    │               │
└──────────────┘               │
                               ▼
                    ┌──────────────────┐
                    │  Node.js Backend │
                    │  (server.js)     │
                    │  Port: 3001      │
                    │  (localhost only)│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Gemini API     │
                    │ (External Cloud) │
                    └──────────────────┘
```

---

## Request Types

### 1. Static Files (HTML, JS, CSS, Images)
```
Request:  GET /
          GET /assets/logo.png
          GET /index.js
          
Handler:  OLS → Serve from /dist/
Result:   ✅ File content
```

### 2. API Endpoints
```
Request:  POST /api/generate-description
          GET  /api/health
          
Handler:  OLS → Proxy to localhost:3001 → Node.js Backend
Result:   ✅ JSON response from backend
```

### 3. SPA Routing (Client-side routes)
```
Request:  GET /about
          GET /dashboard
          
Handler:  OLS → No file exists → Fallback to index.html
Result:   ✅ index.html (React Router handles client-side)
```

---

## Port Usage

| Service | Port | Access | Purpose |
|---------|------|--------|---------|
| OLS | 80/443 | Public | Web server (HTTPS) |
| Node.js | 3001 | localhost | Backend API |
| Gemini API | 443 | External | AI processing |

**Important:** Port 3001 should **NOT** be exposed to public internet!

---

## File Locations

```
Server Directory Structure:
/home/imgde3170/
├── public_html/
│   └── dist/                    ← Static files (built React app)
│       ├── index.html
│       ├── assets/
│       └── ...
│
├── image-desc/                  ← Source code & backend
│   ├── server.js                ← Node.js backend (port 3001)
│   ├── src/                     ← React source
│   ├── .env                     ← Environment variables
│   ├── restart-server.sh        ← Management scripts
│   └── ...
│
└── logs/
    ├── server.log               ← Node.js logs
    └── imgdesc.produkmastah.com.access_log
```

---

## Configuration Summary

### OLS vHost Config
- **docRoot:** `/public_html/dist` → Static files
- **External Processor:** `nodejs_backend` → Proxy to localhost:3001
- **Context:** `/api` → Route to nodejs_backend

### Node.js Backend
- **Port:** 3001 (localhost only)
- **Endpoints:**
  - `POST /api/generate-description`
  - `GET /api/health`

### Build Process
```bash
npm run build  →  Creates dist/ folder  →  OLS serves it
```

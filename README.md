# QR File Sharer (React + Node/Express + MongoDB)

A small full‑stack app to **upload files**, **generate QR codes** for public view links, and **manage files** (list/delete).  
Authentication uses **JWT in HttpOnly cookies** so that the **frontend can stay stateless** while the **backend** enforces sessions. Built for learning + interview demo.

> **Live backend:** `https://qr-code-generator-0opz.onrender.com`  
> **API base:** `https://qr-code-generator-0opz.onrender.com/api`  
> **Local frontend (Vite):** `http://localhost:5173` (during development)

---

## 1) Tech Stack

**Frontend**
- React + Vite
- React Router
- Redux Toolkit (Auth + Files slices)
- Tailwind + shadcn/ui components

**Backend**
- Node.js + Express
- MongoDB (Atlas) via Mongoose
- Multer (file uploads)
- `qrcode` (QR PNG generation)
- `jsonwebtoken` (JWT)
- `cookie-parser`, `cors`

**Infra / Deploy**
- Render (free tier) for Node service
- Optional: ngrok / localtunnel for sharing local server during development

---

## 2) Project Structure (monorepo style)
```
repo/
├─ client/                  # Vite React app
│  ├─ src/
│  │  ├─ Features/
│  │  │  ├─ auth/AuthSlice.jsx
│  │  │  └─ files/filesSlice.jsx
│  │  ├─ Pages/ (Login, Signup, Dashboard)
│  │  ├─ BrowseRoute.jsx
│  │  ├─ lib/apiClient.js
│  │  └─ App.jsx, main.jsx
│  └─ index.html, package.json, .env
└─ server/                  # Express API
   ├─ src/
   │  ├─ index.js
   │  ├─ routes.auth.js
   │  ├─ auth.controller.js, auth.service.js, utils.jwt.js, users.memory.js
   │  ├─ files/
   │  │  ├─ file.routes.js
   │  │  ├─ file.controller.js
   │  │  ├─ file.service.js
   │  │  ├─ file.model.js
   │  │  ├─ upload.middleware.js
   │  │  ├─ viewer.routes.js  # GET /v/:id (simple HTML viewer)
   │  │  ├─ serve.routes.js   # public file serve if needed
   │  │  ├─ qr.routes.js      # GET /qr/:id.png
   │  │  └─ qr.controller.js  # reads QR from disk and sends PNG
   │  └─ db/mongo.js
   └─ package.json, .env
```

---

## 3) Setup Instructions (Local)

### Prereqs
- Node 18+ (works on 22.x too)
- A MongoDB URI (Atlas free cluster is fine)

### Backend (server)
1. `cd server`
2. Create `.env` (see **Environment Variables** below). Minimal example:
   ```env
   PORT=8000
   PUBLIC_BASE_URL=http://localhost:8000
   VITE_ORIGIN=http://localhost:5173

   MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/
   MONGO_DB=qr_app

   JWT_SECRET=some-long-random-secret
   ```
3. Install & run:
   ```bash
   npm install
   npm start           # runs node src/index.js
   # (optional for DX) npm run dev   # if you add nodemon
   ```
4. Health check: open `http://localhost:8000/health` → should return **ok**.

### Frontend (client)
1. `cd client`
2. Create `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
3. Install & run:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173` in the browser.

> **Important (cookies + CORS):**  
> - Frontend must call `fetch(..., { credentials: "include" })`.  
> - Server must set `app.use(cors({ origin: VITE_ORIGIN, credentials: true }))`.  
> - Cookies are set with `SameSite=None; Secure` in production (HTTPS).

---

## 4) Environment Variables (Server)

| Name               | Example                                           | Why it matters |
|--------------------|---------------------------------------------------|----------------|
| `PORT`             | `8000`                                            | Server port |
| `PUBLIC_BASE_URL`  | `https://qr-code-generator-0opz.onrender.com`     | Used to create absolute QR/view URLs |
| `VITE_ORIGIN`      | `http://localhost:5173` or your deployed frontend | CORS allow‑list origin |
| `MONGO_URI`        | `mongodb+srv://...`                               | MongoDB connection string |
| `MONGO_DB`         | `qr_app`                                          | DB name |
| `JWT_SECRET`       | long random string                                | JWT signing |

**Client `.env`**
```
VITE_API_BASE_URL=https://qr-code-generator-0opz.onrender.com/api  # or local
```

---

## 5) API Endpoints (summary)

**Auth**
- `POST /api/signup` → `{ email, password }` → sets `session` cookie, returns `{ user }`
- `POST /api/login`  → `{ email, password }` → sets cookie, returns `{ user }`
- `GET  /api/me`     → returns `{ user }` (reads `session` from cookie)
- `POST /api/logout` → clears cookie

**Files**
- `POST /api/files` (multipart/form-data; field: `files`) → uploads file(s), creates QR, returns `{ items: [...] }`
- `GET  /api/files?page=1&limit=20` → list current user's files
- `GET  /api/files/:id` → single file meta
- `DELETE /api/files/:id` → delete one file + its QR (if implemented with `authRequired`)

**Public / QR**
- `GET /qr/:id.png` → QR code PNG (forced download via `Content-Disposition` header)
- `GET /v/:id`      → simple view page that renders/serves the stored file

---

## 6) How the App Works (High‑level)

1) **Signup/Login**  
- Client calls `/api/signup` or `/api/login` with JSON.  
- Server validates and creates **JWT** → sets `session` cookie (`HttpOnly`, `SameSite=None`, `Secure` in prod).  
- Client stores nothing sensitive; state is in Redux from `/api/me` response.

2) **Session check**  
- On app load, client calls `/api/me`.  
- If cookie is valid, server returns `{ user }`; otherwise `401`.  
- Protected routes render only when `isLoggedIn` is true.

3) **Upload & QR**  
- Client sends multipart `files[]` to `/api/files`.  
- Server writes files to disk (Multer), generates **QR PNG** using the **public view URL** (`/v/:id`) and stores QR path + meta in Mongo.  
- Client lists `/api/files` and displays `qrPngUrl` in grid.

4) **Delete**  
- Client calls `DELETE /api/files/:id`.  
- Server removes Mongo doc and deletes QR PNG (and the uploaded file) from disk.

---

## 7) Run Scripts (reference)

### server/package.json
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5",
    "qrcode": "^1.5.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### client/package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 5173"
  }
}
```

> If any of these scripts are missing in your repo, you can add them as above.

---

## 8) Assumptions & Limitations

- **Users storage (demo):** Users are stored in memory (`users.memory.js`) and passwords are **plain text** for simplicity.  
  - *Real app:* Store hashed passwords (bcrypt/argon2) in MongoDB with unique email index.
- **Disk storage:** Uploaded files & QR PNGs are saved to local disk. On Render free tier, **disk is ephemeral** (a fresh deploy resets files).  
  - *Real app:* Store files in S3 / Cloud Storage or Mongo GridFS. Store only metadata in Mongo.
- **Cookies & CORS:** Cross‑origin cookies require `SameSite=None; Secure` and HTTPS. We set CORS with `credentials: true`.  
- **Single user quota/rules:** No rate limits, no file type allow‑list beyond basic size limit.  
  - *Real app:* Add size/type validation, antivirus scan, rate limiting, and audit logs.
- **Public view link:** `/v/:id` serves the uploaded file. If you need **expiring links**, generate signed URLs instead of static IDs.

---

## 9) Deploy (Render)

1. Push server code to GitHub.
2. Create a **Render → Web Service** → pick your repo.
3. Set **Root Directory** = `server`
4. **Build Command** = `npm install`
5. **Start Command** = `npm start`
6. Add **Environment Variables** (same as local, but `PUBLIC_BASE_URL` must be the Render URL).
7. After deploy: health check `/health`.  
8. Update `client/.env` → `VITE_API_BASE_URL=https://<your-render-app>.onrender.com/api` and rebuild frontend if deploying it somewhere.

> **Note:** Disk on Render free tier is not persistent across deploys. For durable files, use S3/GridFS.

---

## 10) Common Gotchas

- **401 from `/api/me`**: 
  - Client must use `credentials: 'include'` in fetch (our `apiClient` does this).
  - Server CORS must have `credentials: true` and correct `origin`.
  - Cookies require HTTPS with `SameSite=None; Secure` in production.
- **QR not visible on phone**: Use a public base URL (`PUBLIC_BASE_URL`) instead of `http://localhost:8000` so QR encodes a reachable link.
- **"Cannot POST /signup"**: The client must call `/api/signup` (note the `/api` prefix). Make sure `VITE_API_BASE_URL` ends with `/api`.

---

## 11) Minimal Wireflow

**Login** → set cookie → **/api/me** loads user → **Dashboard** shows **Files Grid**  
**Upload** → `/api/files` → DB row created + QR PNG saved → **Grid** shows **qrPngUrl**  
**Delete** → `/api/files/:id` → remove doc + delete files → grid updates

---

## 12) What lives where (Backend)

- **Route** (`routes.auth.js`, `files/file.routes.js`): URL mapping → which controller function runs.
- **Controller** (`auth.controller.js`, `files/file.controller.js`): HTTP layer; parses input, calls services, shapes HTTP responses.
- **Service** (`auth.service.js`, `files/file.service.js`): Business logic; DB/FS calls, QR generation, DTO mapping.
- **Model** (`files/file.model.js`): Mongoose schema for file metadata (name, mime, size, qr paths, uploaderId).
- **Middleware** (`upload.middleware.js`, `authRequired.js`): Cross‑cutting concerns (Multer for uploads, auth guard).

This separation keeps code **testable**, **readable**, and **replaceable** (e.g., swapping disk‑storage → S3 only touches service layer).

---

## 13) Testing Tips

- **Manual API test** with curl/postman:
  ```bash
  # Signup
  curl -i -X POST https://<render>/api/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"a@a.com","password":"123456"}'

  # Me
  curl -i https://<render>/api/me

  # Upload (multipart); 'files' must be the field name
  curl -i -X POST https://<render>/api/files \
    -H "Cookie: session=<...>" \
    -F "files=@./somefile.pdf"
  ```

- **Frontend**: Open DevTools → Network tab. Verify requests go to `/api/...` and `cookie` is present in request/response.

---

## 14) Future Work (nice to have)

- Expiring links / signed URLs
- Drag & drop uploader with progress & cancel
- Shareable short URLs (hashids/shortid)
- Scan analytics per QR (store hits to `/v/:id`)
- Bulk ZIP download of all QR codes
- Real users DB with password hashing + email verification

---

## 15) License
MIT (or your choice).

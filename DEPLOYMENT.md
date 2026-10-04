# Deployment

```
GitHub (rania-medhat/portfolio-update, main)
  ├─ Angular FrontEnd/portfolio-frontend ─► Vercel (static)
  └─ Node Backend ───────────────────────► VPS ─► Nginx (HTTPS) ─► Node :8000 ─► MongoDB + Cloudinary
```

Data lives in MongoDB (records) and Cloudinary (images/CV PDFs), never in Git or on the app server's disk,
so `git pull`, `npm ci`, rebuilds and restarts do not touch it. `Node Backend/uploads/` only serves
old pre-Cloudinary images and is git-ignored.

**No real backend domain is configured in this repository yet.** Everything below uses `api.example.com`
as a placeholder for the subdomain you set up.

## 1. VPS API domain, Nginx, SSL
1. DNS: create an `A` record `api.example.com -> <VPS_PUBLIC_IP>`.
2. Install: `sudo apt install nginx certbot python3-certbot-nginx` and Node 20+ (`node app.js` needs `process.loadEnvFile`, Node 20.12+).
3. `sudo cp deployment/nginx/portfolio-api.conf.example /etc/nginx/sites-available/portfolio-api`, set `server_name`, enable it, `sudo nginx -t && sudo systemctl reload nginx`.
4. `sudo certbot --nginx -d api.example.com`.
5. Firewall: open only 80/443/SSH. MongoDB (27017) and Node (8000) must not be public; run Node with `HOST=127.0.0.1`.

## 2. Backend on the VPS
```bash
git clone https://github.com/rania-medhat/portfolio-update.git && cd portfolio-update/"Node Backend"
cp .env.example .env && nano .env        # fill in the values below; never commit .env
npm ci
npm i -g pm2
pm2 start npm --name portfolio-api -- run start:prod
pm2 save && pm2 startup                   # run the command it prints so PM2 survives reboots
```
Updates: `git pull && cd "Node Backend" && npm ci && pm2 restart portfolio-api`.

`Node Backend/.env` (production):
```env
NODE_ENV=production
PORT=8000
HOST=127.0.0.1
MONGO_URI=<Atlas mongodb+srv URI, or mongodb://127.0.0.1:27017/portfolio for MongoDB installed on the VPS>
CLIENT_ORIGIN=https://<your-project>.vercel.app      # comma-separate to add a custom domain later
CLOUDINARY_CLOUD_NAME=<value>
CLOUDINARY_API_KEY=<value>
CLOUDINARY_API_SECRET=<value>
GOOGLE_CLIENT_ID=<Google OAuth Web client ID>
ADMIN_EMAIL=<admin Google account>
SESSION_SECRET=<32+ random chars: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))">
COOKIE_SAME_SITE=lax
```
**`COOKIE_SAME_SITE`**: use `lax` if frontend and API share a root domain (`portfolio.example.com` + `api.example.com`).
Use `none` if the frontend is on `*.vercel.app` and the API is on a different domain — otherwise the browser will not
send the admin cookie and every admin action returns 401. `none` always sets `Secure` (HTTPS only).

MongoDB: use Atlas, or a system-installed `mongod` (enabled with systemd, bound to localhost). Do not use in-memory MongoDB.

## 3. Frontend on Vercel
1. Edit `Angular FrontEnd/portfolio-frontend/src/environments/environment.ts` and replace `https://YOUR_API_DOMAIN`
   with `https://api.example.com` (your real API origin; no trailing slash, **no `/api`**). Commit and push.
2. Vercel → Add New → Project → Import `rania-medhat/portfolio-update`.
3. Settings: **Root Directory** `Angular FrontEnd/portfolio-frontend`; **Framework Preset** Angular;
   Install `npm ci`; Build `npm run build`; **Output Directory** `dist/portfolio-frontend/browser`.
   These are also set in that folder's `vercel.json`, so leaving the defaults works too.
4. Deploy, then put the resulting `https://<project>.vercel.app` into `CLIENT_ORIGIN` on the VPS and `pm2 restart portfolio-api`.

`vercel.json` rewrites any path without a file extension to `index.html`, so refreshing `/login` or `/dashboard` works
while `.js/.css/.png/...` assets are served normally. `/api` is not proxied; Angular calls the VPS directly.

## 4. Google admin login
Google Cloud Console → APIs & Services → Credentials → your OAuth Web client → **Authorized JavaScript origins**:
add `https://<project>.vercel.app` (and any custom domain later). Only the Client ID is used in the browser.

## 5. Git
```bash
git add . && git status     # confirm no .env, node_modules, dist, .angular/cache, uploads
git commit -m "Prepare portfolio for production deployment"
git push origin main
```

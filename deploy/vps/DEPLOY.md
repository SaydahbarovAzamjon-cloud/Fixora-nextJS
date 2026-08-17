# Fixora VPS deploy — fixoranext.com

## 0) DNS (domain registrar)

| Type | Name | Value |
|------|------|-------|
| A | @ | VPS_IP |
| A | www | VPS_IP |
| A | api | VPS_IP |

## 1) VPS packages

```bash
curl -fsSL https://get.docker.com | sh
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
npm i -g yarn
```

## 2) MongoDB Atlas

https://cloud.mongodb.com → Network Access → Add IP Address → VPS public IP → Confirm.

## 3) Clone repos

```bash
cd ~
git clone <backend-repo> Fixora
git clone <frontend-repo> Fixora-nextJS
```

## 4) Env files

```bash
cp ~/Fixora-nextJS/deploy/vps/backend.env ~/Fixora/.env
cp ~/Fixora-nextJS/deploy/vps/frontend.env.local ~/Fixora-nextJS/.env.local
```

## 5) Deploy backend

```bash
cd ~/Fixora
bash deploy.sh
curl http://localhost:4001/health
```

## 6) Deploy frontend

```bash
cd ~/Fixora-nextJS
bash deploy.sh
curl -I http://localhost:4000
```

## 7) Nginx + SSL

```bash
sudo cp ~/Fixora-nextJS/deploy/vps/nginx-fixoranext.conf /etc/nginx/sites-available/fixoranext
sudo ln -sf /etc/nginx/sites-available/fixoranext /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d fixoranext.com -d www.fixoranext.com -d api.fixoranext.com
```

After Certbot, confirm **every** `server { ... }` block (including `:443`) has:

```nginx
client_max_body_size 12m;
```

Without this, phone profile photos on signup return **HTTP 413** (`Request failed with status code 413`). Frontend also compresses images before upload.

## 8) Firewall

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 9) OAuth consoles

**Google Cloud** → Credentials → OAuth client → Authorized JavaScript origins:
- `https://fixoranext.com`
- `https://www.fixoranext.com`

**Google Cloud** → OAuth consent screen:
- If status is **Testing**, add every Google account that should log in under **Test users** (or publish the app). Testing mode blocks other accounts and often looks like a cancelled popup.
- Frontend prefers Google **ID token** (`loginWithOAuth` token = JWT); auth-code popup is fallback only.

**Kakao Developers** → Platform → Web → Site domain:
- `https://fixoranext.com`

**Kakao Login** → Redirect URI:
- `https://fixoranext.com`

## 10) Smoke test

- https://fixoranext.com
- https://api.fixoranext.com/graphql
- Email / Google / Kakao login

## URLs summary

| Service | URL |
|---------|-----|
| Frontend | https://fixoranext.com |
| API | https://api.fixoranext.com |
| GraphQL | https://api.fixoranext.com/graphql |
| WebSocket | wss://api.fixoranext.com |

# SHREE SHAKTI BILLING — Deployment & Local Network Guide

## 1. Local Network (LAN) Multi-Manager Setup

This is the standard business deployment for Shree Shakti Electric, allowing both managers to work concurrently on two separate PCs connected to the same office Wi-Fi or LAN switch.

```
       [ Manager 1 PC (Hiren) ]                     [ Manager 2 PC (Suresh) ]
             Host Server                                     Client
      Runs: Node.js API + MongoDB                      Opens: Chrome/Edge
      Access: http://localhost:5173              Access: http://192.168.1.15:5173
                   │                                          │
                   └──────────────────┬───────────────────────┘
                                      ▼
                        [ Office Wi-Fi / LAN Router ]
```

### Step 1: Configure the Main Host Computer
1. Open PowerShell and find the local IP address:
   ```powershell
   ipconfig
   ```
   Note the `IPv4 Address` (e.g. `192.168.1.15`).
2. Ensure MongoDB service is running:
   ```powershell
   Get-Service -Name "*mongo*"
   ```
3. Initialize the database seed (one-time):
   ```powershell
   npm.cmd run seed
   ```
4. Start the application:
   ```powershell
   npm.cmd run dev
   ```
   The backend binds to `0.0.0.0:5000` and the frontend binds to `0.0.0.0:5173`.

### Step 2: Open Windows Firewall Port (if required)
If the second computer cannot connect:
```powershell
New-NetFirewallRule -DisplayName "Shree Shakti Billing Server" -Direction Inbound -LocalPort 5000,5173 -Protocol TCP -Action Allow
```

### Step 3: Access from the Second Computer
Open Google Chrome or Edge on Manager 2's computer and navigate to:
```
http://192.168.1.15:5173
```
Both managers can now log in, generate invoices, print PDFs, and collect payments in real time!

---

## 2. Production Cloud Deployment (Linux / Docker)

### Environment Variables
Configure `.env` on production:
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://billing.shreeshaktielectric.com
MONGODB_URI=mongodb+srv://<USER>:<PASS>@cluster.mongodb.net/shree_shakti_billing?retryWrites=true&w=majority
SESSION_SECRET=<LONG_RANDOM_64_CHAR_HEX_KEY>
SESSION_MAX_AGE_DAYS=7
PDF_STORAGE_DIR=/var/data/shree-shakti/pdfs
```

### Process Management with PM2
```bash
# Build both packages
npm run build

# Start server under PM2
pm2 start server/dist/server.js --name "shree-shakti-server" -i max
pm2 save
pm2 startup
```

### Nginx Reverse Proxy with SSL
```nginx
server {
    server_name billing.shreeshaktielectric.com;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/shree-shakti/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl;
    # SSL certificates managed via Certbot
}
```

---

## 3. Database Backup & Disaster Recovery

### Automated Nightly Backup Script
```powershell
$backupDir = "D:\Backups\Mongo_$(Get-Date -Format 'yyyyMMdd')"
mongodump --uri="mongodb://127.0.0.1:27017/shree_shakti_billing" --out="$backupDir"
```

### Restore Command
```powershell
mongorestore --uri="mongodb://127.0.0.1:27017/shree_shakti_billing" --drop "D:\Backups\Mongo_20261112\shree_shakti_billing"
```

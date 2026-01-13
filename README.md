### Preview Production Build
```bash
npm run preview
```

### Development dengan Backend
Untuk development penuh dengan backend:

```bash
# Terminal 1: Jalankan backend
npm run server

# Terminal 2: Jalankan frontend
npm run dev
```

Frontend akan proxy request API ke backend secara otomatis.

## Deployment Production

### 1. Build Frontend
```bash
npm run build
```

### 2. Setup Server Production
```bash
# Install dependencies production
npm install --production

# Set environment variables
export GEMINI_API_KEY=your_production_api_key
export PORT=3001
export NODE_ENV=production

# Jalankan server
npm run server
```

### 3. Setup Nginx (Opsional)
Untuk production dengan Nginx sebagai reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Process Manager (PM2)
Gunakan PM2 untuk production:

```bash
npm install -g pm2
pm2 start server.js --name "image-desc"
pm2 startup
pm2 save

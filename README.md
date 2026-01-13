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

### Tentang Backend Server
Backend menggunakan **Node.js HTTP module native** tanpa framework seperti Express. Ini memberikan:
- ✅ **Lebih ringan** - Tidak ada dependency eksternal (express, cors, dll)
- ✅ **Lebih cepat** - Overhead minimal, startup lebih cepat
- ✅ **Lebih simple** - Cocok untuk production yang tidak terlalu strict
- ✅ **Zero dependencies** - Hanya butuh Node.js core modules

### 1. Build Frontend
```bash
npm run build
```

### 2. Setup Server Production
```bash
# TIDAK PERLU install dependencies production
# Server hanya menggunakan Node.js built-in modules

# Set environment variables
export GEMINI_API_KEY=your_production_api_key
export PORT=3001
export NODE_ENV=production

# Jalankan server langsung
node server.js
```

**Windows PowerShell:**
```powershell
$env:GEMINI_API_KEY="your_production_api_key"
$env:PORT=3001
node server.js
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

### 4. Process Management

Ada 2 metode untuk menjalankan server di production:

#### Metode 1: nohup (Simple & Quick)
```bash
# Make scripts executable
chmod +x *.sh

# Restart server dengan rebuild
./restart-server.sh

# Check status
./status-server.sh

# Stop server
./stop-server.sh

# View logs
tail -f server.log
```

#### Metode 2: systemd (Recommended for Production)
```bash
# Edit service file
nano image-desc.service
# Sesuaikan path dan user

# Install service
sudo cp image-desc.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable image-desc
sudo systemctl start image-desc

# Check status
sudo systemctl status image-desc

# View logs
sudo journalctl -u image-desc -f
```

**Lihat dokumentasi lengkap di:** [SERVER-MANAGEMENT.md](SERVER-MANAGEMENT.md)

### 5. Deployment dengan .env File
Untuk keamanan, gunakan file `.env` di production:

```bash
# .env (di production server)
GEMINI_API_KEY=your_production_api_key
PORT=3001
NODE_ENV=production
```

Kemudian jalankan:
```bash
node server.js  # Akan otomatis baca .env
# atau
./restart-server.sh
```


# Troubleshooting Guide - Image Description Server

## Error 404 pada `/api/generate-description`

### Kemungkinan Penyebab:
1. **Server belum running** atau crash
2. **Routing issue** - URL tidak match
3. **Build folder tidak ada**

### Solusi:

#### 1. Cek apakah server running
```bash
# Cek status PM2
pm2 status

# Atau cek port
netstat -tlnp | grep 3001
# Windows: netstat -ano | findstr :3001
```

#### 2. Cek log server
```bash
# PM2 logs
pm2 logs image-desc

# Atau lihat file log
pm2 logs image-desc --lines 100
```

#### 3. Restart server
```bash
# Gunakan script restart
chmod +x restart-server.sh
./restart-server.sh

# Atau manual
pm2 restart image-desc
```

#### 4. Cek environment variables
```bash
# Pastikan API key sudah di-set
pm2 env image-desc

# Jika belum ada, update
pm2 restart image-desc --update-env
```

#### 5. Test endpoint
```bash
# Test health check
curl http://localhost:3001/api/health

# Test dari luar (production URL)
curl https://imgdesc.produkmastah.com/api/health
```

## Error CORS

### Gejala:
```
Access to fetch at ... has been blocked by CORS policy
```

### Solusi:
Server sudah include CORS headers. Pastikan:
1. Request menggunakan method yang benar (GET/POST)
2. Content-Type header ada di request

## Error "Cannot read properties of undefined"

### Ini biasanya dari browser extension:
- `giveFreely.tsx` = Browser extension, bukan error aplikasi
- `static.cloudflareinsights.com` = Cloudflare analytics, bisa di-ignore

### Cara fix:
- Disable browser extensions saat testing
- Atau ignore error ini (tidak affect aplikasi)

## Server tidak serving static files

### Solusi:
```bash
# 1. Pastikan folder dist ada
ls -la dist/

# 2. Build ulang jika perlu
npm run build

# 3. Restart server
pm2 restart image-desc
```

## Memory Issues

### Jika server crash karena memory:
```bash
# Increase PM2 memory limit
pm2 start server.js --name "image-desc" --max-memory-restart 500M

# Atau edit ecosystem config
pm2 ecosystem
```

## Quick Debug Commands

```bash
# Check if server file exists
ls -la server.js

# Check Node version (min: v18+)
node --version

# Test server langsung (tanpa PM2)
node server.js

# Monitor real-time logs
pm2 logs image-desc --raw

# View server metrics
pm2 monit
```

## Production Deployment Checklist

- [ ] `npm run build` berhasil
- [ ] File `.env` ada dengan `GEMINI_API_KEY`
- [ ] Port 3001 tidak digunakan aplikasi lain
- [ ] Firewall allow port 3001
- [ ] PM2 installed globally
- [ ] Server.js readable dan executable
- [ ] Folder `dist/` ada dan berisi build result

## Restart Sequence

```bash
# Full restart sequence
pm2 stop image-desc
npm run build
pm2 start server.js --name "image-desc"
pm2 save
```

## Contact Debug Info

Jika masih ada masalah, kumpulkan info berikut:
```bash
node --version
pm2 --version
pm2 logs image-desc --lines 50 --nostream
ls -la dist/
cat .env | grep -v GEMINI_API_KEY  # Don't show actual key
curl http://localhost:3001/api/health
```

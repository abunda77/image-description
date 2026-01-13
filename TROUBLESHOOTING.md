# Troubleshooting Guide - Image Description Server

## Error 404 pada `/api/generate-description`

### Kemungkinan Penyebab:
1. **Server belum running** atau crash
2. **Routing issue** - URL tidak match
3. **Build folder tidak ada**

### Solusi:

#### 1. Cek apakah server running
```bash
# Cek status dengan script
./status-server.sh

# Atau cek port manual
netstat -tlnp | grep 3001
# Windows: netstat -ano | findstr :3001

# Atau dengan lsof
lsof -i:3001
```

#### 2. Cek log server
```bash
# Lihat log (nohup method)
tail -f server.log

# Atau lihat semua log
cat server.log

# Systemd method
sudo journalctl -u image-desc -f
```

#### 3. Restart server
```bash
# Gunakan script restart
chmod +x restart-server.sh
./restart-server.sh

# Atau systemd
sudo systemctl restart image-desc
```

#### 4. Cek environment variables
```bash
# Cek file .env
cat .env

# Pastikan GEMINI_API_KEY ada
grep GEMINI_API_KEY .env
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
./restart-server.sh
# atau systemd:
sudo systemctl restart image-desc
```

## Memory Issues

### Jika server crash karena memory:

**Systemd method:**
```bash
# Edit service file
sudo nano /etc/systemd/system/image-desc.service

# Tambahkan di section [Service]:
MemoryMax=500M
MemoryHigh=400M

# Reload dan restart
sudo systemctl daemon-reload
sudo systemctl restart image-desc
```

**Nohup method:**
Monitor dengan `htop` atau restart server secara berkala.

## Quick Debug Commands

```bash
# Check if server file exists
ls -la server.js

# Check Node version (min: v18+)
node --version

# Check server status
./status-server.sh

# Test server langsung (foreground untuk debug)
node server.js

# Monitor real-time logs (nohup)
tail -f server.log

# Monitor with systemd
sudo journalctl -u image-desc -f

# Check process
ps aux | grep node
```

## Production Deployment Checklist

- [ ] `npm run build` berhasil
- [ ] File `.env` ada dengan `GEMINI_API_KEY`
- [ ] Port 3001 tidak digunakan aplikasi lain
- [ ] Firewall allow port 3001
- [ ] Scripts executable (`chmod +x *.sh`)
- [ ] Server.js readable dan executable
- [ ] Folder `dist/` ada dan berisi build result

## Restart Sequence

### Nohup method:
```bash
./stop-server.sh
npm run build
./start-server.sh

# Atau langsung
./restart-server.sh
```

### Systemd method:
```bash
# Rebuild
npm run build

# Restart service
sudo systemctl restart image-desc

# Check status
sudo systemctl status image-desc
```

## Server Won't Start

### Debug steps:
```bash
# 1. Kill any existing process on port
kill -9 $(lsof -ti:3001)

# 2. Remove PID file
rm -f server.pid

# 3. Try starting in foreground to see errors
node server.js

# 4. Check for syntax errors
node --check server.js

# 5. Check permissions
ls -la server.js
chmod +x *.sh
```

## Contact Debug Info

Jika masih ada masalah, kumpulkan info berikut:
```bash
node --version
./status-server.sh
tail -n 50 server.log
ls -la dist/
cat .env | grep -v GEMINI_API_KEY  # Don't show actual key
curl http://localhost:3001/api/health
```

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Port already in use | `kill -9 $(lsof -ti:3001)` |
| PID file exists but no process | `rm -f server.pid && ./start-server.sh` |
| Can't execute script | `chmod +x *.sh` |
| 404 on API | Check logs: `tail -f server.log` |
| Server won't stop | `kill -9 $(lsof -ti:3001)` |
| No logs | Check if `server.log` exists and is writable |

## See Also
- [SERVER-MANAGEMENT.md](SERVER-MANAGEMENT.md) - Complete server management guide
- [README.md](README.md) - General documentation

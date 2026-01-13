# Server Management Scripts

Script untuk mengelola server production **tanpa PM2**, menggunakan **nohup** atau **systemd**.

## 📋 File Scripts

1. **restart-server.sh** - Restart server dengan rebuild frontend
2. **start-server.sh** - Start server (tanpa rebuild)
3. **stop-server.sh** - Stop server
4. **status-server.sh** - Cek status server

## 🚀 Quick Start

### Metode 1: Menggunakan nohup (Simple)

```bash
# Make scripts executable
chmod +x *.sh

# Restart server (dengan build)
./restart-server.sh

# Check status
./status-server.sh

# View logs
tail -f server.log

# Stop server
./stop-server.sh
```

### Metode 2: Menggunakan systemd (Production)

Lebih proper untuk production server:

```bash
# 1. Edit file service
nano image-desc.service

# Ganti:
# - /path/to/image-desc dengan path actual
# - User=www-data dengan user yang sesuai

# 2. Copy ke systemd
sudo cp image-desc.service /etc/systemd/system/

# 3. Reload systemd
sudo systemctl daemon-reload

# 4. Enable auto-start
sudo systemctl enable image-desc

# 5. Start service
sudo systemctl start image-desc

# 6. Check status
sudo systemctl status image-desc
```

## 📊 Status & Monitoring

```bash
# Check if server is running
./status-server.sh

# View live logs (nohup method)
tail -f server.log

# View logs (systemd method)
sudo journalctl -u image-desc -f

# Check port
netstat -tlnp | grep 3001
# or
lsof -i:3001
```

## 🔄 Common Operations

### Start Server
```bash
# Nohup method
./start-server.sh

# Systemd method
sudo systemctl start image-desc
```

### Stop Server
```bash
# Nohup method
./stop-server.sh

# Systemd method
sudo systemctl stop image-desc
```

### Restart Server
```bash
# Nohup method (dengan rebuild)
./restart-server.sh

# Systemd method
sudo systemctl restart image-desc
```

### Deploy Update
```bash
# Pull latest code
git pull origin main

# Restart server (will auto-rebuild)
./restart-server.sh

# Or dengan systemd
sudo systemctl restart image-desc
```

## 🐛 Troubleshooting

### Server tidak mau start
```bash
# Check logs
cat server.log

# Check if port in use
lsof -i:3001

# Manual start untuk debug
node server.js
```

### Process zombie/stuck
```bash
# Kill by port
kill -9 $(lsof -ti:3001)

# Remove PID file
rm -f server.pid

# Start fresh
./restart-server.sh
```

### Permission issues
```bash
# Make scripts executable
chmod +x *.sh

# Fix ownership
chown -R $USER:$USER .
```

## 📝 Files Generated

- `server.pid` - Process ID file
- `server.log` - Server logs
- `nohup.out` - Backup log (if any)

## 🔒 Security Notes

### Systemd method (recommended)
- Auto-restart on failure
- Proper user isolation
- System log integration
- Auto-start on boot

### Nohup method
- Simple & lightweight
- No external dependencies
- Easy to debug
- Manual management

## 💡 Tips

1. **Use systemd for production** - More reliable & manageable
2. **Use nohup for quick testing** - Simple & fast
3. **Always check logs** - `tail -f server.log`
4. **Monitor resources** - `./status-server.sh`
5. **Keep .env secure** - Don't commit to git

## 🆚 PM2 vs nohup vs systemd

| Feature | PM2 | nohup | systemd |
|---------|-----|-------|---------|
| Auto-restart | ✅ | ❌ | ✅ |
| Log rotation | ✅ | ❌ | ✅ |
| Clustering | ✅ | ❌ | ❌ |
| Dependencies | npm | none | none |
| Complexity | Medium | Low | Medium |
| Production | ✅ | ⚠️ | ✅✅ |

**Rekomendasi:**
- Development: `npm run server` atau `nohup`
- Production: `systemd` atau `PM2`
- Quick deploy: `nohup` scripts

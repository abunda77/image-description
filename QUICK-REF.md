# Quick Reference - Server Management

## 🚀 Start Server
```bash
./start-server.sh
```

## 🔄 Restart Server (with rebuild)
```bash
./restart-server.sh
```

## ⏹️ Stop Server
```bash
./stop-server.sh
```

## 📊 Check Status
```bash
./status-server.sh
```

## 📋 View Logs
```bash
# Live tail
tail -f server.log

# Last 50 lines
tail -n 50 server.log

# All logs
cat server.log
```

## 🔍 Troubleshooting

### Port already in use
```bash
kill -9 $(lsof -ti:3001)
```

### Server won't start
```bash
rm -f server.pid
./restart-server.sh
```

### Check if running
```bash
lsof -i:3001
# or
./status-server.sh
```

## 📦 Deploy Update
```bash
git pull origin main
./restart-server.sh
```

## 🌐 Test Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Production
curl https://imgdesc.produkmastah.com/api/health
```

## 🔧 First Time Setup
```bash
# 1. Clone repo
git clone <repo-url>
cd image-desc

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
GEMINI_API_KEY=your_key_here
PORT=3001
NODE_ENV=production
EOF

# 4. Build frontend
npm run build

# 5. Make scripts executable
chmod +x *.sh

# 6. Start server
./restart-server.sh
```

## 📖 More Info
- Full guide: [SERVER-MANAGEMENT.md](SERVER-MANAGEMENT.md)
- Troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Main docs: [README.md](README.md)

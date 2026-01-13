# Deployment Checklist for OLS + Node.js

## ✅ Pre-Deployment

- [ ] Node.js installed (v18+)
  ```bash
  node --version
  ```

- [ ] Project cloned and dependencies installed
  ```bash
  cd ~/image-desc
  npm install
  ```

- [ ] Environment file configured
  ```bash
  cat .env
  # Should contain: GEMINI_API_KEY=xxx
  ```

- [ ] Frontend built successfully
  ```bash
  npm run build
  ls -la dist/
  # Should see index.html and assets/
  ```

---

## ✅ OLS Configuration

- [ ] vHost exists for imgdesc.produkmastah.com
  - Via CyberPanel: Websites → List

- [ ] docRoot points to dist folder
  ```
  docRoot = $VH_ROOT/public_html/dist
  ```

- [ ] SSL certificate installed
  - Check: https://imgdesc.produkmastah.com (green padlock)

- [ ] External processor added (nodejs_backend)
  ```apache
  extprocessor nodejs_backend {
    type                    proxy
    address                 http://127.0.0.1:3001
    maxConns                100
    pcKeepAliveTimeout      60
    initTimeout             60
    retryTimeout            0
    respBuffer              0
  }
  ```

- [ ] Context for /api added
  ```apache
  context /api {
    type                    proxy
    handler                 nodejs_backend
    addDefaultCharset       off
  }
  ```

- [ ] OLS gracefully restarted
  ```bash
  sudo systemctl restart lsws
  # or via CyberPanel
  ```

---

## ✅ Node.js Backend

- [ ] Scripts are executable
  ```bash
  chmod +x *.sh
  ```

- [ ] Backend server can start
  ```bash
  ./start-server.sh
  ```

- [ ] Server is running on port 3001
  ```bash
  lsof -i:3001
  # Should show node process
  ```

- [ ] Health endpoint responds
  ```bash
  curl http://localhost:3001/api/health
  # Should return: {"status":"OK",...}
  ```

- [ ] Server auto-starts on reboot (optional but recommended)
  ```bash
  sudo cp image-desc.service /etc/systemd/system/
  sudo systemctl enable image-desc
  sudo systemctl start image-desc
  ```

---

## ✅ Integration Testing

- [ ] Static files load via HTTPS
  ```bash
  curl -I https://imgdesc.produkmastah.com/
  # Should return 200 OK
  ```

- [ ] API health via domain works
  ```bash
  curl https://imgdesc.produkmastah.com/api/health
  # Should return: {"status":"OK",...}
  ```

- [ ] Frontend loads in browser
  - Open: https://imgdesc.produkmastah.com
  - Check: No console errors

- [ ] Image upload works
  - Upload test image
  - Click "Generate Description"
  - Check: Description appears

- [ ] Check browser network tab
  - POST request to /api/generate-description
  - Status: 200 OK
  - Response: JSON with description

---

## ✅ Security

- [ ] Port 3001 NOT exposed to internet
  ```bash
  # Should only be accessible from localhost
  curl -I http://YOUR_SERVER_IP:3001/api/health
  # Should FAIL (connection refused)
  ```

- [ ] .env file NOT in public folder
  ```bash
  ls -la ~/public_html/
  # Should NOT see .env
  ```

- [ ] GEMINI_API_KEY not committed to git
  ```bash
  git log --all -p | grep GEMINI_API_KEY
  # Should return nothing
  ```

- [ ] Firewall configured
  ```bash
  sudo firewall-cmd --list-all
  # Port 3001 should NOT be in list
  ```

---

## ✅ Monitoring

- [ ] Logs are being written
  ```bash
  tail -f ~/image-desc/server.log
  ```

- [ ] OLS logs accessible
  ```bash
  tail -f /usr/local/lsws/logs/error.log
  tail -f ~/logs/imgdesc.produkmastah.com.error_log
  ```

- [ ] Status script works
  ```bash
  ./status-server.sh
  ```

---

## ✅ Performance

- [ ] Page load time < 3 seconds
  - Test: https://www.webpagetest.org/

- [ ] API response time < 30 seconds
  - Upload test image, measure time

- [ ] No memory leaks
  ```bash
  ./status-server.sh
  # Check memory usage over time
  ```

---

## 🔧 Troubleshooting Checklist

If something doesn't work:

- [ ] Check Node.js is running
  ```bash
  ./status-server.sh
  ```

- [ ] Check OLS error logs
  ```bash
  tail -f /usr/local/lsws/logs/error.log
  ```

- [ ] Check backend logs
  ```bash
  tail -f server.log
  ```

- [ ] Test backend directly
  ```bash
  curl http://localhost:3001/api/health
  ```

- [ ] Test via domain
  ```bash
  curl https://imgdesc.produkmastah.com/api/health
  ```

- [ ] Restart everything
  ```bash
  ./restart-server.sh
  sudo systemctl restart lsws
  ```

---

## 📝 Post-Deployment

- [ ] Document any custom configurations
- [ ] Set up monitoring/alerting (optional)
- [ ] Schedule regular backups
- [ ] Test auto-restart on server reboot
- [ ] Update DNS if needed
- [ ] Share access with team

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ https://imgdesc.produkmastah.com loads without errors  
✅ Image upload and description generation works  
✅ API requests go through (check Network tab)  
✅ Backend logs show successful requests  
✅ No 404 or 502 errors in production  

---

## Quick Deploy Commands

```bash
# Pull latest code
cd ~/image-desc
git pull origin main

# Build frontend
npm run build

# Copy dist to public_html
cp -r dist/* ~/public_html/dist/

# Restart backend
./restart-server.sh

# Restart OLS (if config changed)
sudo systemctl restart lsws
```

---

## Support Files

- 📖 [OLS-CONFIG-GUIDE.md](OLS-CONFIG-GUIDE.md) - Detailed OLS setup
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- 🚀 [QUICK-REF.md](QUICK-REF.md) - Quick commands reference
- 🐛 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

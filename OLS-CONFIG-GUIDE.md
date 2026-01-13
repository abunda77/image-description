# OpenLiteSpeed Configuration Guide

## Problem
Static files served correctly, but API endpoints return 404.

## Root Cause
OLS serves static files from `dist/` but doesn't proxy API requests to Node.js backend running on port 3001.

## Solution

### Method 1: Using CyberPanel GUI (Recommended)

#### Step 1: Add External App (Proxy to Node.js)

1. Login to **CyberPanel**
2. Go to **Websites** → Select `imgdesc.produkmastah.com`
3. Go to **Manage** → **vHost Conf**
4. Add this configuration **before** the closing brace:

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

context /api {
  type                    proxy
  handler                 nodejs_backend
  addDefaultCharset       off
}
```

5. Click **Save**
6. **Graceful Restart** OLS

#### Step 2: Verify

```bash
# Test health endpoint
curl https://imgdesc.produkmastah.com/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

### Method 2: Manual vHost Config Edit

Edit vhost config file manually:

```bash
# Find your vhost config
# Usually at: /usr/local/lsws/conf/vhosts/imgdesc.produkmastah.com/vhconf.conf

sudo nano /usr/local/lsws/conf/vhosts/imgdesc.produkmastah.com/vhconf.conf
```

Add the external processor and context as shown above.

Then restart OLS:
```bash
sudo systemctl restart lsws
# or
/usr/local/lsws/bin/lswsctrl restart
```

### Complete vHost Configuration Example

```apache
docRoot                   $VH_ROOT/public_html/dist
vhDomain                  $VH_NAME
vhAliases                 www.$VH_NAME
adminEmails               erie00024@gmail.com
enableGzip                1
enableIpGeo               1

index  {
  useServer               0
  indexFiles              index.html
}

errorlog $VH_ROOT/logs/$VH_NAME.error_log {
  useServer               0
  logLevel                WARN
  rollingSize             10M
}

accesslog $VH_ROOT/logs/$VH_NAME.access_log {
  useServer               0
  logFormat               "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\""
  logHeaders              5
  rollingSize             10M
  keepDays                10  
  compressArchive         1
}

# NEW: External processor for Node.js backend
extprocessor nodejs_backend {
  type                    proxy
  address                 http://127.0.0.1:3001
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

# NEW: Context to proxy /api requests
context /api {
  type                    proxy
  handler                 nodejs_backend
  addDefaultCharset       off
}

# Keep existing SSL config
vhssl  {
  keyFile                 /etc/letsencrypt/live/imgdesc.produkmastah.com/privkey.pem
  certFile                /etc/letsencrypt/live/imgdesc.produkmastah.com/fullchain.pem
  certChain               1
  sslProtocol             24
  enableECDHE             1
  renegProtection         1
  sslSessionCache         1
  enableSpdy              15
  enableStapling          1
  ocspRespMaxAge          86400
}

# Keep existing rewrite rules
rewrite  {
  enable                  1
  autoLoadHtaccess        1
}

# Keep well-known context
context /.well-known/acme-challenge {
  location                /usr/local/lsws/Example/html/.well-known/acme-challenge
  allowBrowse             1

  rewrite  {
    enable                  0
  }
  addDefaultCharset       off
}
```

## Important Notes

### 1. Make Sure Node.js Server is Running
```bash
# Check if server is running
./status-server.sh

# Or check port
lsof -i:3001

# Start if not running
./restart-server.sh
```

### 2. Firewall Rules
Node.js backend should **NOT** be exposed to public. Only accessible from localhost.

```bash
# Check firewall
sudo firewall-cmd --list-all

# Port 3001 should NOT be open to public
# Only OLS proxy should access it via localhost
```

### 3. Auto-start Node.js on Boot

Use systemd service:

```bash
# Copy service file
sudo cp image-desc.service /etc/systemd/system/

# Edit paths
sudo nano /etc/systemd/system/image-desc.service

# Enable and start
sudo systemctl enable image-desc
sudo systemctl start image-desc

# Check status
sudo systemctl status image-desc
```

## Testing

### 1. Test Static Files
```bash
curl https://imgdesc.produkmastah.com/
# Should return HTML
```

### 2. Test API Health
```bash
curl https://imgdesc.produkmastah.com/api/health
# Should return: {"status":"OK","timestamp":"..."}
```

### 3. Test from Browser Console
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

## Troubleshooting

### API still returns 404

1. **Check OLS error log:**
```bash
tail -f /usr/local/lsws/logs/error.log
tail -f $VH_ROOT/logs/imgdesc.produkmastah.com.error_log
```

2. **Check if Node.js is running:**
```bash
./status-server.sh
```

3. **Test backend directly:**
```bash
curl http://localhost:3001/api/health
```

4. **Restart both OLS and Node.js:**
```bash
./restart-server.sh
sudo systemctl restart lsws
```

### 502 Bad Gateway

Backend Node.js not running or crashed:
```bash
./status-server.sh
./restart-server.sh
```

### 504 Gateway Timeout

Backend too slow or not responding:
- Check Node.js logs: `tail -f server.log`
- Increase `initTimeout` in OLS config

## Alternative: Using .htaccess (Not Recommended)

You can also use `.htaccess` in `dist/` folder, but direct vhost config is better:

```apache
# dist/.htaccess
RewriteEngine On

# Proxy API requests to Node.js
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]

# Fallback to index.html for SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

## Summary

- ✅ **Static files** → Served by OLS from `dist/`
- ✅ **API requests** (`/api/*`) → Proxied to Node.js on port 3001
- ✅ **Node.js backend** → Running on localhost:3001 (not exposed)
- ✅ **SSL/HTTPS** → Handled by OLS

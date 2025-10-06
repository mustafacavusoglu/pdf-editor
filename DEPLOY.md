# Ubuntu Sunucuya Deployment Rehberi

## 1. Sunucuya Gerekli Yazılımları Kurun

```bash
# Node.js ve npm kurulumu (NodeSource repository ile)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git kurulumu
sudo apt-get install -y git

# PM2 kurulumu (process manager)
sudo npm install -g pm2

# Nginx kurulumu (opsiyonel - reverse proxy için)
sudo apt-get install -y nginx
```

## 2. Projeyi Sunucuya Aktarın

### Seçenek A: Git ile (Önerilen)
```bash
# Önce projenizi GitHub/GitLab'a push edin
# Sonra sunucuda:
cd /var/www
sudo git clone <your-repository-url> free-pdf
cd free-pdf
```

### Seçenek B: SCP ile
```bash
# Yerel makinenizden:
cd /Users/mustafacavusoglu/workspace/free-pdf
tar -czf free-pdf.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .
scp free-pdf.tar.gz your-user@your-server-ip:/tmp/

# Sunucuda:
sudo mkdir -p /var/www/free-pdf
cd /var/www/free-pdf
sudo tar -xzf /tmp/free-pdf.tar.gz
```

## 3. Projeyi Sunucuda Çalıştırın

```bash
cd /var/www/free-pdf

# Bağımlılıkları kurun (--legacy-peer-deps ile)
npm install --legacy-peer-deps

# Production build oluşturun
npm run build

# PM2 ile başlatın
pm2 start ecosystem.config.js

# PM2'yi sistem başlangıcına ekleyin
pm2 startup
pm2 save
```

## 4. Nginx Ayarları (Opsiyonel - Domain ile yayın için)

```bash
# Nginx config dosyası oluşturun
sudo nano /etc/nginx/sites-available/free-pdf
```

Aşağıdaki içeriği yapıştırın:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Domain adınızı yazın veya IP adresinizi

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # PDF dosyaları için özel ayarlar
        client_max_body_size 50M;
    }
}
```

Nginx'i etkinleştirin:

```bash
# Config'i etkinleştir
sudo ln -s /etc/nginx/sites-available/free-pdf /etc/nginx/sites-enabled/

# Nginx test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

## 5. Güvenlik Duvarı Ayarları

```bash
# Port 80 (HTTP) açın
sudo ufw allow 80

# Port 443 (HTTPS) açın - SSL için
sudo ufw allow 443

# Port 3000'i sadece localhost'tan erişilebilir yapın (Nginx kullanıyorsanız)
# sudo ufw allow 3000  # Direkt erişim istiyorsanız
```

## 6. SSL Sertifikası (HTTPS için - Opsiyonel)

```bash
# Certbot kurulumu
sudo apt-get install -y certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d your-domain.com
```

## 7. Yararlı PM2 Komutları

```bash
# Uygulamayı görüntüle
pm2 list

# Logları görüntüle
pm2 logs free-pdf

# Uygulamayı yeniden başlat
pm2 restart free-pdf

# Uygulamayı durdur
pm2 stop free-pdf

# Uygulamayı sil
pm2 delete free-pdf

# Monitoring
pm2 monit
```

## 8. Güncelleme İşlemi

```bash
cd /var/www/free-pdf

# Git ile (Seçenek A)
git pull
npm install --legacy-peer-deps
npm run build
pm2 restart free-pdf

# SCP ile (Seçenek B)
# Yeni dosyaları aktarın ve tekrar build edin
npm install --legacy-peer-deps
npm run build
pm2 restart free-pdf
```

## Port Ayarları

- Varsayılan port: **3000**
- Port değiştirmek için `ecosystem.config.js` dosyasındaki `PORT` değerini düzenleyin
- Nginx kullanmadan direkt erişim: `http://your-server-ip:3000`
- Nginx ile: `http://your-domain.com` veya `http://your-server-ip`

## Sorun Giderme

### Port zaten kullanımda
```bash
# 3000 portunu kullanan process'i bulun
sudo lsof -i :3000
# Process'i sonlandırın
sudo kill -9 <PID>
```

### Build hatası
```bash
# Node_modules'ü temizle
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Bellek hatası
```bash
# Node.js bellek limitini artırın
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```


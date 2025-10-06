#!/bin/bash

# Ubuntu sunucuya deployment script
# Kullanım: ./deploy.sh username@server-ip

if [ -z "$1" ]; then
    echo "Kullanım: ./deploy.sh username@server-ip"
    exit 1
fi

SERVER=$1
DEPLOY_PATH="/var/www/free-pdf"

echo "🚀 Projeyi hazırlıyorum..."

# Geçici dizin oluştur
TMP_DIR=$(mktemp -d)

# Dosyaları kopyala (node_modules ve .next hariç)
rsync -av \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=*.log \
    --exclude=.DS_Store \
    --exclude=.env*.local \
    . $TMP_DIR/

echo "📦 Dosyalar arşivleniyor..."
cd $TMP_DIR
tar -czf free-pdf.tar.gz .

echo "📤 Sunucuya gönderiliyor..."
scp free-pdf.tar.gz $SERVER:/tmp/

echo "🔧 Sunucuda kurulum yapılıyor..."
ssh $SERVER << 'EOF'
    echo "📁 Dizin oluşturuluyor..."
    sudo mkdir -p /var/www/free-pdf
    
    echo "📦 Dosyalar açılıyor..."
    cd /var/www/free-pdf
    sudo tar -xzf /tmp/free-pdf.tar.gz
    
    echo "📚 Bağımlılıklar kuruluyor..."
    sudo npm install --legacy-peer-deps
    
    echo "🏗️  Build oluşturuluyor..."
    sudo npm run build
    
    echo "🔄 PM2 ile başlatılıyor/yeniden başlatılıyor..."
    if pm2 list | grep -q "free-pdf"; then
        pm2 restart free-pdf
    else
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    echo "🧹 Geçici dosyalar temizleniyor..."
    rm /tmp/free-pdf.tar.gz
    
    echo "✅ Deployment tamamlandı!"
    pm2 list
EOF

# Geçici dosyaları temizle
rm -rf $TMP_DIR

echo "🎉 İşlem tamamlandı!"
echo "🌐 Uygulamanız http://SERVER_IP:3000 adresinde çalışıyor"


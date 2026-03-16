#!/bin/bash
# Chalixus (Pterodactyl Fork) Automated Installer for Ubuntu 24.04 LTS
set -e

echo "============================================================="
echo "        Chalixus Panel Automated Installer                   "
echo "        Supported OS: Ubuntu 24.04 LTS                       "
echo "============================================================="
echo ""

# ---------------------------------------------------------
# UPDATE THIS LINK ONCE YOU PUSH YOUR REPOSITORY TO GITHUB!
# ---------------------------------------------------------
GITHUB_REPO_URL="https://github.com/Xiled0001/chalixus-panel.git"

# Collect Information
read -p "Enter your panel FQDN (e.g., panel.yourdomain.com): " FQDN
read -p "Enter Let's Encrypt email (for SSL notifications): " SSL_EMAIL
read -p "Enter the secure database password for the panel: " DB_PASSWORD
echo ""
echo "--- Admin Account Setup ---"
read -p "Enter initial admin email: " ADMIN_EMAIL
read -p "Enter initial admin username: " ADMIN_USERNAME
read -p "Enter initial admin first name: " ADMIN_FIRST
read -p "Enter initial admin last name: " ADMIN_LAST
read -p "Enter initial admin password: " ADMIN_PASSWORD
echo ""

echo "=> [1/9] Installing system dependencies (Nginx, MariaDB, PHP 8.3, Redis)..."
sleep 2
apt update
apt -y install software-properties-common curl apt-transport-https ca-certificates gnupg
LC_ALL=C.UTF-8 add-apt-repository -y ppa:ondrej/php
apt update
apt -y install php8.3 php8.3-{common,cli,gd,mysql,mbstring,bcmath,xml,fpm,curl,zip} mariadb-server nginx tar unzip git redis-server certbot python3-certbot-nginx

echo "=> [2/9] Installing Composer..."
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

echo "=> [3/9] Installing Node.js (v20) & Yarn..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt -y install nodejs
npm install -g yarn

echo "=> [4/9] Preparing Database..."
mysql -e "CREATE USER IF NOT EXISTS 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "CREATE DATABASE IF NOT EXISTS panel;"
mysql -e "GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;"
mysql -e "FLUSH PRIVILEGES;"

echo "=> [5/9] Downloading Chalixus Panel from GitHub..."
mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl
if [ ! -d "/var/www/pterodactyl/.git" ]; then
    git clone $GITHUB_REPO_URL .
else
    git pull
fi
chmod -R 755 storage/* bootstrap/cache/

echo "=> [6/9] Compiling UI Assets & Installing Dependencies..."
composer install --no-dev --optimize-autoloader
yarn install
yarn build:production

echo "=> [7/9] Configuring Environment & Database Migrations..."
cp .env.example .env
php artisan key:generate --force

# Configure .env without interactive prompts
sed -i "s|APP_URL=http://localhost|APP_URL=https://${FQDN}|" .env
sed -i "s/DB_PASSWORD=/DB_PASSWORD=${DB_PASSWORD}/" .env
sed -i "s/CACHE_DRIVER=file/CACHE_DRIVER=redis/" .env
sed -i "s/SESSION_DRIVER=file/SESSION_DRIVER=redis/" .env
sed -i "s/QUEUE_CONNECTION=sync/QUEUE_CONNECTION=redis/" .env
sed -i "s/REDIS_HOST=127.0.0.1/REDIS_HOST=127.0.0.1/" .env
sed -i "s/REDIS_PASSWORD=null/REDIS_PASSWORD=null/" .env
sed -i "s/REDIS_PORT=6379/REDIS_PORT=6379/" .env

php artisan migrate --seed --force

echo "=> Creating Admin User..."
php artisan p:user:make --email="${ADMIN_EMAIL}" --username="${ADMIN_USERNAME}" --name-first="${ADMIN_FIRST}" --name-last="${ADMIN_LAST}" --password="${ADMIN_PASSWORD}" --admin=1

echo "=> Setting Permissions..."
chown -R www-data:www-data /var/www/pterodactyl/*

echo "=> [8/9] Setting up Cron & Queue Worker..."
(crontab -l 2>/dev/null; echo "* * * * * php /var/www/pterodactyl/artisan schedule:run >> /dev/null 2>&1") | crontab -

cat << 'EOF' > /etc/systemd/system/pteroq.service
[Unit]
Description=Pterodactyl Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/pterodactyl/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now pteroq.service
systemctl enable --now redis-server

echo "=> [9/9] Obtaining SSL Certificate and Configuring Nginx..."
certbot --nginx -d $FQDN --non-interactive --agree-tos -m $SSL_EMAIL

rm -f /etc/nginx/sites-enabled/default

cat << EOF > /etc/nginx/sites-available/pterodactyl.conf
server {
    listen 80;
    server_name ${FQDN};
    return 301 https://\$server_name\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name ${FQDN};
    root /var/www/pterodactyl/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/${FQDN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${FQDN}/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/pterodactyl.app-access.log;
    error_log  /var/log/nginx/pterodactyl.app-error.log error;

    client_max_body_size 100m;
    client_body_timeout 120s;
    sendfile off;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param PHP_VALUE "upload_max_filesize = 100M \n post_max_size=100M";
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
        include /etc/nginx/fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

ln -s /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/pterodactyl.conf
systemctl restart nginx

echo "=========================================================="
echo "          Setup Completed Successfully!                   "
echo "      Your panel is available at: https://${FQDN}         "
echo "=========================================================="

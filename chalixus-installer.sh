#!/bin/bash
# Chalixus (Pterodactyl Fork) Automated Installer
# Supported OS: Ubuntu 20.04 / 22.04 / 24.04 LTS, Debian 11 / 12
set -e

echo "============================================================="
echo "        Chalixus Panel Automated Installer                   "
echo "        Supported OS: Ubuntu 20.04/22.04/24.04, Debian 11/12 "
echo "============================================================="
echo ""

# ---------------------------------------------------------
# UPDATE THIS LINK ONCE YOU PUSH YOUR REPOSITORY TO GITHUB!
# ---------------------------------------------------------
GITHUB_REPO_URL="https://github.com/Xiled0001/chalixus-panel.git"

# ── OS Detection ──────────────────────────────────────────
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_ID=$ID          # ubuntu | debian
    OS_CODENAME=$VERSION_CODENAME
else
    echo "ERROR: Cannot detect OS. /etc/os-release not found."
    exit 1
fi

case "$OS_ID" in
    ubuntu|debian) ;;
    *)
        echo "ERROR: Unsupported OS '$OS_ID'. This installer supports Ubuntu and Debian only."
        exit 1
        ;;
esac

echo "Detected OS: $OS_ID $VERSION_ID ($OS_CODENAME)"
echo ""

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

# ── [1/9] System Dependencies ─────────────────────────────
echo "=> [1/9] Installing system dependencies (Nginx, MariaDB, PHP 8.3, Redis)..."
sleep 2

apt update
apt -y install software-properties-common curl apt-transport-https ca-certificates gnupg lsb-release

# Add the correct PHP repository depending on the OS
if [ "$OS_ID" = "ubuntu" ]; then
    echo "Adding ondrej/php PPA for Ubuntu..."
    LC_ALL=C.UTF-8 add-apt-repository -y ppa:ondrej/php
elif [ "$OS_ID" = "debian" ]; then
    echo "Adding sury.org PHP repository for Debian..."
    curl -sSLo /usr/share/keyrings/deb.sury.org-php.gpg \
        https://packages.sury.org/php/apt.gpg
    echo "deb [signed-by=/usr/share/keyrings/deb.sury.org-php.gpg] \
https://packages.sury.org/php/ ${OS_CODENAME} main" \
        > /etc/apt/sources.list.d/php.list
fi

apt update

# Install PHP packages individually — avoids brace-expansion failures
# that occur when the PPA is not yet active at the time apt runs.
apt -y install \
    php8.3 \
    php8.3-common \
    php8.3-cli \
    php8.3-gd \
    php8.3-mysql \
    php8.3-mbstring \
    php8.3-bcmath \
    php8.3-xml \
    php8.3-fpm \
    php8.3-curl \
    php8.3-zip \
    mariadb-server \
    nginx \
    tar \
    unzip \
    git \
    redis-server \
    certbot \
    python3-certbot-nginx

# ── [2/9] Composer ────────────────────────────────────────
echo "=> [2/9] Installing Composer..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# ── [3/9] Node.js & Yarn ──────────────────────────────────
echo "=> [3/9] Installing Node.js (v22) & Yarn..."
# Remove any existing Node.js to prevent version conflicts
apt remove -y nodejs 2>/dev/null || true
rm -f /etc/apt/sources.list.d/nodesource.list
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs
npm install -g yarn

# ── [4/9] Database ────────────────────────────────────────
echo "=> [4/9] Preparing Database..."
mysql -e "CREATE USER IF NOT EXISTS 'pterodactyl'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "CREATE DATABASE IF NOT EXISTS panel;"
mysql -e "GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;"
mysql -e "FLUSH PRIVILEGES;"

# ── [5/9] Clone Repository ────────────────────────────────
echo "=> [5/9] Downloading Chalixus Panel from GitHub..."
mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl
if [ ! -d "/var/www/pterodactyl/.git" ]; then
    git clone "$GITHUB_REPO_URL" .
else
    git pull
fi
chmod -R 755 storage/* bootstrap/cache/

# ── [6/9] UI Assets & Dependencies ───────────────────────
echo "=> [6/9] Compiling UI Assets & Installing Dependencies..."
composer install --no-dev --optimize-autoloader
yarn install --ignore-engines
yarn build:production

# ── [7/9] Environment & Migrations ───────────────────────
echo "=> [7/9] Configuring Environment & Database Migrations..."
cp .env.example .env
php artisan key:generate --force

sed -i "s|APP_URL=http://localhost|APP_URL=https://${FQDN}|" .env
sed -i "s/DB_PASSWORD=/DB_PASSWORD=${DB_PASSWORD}/" .env
sed -i "s/CACHE_DRIVER=file/CACHE_DRIVER=redis/" .env
sed -i "s/SESSION_DRIVER=file/SESSION_DRIVER=redis/" .env
sed -i "s/QUEUE_CONNECTION=sync/QUEUE_CONNECTION=redis/" .env

php artisan migrate --seed --force

echo "=> Creating Admin User..."
php artisan p:user:make \
    --email="${ADMIN_EMAIL}" \
    --username="${ADMIN_USERNAME}" \
    --name-first="${ADMIN_FIRST}" \
    --name-last="${ADMIN_LAST}" \
    --password="${ADMIN_PASSWORD}" \
    --admin=1

echo "=> Setting Permissions..."
chown -R www-data:www-data /var/www/pterodactyl/*

# ── [8/9] Cron & Queue Worker ─────────────────────────────
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

# ── [9/9] SSL & Nginx ─────────────────────────────────────
echo "=> [9/9] Obtaining SSL Certificate and Configuring Nginx..."
certbot --nginx -d "$FQDN" --non-interactive --agree-tos -m "$SSL_EMAIL"

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

ln -sf /etc/nginx/sites-available/pterodactyl.conf /etc/nginx/sites-enabled/pterodactyl.conf
systemctl restart nginx

echo "=========================================================="
echo "          Setup Completed Successfully!                   "
echo "      Your panel is available at: https://${FQDN}         "
echo "=========================================================="

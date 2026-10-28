#!/bin/bash
# ==============================================================================
# Swaramayi Real Estate CRM & Public Website - AWS EC2 Native Deployment (NO DOCKER)
# Stack: Node.js 20 LTS + PM2 + Nginx + Certbot SSL on Ubuntu 22.04 / 24.04 LTS
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}🚀 SWARNAMAYI - NATIVE AWS EC2 DEPLOYMENT (NO DOCKER / NO COMPOSE)${NC}"
echo -e "${CYAN}====================================================================${NC}"

PROJECT_DIR=$(pwd)
APP_DIR="/var/www/swaramayi"

# 1. Update Ubuntu packages
echo -e "\n${YELLOW}[1/8] Updating system packages & installing prerequisites...${NC}"
sudo apt-get update -y
sudo apt-get install -y curl git ufw nginx certbot python3-certbot-nginx build-essential

# 2. Add Swap Space (2GB) to prevent Out-Of-Memory errors during npm build on t2.micro/t3.micro
echo -e "\n${YELLOW}[2/8] Checking swap memory for smooth builds...${NC}"
if [ $(swapon --show | wc -l) -le 1 ]; then
    echo -e "${CYAN}Configuring 2GB swap file...${NC}"
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}✅ Swap memory enabled.${NC}"
else
    echo -e "${GREEN}✅ Swap memory already present.${NC}"
fi

# 3. Install Node.js 20 LTS & PM2
echo -e "\n${YELLOW}[3/8] Checking Node.js 20 & PM2 installation...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v) != v20* && $(node -v) != v22* ]]; then
    echo -e "${CYAN}Installing Node.js 20 LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo -e "${GREEN}Node.js Version: $(node -v)${NC}"
echo -e "${GREEN}NPM Version:     $(npm -v)${NC}"

if ! command -v pm2 &> /dev/null; then
    echo -e "${CYAN}Installing PM2 process manager...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}PM2 is already installed: $(pm2 -v)${NC}"
fi

# 4. Synchronize project to /var/www/swaramayi
echo -e "\n${YELLOW}[4/8] Synchronizing application files to $APP_DIR...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

if [ "$PROJECT_DIR" != "$APP_DIR" ]; then
    cp -r $PROJECT_DIR/* $APP_DIR/
fi

cd $APP_DIR

# 5. Build and Launch Backend with PM2
echo -e "\n${YELLOW}[5/8] Setting up Backend API...${NC}"
cd $APP_DIR/backend

if [ ! -f .env ]; then
    cat << 'EOF' > .env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://avishekdas075_db_user:11to1FBkkfSvKsse@cluster0.fathkrm.mongodb.net/swaramayi_crm?retryWrites=true&w=majority
JWT_SECRET=swaramayi_crm_super_secret_jwt_key_2026_production_ready
EOF
    echo -e "${CYAN}Created default backend .env${NC}"
fi

npm install
npm run build

echo -e "${CYAN}Starting backend with PM2...${NC}"
pm2 delete swaramayi-backend 2>/dev/null || true
pm2 start "npx tsx src/server.ts" --name "swaramayi-backend" --env NODE_ENV=production
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME || true

# 6. Build CRM Frontend & Public Website
echo -e "\n${YELLOW}[6/8] Building Frontends...${NC}"
echo -e "${CYAN}Building CRM Frontend...${NC}"
cd $APP_DIR/frontend
npm install
npm run build

echo -e "${CYAN}Building Public Website Frontend...${NC}"
cd $APP_DIR/website-frontend
npm install
npm run build

# 7. Configure Nginx Web Server & Reverse Proxy
echo -e "\n${YELLOW}[7/8] Configuring Nginx Web Server...${NC}"
sudo cp $APP_DIR/nginx/native-nginx.conf /etc/nginx/sites-available/swaramayi

# Enable site and disable default
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/swaramayi /etc/nginx/sites-enabled/swaramayi

# Test Nginx syntax and reload
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 8. Configure UFW Firewall
echo -e "\n${YELLOW}[8/8] Configuring Firewall...${NC}"
sudo ufw allow 22/tcp || true    # SSH
sudo ufw allow 80/tcp || true    # HTTP
sudo ufw allow 443/tcp || true   # HTTPS
sudo ufw allow 3000/tcp || true  # CRM Direct Port
sudo ufw allow 5000/tcp || true  # Backend API Port
sudo ufw --force enable || true

# Health Verification
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR-EC2-PUBLIC-IP")
echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL WITHOUT DOCKER!${NC}"
echo -e "${GREEN}====================================================================${NC}"
echo -e "Your application is LIVE and running with PM2 and Nginx:"
echo -e "👉 ${CYAN}Public Website:${NC}    http://${PUBLIC_IP}"
echo -e "👉 ${CYAN}CRM Dashboard:${NC}     http://${PUBLIC_IP}:3000   (or http://${PUBLIC_IP}/crm/)"
echo -e "👉 ${CYAN}Backend Health:${NC}    http://${PUBLIC_IP}/api/v1/health"
echo -e "\n${YELLOW}--------------------------------------------------------------------${NC}"
echo -e "${YELLOW}🔒 TO SETUP FREE SSL (HTTPS) WITH CERTBOT:${NC}"
echo -e "1. Point your domain 'A' records to this IP (${PUBLIC_IP}):"
echo -e "   - swaramayi.com       -> ${PUBLIC_IP}"
echo -e "   - www.swaramayi.com   -> ${PUBLIC_IP}"
echo -e "   - crm.swaramayi.com   -> ${PUBLIC_IP}"
echo -e ""
echo -e "2. Run this single command on this server:"
echo -e "   ${CYAN}sudo certbot --nginx -d swaramayi.com -d www.swaramayi.com -d crm.swaramayi.com${NC}"
echo -e "   (Certbot will automatically obtain and configure SSL for all domains!)\n"
echo -e "🛠️ Useful PM2 Commands:"
echo -e "   - Check Backend Status:  ${CYAN}pm2 status${NC}"
echo -e "   - View Live Logs:        ${CYAN}pm2 logs swaramayi-backend${NC}"
echo -e "   - Restart Backend:       ${CYAN}pm2 restart swaramayi-backend${NC}"
echo -e "${GREEN}====================================================================${NC}"

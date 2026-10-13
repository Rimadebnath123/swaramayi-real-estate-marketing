#!/bin/bash
# ==============================================================================
# Swaramayi Real Estate CRM & Public Website - AWS EC2 Automated Deployment Script
# Supports: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS on AWS EC2
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}🚀 SWARNAMAYI REAL ESTATE MARKETING - AWS EC2 DEPLOYMENT SCRIPT${NC}"
echo -e "${CYAN}==================================================================${NC}"

# 1. Update OS packages
echo -e "\n${YELLOW}[1/7] Updating system packages...${NC}"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw git

# 2. Install Docker if not installed
echo -e "\n${YELLOW}[2/7] Checking Docker Engine installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${CYAN}Docker not found. Installing official Docker Engine...${NC}"
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER || true
    echo -e "${GREEN}✅ Docker Engine installed successfully!${NC}"
else
    echo -e "${GREEN}✅ Docker is already installed: $(docker --version)${NC}"
fi

# 3. Configure Firewall (UFW)
echo -e "\n${YELLOW}[3/7] Configuring UFW Firewall...${NC}"
sudo ufw allow 22/tcp || true    # SSH
sudo ufw allow 80/tcp || true    # HTTP
sudo ufw allow 443/tcp || true   # HTTPS
sudo ufw allow 3000/tcp || true  # Direct CRM Dashboard (Optional)
sudo ufw allow 5000/tcp || true  # Direct Backend API (Optional)
sudo ufw --force enable || true
echo -e "${GREEN}✅ Firewall configured (Ports 22, 80, 443, 3000, 5000 opened)${NC}"

# 4. Prepare Environment Variables & Directories
echo -e "\n${YELLOW}[4/7] Setting up environment configuration...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${CYAN}Created .env from .env.example${NC}"
    else
        cat << 'EOF' > .env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://avishekdas075_db_user:11to1FBkkfSvKsse@cluster0.fathkrm.mongodb.net/swaramayi_crm?retryWrites=true&w=majority
JWT_SECRET=swaramayi_crm_super_secret_jwt_key_2026_production_ready
VITE_GOOGLE_MAPS_API_KEY=
DOMAIN_NAME=swaramayi.com
CRM_SUBDOMAIN=crm.swaramayi.com
SSL_EMAIL=admin@swaramayi.com
EOF
        echo -e "${CYAN}Created default .env file${NC}"
    fi
else
    echo -e "${GREEN}✅ Existing .env file found.${NC}"
fi

mkdir -p certbot/conf certbot/www

# 5. Build and Launch Containers
echo -e "\n${YELLOW}[5/7] Building and starting Docker containers with Docker Compose...${NC}"
sudo docker compose pull || true
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

# 6. Verify Container Health
echo -e "\n${YELLOW}[6/7] Verifying running services...${NC}"
sleep 5
sudo docker compose ps

# Test backend health check locally
HEALTH_STATUS=$(curl -s http://localhost:5000/api/v1/health || curl -s http://localhost/api/v1/health || echo "FAILED")

if [[ "$HEALTH_STATUS" =~ "ONLINE" ]]; then
    echo -e "${GREEN}✅ Backend API is ONLINE and responding!${NC}"
else
    echo -e "${YELLOW}⚠️ API response check: $HEALTH_STATUS (Containers are initializing)${NC}"
fi

# 7. Print Public Access Summary
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "YOUR-EC2-PUBLIC-IP")

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN}🎉 CONGRATULATIONS! SWARAMAYI APP IS DEPLOYED ON AWS EC2!${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Access your application immediately via your EC2 Public IP:"
echo -e "👉 ${CYAN}Public Website:${NC}    http://${PUBLIC_IP}"
echo -e "👉 ${CYAN}CRM Dashboard:${NC}     http://${PUBLIC_IP}:3000  (or http://${PUBLIC_IP}/crm/)"
echo -e "👉 ${CYAN}Backend Health:${NC}    http://${PUBLIC_IP}:5000/api/v1/health"
echo -e "\n${YELLOW}------------------------------------------------------------------${NC}"
echo -e "${YELLOW}🔒 TO SETUP SSL (HTTPS) WITH YOUR DOMAIN:${NC}"
echo -e "1. Point your domain DNS 'A' records to this IP: ${PUBLIC_IP}"
echo -e "   - swaramayi.com       -> ${PUBLIC_IP}"
echo -e "   - www.swaramayi.com   -> ${PUBLIC_IP}"
echo -e "   - crm.swaramayi.com   -> ${PUBLIC_IP}"
echo -e ""
echo -e "2. Once DNS is propagated, run:"
echo -e "   ${CYAN}bash setup-ssl.sh${NC}"
echo -e "${GREEN}==================================================================${NC}"

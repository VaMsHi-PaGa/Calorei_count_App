#!/usr/bin/env bash
# One-time server setup script — run as the deploy user (ubuntu) on a fresh VPS.
# After this completes, the GitHub Actions deploy workflow handles all future deploys.
set -e

APP_DIR=/home/ubuntu/fittrack

# ── System packages ───────────────────────────────────────────────────────────
sudo apt-get update -qq
sudo apt-get install -y -qq nginx python3 python3-venv python3-pip git

# ── Node.js 20 (via NodeSource) ───────────────────────────────────────────────
if ! command -v node > /dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# ── PM2 ───────────────────────────────────────────────────────────────────────
if ! command -v pm2 > /dev/null 2>&1; then
  sudo npm install -g pm2
fi

# Configure PM2 to start on reboot
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash

# ── Clone repo ────────────────────────────────────────────────────────────────
if [ ! -d "$APP_DIR" ]; then
  git clone https://github.com/vamshi-paga/calorei_count_app.git "$APP_DIR"
fi

# ── Create .env ───────────────────────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" <<'ENVEOF'
# Database
DB_PASSWORD=change_me_strong_password
DATABASE_URL=sqlite:///./fitness.db

# Auth
JWT_SECRET_KEY=change_me_long_random_secret
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_MINUTES=43200

# Server public URL (used to bake API base into the frontend build)
FRONTEND_URL=http://YOUR_SERVER_IP_OR_DOMAIN

# Ollama (local LLM for food macro estimation)
OLLAMA_URL=http://localhost:11434

# Email (optional — leave blank to print to console)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@fittrack.com
ENVEOF
  echo ">>> Created $APP_DIR/.env — edit it with real values before first deploy."
fi

# ── Install nginx config ──────────────────────────────────────────────────────
sudo cp "$APP_DIR/nginx/nginx.conf" /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx

echo ""
echo "Setup complete. Next steps:"
echo "  1. Edit $APP_DIR/.env (set FRONTEND_URL, DB_PASSWORD, JWT_SECRET_KEY)"
echo "  2. Add VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT to GitHub repo secrets"
echo "  3. Push to main — the deploy workflow will handle the rest"

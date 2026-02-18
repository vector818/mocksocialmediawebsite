#!/bin/bash
set -euo pipefail

# ============================================================
#  setup-docker-host.sh - Installs Git, Docker, Docker Compose
#                         and Buildx on Ubuntu
# ============================================================

echo "=== Docker Host Setup (Ubuntu) ==="
echo ""

# --- Git ---
if command -v git &> /dev/null; then
  echo "[OK] Git already installed: $(git --version)"
else
  echo "[..] Installing Git..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq git
  echo "[OK] Git installed: $(git --version)"
fi

# --- Docker Engine ---
if command -v docker &> /dev/null; then
  echo "[OK] Docker already installed: $(docker --version)"
else
  echo "[..] Installing Docker..."
  sudo apt-get update -qq
  sudo apt-get install -y -qq ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io
  echo "[OK] Docker installed: $(docker --version)"
fi

# --- Docker Compose plugin ---
if docker compose version &> /dev/null; then
  echo "[OK] Docker Compose already installed: $(docker compose version --short)"
else
  echo "[..] Installing Docker Compose plugin..."
  sudo apt-get install -y -qq docker-compose-plugin
  echo "[OK] Docker Compose installed: $(docker compose version --short)"
fi

# --- Docker Buildx plugin ---
if docker buildx version &> /dev/null; then
  echo "[OK] Docker Buildx already installed: $(docker buildx version)"
else
  echo "[..] Installing Docker Buildx plugin..."
  sudo apt-get install -y -qq docker-buildx-plugin
  echo "[OK] Docker Buildx installed: $(docker buildx version)"
fi

# --- Add current user to docker group ---
if groups "$USER" | grep -q '\bdocker\b'; then
  echo "[OK] User '$USER' already in docker group"
else
  echo "[..] Adding '$USER' to docker group..."
  sudo usermod -aG docker "$USER"
  echo "[OK] Added. Log out and back in (or run 'newgrp docker') to use docker without sudo"
fi

# --- Start & enable Docker ---
sudo systemctl start docker
sudo systemctl enable docker

echo ""
echo "=== Done ==="
echo "  Git:           $(git --version)"
echo "  Docker:        $(docker --version)"
echo "  Compose:       $(docker compose version --short)"
echo "  Buildx:        $(docker buildx version)"
echo ""

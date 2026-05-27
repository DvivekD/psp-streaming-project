#!/bin/bash
set -e

echo "Updating packages..."
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "Installing ffmpeg, unzip, curl..."
sudo apt-get install -y ffmpeg unzip curl python3-pip python3-venv cron

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing pm2..."
sudo npm install -g pm2

echo "Installing latest yt-dlp..."
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

echo "Setting up python venv and installing bgutil-ytdlp-pot-provider..."
sudo mkdir -p /opt/ytdlp-plugins
sudo chown -R $USER:$USER /opt/ytdlp-plugins
cd /opt/ytdlp-plugins
python3 -m venv venv
source venv/bin/activate
pip install bgutil-ytdlp-pot-provider

# yt-dlp plugin needs to be installed in a place yt-dlp can find it, 
# or we can install the plugin directly with yt-dlp's pip if it's the python package.
# Actually, the simplest way is to install it via pip in the user's home directory.
pip3 install --user bgutil-ytdlp-pot-provider

echo "Configuring DuckDNS Cron Job..."
DUCKDNS_DOMAIN="upbackup67dev"
DUCKDNS_TOKEN="da0894c7-d8b4-439b-a167-4b82796890d9"
CRON_JOB="*/5 * * * * curl -k \"https://www.duckdns.org/update?domains=${DUCKDNS_DOMAIN}&token=${DUCKDNS_TOKEN}&ip=\""

(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "Setup complete!"

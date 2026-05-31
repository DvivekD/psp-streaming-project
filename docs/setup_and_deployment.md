# Setup and Deployment Guide

This guide provides step-by-step instructions for deploying the entire PSP Streaming Project ecosystem onto a fresh Ubuntu server (like our Azure VM) and configuring your PSP to connect to it.

## 1. Prerequisites (Azure VM)

You need a cloud server running a modern Ubuntu distribution. Ensure the following ports are open in your network firewall:
- **80**: yt2009 frontend
- **4000**: PSP Manga Server
- **8080**: yt-dlp backend
- **8083**: Spotiflac (Spotify/SoundCloud)
- **8081**: PSP Cloud Storage

## 2. Install Core Dependencies

Update your package lists and install the heavy lifters:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git python3 ffmpeg build-essential
```

Install Node.js (v18+) and PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
pm2 install pm2-logrotate
```

Install the latest `yt-dlp`:
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

## 3. Install and Configure Cloudflare WARP Proxy

YouTube heavily blocks datacenter IP addresses (like Azure and AWS). We bypass this by routing our `yt-dlp` requests through a local SOCKS5 proxy powered by Cloudflare WARP.

```bash
# Add Cloudflare repository
curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list

# Install WARP
sudo apt update
sudo apt install cloudflare-warp

# Configure WARP as a local proxy on port 40000
warp-cli registration new
warp-cli mode proxy
warp-cli proxy port 40000
warp-cli connect
```

You can verify it works by checking your IP through the proxy:
```bash
curl -x socks5://127.0.0.1:40000 https://ifconfig.me
```
*Note: This IP should be a Cloudflare consumer IP, not your Azure datacenter IP.*

## 4. Clone and Configure the Ecosystem

Clone the repository to `/home/azureuser/psp-streaming-project`.

### Install Backend Dependencies
Navigate to the root directory and install dependencies:
```bash
cd psp-streaming-project
npm install express lru-cache express-async-errors
```

### Configure environment variables
You may need to define specific ports in a `.env` file if you change them from the defaults listed above.

## 5. Deploy with PM2

We use PM2 to keep the various Node backends alive forever. Run the following commands:

```bash
pm2 start backend.js --name "psp-cloud"
pm2 start yt2009/backend.js --name "psp-yt2009"
pm2 start manga-server.js --name "manga-server"
pm2 start spotiflac-backend/spotiflac-server_azure.js --name "psp-spotiflac-azure"
```

Save the process list so they reboot if the server restarts:
```bash
pm2 save
pm2 startup
```

## 6. PSP Client Configuration

### Connecting the PSP
1. Ensure your PSP is connected to a WPA1/WPA2-TKIP (or WEP/Open) Wi-Fi network, as PSPs do not support WPA2-AES.
2. In your PSP Browser, navigate to your Azure VM IP address: `http://YOUR_SERVER_IP/`

### The "Light Blue Line" Test
When loading a YouTube video, watch the buffering bar at the bottom.
- A **dark blue line** represents the current playhead.
- A **light blue line** represents the video buffer.
If the light blue line sprints ahead of the dark blue line immediately, the system is perfectly tuned and utilizing the unleashed ffmpeg streams. If the video hangs on a black screen, ensure PM2 is running and check `pm2 logs` for FFmpeg pipeline crashes.

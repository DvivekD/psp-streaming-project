#!/bin/bash
set -e

echo "Extracting deployment zip..."
unzip -o psp_deployment.zip -d psp-streaming

echo "Starting backend process..."
cd psp-streaming/yt2009_modified/back
npm install
# Allow port 80 binding by node
sudo setcap 'cap_net_bind_service=+ep' $(which node)

pm2 start backend.js --name "psp-stream"
pm2 save
pm2 startup

echo "Deployment finished!"

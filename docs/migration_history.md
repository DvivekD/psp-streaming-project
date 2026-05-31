# PSP Streaming Project - Migration History

This document outlines the architectural evolution of the PSP YouTube streaming backend, detailing the network constraints faced and the solutions implemented to bypass them.

## Phase 1: Local Network (Direct IP)
**Architecture:** 
- Node.js backend (`yt2009`) running on a local Windows laptop.
- The PSP connected to an iPhone personal hotspot (tethering), with the laptop also connected to the hotspot to share a Local Area Network (LAN).
- The PSP GoTube application was configured to point directly to the laptop's local IP address (e.g., `192.168.x.x`).

**Challenges:**
- Required the laptop to be physically present, powered on, and actively running the server.
- The iPhone hotspot tethering was a fragile network bridge, prone to dropping packets and changing IP addresses upon reconnection, requiring constant updates to the PSP's `YouTubex.js` file.
- Cannot easily share the proxy with other users outside the physical location.

## Phase 2: Attempting Cloud Migration & `cookies.txt`
**Architecture:**
- Migrated the Node.js backend to a Microsoft Azure Virtual Machine (Ubuntu Linux) to eliminate the need for local hardware and iPhone tethering.
- Pointed the PSP to the Azure VM's static public IP address.
- Added a `cookies.txt` file to `yt-dlp` to simulate an authenticated browser session.

**Challenges:**
- **Datacenter IP Bans:** YouTube aggressively detects and blocks traffic originating from cloud datacenter IP ranges (like Azure, AWS, and GCP). This resulted in immediate `HTTP 403 Forbidden` and `BadAuthentication` errors from `yt-dlp`.
- **Ineffective Cookies:** While the `cookies.txt` method initially helped bypass some age-restriction checks, it was insufficient to mask the datacenter footprint. YouTube's anti-bot system quickly invalidated the sessions or ignored the cookies entirely when noticing the Azure origin IP.

## Phase 3: The Azure Cloudflare WARP Proxy (Current)
**Architecture:**
- Maintained the Node.js server on the Azure VM for robust uptime and bandwidth (utilizing a $100 student credit).
- Installed **Cloudflare WARP** (`cloudflare-warp`) on the Azure VM.
- Configured WARP specifically in **Proxy Mode** (`mode proxy`), which binds a SOCKS5 proxy to `127.0.0.1:40000` rather than acting as a global system VPN. This prevents WARP from hijacking the default network interface and locking out the SSH connection.
- Modified the Node.js backend to route all `yt-dlp` and `ffmpeg` HTTP requests through the local SOCKS5 WARP tunnel.

**Success:**
- Cloudflare WARP effectively masks the Azure datacenter IP, making the traffic appear as originating from a residential or mobile ISP pool.
- YouTube's anti-bot systems allow the connections, completely resolving the `403 Forbidden` errors.
- The server remains fully accessible via SSH on its public IP, while all outbound streaming traffic is securely tunneled and unblocked.
- Integrated aggressive "Zombie Process Walls" (`req.on('close')`) to manage the Azure VM's 4GB RAM by killing orphaned transcode jobs when the PSP disconnects.

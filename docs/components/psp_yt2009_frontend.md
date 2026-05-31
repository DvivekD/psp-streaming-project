# PSP yt2009 Frontend Mechanics

## Overview
This document details how the original PlayStation Portable (PSP) hardware interacts with our backend for streaming YouTube videos (via the yt2009 project principles).

## Hardware Limitations
The original PSP is constrained by its 333 MHz MIPS CPU and limited RAM (32MB for PSP-1000, 64MB for PSP-2000/3000 models). It natively supports AVC (H.264) video but with strict profile and resolution limits (typically Baseline profile, max 480x272 resolution). Network connectivity is limited to 802.11b Wi-Fi, which restricts bandwidth to a theoretical 11 Mbps, but practically much lower, making streaming a challenge.

## FLV Video Buffering Behavior ('Light Blue Line')
The PSP's native video player streams over HTTP. When streaming, the PSP buffers the incoming video stream into RAM. This buffering process is visualized by a 'light blue line' in the player's progress bar. The hardware relies on a fast, continuous feed of data to maintain a healthy buffer. If the data feed slows down, the blue line stops progressing, and the video playback will eventually stall when it catches up to the buffered amount. The buffer size is small enough that network hitches or slow serving can immediately impact playback.

## The ffmpeg `-re` Flag and Buffer Starvation
When serving transcoded video to the PSP via ffmpeg over the network, using the `-re` flag (which tells ffmpeg to read input at native frame rate) is highly discouraged. 
Because the PSP's internal network stack and buffer management expect to quickly fill its memory buffer (the light blue line) before starting and during playback, throttling the stream to real-time (`-re`) prevents the PSP from downloading the data as fast as it wants to. This results in buffer starvation: the PSP plays the video, but the buffer never fills up enough to handle minor network fluctuations, causing constant stuttering and pauses. Feeding the data as fast as the network allows ensures the PSP's buffer stays full.

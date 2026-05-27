#!/bin/bash
# Deletes FLV files older than 1 day in the cache directory
find /home/azureuser/psp-movies-backend/cache -name "*.flv" -type f -mtime +1 -delete

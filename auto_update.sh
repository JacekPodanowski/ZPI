#!/bin/bash

# Go to the folder where the script is
cd "$(dirname "$0")" || exit

# Email recipient
EMAIL="zakhbogdan@gmail.com"

# Fetch latest commits
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "$(date): New changes detected. Pulling and rebuilding..."
    
    if git pull origin main; then
        if /usr/local/bin/docker-compose up -d --build; then
            echo "$(date): Update complete."
        else
            MSG="$(date): ERROR - Docker rebuild failed!"
            echo "$MSG" >&2
            echo "$MSG" | mail -s "Auto-update ERROR on Docker rebuild" $EMAIL
        fi
    else
        MSG="$(date): ERROR - Git pull failed!"
        echo "$MSG" >&2
        echo "$MSG" | mail -s "Auto-update ERROR on Git pull" $EMAIL
    fi
else
    echo "$(date): No changes detected."
fi


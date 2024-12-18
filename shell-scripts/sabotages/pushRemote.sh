#!/bin/bash

# This is sagotage no.1

REMOTE_REPO_PATH="git@github.com:Dagechan/WorkSpace.git"
TEMP_DIR="../workspace/temp_repo"

# Clone the repository into a temporary directory
git clone "$REMOTE_REPO_PATH" "$TEMP_DIR"
cd "$TEMP_DIR"

# Add a direct commit to the main branch
echo "This is a sabotage commit. \n このファイル「README.md」は消さずに問題を解決してください．" >> README.md
git add README.md
git commit -m "Sabotage: added README.md directly to main"

# Push the changes to the remote repository
git push origin main

# Cleanup
cd ..
rm -rf "$TEMP_DIR"

echo "Sabotage 1 complete: Direct commit added to main branch."

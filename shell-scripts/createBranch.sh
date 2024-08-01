#!/bin/bash

# specify the directory to rewrite
REPO_PATH="../workspace"

# specify the new branch name
NEW_BRANCH="stinky-garbage"

# check if the directory exists
if [ -d "$REPO_PATH/.git" ]; then
    # rewrite the URL
    git -C "$REPO_PATH" checkout -b "$NEW_BRANCH"
    
    # confirm the change
    if [ $? -eq 0 ]; then
        echo "branch created successfully."
    else
        echo "Failed to create new branch."
    fi
else
    echo "$REPO_PATH/.git does not exist"
fi
#!/bin/bash

# specify the directory to rewrite
REPO_PATH="../workspace"

# specify the new remote URL
NEW_URL="git@github.com:Dagechan/git-test.git"

# check if the directory exists
if [ -d "$REPO_PATH/.git" ]; then
    # rewrite the URL
    git -C "$REPO_PATH" remote set-url origin "$NEW_URL"
    
    # confirm the change
    if [ $? -eq 0 ]; then
        echo "URL rewritten successfully to $NEW_URL."
    else
        echo "Failed to rewrite URL."
    fi
else
    echo "$REPO_PATH/.git does not exist"
fi
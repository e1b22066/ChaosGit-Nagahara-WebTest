#!/bin/bash

# specify the directory to rewrite
REPO_PATH="../workspace"

# specify the remote branch name
REMOTE_BRANCH="develop"

# check if the directory exists
if [ -d "$REPO_PATH/.git" ]; then
    # rewrite the URL
    git -C "$REPO_PATH" push origin --delete "$REMOTE_BRANCH"
    
    # confirm the change
    if [ $? -eq 0 ]; then
        echo "remote branch deleted successfully."
    else
        echo "Failed to delete remote branch."
    fi
else
    echo "$REPO_PATH/.git does not exist"
fi

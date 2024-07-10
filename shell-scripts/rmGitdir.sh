#!/bin/bash

# specify the directory to remove
REPO_PATH="../workspace"

# check if the directory exists
if [ -d "$REPO_PATH/.git" ]; then
    # remove .git directory
    rm -rf "$REPO_PATH/.git"
    echo ".git directory deleted successfully."
else
    echo "$REPO_PATH/.git does not exist"
fi

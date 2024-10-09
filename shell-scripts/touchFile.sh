#!/bin/bash

# specify the directory to create
REPO_PATH="../workspace"

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
    # create a file in the directory
    touch "$REPO_PATH/sussy.txt"
    echo "sussy.txt file created successfully."
else
    echo "$REPO_PATH does not exist"
fi
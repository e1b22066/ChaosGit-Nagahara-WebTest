#!/bin/bash

# specify the directory to check
REPO_PATH="workspace/"

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
  # execute git command in the specified directory
  if git -C "$REPO_PATH" branch | grep -q '\bmain\b'; then
    echo "Branch name successfully changed to 'main'."
    exit 0
  else
    echo "Branch name change to 'main' not found."
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
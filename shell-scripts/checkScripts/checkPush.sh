#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

local_commit=$(git -C "$REPO_PATH" rev-parse main)
remote_commit=$(git -C "$REPO_PATH" ls-remote origin main | awk '{print $1}')

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
  echo "$local_commit"
  echo "$remote_commit"
  # execute git command in the specified directory
  if [ "$local_commit" = "$remote_commit" ]; then
    echo "Task 5 Completed"
    exit 0
  else
    echo "Task 5 Incomplete"
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi
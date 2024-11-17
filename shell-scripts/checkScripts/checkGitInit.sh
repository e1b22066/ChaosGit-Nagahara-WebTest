#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
  # check if the directory is a git repository
  if [ -d "$REPO_PATH/.git" ]; then
    echo "'git init' has been executed in '$REPO_PATH'."
    exit 0
  else
    echo "'git init' has not been executed in '$REPO_PATH'."
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi

#!/bin/bash

REPO_PATH="../../workspace"
URL="git@github.com:igakilab/Kitamoto-LastProject.git"

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
  # execute git command in the specified directory
  if git -C "$REPO_PATH" remote -v | grep -q "$URL"; then
    echo "Repository cloned successfully."
  else
    echo "Expected repository URL not found."
  fi
else
  echo "Directory $REPO_PATH does not exist."
fi

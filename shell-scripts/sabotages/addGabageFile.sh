#!/bin/bash

# This is sabotage no.2

# Specify the local repository path
REPO_PATH="../workspace/"

# Check if the local repo exists
if [ -d "$REPO_PATH" ]; then
  # Add an unnecessary file and commit it
  cd "$REPO_PATH" || exit 1
  echo "This is an unnecessary file" > unnecessary_file.txt
  git add unnecessary_file.txt
  git commit -m "Sabotage: Added unnecessary file"
  echo "Sabotage 2: Unnecessary file committed."
else
  echo "Local repository does not exist."
  exit 1
fi

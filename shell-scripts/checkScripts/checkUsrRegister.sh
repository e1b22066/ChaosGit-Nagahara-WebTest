#!/bin/bash

# specify the directory to check
REPO_PATH="../workspace/"

# check if the directory exists
if [ -d "$REPO_PATH" ]; then
  # check if the directory is a git repository
  if [ -d "$REPO_PATH/.git" ]; then
    # check for git user name
    GIT_USER_NAME=$(git -C "$REPO_PATH" config user.name)
    # check for git user email
    GIT_USER_EMAIL=$(git -C "$REPO_PATH" config user.email)

    if [ -z "$GIT_USER_NAME" ] || [ -z "$GIT_USER_EMAIL" ]; then
      echo "Git user name or email is not set."
      exit 1
    else
      echo "Git user name and email are properly configured:"
      echo "User Name: $GIT_USER_NAME"
      echo "User Email: $GIT_USER_EMAIL"
      exit 0
    fi
  else
    echo "'git init' has not been executed in '$REPO_PATH'."
    exit 1
  fi
else
  echo "Directory $REPO_PATH does not exist."
  exit 1
fi

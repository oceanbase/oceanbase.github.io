#!/usr/bin/env bash

# This script will convert a folder to a json file

# Check if the folder exists
if [ ! -d "$1" ]; then
  echo "Folder does not exist"
  exit 1
fi

# Check if the folder is empty
if [ ! "$(ls -A $1)" ]; then
  echo "Folder is empty"
  exit 1
fi

# Check if the output file is provided
if [ -z "$2" ]; then
  echo "Output file is not provided"
  exit 1
fi

# Check if the output file is a json file
if [[ "$2" != *.json ]]; then
  echo "Output file is not a json file"
  exit 1
fi

# Convert the folder to a json file
# Format: {"logoPath": "/img/company.png", "name": "company"}

# Start the json file
echo "[" > $2

# Loop through the folder

for file in $1/*; do
  # Get the file name
  name=$(basename $file)
  # Get the file name without extension
  name="${name%.*}"
  # Get the file path
  path=$(realpath $file)
  # Add the file to the json file
  echo "{\"logoPath\": \"$path\", \"name\": \"$name\"}," >> $2
done

# End the json file
echo "]" >> $2

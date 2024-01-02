#!/usr/bin/env bash

# Comment @fetchai/blst-ts/prebuild/emscripten

DIR="$( cd "$( dirname "$0" )" && pwd -P )"
file_path=${DIR}/../../../node_modules/@fetchai/blst-ts/prebuild/emscripten/blst.js

# Check if the file exists
if [ ! -f "$file_path" ]; then
  echo "@fetchai blst.js Error: File '$file_path' not found."
  exit 1
fi

###################################################################
# blst.js
fs='var fs;'
fs_replacement="\/\/ $fs"
# Uncomment
sed -i'' -e "s|$fs_replacement|$fs|g" "$file_path"

###################################################################
# fs = require('fs');
fs="fs = require('fs');"
fs_replacement="\/\/ $fs"
# Uncomment
sed -i'' -e "s|$fs_replacement|$fs|g" "$file_path"

###################################################################
# read_
read_uc='// read_ = function shell_read(filename, binary) {'

# Use awk to uncomment the code block while preserving line breaks
awk -v start="$read_uc" '
  # If a line matches the commented start pattern, set a flag to begin uncommenting
  index($0, start) {
    uncomment_flag = 1
  }
  # If the uncomment flag is set, remove the comment characters
  uncomment_flag {
    sub("//", "", $0)
  }
  # If a line ends the code block (contains "};"), unset the flag to stop uncommenting
  index($0, "};") && uncomment_flag {
    uncomment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

###################################################################
# readAsync
read_uc='//  fs.readFile(filename, function(err, data) {'

# Use awk to uncomment the code block while preserving line breaks
awk -v start="$read_uc" '
  # If a line matches the commented start pattern, set a flag to begin uncommenting
  index($0, start) {
    uncomment_flag = 1
  }
  # If the uncomment flag is set, remove the comment characters
  uncomment_flag {
    sub("//", "", $0)
  }
  # If a line ends the code block (contains "});"), unset the flag to stop uncommenting
  index($0, "});") && uncomment_flag {
    uncomment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

# Check if the replacement was successful
if [ $? -eq 0 ]; then
  echo "@fetchai blst.js updates completed successfully."
else
  echo "@fetchai blst.js Error: updates failed."
fi

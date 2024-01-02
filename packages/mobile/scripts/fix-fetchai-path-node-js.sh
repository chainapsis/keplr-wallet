#!/usr/bin/env bash

# Comment @fetchai/blst-ts/dist/scripts

DIR="$( cd "$( dirname "$0" )" && pwd -P )"
file_path=${DIR}/../../../node_modules/@fetchai/blst-ts/dist/scripts/paths_node.js

# Check if the file exists
if [ ! -f "$file_path" ]; then
  echo "@fetchai paths_node.js Error: File '$file_path' not found."
  exit 1
fi

###################################################################
# blst-ts
fs1='const fs_1 = __importDefault(require("fs"));'
fs1_replacement="\/\/ $fs1"
# Uncomment
sed -i'' -e "s|$fs1_replacement|$fs1|g" "$file_path"
# Comment
sed -i'' -e "s|$fs1|$fs1_replacement|g" "$file_path"

###################################################################
# mkdirBinary
mk_dir_uc='//function mkdirBinary() {'

# Use awk to uncomment the code block while preserving line breaks
awk -v start="$mk_dir_uc" '
  # If a line matches the commented start pattern, set a flag to begin uncommenting
  index($0, start) {
    uncomment_flag = 1
  }
  # If the uncomment flag is set, remove the comment characters
  uncomment_flag {
    sub("//", "", $0)
  }
  # If a line ends the code block (contains "exports.mkdirBinary"), unset the flag to stop uncommenting
  index($0, "exports.mkdirBinary") && uncomment_flag {
    uncomment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

mk_dir_c='function mkdirBinary() {'

# Use awk to comment out the code block while preserving line breaks
awk -v start="$mk_dir_c" '
  # If a line matches the start pattern, set a flag to begin commenting out
  index($0, start) {
    comment_flag = 1
  }
  # If the comment flag is set, comment out the line
  comment_flag {
    $0 = "//" $0
  }
  # If a line ends the code block (contains "exports.mkdirBinary"), unset the flag to stop commenting out
  index($0, "exports.mkdirBinary") && comment_flag {
    comment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

###################################################################
# ensureDirFromFilepath
mk_dir_uc='//function ensureDirFromFilepath(filepath) {'

# Use awk to uncomment the code block while preserving line breaks
awk -v start="$mk_dir_uc" '
  # If a line matches the commented start pattern, set a flag to begin uncommenting
  index($0, start) {
    uncomment_flag = 1
  }
  # If the uncomment flag is set, remove the comment characters
  uncomment_flag {
    sub("//", "", $0)
  }
  # If a line ends the code block (contains "exports.ensureDirFromFilepath"), unset the flag to stop uncommenting
  index($0, "exports.ensureDirFromFilepath") && uncomment_flag {
    uncomment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

mk_dir_c='function ensureDirFromFilepath(filepath) {'

# Use awk to comment out the code block while preserving line breaks
awk -v start="$mk_dir_c" '
  # If a line matches the start pattern, set a flag to begin commenting out
  index($0, start) {
    comment_flag = 1
  }
  # If the comment flag is set, comment out the line
  comment_flag {
    $0 = "//" $0
  }
  # If a line ends the code block (contains "exports.ensureDirFromFilepath"), unset the flag to stop commenting out
  index($0, "exports.ensureDirFromFilepath") && comment_flag {
    comment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

###################################################################
# findBindingsFile
mk_dir_uc='//function findBindingsFile(dirpath) {'

# Use awk to uncomment the code block while preserving line breaks
awk -v start="$mk_dir_uc" '
  # If a line matches the commented start pattern, set a flag to begin uncommenting
  index($0, start) {
    uncomment_flag = 1
  }
  # If the uncomment flag is set, remove the comment characters
  uncomment_flag {
    sub("//", "", $0)
  }
  # If a line ends the code block (contains "exports.findBindingsFile"), unset the flag to stop uncommenting
  index($0, "exports.findBindingsFile") && uncomment_flag {
    uncomment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

mk_dir_c='function findBindingsFile(dirpath) {'

# Use awk to comment out the code block while preserving line breaks
awk -v start="$mk_dir_c" '
  # If a line matches the start pattern, set a flag to begin commenting out
  index($0, start) {
    comment_flag = 1
  }
  # If the comment flag is set, comment out the line
  comment_flag {
    $0 = "//" $0
  }
  # If a line ends the code block (contains "exports.findBindingsFile"), unset the flag to stop commenting out
  index($0, "exports.findBindingsFile") && comment_flag {
    comment_flag = 0
  }
  # Print the line
  1
' "$file_path" > tmpfile && mv tmpfile "$file_path"

# Check if the replacement was successful
if [ $? -eq 0 ]; then
  echo "@fetchai paths_node.js updates completed successfully."
else
  echo "@fetchai paths_node.js Error: updates failed."
fi

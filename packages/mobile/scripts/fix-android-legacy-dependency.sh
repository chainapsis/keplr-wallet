#!/usr/bin/env bash

# Update android gradle config of outdated react-native-scrypt lib

DIR="$( cd "$( dirname "$0" )" && pwd -P )"
file_path=${DIR}/../node_modules/react-native-scrypt/android/build.gradle
# Check if the file exists
if [ ! -f "$file_path" ]; then
  echo "Android Error: File '$file_path' not found."
  exit 1
fi

# Print the original file content
# echo "Original content of $file_path:"
# cat "$file_path"

# Search for the line containing "compile 'com.facebook.react:react-native:+'" and replace it
sed -i -e 's/compile '\''com\.facebook\.react:react-native:+'\''/implementation '\''com.facebook.react:react-native:+'\''/g' "$file_path"

# Check if the replacement was successful
if [ $? -eq 0 ]; then
  echo "Legacy android dependency updates completed successfully."
else
  echo "Android Error: Legacy dependency updates failed."
fi

# Print the modified file content
# echo "Modified content of $file_path:"
# cat "$file_path"

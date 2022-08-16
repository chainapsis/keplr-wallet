#!/bin/bash

# Fix a bug that if blur type is not changed, the blur amount is not applied too.
# And, if the blur amount is 0 or lesser than 0, disable the blur.

DIR="$( cd "$( dirname "$0" )" && pwd -P )"

cp ${DIR}/BlurView.m ${DIR}/../node_modules/@react-native-community/blur/ios/BlurView.m

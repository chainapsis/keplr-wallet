#!/bin/bash

# We need to set the full background image for the splash screen.
# But, the expo's splash screen module doesn't handle the bakcground as image but the color.
# And, just setting the splashscreen.xml has the background image makes the white flash right before actual app load.
# To fix this problem, this script just replaces some codes on the expo's splash screen module to handle the background as image.

DIR="$( cd "$( dirname "$0" )" && pwd -P )"

cp ${DIR}/splashscreen_background.png ${DIR}/../node_modules/expo-splash-screen/android/src/main/res/drawable/splashscreen_background.png
cp ${DIR}/SplashScreenView.kt ${DIR}/../node_modules/expo-splash-screen/android/src/main/java/expo/modules/splashscreen/SplashScreenView.kt
cp ${DIR}/NativeResourcesBasedSplashScreenViewProvider.kt ${DIR}/../node_modules/expo-splash-screen/android/src/main/java/expo/modules/splashscreen/NativeResourcesBasedSplashScreenViewProvider.kt

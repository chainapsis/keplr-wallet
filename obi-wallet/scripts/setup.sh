SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd ${SCRIPT_DIR}/..;

# Load environment variables
export $(grep -v '^#' apps/mobile/.env | xargs)

# Create apps/mobile/ios/Mobile/AppCenter-Config.plist
tee apps/mobile/ios/Mobile/AppCenter-Config.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
    <key>AppSecret</key>
    <string>${IOS_APP_CENTER_SECRET}</string>
    </dict>
</plist>
EOF

# Create apps/mobile/android/app/src/main/assets/appcenter-config.json
tee apps/mobile/android/app/src/main/assets/appcenter-config.json <<EOF
{
  "app_secret": "${ANDROID_APP_CENTER_SECRET}"
}
EOF

# Install dependencies
yarn

# Install Keplr dependencies and build packages
(cd ..; yarn && yarn build:libs)

# Build provider
bash scripts/build-provider.sh

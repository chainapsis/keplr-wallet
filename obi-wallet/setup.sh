SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd ${SCRIPT_DIR};

# Load environment variables
export $(grep -v '^#' apps/mobile/.env | xargs)

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

# Setup URI scheme
(cd apps/mobile; uri-scheme add obi --android --ios)

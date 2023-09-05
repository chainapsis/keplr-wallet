import {
  detect,
  BrowserInfo,
  BotInfo,
  NodeInfo,
  SearchBotDeviceInfo,
  ReactNativeInfo,
} from "detect-browser";

function detectEnv(
  userAgent?: string
):
  | BrowserInfo
  | BotInfo
  | NodeInfo
  | SearchBotDeviceInfo
  | ReactNativeInfo
  | null {
  return detect(userAgent);
}

function detectOS() {
  const env = detectEnv();
  return env && env.os ? env.os : undefined;
}

export function isAndroid(): boolean {
  const os = detectOS();
  return os ? os.toLowerCase().includes("android") : false;
}

function isIOS(): boolean {
  const os = detectOS();
  return os
    ? os.toLowerCase().includes("ios") ||
        (os.toLowerCase().includes("mac") && navigator.maxTouchPoints > 1)
    : false;
}

export function isMobile(): boolean {
  const os = detectOS();
  return os ? isAndroid() || isIOS() : false;
}

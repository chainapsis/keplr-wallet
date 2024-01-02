import { polyfillWebCrypto } from "react-native-crypto-polyfill";

polyfillWebCrypto();
// crypto is now globally defined

if (typeof __dirname === "undefined") global.__dirname = "/";
if (typeof __filename === "undefined") global.__filename = "";
if (typeof process === "undefined") {
  global.process = require("process");
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bProcess = require("process");
  for (const p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

process.browser = false;
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (typeof Buffer === "undefined") global.Buffer = require("buffer").Buffer;

if (!global.atob || !global.btoa) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Buffer = require("buffer").Buffer;
  global.atob = (data) => {
    return Buffer.from(data, "base64").toString();
  };

  global.btoa = (data) => {
    return Buffer.from(data).toString("base64");
  };
}

const isDev = typeof __DEV__ === "boolean" && __DEV__;
process.env["NODE_ENV"] = isDev ? "development" : "production";

import EventEmitter from "eventemitter3";

const eventListener = new EventEmitter();

window.addEventListener = (type, fn, options) => {
  if (options && options.once) {
    eventListener.once(type, fn);
  } else {
    eventListener.addListener(type, fn);
  }
};

window.removeEventListener = (type, fn) => {
  eventListener.removeListener(type, fn);
};

window.dispatchEvent = (event) => {
  eventListener.emit(event.type);
};

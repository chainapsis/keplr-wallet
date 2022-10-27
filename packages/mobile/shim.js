import "setimmediate";
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
  const base64 = require("./shim-base64.js");
  global.atob = base64.atob;

  global.btoa = base64.btoa;
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

// Shim FileReader.readAsArrayBuffer
// https://github.com/facebook/react-native/issues/21209
// Check @ethersproject/shims
const fr = new FileReader();
try {
  fr.readAsArrayBuffer(new Blob(["hello"], { type: "text/plain" }));
} catch (error) {
  FileReader.prototype.readAsArrayBuffer = function (blob) {
    if (this.readyState === this.LOADING) {
      throw new Error("InvalidStateError");
    }
    this._setReadyState(this.LOADING);
    this._result = null;
    this._error = null;
    const fr = new FileReader();
    fr.onloadend = () => {
      const content = atob(fr.result.split(",").pop().trim());
      const buffer = new ArrayBuffer(content.length);
      const view = new Uint8Array(buffer);
      view.set(Array.from(content).map((c) => c.charCodeAt(0)));
      this._result = buffer;
      this._setReadyState(this.DONE);
    };
    fr.readAsDataURL(blob);
  };
}

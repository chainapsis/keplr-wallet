import 'setimmediate';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (!global.atob || !global.btoa) {
  const base64 = require('./shim-base64.js');
  global.atob = base64.atob;
  global.btoa = base64.btoa;
}

const TextEncodingPolyfill = require('text-encoding');
Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
});

import {polyfillWebCrypto} from 'expo-standard-web-crypto';

polyfillWebCrypto();
// crypto is now globally defined

import 'react-native-url-polyfill/auto';

import EventEmitter from 'eventemitter3';

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

window.dispatchEvent = event => {
  eventListener.emit(event.type);
};

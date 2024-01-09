import 'setimmediate';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
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

import 'setimmediate';

const TextEncodingPolyfill = require('text-encoding');
Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
});

import {polyfillWebCrypto} from 'expo-standard-web-crypto';

polyfillWebCrypto();
// crypto is now globally defined

import 'react-native-url-polyfill/auto';

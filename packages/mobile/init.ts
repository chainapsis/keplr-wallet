import './src/background/background';

import {Keplr} from '@keplr-wallet/provider';
import {RNMessageRequesterInternal} from './src/router';

// @ts-ignore
window.keplr = new Keplr('', 'core', new RNMessageRequesterInternal());

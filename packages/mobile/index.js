/**
 * @format
 */

import './crypto';
import './shim';

import 'text-encoding';

import {AppRegistry} from 'react-native';

import App from './App';
import {name as appName} from './app.json';

import './init';

AppRegistry.registerComponent(appName, () => App);

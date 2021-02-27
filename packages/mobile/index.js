/**
 * @format
 */

import {AppRegistry} from 'react-native';

import 'text-encoding';

import App from './App';
import {name as appName} from './app.json';

import './init';

AppRegistry.registerComponent(appName, () => App);

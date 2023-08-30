/**
 * @format
 */

import './shim';

// XXX: 이거 없으면 react-native-reanimated에서 오류가 난다.
//      https://github.com/software-mansion/react-native-reanimated/issues/4836#issuecomment-1660252576
//      뭔 버근지는 모르겠지만 일단 이렇게 해결한다.
//      react-native-gesture-handler도 해놓으라는 얘기가 있어서 그냥 해놓는다.
//      나중에 버그가 해결된 버전이 나오면 업데이트하고 이 부분은 지워도 된다.
import 'react-native-reanimated';
import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import './init';

AppRegistry.registerComponent(appName, () => App);

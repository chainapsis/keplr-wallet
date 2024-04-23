import Bugsnag from '@bugsnag/react-native';
import BugsnagPluginReactNavigation from '@bugsnag/plugin-react-navigation';
import {CODEPUSH_VERSION} from './constants';

Bugsnag.start({
  plugins: [new BugsnagPluginReactNavigation()],
  codeBundleId: CODEPUSH_VERSION,
});

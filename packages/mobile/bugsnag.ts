import Bugsnag from '@bugsnag/react-native';
import BugsnagPluginReactNavigation from '@bugsnag/plugin-react-navigation';
Bugsnag.start({
  plugins: [new BugsnagPluginReactNavigation()],
});

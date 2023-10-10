import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect} from 'react';
import {useFocusedScreen} from '../../provider/focused-screen';

export const useSetFocusedScreen = () => {
  const route = useRoute();
  const isFocused = useIsFocused();

  const focusedScreen = useFocusedScreen();

  useEffect(() => {
    if (isFocused) {
      focusedScreen.setCurrent({
        name: route.name,
        key: route.key,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, route.key, route.name]);
};

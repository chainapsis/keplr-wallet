import {useEffect, useRef} from 'react';
import {TextInput} from 'react-native';

export const useFocusOnMount = <Ref extends TextInput>() => {
  const ref = useRef<Ref>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);
  return ref;
};

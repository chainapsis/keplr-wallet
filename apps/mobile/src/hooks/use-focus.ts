import {useRef} from 'react';
import {InteractionManager, TextInput} from 'react-native';
import {useEffectOnce} from './use-effect-once';

export const useFocusAfterRouting = <Ref extends TextInput>() => {
  const ref = useRef<Ref>(null);
  // XXX: RN에서 스크린이 변할때 바로 mount에서 focus를 주면 안드로이드에서 키보드가 안뜬다.
  //      이 경우 settimeout을 쓰라지만... 그냥 스크린이 다 뜨면 포커스를 주는 것으로 한다.
  useEffectOnce(() => {
    if (ref.current) {
      InteractionManager.runAfterInteractions(() => {
        ref.current?.focus();
      });
    }
  });
  return ref;
};

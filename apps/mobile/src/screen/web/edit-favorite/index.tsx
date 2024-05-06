import React, {FunctionComponent, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {WebStackNavigation} from '../../../navigation.tsx';
import {Gutter} from '../../../components/gutter';
import {Button} from '../../../components/button';
import {useIntl} from 'react-intl';
import {TextInput} from '../../../components/input';
import {useStore} from '../../../stores';
import {useEffectOnce} from '../../../hooks';
import {InteractionManager, TextInput as NativeTextInput} from 'react-native';

export const EditFavoriteUrlScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<WebStackNavigation, 'Web.EditFavorite'>>();

  const {webpageStore} = useStore();

  const [name, setName] = React.useState(route.params.url.name);
  const [error, setError] = React.useState('');

  const inputRef = useRef<NativeTextInput>(null);
  useEffectOnce(() => {
    // XXX: 병맛이지만 RN에서 스크린이 변할때 바로 mount에서 focus를 주면 안드로이드에서 키보드가 안뜬다.
    //      이 경우 settimeout을 쓰라지만... 그냥 스크린이 다 뜨면 포커스를 주는 것으로 한다.
    InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
  });

  return (
    <Box style={style.flatten(['flex-1', 'padding-x-12'])}>
      <TextInput
        ref={inputRef}
        label={intl.formatMessage({
          id: 'page.browser.favorite.name-input.label',
        })}
        value={name}
        error={error}
        onChangeText={text => setName(text)}
      />

      <Gutter size={20} />

      <TextInput
        label={intl.formatMessage({
          id: 'page.browser.favorite.url-input.label',
        })}
        disabled={true}
        value={route.params.url.url}
      />

      <Box style={style.flatten(['flex-1'])} />

      <Button
        text={intl.formatMessage({id: 'button.save'})}
        size="large"
        onPress={() => {
          if (!name) {
            setError('Name is required');
            return;
          }

          webpageStore.editFavoriteUrl({
            name,
            url: route.params.url.url,
          });

          navigation.goBack();
        }}
      />

      <Gutter size={23} />
    </Box>
  );
});

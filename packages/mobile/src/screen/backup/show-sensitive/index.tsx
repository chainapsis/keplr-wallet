import React, {FunctionComponent, useEffect, useState} from 'react';
import {ScrollViewRegisterContainer} from '../../register/components/scroll-view-register-container';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../../navigation';
import {Text, View} from 'react-native';
import {RNMessageRequesterInternal} from '../../../router';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {ShowSensitiveLegacyKeyRingDataMsg} from '@keplr-wallet/background';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {CopyToClipboard} from '../../register/new-mnemonic';
import {useIntl} from 'react-intl';
import {SVGLoadingIcon} from '../../../components/spinner';

export const BackupShowSensitiveScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Migration.Backup.ShowSensitive'>>();
  const navigation = useNavigation();

  const [sensitive, setSensitive] = useState('');

  useEffect(() => {
    (async () => {
      const requester = new RNMessageRequesterInternal();

      const sensitiveData = await requester.sendMessage(
        BACKGROUND_PORT,
        new ShowSensitiveLegacyKeyRingDataMsg(
          route.params.index,
          route.params.password,
        ),
      );

      // Loading 창이 너무 빨리 닫히면 안되므로, 0.5초 정도 기다린 후에 렌더링하도록 한다.
      setTimeout(() => {
        setSensitive(sensitiveData);
      }, 500);
    })();
  }, [route.params.index, route.params.password]);

  useEffect(() => {
    navigation.setOptions({
      title: intl.formatMessage(
        {id: 'page.migration.backup.sensitive.title'},
        {
          type:
            route.params.type === 'mnemonic'
              ? 'Recovery Phrase'
              : 'Private Key',
        },
      ),
    });
  }, [intl, navigation, route.params.type]);

  return (
    <ScrollViewRegisterContainer
      paddingX={12}
      bottomButton={{
        text: intl.formatMessage({
          id: 'page.migration.backup.sensitive.button',
        }),
        size: 'large',
        onPress: () => {
          navigation.goBack();
        },
      }}>
      <Box
        minHeight={160}
        paddingX={24}
        paddingY={20}
        borderRadius={8}
        backgroundColor={style.get('color-gray-600').color}>
        {sensitive ? (
          <Text style={style.flatten(['color-text-high', 'subtitle3'])}>
            {sensitive}
          </Text>
        ) : (
          <View style={style.flatten(['justify-center', 'items-center'])}>
            <SVGLoadingIcon color={style.get('color-white').color} size={16} />
          </View>
        )}

        <Box style={{flex: 1}} />

        <CopyToClipboard text={sensitive} />
      </Box>
    </ScrollViewRegisterContainer>
  );
};

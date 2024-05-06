import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';

import {Stack} from '../../../../../components/stack';

import {useStyle} from '../../../../../styles';
import {PageWithScrollView} from '../../../../../components/page';
import {Text} from 'react-native';
import {Gutter} from '../../../../../components/gutter';
import DeviceInfo from 'react-native-device-info';
import {Box} from '../../../../../components/box';
import {useAppUpdate} from '../../../../../provider/app-update';
import {APP_VERSION, CODEPUSH_VERSION} from '../../../../../../constants';

//TODO code push 추가후 버전페이지에도 추가 해야함
export const SettingGeneralVersionScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const buildNumber = DeviceInfo.getBuildNumber();

  const appUpdate = useAppUpdate();

  return (
    <PageWithScrollView
      backgroundMode="default"
      contentContainerStyle={style.flatten(['padding-x-12', 'padding-top-8'])}>
      <Stack gutter={8}>
        <Text style={style.flatten(['subtitle3', 'color-text-low'])}>App</Text>
        <SettingItem label="App Version" paragraph={APP_VERSION} />
        <SettingItem label="Build Number" paragraph={buildNumber} />
        <SettingItem
          label="Code Version"
          paragraph={CODEPUSH_VERSION || 'None'}
        />
      </Stack>
      <Gutter size={20} />
      <Stack gutter={8}>
        <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
          Remote
        </Text>
        <SettingItem
          label="Pending Code Version"
          paragraph={
            appUpdate.codepush.newVersion
              ? appUpdate.codepush.newVersion
              : 'None'
          }
        />
      </Stack>
    </PageWithScrollView>
  );
});

export const SettingItem: FunctionComponent<{
  label: string;
  paragraph: string;
}> = ({label, paragraph}) => {
  const style = useStyle();

  return (
    <Box
      backgroundColor={style.get('color-card-default').color}
      padding={14}
      borderRadius={6}>
      <Text style={style.flatten(['subtitle4', 'color-text-middle'])}>
        {label}
      </Text>
      <Gutter size={4} />
      <Text style={style.flatten(['body3', 'color-text-high'])}>
        {paragraph}
      </Text>
    </Box>
  );
};

import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';

import {Stack} from '../../../../../components/stack';

import {useStyle} from '../../../../../styles';
import {PageWithScrollView} from '../../../../../components/page';
import {Text} from 'react-native';
import {Gutter} from '../../../../../components/gutter';
import DeviceInfo from 'react-native-device-info';
// import codePush from 'react-native-code-push';
import {Box} from '../../../../../components/box';

//TODO code push 추가후 버전페이지에도 추가 해야함
export const SettingGeneralVersionScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();
  // "undefined" means that it is on fetching,
  // empty string "" means that there is no data.
  // const [currentCodeVersion, setCurrentCodeVersion] = useState<
  //   string | undefined
  // >(undefined);
  // const [latestCodeVersion, setLatestCodeVersion] = useState<
  //   string | undefined
  // >(undefined);
  // const [pendingCodeVersion, setPendingCodeVersion] = useState<
  //   string | undefined
  // >(undefined);

  // useEffect(() => {
  //   codePush.getUpdateMetadata(codePush.UpdateState.RUNNING).then(update => {
  //     if (update) {
  //       setCurrentCodeVersion(update.label);
  //     } else {
  //       setCurrentCodeVersion('');
  //     }
  //   });

  //   codePush.getUpdateMetadata(codePush.UpdateState.LATEST).then(update => {
  //     if (update) {
  //       setLatestCodeVersion(update.label);
  //     } else {
  //       setLatestCodeVersion('');
  //     }
  //   });

  //   codePush.getUpdateMetadata(codePush.UpdateState.PENDING).then(update => {
  //     if (update) {
  //       setPendingCodeVersion(update.label);
  //     } else {
  //       setPendingCodeVersion('');
  //     }
  //   });
  // }, []);

  const parseVersion = (version: string | undefined) => {
    if (version === undefined) {
      return 'Fetching...';
    }

    if (version === '') {
      return 'None';
    }

    return version;
  };

  return (
    <PageWithScrollView
      backgroundMode="default"
      contentContainerStyle={style.flatten(['padding-x-12'])}>
      <Stack gutter={8}>
        <Text style={style.flatten(['subtitle3', 'color-text-low'])}>App</Text>
        <SettingItem label="App Version" paragraph={appVersion} />
        <SettingItem
          label="Build Number"
          paragraph={parseVersion(buildNumber)}
        />
        {/* <SettingItem
          label="Code Version"
          paragraph={parseVersion(currentCodeVersion)}
        /> */}
      </Stack>
      <Gutter size={20} />
      <Stack gutter={8}>
        <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
          Remote
        </Text>
        {/* <SettingItem
          label="Latest Code Version"
          paragraph={parseVersion(latestCodeVersion)}
        />
        <SettingItem
          label="Pending Code Version"
          paragraph={parseVersion(pendingCodeVersion)}
        /> */}
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
      <Text style={style.flatten(['subtitle4', 'color-text-low'])}>
        {label}
      </Text>
      <Gutter size={4} />
      <Text style={style.flatten(['body3', 'color-text-high'])}>
        {paragraph}
      </Text>
    </Box>
  );
};

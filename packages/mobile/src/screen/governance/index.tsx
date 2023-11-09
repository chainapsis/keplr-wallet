import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {Text} from 'react-native';
import {useStore} from '../../stores';
import {Dec} from '@keplr-wallet/unit';
import {Box} from '../../components/box';
import FastImage from 'react-native-fast-image';
import {ViewToken} from '../../components/token-view';
import {Gutter} from '../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';

export const GovernanceScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {hugeQueriesStore} = useStore();
  const navigation = useNavigation<StackNavProp>();
  const delegations: ViewToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter(token => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations],
  );
  return (
    <PageWithScrollView backgroundMode={'default'}>
      {delegations.map(token => {
        return (
          <React.Fragment key={token.chainInfo.chainId}>
            <Box
              padding={16}
              backgroundColor={style.get('color-gray-600').color}
              onClick={() =>
                navigation.navigate('Governance', {
                  screen: 'Governance.list',
                  params: {chainId: token.chainInfo.chainId},
                })
              }>
              <FastImage source={{uri: token.chainInfo.chainSymbolImageUrl}} />
              <Text style={style.flatten(['h4', 'color-text-high'])}>
                {token.chainInfo.chainName}
              </Text>
            </Box>
            <Gutter size={12} />
          </React.Fragment>
        );
      })}
    </PageWithScrollView>
  );
});

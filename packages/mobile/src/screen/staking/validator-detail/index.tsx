import React, {FunctionComponent} from 'react';

import {observer} from 'mobx-react-lite';

import {useStyle} from '../../../styles';

import {PageWithScrollView} from '../../../components/page';
import {Stack} from '../../../components/stack';
import {GuideBox} from '../../../components/guide-box';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StakeNavigation} from '../../../navigation';
import {UnbondingCard} from './unbonding-card';

export const ValidatorDetailScreen: FunctionComponent = observer(() => {
  const route = useRoute<RouteProp<StakeNavigation, 'Stake.ValidateDetail'>>();
  const style = useStyle();
  const {validatorAddress, chainId} = route.params;

  return (
    <PageWithScrollView
      backgroundMode="default"
      style={style.flatten(['padding-x-12'])}>
      <Stack gutter={12}>
        <GuideBox title="te" color="warning" />
      </Stack>
      <UnbondingCard chainId={chainId} validatorAddress={validatorAddress} />
    </PageWithScrollView>
  );
});

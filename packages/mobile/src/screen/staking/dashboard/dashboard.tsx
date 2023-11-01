import React, {FunctionComponent} from 'react';
import {PageWithScrollView} from '../../../components/page';

import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';

export const StakingDashboardScreen: FunctionComponent = observer(() => {
  // const {chainStore, accountStore, queriesStore} = useStore();

  // const style = useStyle();

  // const account = accountStore.getAccount(chainStore.getChain());
  // const queries = queriesStore.get(chainStore.current.chainId);

  // const unbondings =
  //   queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
  //     account.bech32Address,
  //   ).unbondingBalances;

  return (
    <PageWithScrollView backgroundMode="default">
      <Text style={{color: 'white'}}>test</Text>
      {/* <MyRewardCard containerStyle={style.flatten(['margin-y-card-gap'])} />
      <DelegationsCard
        containerStyle={style.flatten(['margin-bottom-card-gap'])}
      />
      {unbondings.length > 0 ? (
        <UndelegationsCard
          containerStyle={style.flatten(['margin-bottom-card-gap'])}
        />
      ) : null} */}
    </PageWithScrollView>
  );
});

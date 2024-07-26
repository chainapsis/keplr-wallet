import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {CoinPretty} from '@keplr-wallet/unit';
import {Staking} from '@keplr-wallet/stores';
import {MsgItemBase} from './base.tsx';
import {MessageDelegateIcon} from '../../../components/icon';
import {useStyle} from '../../../styles';

export const MsgRelationDelegate: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const {chainStore, queriesStore} = useStore();

  const style = useStyle();
  const chainInfo = chainStore.getChain(msg.chainId);

  const amountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const amount = (msg.msg as any)['amount'] as {
      denom: string;
      amount: string;
    };

    if (amount.denom !== targetDenom) {
      return new CoinPretty(currency, '0');
    }
    return new CoinPretty(currency, amount.amount);
  }, [chainInfo, msg.msg, targetDenom]);

  const validatorAddress: string = useMemo(() => {
    return (msg.msg as any)['validator_address'];
  }, [msg.msg]);

  const queryBonded = queriesStore
    .get(chainInfo.chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded);
  const queryUnbonding = queriesStore
    .get(chainInfo.chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Unbonding);
  const queryUnbonded = queriesStore
    .get(chainInfo.chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Unbonded);

  const moniker: string = (() => {
    if (!validatorAddress) {
      return 'Unknown';
    }
    const bonded = queryBonded.getValidator(validatorAddress);
    if (bonded?.description.moniker) {
      return bonded.description.moniker;
    }
    const unbonding = queryUnbonding.getValidator(validatorAddress);
    if (unbonding?.description.moniker) {
      return unbonding.description.moniker;
    }
    const unbonded = queryUnbonded.getValidator(validatorAddress);
    if (unbonded?.description.moniker) {
      return unbonded.description.moniker;
    }

    return 'Unknown';
  })();

  return (
    <MsgItemBase
      logo={
        <MessageDelegateIcon
          size={40}
          color={style.get('color-gray-200').color}
        />
      }
      chainId={msg.chainId}
      title="Stake"
      paragraph={`To ${moniker}`}
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});

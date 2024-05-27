import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {MsgHistory} from '../types.ts';
import {CoinPretty} from '@keplr-wallet/unit';
import {Staking} from '@keplr-wallet/stores';
import {MsgItemBase} from './base.tsx';
import {IconProps} from '../../../components/icon/types.ts';
import {Path, Svg} from 'react-native-svg';
import {useStyle} from '../../../styles';

export const MsgRelationRedelegate: FunctionComponent<{
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

  const srcValidatorAddress: string = useMemo(() => {
    return (msg.msg as any)['validator_src_address'];
  }, [msg.msg]);
  const dstValidatorAddress: string = useMemo(() => {
    return (msg.msg as any)['validator_dst_address'];
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

  const srcMoniker: string = (() => {
    if (!srcValidatorAddress) {
      return 'Unknown';
    }
    const bonded = queryBonded.getValidator(srcValidatorAddress);
    if (bonded?.description.moniker) {
      return bonded.description.moniker;
    }
    const unbonding = queryUnbonding.getValidator(srcValidatorAddress);
    if (unbonding?.description.moniker) {
      return unbonding.description.moniker;
    }
    const unbonded = queryUnbonded.getValidator(srcValidatorAddress);
    if (unbonded?.description.moniker) {
      return unbonded.description.moniker;
    }

    return 'Unknown';
  })();

  const dstMoniker: string = (() => {
    if (!dstValidatorAddress) {
      return 'Unknown';
    }
    const bonded = queryBonded.getValidator(dstValidatorAddress);
    if (bonded?.description.moniker) {
      return bonded.description.moniker;
    }
    const unbonding = queryUnbonding.getValidator(dstValidatorAddress);
    if (unbonding?.description.moniker) {
      return unbonding.description.moniker;
    }
    const unbonded = queryUnbonded.getValidator(dstValidatorAddress);
    if (unbonded?.description.moniker) {
      return unbonded.description.moniker;
    }

    return 'Unknown';
  })();

  return (
    <MsgItemBase
      logo={
        <RedelegateIcon size={16} color={style.get('color-gray-200').color} />
      }
      chainId={msg.chainId}
      title="Switch Validator"
      paragraph={`${(() => {
        if (srcMoniker.length + dstMoniker.length > 18) {
          return `${srcMoniker.slice(0, 9)}...`;
        }
        return srcMoniker;
      })()} -> ${dstMoniker}`}
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});

export const RedelegateIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 16" fill="none">
      <Path
        d="M9 3L14 8L9 13M5 3L10 8L5 13"
        stroke={color || 'currentColor'}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

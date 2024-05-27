import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {CoinPretty} from '@keplr-wallet/unit';
import {Staking} from '@keplr-wallet/stores';
import {MsgItemBase} from './base.tsx';
import {IconProps} from '../../../components/icon/types.ts';
import {Path, Svg} from 'react-native-svg';

export const MsgRelationDelegate: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const {chainStore, queriesStore} = useStore();

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
      logo={<DelegateIcon size={16} />}
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

export const DelegateIcon: FunctionComponent<IconProps> = ({size}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M4.62767 8.81934L3.46062 9.41763C3.22993 9.51092 3.06668 9.73583 3.06668 9.99992C3.06668 10.2621 3.22753 10.487 3.4557 10.5822V10.5945L9.42757 13.6439L9.4325 13.6414C9.60394 13.7284 9.79454 13.7817 10 13.7817C10.2055 13.7817 10.3961 13.7284 10.5675 13.6414L10.5725 13.6439L16.5443 10.5945V10.5822C16.7725 10.487 16.9333 10.2621 16.9333 9.99992C16.9333 9.73583 16.7701 9.51092 16.5394 9.41763L15.3724 8.81934C13.5413 9.7566 11.0422 11.0319 11.0132 11.0426C10.6886 11.1876 10.3486 11.2605 10 11.2605C9.6502 11.2605 9.30903 11.187 8.98316 11.0414C8.95543 11.0313 6.45933 9.75723 4.62767 8.81934ZM4.62767 12.6012L3.46062 13.1994C3.22993 13.2927 3.06668 13.5176 3.06668 13.7817C3.06668 14.0439 3.22753 14.2689 3.4557 14.364V14.3763L9.42757 17.4257L9.4325 17.4232C9.60394 17.5102 9.79454 17.5636 10 17.5636C10.2055 17.5636 10.3961 17.5102 10.5675 17.4232L10.5725 17.4257L16.5443 14.3763V14.364C16.7725 14.2689 16.9333 14.0439 16.9333 13.7817C16.9333 13.5176 16.7701 13.2927 16.5394 13.1994L15.3724 12.6012C13.5413 13.5384 11.0422 14.8137 11.0132 14.8244C10.6886 14.9694 10.3486 15.0423 10 15.0423C9.6502 15.0423 9.30903 14.9688 8.98316 14.8232C8.95543 14.8131 6.45933 13.539 4.62767 12.6012Z"
        fill="#72747B"
      />
      <Path
        d="M9.43374 2.57638C9.60455 2.49002 9.79518 2.43604 10 2.43604C10.2049 2.43604 10.3955 2.49002 10.5663 2.57638H10.5774L16.5394 5.63556C16.7701 5.72885 16.9334 5.95376 16.9334 6.21785C16.9334 6.48006 16.7725 6.70497 16.5443 6.80014V6.81245L10.5725 9.86179L10.5675 9.85933C10.3961 9.94631 10.2055 9.99967 10 9.99967C9.79455 9.99967 9.60395 9.94631 9.43251 9.85933L9.42759 9.86179L3.45571 6.81245V6.80014C3.22754 6.70497 3.06669 6.48006 3.06669 6.21785C3.06669 5.95376 3.22994 5.72885 3.46063 5.63556L9.42266 2.57638H9.43374Z"
        fill="#FEFEFE"
      />
    </Svg>
  );
};

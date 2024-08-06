import React, {FunctionComponent} from 'react';
import {MsgDelegate} from '@keplr-wallet/proto-types/cosmos/staking/v1beta1/tx';
import {observer} from 'mobx-react-lite';
import {CoinPrimitive, Staking} from '@keplr-wallet/stores';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {CoinPretty} from '@keplr-wallet/unit';
import {FormattedMessage} from 'react-intl';
import {IMessageRenderer} from './types';
import {useStore} from '../../stores';
import {Text} from 'react-native';
import {useStyle} from '../../styles';
import {MessageDelegateIcon} from '../../components/icon';
import {ItemLogo} from '../activities/msg-items/logo.tsx';

export const DelegateMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ('type' in msg && msg.type === 'cosmos-sdk/MsgDelegate') {
        return {
          amount: msg.value.amount,
          validatorAddress: msg.value.validator_address,
          delegatorAddress: msg.value.delegatorAddress,
        };
      }

      if (
        'unpacked' in msg &&
        msg.typeUrl === '/cosmos.staking.v1beta1.MsgDelegate'
      ) {
        return {
          amount: (msg.unpacked as MsgDelegate).amount,
          validatorAddress: (msg.unpacked as MsgDelegate).validatorAddress,
          delegatorAddress: (msg.unpacked as MsgDelegate).delegatorAddress,
        };
      }
    })();

    if (d) {
      return {
        icon: (
          <ItemLogo
            center={<MessageDelegateIcon size={40} color="#DCDCE3" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.delegate.title" />
        ),
        content: (
          <DelegateMessagePretty
            chainId={chainId}
            amount={d.amount}
            validatorAddress={d.validatorAddress}
          />
        ),
      };
    }
  },
};

const DelegateMessagePretty: FunctionComponent<{
  chainId: string;
  amount: CoinPrimitive;
  validatorAddress: string;
}> = observer(({chainId, amount, validatorAddress}) => {
  const {chainStore, queriesStore} = useStore();
  const style = useStyle();

  const currency = chainStore.getChain(chainId).forceFindCurrency(amount.denom);
  const coinpretty = new CoinPretty(currency, amount.amount);
  const moniker = queriesStore
    .get(chainId)
    .cosmos.queryValidators.getQueryStatus(Staking.BondStatus.Bonded)
    .getValidator(validatorAddress)?.description.moniker;

  return (
    <Text style={style.flatten(['body3', 'color-text-middle'])}>
      <FormattedMessage
        id="page.sign.components.messages.delegate.paragraph"
        values={{
          validator:
            moniker || Bech32Address.shortenAddress(validatorAddress, 28),
          amount: coinpretty.trim(true).toString(),
          b: (...chunks: any) => (
            <Text style={{fontWeight: 'bold'}}>{chunks}</Text>
          ),
        }}
      />
    </Text>
  );
});

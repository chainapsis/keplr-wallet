import {IMessageRenderer} from '../types';
import React, {FunctionComponent} from 'react';
import {Coin} from '@keplr-wallet/types';
import {observer} from 'mobx-react-lite';
import {CoinPretty} from '@keplr-wallet/unit';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {MsgExecuteContract} from '@keplr-wallet/proto-types/cosmwasm/wasm/v1/tx';
import {MsgExecuteContract as MsgExecuteSecretContract} from '@keplr-wallet/proto-types/secret/compute/v1beta1/msg';
import {Buffer} from 'buffer/';
import {WasmMessageView} from './wasm-message-view';
import {FormattedMessage} from 'react-intl';
import {useStore} from '../../../stores';
import {Gutter} from '../../../components/gutter';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {MessageExecuteContractIcon} from '../../../components/icon';
import {ItemLogo} from '../../activities/msg-items/logo.tsx';

export const ExecuteContractMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ('type' in msg && msg.type === 'wasm/MsgExecuteContract') {
        return {
          funds: msg.value.funds ?? msg.value.sent_funds ?? [],
          contract: msg.value.contract,
          sender: msg.value.sender,
          msg: msg.value.msg,
          callbackCodeHash: msg.value.callback_code_hash,
        };
      }

      if (
        'unpacked' in msg &&
        (msg.typeUrl === '/cosmwasm.wasm.v1.MsgExecuteContract' ||
          msg.typeUrl === '/secret.compute.v1beta1.MsgExecuteContract')
      ) {
        return {
          funds: (msg.unpacked as MsgExecuteContract).funds,
          contract: (msg.unpacked as MsgExecuteContract).contract,
          sender: (msg.unpacked as MsgExecuteContract).sender,
          msg: JSON.parse(
            Buffer.from((msg.unpacked as MsgExecuteContract).msg).toString(),
          ),
          callbackCodeHash: (msg.unpacked as MsgExecuteSecretContract)
            .callbackCodeHash,
        };
      }
    })();

    if (d) {
      return {
        icon: (
          <ItemLogo
            center={<MessageExecuteContractIcon size={40} color="#DCDCE3" />}
          />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.execute-wasm-contract.title" />
        ),
        content: (
          <ExecuteContractMessagePretty
            chainId={chainId}
            funds={d.funds}
            contract={d.contract}
            sender={d.sender}
            msg={d.msg}
            callbackCodeHash={d.callbackCodeHash}
          />
        ),
      };
    }
  },
};

const ExecuteContractMessagePretty: FunctionComponent<{
  chainId: string;
  funds: Coin[];
  contract: string;
  sender: string;
  msg: object | string;
  callbackCodeHash: string | undefined;
}> = observer(({chainId, funds, contract, msg}) => {
  const {chainStore} = useStore();
  const style = useStyle();

  const coins = funds.map(coin => {
    const currency = chainStore.getChain(chainId).forceFindCurrency(coin.denom);

    return new CoinPretty(currency, coin.amount);
  });

  const isSecretWasm = chainStore.getChain(chainId).hasFeature('secretwasm');

  return (
    <React.Fragment>
      <Text style={style.flatten(['body3', 'color-text-middle'])}>
        <FormattedMessage
          id="page.sign.components.messages.execute-wasm-contract.paragraph"
          values={{
            address: Bech32Address.shortenAddress(
              isSecretWasm
                ? new Bech32Address(Buffer.from(contract, 'base64')).toBech32(
                    'secret',
                  )
                : contract,
              26,
            ),
            b: (...chunks: any) => (
              <Text style={{fontWeight: 'bold'}}>{chunks}</Text>
            ),
            ['only-sent-exist']: (...chunks: any[]) =>
              coins.length > 0 ? chunks : '',
            sent: coins
              .map(coinPretty => {
                return coinPretty.trim(true).toString();
              })
              .join(','),
          }}
        />
      </Text>

      <Gutter size={6} />
      <WasmMessageView
        chainId={chainId}
        msg={msg}
        isSecretWasm={isSecretWasm}
      />
    </React.Fragment>
  );
});

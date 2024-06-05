import {AnyWithUnpacked, ProtoCodec} from '@keplr-wallet/cosmos';
import {Msg} from '@keplr-wallet/types';
import React from 'react';
import yaml from 'js-yaml';
import {IMessageRenderer, IMessageRenderRegistry} from './types';
import {FormattedMessage} from 'react-intl';
import {CustomIcon, UnknownMessageContent} from './custom-message';
import {ClaimRewardsMessage} from './claim-rewards';
import {SendMessage} from './send';
import {DelegateMessage} from './delegate';
import {UndelegateMessage} from './undelegate';
import {RedelegateMessage} from './redelegate';
import {VoteMessage} from './renders/vote';
import {ExecuteContractMessage} from './renders/execute-contract';
import {TransferMessage} from './transfer.tsx';

export class MessageRenderRegistry implements IMessageRenderRegistry {
  protected renderers: IMessageRenderer[] = [];

  register(renderer: IMessageRenderer): void {
    this.renderers.push(renderer);
  }

  render(
    chainId: string,
    protoCodec: ProtoCodec,
    msg: Msg | AnyWithUnpacked,
  ): {
    icon: React.ReactElement;
    title: string | React.ReactElement;
    content: string | React.ReactElement;
  } {
    try {
      for (const renderer of this.renderers) {
        const res = renderer.process(chainId, msg, protoCodec);
        if (res) {
          return res;
        }
      }
    } catch (e) {
      console.log(e);
      // Fallback to unknown message
    }

    const prettyMsg = (() => {
      try {
        if ('type' in msg) {
          return yaml.dump(msg);
        }

        if ('typeUrl' in msg) {
          return yaml.dump(protoCodec.unpackedAnyToJSONRecursive(msg));
        }

        return yaml.dump(msg);
      } catch (e) {
        console.log(e);
        return 'Failed to decode the msg';
      }
    })();

    return {
      icon: <CustomIcon />,
      title: (
        <FormattedMessage id="page.sign.components.messages.custom.title" />
      ),
      content: <UnknownMessageContent>{prettyMsg}</UnknownMessageContent>,
    };
  }
}

export const defaultRegistry = new MessageRenderRegistry();
defaultRegistry.register(ClaimRewardsMessage);
defaultRegistry.register(SendMessage);
defaultRegistry.register(TransferMessage);
defaultRegistry.register(DelegateMessage);
defaultRegistry.register(UndelegateMessage);
defaultRegistry.register(RedelegateMessage);
defaultRegistry.register(VoteMessage);
defaultRegistry.register(ExecuteContractMessage);

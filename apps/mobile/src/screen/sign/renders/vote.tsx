import {IMessageRenderer} from '../types';
import React, {FunctionComponent} from 'react';
import {MsgVote} from '@keplr-wallet/proto-types/cosmos/gov/v1beta1/tx';
import {VoteOption} from '@keplr-wallet/proto-types/cosmos/gov/v1beta1/gov';
import {FormattedMessage, useIntl} from 'react-intl';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {MessageVoteIcon} from '../../../components/icon';
import {ItemLogo} from '../../activities/msg-items/logo.tsx';

export const VoteMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ('type' in msg && msg.type === 'cosmos-sdk/MsgVote') {
        return {
          proposalId: msg.value.proposal_id,
          voter: msg.value.voter,
          option: msg.value.option,
        };
      }

      if ('unpacked' in msg && msg.typeUrl === '/cosmos.gov.v1beta1.MsgVote') {
        return {
          proposalId: (msg.unpacked as MsgVote).proposalId,
          voter: (msg.unpacked as MsgVote).voter,
          option: (msg.unpacked as MsgVote).option,
        };
      }
    })();

    if (d) {
      return {
        icon: (
          <ItemLogo center={<MessageVoteIcon size={40} color="#DCDCE3" />} />
        ),
        title: (
          <FormattedMessage id="page.sign.components.messages.vote.title" />
        ),
        content: (
          <VoteMessagePretty
            chainId={chainId}
            proposalId={d.proposalId}
            voter={d.voter}
            option={d.option}
          />
        ),
      };
    }
  },
};

const VoteMessagePretty: FunctionComponent<{
  chainId: string;
  proposalId: string;
  voter: string;
  option: VoteOption | string;
}> = ({proposalId, option}) => {
  const intl = useIntl();
  const style = useStyle();
  const textualOption = (() => {
    if (typeof option === 'string') {
      return option;
    }

    switch (option) {
      case 0:
        return intl.formatMessage({
          id: 'page.sign.components.messages.vote.empty',
        });
      case 1:
        return intl.formatMessage({
          id: 'page.sign.components.messages.vote.yes',
        });
      case 2:
        return intl.formatMessage({
          id: 'page.sign.components.messages.vote.abstain',
        });
      case 3:
        return intl.formatMessage({
          id: 'page.sign.components.messages.vote.no',
        });
      case 4:
        return intl.formatMessage({
          id: 'page.sign.components.messages.vote.no-with-veto',
        });
      default:
        return intl.formatMessage({
          id: 'page.sign.components.messages.vote.unspecified',
        });
    }
  })();

  return (
    <Text style={style.flatten(['body3', 'color-text-middle'])}>
      <FormattedMessage
        id="page.sign.components.messages.vote.paragraph"
        values={{
          textualOption,
          proposalId,
          b: (...chunks: any) => (
            <Text style={{fontWeight: 'bold'}}>{chunks}</Text>
          ),
        }}
      />
    </Text>
  );
};

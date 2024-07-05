import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {MsgItemBase} from './base.tsx';
import {useStyle} from '../../../styles';
import {MessageVoteIcon} from '../../../components/icon';

export const MsgRelationVote: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const style = useStyle();
  const proposal: {
    proposalId: string;
  } = useMemo(() => {
    return {
      proposalId: (msg.msg as any)['proposal_id'],
    };
  }, [msg.msg]);

  const voteText: {
    text: string;
    color: string;
  } = useMemo(() => {
    switch ((msg.msg as any)['option']) {
      case 'VOTE_OPTION_YES':
        return {
          text: 'Yes',
          color: style.get('color-gray-10').color,
        };
      case 'VOTE_OPTION_NO':
        return {
          text: 'No',
          color: style.get('color-gray-10').color,
        };
      case 'VOTE_OPTION_NO_WITH_VETO':
        return {
          text: 'NWV',
          color: style.get('color-yellow-400').color,
        };
      case 'VOTE_OPTION_ABSTAIN':
        return {
          text: 'Abstain',
          color: style.get('color-gray-10').color,
        };
      default:
        return {
          text: 'Unknown',
          color: style.get('color-gray-10').color,
        };
    }
  }, [msg.msg, style]);

  return (
    <MsgItemBase
      logo={
        <MessageVoteIcon size={40} color={style.get('color-gray-200').color} />
      }
      chainId={msg.chainId}
      title="Vote"
      paragraph={`#${proposal.proposalId}`}
      amount={voteText.text}
      overrideAmountColor={voteText.color}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});

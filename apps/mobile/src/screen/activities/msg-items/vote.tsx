import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {MsgItemBase} from './base.tsx';
import {G, Defs, Path, Rect, Svg, ClipPath} from 'react-native-svg';
import {useStyle} from '../../../styles';

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
      logo={<VoteIcon />}
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

export const VoteIcon: FunctionComponent = () => {
  return (
    <Svg width={14} height={18} viewBox="0 0 14 18" fill="none">
      <G clipPath="url(#clip0_12938_3886)">
        <Rect
          x="0.5"
          y="4.38281"
          width="13"
          height="11"
          rx="2"
          fill="#ABABB5"
        />
        <Rect
          x="7.60928"
          y="0.234375"
          width="5.39721"
          height="7.66871"
          rx="1.10608"
          transform="rotate(36.3126 7.60928 0.234375)"
          fill="#ABABB5"
          stroke="#2E2E32"
          stroke-width="1.65912"
        />
        <Rect x="3.5" y="7.49805" width="7" height="5" fill="#ABABB5" />
        <Path
          d="M2.5 7.49805H11.5"
          stroke="#2E2E32"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_12938_3886">
          <Rect
            width="14"
            height="17"
            fill="white"
            transform="translate(0 0.5)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

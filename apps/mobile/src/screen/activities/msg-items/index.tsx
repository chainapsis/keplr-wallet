import React, {ErrorInfo, FunctionComponent, PropsWithChildren} from 'react';
import {MsgHistory} from '../types.ts';
import {Box} from '../../../components/box';
import {Text} from 'react-native';
import {MsgRelationSend} from './send.tsx';
import {MsgRelationReceive} from './receive.tsx';
import {MsgRelationIBCSend} from './ibc-send.tsx';
import {MsgRelationIBCSendReceive} from './ibc-receive.tsx';
import {MsgRelationIBCSendRefunded} from './ibc-send-refunded.tsx';
import {MsgRelationIBCSwap} from './ibc-swap.tsx';
import {MsgRelationIBCSwapReceive} from './ibc-swap-receive.tsx';
import {MsgRelationIBCSwapRefunded} from './ibc-swap-refunded.tsx';
import {MsgRelationDelegate} from './delegate.tsx';
import {MsgRelationUndelegate} from './undelegate.tsx';
import {MsgRelationRedelegate} from './redelegate.tsx';
import {MsgRelationCancelUndelegate} from './cancel-undelegate.tsx';
import {MsgRelationVote} from './vote.tsx';
import {MsgRelationMergedClaimRewards} from './merged-claim-rewards.tsx';
import {XAxis} from '../../../components/axis';
import {ItemLogo} from './logo.tsx';
import {Gutter} from '../../../components/gutter';
import {useStyle} from '../../../styles';
import Svg, {Path} from 'react-native-svg';

export const MsgItemRender: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage?: boolean;
}> = ({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  return (
    <ErrorBoundary>
      <MsgItemRenderInner
        msg={msg}
        prices={prices}
        targetDenom={targetDenom}
        isInAllActivitiesPage={isInAllActivitiesPage}
      />
    </ErrorBoundary>
  );
};

const MsgItemRenderInner: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage?: boolean;
}> = ({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  switch (msg.relation) {
    case 'send': {
      return (
        <MsgRelationSend
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'receive': {
      return (
        <MsgRelationReceive
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'ibc-send': {
      return (
        <MsgRelationIBCSend
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'ibc-send-receive': {
      return (
        <MsgRelationIBCSendReceive
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'ibc-send-refunded': {
      return (
        <MsgRelationIBCSendRefunded
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'ibc-swap-skip-osmosis': {
      return (
        <MsgRelationIBCSwap
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'ibc-swap-skip-osmosis-receive': {
      return (
        <MsgRelationIBCSwapReceive
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'ibc-swap-skip-osmosis-refunded': {
      return (
        <MsgRelationIBCSwapRefunded
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'delegate': {
      return (
        <MsgRelationDelegate
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'undelegate': {
      return (
        <MsgRelationUndelegate
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'redelegate': {
      return (
        <MsgRelationRedelegate
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'cancel-undelegate': {
      return (
        <MsgRelationCancelUndelegate
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'vote': {
      return (
        <MsgRelationVote
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
    case 'custom/merged-claim-rewards': {
      return (
        <MsgRelationMergedClaimRewards
          msg={msg}
          prices={prices}
          targetDenom={targetDenom}
          isInAllActivitiesPage={isInAllActivitiesPage}
        />
      );
    }
  }

  return <UnknownMsgItem title="Unknown message" />;
};

const UnknownMsgItem: FunctionComponent<{
  title: string;
}> = ({title}) => {
  const style = useStyle();
  return (
    <Box
      borderRadius={6}
      backgroundColor={style.get('color-gray-600').color}
      paddingX={16}
      paddingY={14}
      alignY="center">
      <XAxis alignY="center">
        <ItemLogo center={<UnknownIcon />} />

        <Gutter size={12} />

        <Text style={style.flatten(['subtitle3', 'color-gray-10'])}>
          {title}
        </Text>

        <Box style={style.flatten(['flex-1'])} />
      </XAxis>
    </Box>
  );
};

const UnknownIcon: FunctionComponent = () => {
  return (
    <Svg width="20" height="20" fill="none" viewBox="0 0 20 20">
      <Path
        fill="#F0224B"
        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      />
    </Svg>
  );
};

class ErrorBoundary extends React.Component<
  PropsWithChildren,
  {
    hasError: boolean;
  }
> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log(error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return <UnknownMsgItem title="Unknown error occured" />;
    }

    return this.props.children;
  }
}

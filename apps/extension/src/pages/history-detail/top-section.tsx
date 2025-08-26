import React, { FunctionComponent } from "react";
import { MsgHistory } from "../main/token-detail/types";
import { HistoryDetailSend, HistoryDetailSendIcon } from "./msgs/send";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HistoryDetailReceive, HistoryDetailReceiveIcon } from "./msgs/receive";
import { HistoryDetailIBCSend } from "./msgs/ibc-send";
import { HistoryDetailIBCSendReceive } from "./msgs/ibc-send-receive";
import {
  HistoryDetailIBCSwapSkip,
  HistoryDetailIBCSwapSkipIcon,
} from "./msgs/ibc-swap";
import { HistoryDetailIBCSwapSkipReceive } from "./msgs/ibc-swap-receive";
import {
  HistoryDetailMergedClaimRewards,
  HistoryDetailMergedClaimRewardsIcon,
} from "./msgs/merged-claim-rewards";
import {
  HistoryDetailDelegate,
  HistoryDetailDelegateIcon,
} from "./msgs/delegate";
import {
  HistoryDetailUndelegate,
  HistoryDetailUndelegateIcon,
} from "./msgs/undelegate";
import {
  HistoryDetailRedelegate,
  HistoryDetailRedelegateIcon,
} from "./msgs/redelegate";
import { HistoryDetailGovVoteIcon, HistoryDetailVote } from "./msgs/vote";
import { HistoryDetailEvmSend } from "./msgs/evm-send";
import { HistoryDetailEvmReceive } from "./msgs/evm-receive";
import {
  HistoryDetailEvmApprove,
  HistoryDetailEvmApproveIcon,
} from "./msgs/evm-approve";
import {
  HistoryDetailEvmContractCall,
  HistoryDetailEvmContractCallIcon,
} from "./msgs/evm-contract-call";
import { IconBase } from "./icon-base";
import { ColorPalette } from "../../styles";

export const HistoryDetailTopSection: FunctionComponent<{
  msg: MsgHistory;
}> = observer(({ msg }) => {
  const { chainStore } = useStore();

  const targetDenom = (() => {
    // "custom/merged-claim-rewards"는 예외임
    if (msg.relation === "custom/merged-claim-rewards") {
      if (!msg.denoms || msg.denoms.length === 0) {
        throw new Error(`Invalid denoms: ${msg.denoms})`);
      }
      const chainInfo = chainStore.getChain(msg.chainId);
      if (chainInfo.chainIdentifier === "dydx-mainnet") {
        // dydx는 USDC에 우선권을 줌
        if (
          msg.denoms.includes(
            "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5"
          )
        ) {
          return "ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5";
        }
      }
      if (chainInfo.stakeCurrency) {
        if (msg.denoms.includes(chainInfo.stakeCurrency.coinMinimalDenom)) {
          return chainInfo.stakeCurrency.coinMinimalDenom;
        }
      }
      return msg.denoms[0];
    }
    if (!msg.denoms || msg.denoms.length !== 1) {
      // 백엔드에서 denoms는 무조건 한개 오도록 보장한다.
      throw new Error(`Invalid denoms: ${msg.denoms})`);
    }

    return msg.denoms[0];
  })();

  let icon: React.ReactElement | undefined;
  let iconText: string | undefined;
  let section: React.ReactElement | undefined;

  switch (msg.relation) {
    case "send": {
      icon = <HistoryDetailSendIcon />;
      iconText = "Send";
      section = <HistoryDetailSend msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "receive": {
      icon = <HistoryDetailReceiveIcon />;
      iconText = "Receive";
      section = <HistoryDetailReceive msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "ibc-send": {
      icon = <HistoryDetailSendIcon />;
      iconText = "Send";
      section = <HistoryDetailIBCSend msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "ibc-send-receive": {
      icon = <HistoryDetailReceiveIcon />;
      iconText = "Receive";
      section = (
        <HistoryDetailIBCSendReceive msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "ibc-swap-skip-osmosis":
    case "ibc-swap-skip": {
      icon = <HistoryDetailIBCSwapSkipIcon />;
      iconText = "Swap";
      section = (
        <HistoryDetailIBCSwapSkip msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "ibc-swap-skip-osmosis-receive":
    case "ibc-swap-skip-receive": {
      icon = <HistoryDetailIBCSwapSkipIcon />;
      iconText = "Swap Complete";
      section = (
        <HistoryDetailIBCSwapSkipReceive msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "custom/merged-claim-rewards":
    case "noble-claim-yield": {
      icon = <HistoryDetailMergedClaimRewardsIcon />;
      iconText = "Claim Reward";
      section = (
        <HistoryDetailMergedClaimRewards msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "delegate": {
      icon = <HistoryDetailDelegateIcon />;
      iconText = "Stake";
      section = <HistoryDetailDelegate msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "undelegate": {
      icon = <HistoryDetailUndelegateIcon />;
      iconText = "Unstake";
      section = <HistoryDetailUndelegate msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "redelegate": {
      icon = <HistoryDetailRedelegateIcon />;
      iconText = "Switch Validator";
      section = <HistoryDetailRedelegate msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "vote": {
      icon = <HistoryDetailGovVoteIcon />;
      iconText = "Vote";
      section = <HistoryDetailVote msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "evm/send":
    case "evm/erc20-send": {
      icon = <HistoryDetailSendIcon />;
      iconText = "Send";
      section = <HistoryDetailEvmSend msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "evm/receive":
    case "evm/erc20-receive": {
      icon = <HistoryDetailReceiveIcon />;
      iconText = "Receive";
      section = <HistoryDetailEvmReceive msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "evm/erc20-approve": {
      icon = <HistoryDetailEvmApproveIcon />;
      iconText = "Approve Token";
      section = <HistoryDetailEvmApprove msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "evm/contract-call": {
      icon = <HistoryDetailEvmContractCallIcon />;
      iconText = "Execute Contract";
      section = (
        <HistoryDetailEvmContractCall msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
  }

  // Render icon and section
  const iconElement = icon || <UnknownIcon />;
  const sectionElement = section;

  return (
    <React.Fragment>
      <IconBase
        icon={iconElement}
        type={(() => {
          if (iconText) {
            return iconText;
          }

          if (msg.msg && (msg.msg as any)["@type"]) {
            return (msg.msg as any)["@type"];
          }
          return msg.relation || "Unknown";
        })()}
        chainId={msg.chainId}
      />
      {sectionElement}
    </React.Fragment>
  );
});

const UnknownIcon: FunctionComponent = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
    >
      <circle
        cx="19.998"
        cy="18.482"
        r="12.921"
        stroke={ColorPalette["gray-300"]}
        strokeWidth="2.5"
      />
      <path
        stroke={ColorPalette["gray-300"]}
        strokeWidth="2.5"
        d="M7.766 20.415c-4.167 3.681-6.374 7-5.377 8.647 1.584 2.617 10.645.031 20.24-5.775 9.593-5.806 16.087-12.634 14.504-15.25-.95-1.57-4.59-1.268-9.42.478"
      />
    </svg>
  );
};

import React, { FunctionComponent } from "react";
import { MsgHistory } from "../main/token-detail/types";
import { HistoryDetailSend } from "./msgs/send";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { HistoryDetailReceive } from "./msgs/receive";
import { HistoryDetailIBCSend } from "./msgs/ibc-send";
import { HistoryDetailIBCSendReceive } from "./msgs/ibc-send-receive";
import { HistoryDetailIBCSwapSkip } from "./msgs/ibc-swap";
import { HistoryDetailIBCSwapSkipReceive } from "./msgs/ibc-swap-receive";
import { HistoryDetailMergedClaimRewards } from "./msgs/merged-claim-rewards";
import { HistoryDetailDelegate } from "./msgs/delegate";
import { HistoryDetailUndelegate } from "./msgs/undelegate";
import { HistoryDetailRedelegate } from "./msgs/redelegate";
import { HistoryDetailVote } from "./msgs/vote";
import { UnknownIcon } from "./unknown-icon";

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
  let section: React.ReactElement | undefined;

  switch (msg.relation) {
    case "send": {
      section = <HistoryDetailSend msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "receive": {
      section = <HistoryDetailReceive msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "ibc-send": {
      section = <HistoryDetailIBCSend msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "ibc-send-receive": {
      section = (
        <HistoryDetailIBCSendReceive msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "ibc-swap-skip-osmosis":
    case "ibc-swap-skip": {
      section = (
        <HistoryDetailIBCSwapSkip msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "ibc-swap-skip-osmosis-receive":
    case "ibc-swap-skip-receive": {
      section = (
        <HistoryDetailIBCSwapSkipReceive msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "custom/merged-claim-rewards":
    case "noble-claim-yield": {
      section = (
        <HistoryDetailMergedClaimRewards msg={msg} targetDenom={targetDenom} />
      );
      break;
    }
    case "delegate": {
      section = <HistoryDetailDelegate msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "undelegate": {
      section = <HistoryDetailUndelegate msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "redelegate": {
      section = <HistoryDetailRedelegate msg={msg} targetDenom={targetDenom} />;
      break;
    }
    case "vote": {
      section = <HistoryDetailVote msg={msg} targetDenom={targetDenom} />;
      break;
    }
  }

  // Render icon and section
  const iconElement = icon || (
    <UnknownIcon type={msg.relation || "Unknown"} chainId={msg.chainId} />
  );
  const sectionElement = section || <div>Unknown</div>;

  return (
    <React.Fragment>
      {iconElement}
      {sectionElement}
    </React.Fragment>
  );
});

import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Stack } from "../../../components/stack";
import { Box } from "../../../components/box";
import { AmountInput } from "../../../components/input";
import {
  IAmountConfig,
  IFeeConfig,
  IGasConfig,
  IGasSimulator,
  IMemoConfig,
  ISenderConfig,
} from "@keplr-wallet/hooks";
import { MemoInput } from "../../../components/input/memo-input";
import { FeeControl } from "../../../components/input/fee-control";
import { useIntl } from "react-intl";
import { VerticalCollapseTransition } from "../../../components/transition/vertical-collapse";
import { FeeCoverageDescription } from "../../../components/top-up";

export const IBCTransferAmountView: FunctionComponent<{
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
  senderConfig: ISenderConfig;
  memoConfig: IMemoConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;

  shouldTopUp: boolean;
  isTopUpAvailable: boolean;
}> = observer(
  ({
    amountConfig,
    feeConfig,
    senderConfig,
    memoConfig,
    gasConfig,
    gasSimulator,

    shouldTopUp,
    isTopUpAvailable,
  }) => {
    const intl = useIntl();

    return (
      <Box
        paddingX="0.75rem"
        style={{
          flex: 1,
        }}
      >
        <Stack gutter="0.75rem">
          <AmountInput amountConfig={amountConfig} />

          <MemoInput
            memoConfig={memoConfig}
            placeholder={intl.formatMessage({
              id: "components.input.memo-input.optional-placeholder",
            })}
          />
        </Stack>
        <div style={{ flex: 1 }} />
        <VerticalCollapseTransition collapsed={shouldTopUp}>
          <FeeControl
            senderConfig={senderConfig}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            gasSimulator={gasSimulator}
            disableAutomaticFeeSet={shouldTopUp}
            shouldTopUp={shouldTopUp}
          />
        </VerticalCollapseTransition>
        <VerticalCollapseTransition
          collapsed={!(shouldTopUp && isTopUpAvailable)}
        >
          <FeeCoverageDescription isTopUpAvailable={isTopUpAvailable} />
        </VerticalCollapseTransition>
      </Box>
    );
  }
);

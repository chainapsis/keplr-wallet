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

export const IBCTransferAmountView: FunctionComponent<{
  amountConfig: IAmountConfig;
  feeConfig: IFeeConfig;
  senderConfig: ISenderConfig;
  memoConfig: IMemoConfig;
  gasConfig: IGasConfig;
  gasSimulator?: IGasSimulator;
}> = observer(
  ({
    amountConfig,
    feeConfig,
    senderConfig,
    memoConfig,
    gasConfig,
    gasSimulator,
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

          <div style={{ flex: 1 }} />
          <FeeControl
            senderConfig={senderConfig}
            feeConfig={feeConfig}
            gasConfig={gasConfig}
            gasSimulator={gasSimulator}
          />
        </Stack>
      </Box>
    );
  }
);

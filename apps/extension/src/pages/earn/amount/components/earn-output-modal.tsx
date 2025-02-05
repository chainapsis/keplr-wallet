import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Box } from "../../../../components/box";
import { Subtitle1 } from "../../../../components/typography";
import { CoinPretty } from "@keplr-wallet/unit";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 0.75rem;
    padding-top: 0.88rem;

    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette.white
        : ColorPalette["gray-600"]};
  `,
};

export const EarnOutputModal: FunctionComponent<{
  token: CoinPretty;
}> = observer(({ token }) => {
  // TO-DO: need to query for USDN output
  return (
    <Styles.Container>
      <Box marginBottom="1.25rem" marginLeft="0.5rem" paddingY="0.4rem">
        <Subtitle1>
          <FormattedMessage
            id="page.earn.amount.earn-output-modal.title"
            values={{
              tokenName: token.denom,
            }}
          />
        </Subtitle1>
      </Box>
    </Styles.Container>
  );
});

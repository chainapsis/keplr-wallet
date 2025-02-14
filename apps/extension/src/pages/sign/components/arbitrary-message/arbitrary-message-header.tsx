import React, { FunctionComponent } from "react";
import { H4 } from "../../../../components/typography";
import { FormattedMessage } from "react-intl";
import { YAxis } from "../../../../components/axis";

export const ArbitraryMsgSignHeader: FunctionComponent<{
  isFromKeplr?: boolean;
}> = ({ isFromKeplr }) => {
  return (
    <YAxis alignX="center">
      <H4>
        {isFromKeplr ? (
          <FormattedMessage id="page.sign.adr36.title.from-keplr" />
        ) : (
          <FormattedMessage id="page.sign.adr36.title" />
        )}
      </H4>
    </YAxis>
  );
};

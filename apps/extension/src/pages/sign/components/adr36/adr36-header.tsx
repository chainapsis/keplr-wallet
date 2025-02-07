import React, { FunctionComponent } from "react";
import { H4 } from "../../../../components/typography";
import { FormattedMessage } from "react-intl";
import { YAxis } from "../../../../components/axis";

export const Adr36SignHeader: FunctionComponent = () => {
  return (
    <YAxis alignX="center">
      <H4>
        <FormattedMessage id="page.sign.adr36.title" />
      </H4>
    </YAxis>
  );
};

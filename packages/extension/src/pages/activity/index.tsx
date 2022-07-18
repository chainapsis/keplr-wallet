import React, { FunctionComponent } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { HeaderLayout } from "../../layouts";

export const ActivityPage: FunctionComponent = () => {
  const history = useHistory();
  const intl = useIntl();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({ id: "setting.keyring" })}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <h3>Activity Page</h3>
    </HeaderLayout>
  );
};

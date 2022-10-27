import React, { FunctionComponent } from "react";
import { useHistory } from "react-router";
import { SwitchUser } from "../../components/switch-user";
import { HeaderLayout } from "../../layouts";

export const ActivityPage: FunctionComponent = () => {
  const history = useHistory();

  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      onBackButton={() => {
        history.goBack();
      }}
      rightRenderer={<SwitchUser />}
    >
      <h3>Activity Page</h3>
    </HeaderLayout>
  );
};

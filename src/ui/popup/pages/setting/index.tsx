import React, { FunctionComponent, useCallback } from "react";
import { HeaderLayout } from "../../layouts/header-layout";
import { useHistory } from "react-router";

export const SettingPage: FunctionComponent = () => {
  const history = useHistory();

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle="Setting"
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      setting
    </HeaderLayout>
  );
};

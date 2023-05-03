import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../layouts/header";
import { BackButton } from "../../layouts/header/components";
import { CommunityInfoView, RawInfoView } from "./components";

export const SuggestChainPage: FunctionComponent = observer(() => {
  const [isCommunityDriven, setIsCommunityDriven] = React.useState(false);
  const [isDeveloper, setIsDeveloper] = React.useState(false);

  return (
    <HeaderLayout
      fixedHeight
      title={isCommunityDriven ? "" : "Add Injective to Keplr"}
      left={isCommunityDriven && isDeveloper ? <BackButton /> : null}
      bottomButton={{
        text: "Approve",
        size: "large",
        color: "primary",
        onClick: () => {
          setIsCommunityDriven(!isCommunityDriven);
          setIsDeveloper(!isDeveloper);
        },
      }}
    >
      {isCommunityDriven ? (
        <CommunityInfoView />
      ) : (
        <RawInfoView isDeveloper={isDeveloper} />
      )}
    </HeaderLayout>
  );
});

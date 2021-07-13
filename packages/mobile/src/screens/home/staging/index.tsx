import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { AccountCard } from "./account-card";

export const HomeScreen: FunctionComponent = () => {
  return (
    <PageWithScrollView>
      <AccountCard />
    </PageWithScrollView>
  );
};

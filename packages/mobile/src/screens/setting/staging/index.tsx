import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";

export const SettingScreen: FunctionComponent = () => {
  return (
    <PageWithScrollView>
      <SettingSelectAccountItem />
      <SettingSectionTitle title="General" />
      <SettingItem
        label="Currency"
        right={<RightArrow paragraph="USD" />}
        topBorder={true}
      />
      <SettingItem label="Address Book" right={<RightArrow />} />
    </PageWithScrollView>
  );
};

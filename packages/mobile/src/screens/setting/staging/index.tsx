import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { useStyle } from "../../../styles";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";

export const SettingScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <PageWithScrollView style={style.flatten(["padding-x-0"])}>
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

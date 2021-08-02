import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../components/staging/page";
import { RightArrow, SettingItem, SettingSectionTitle } from "./components";
import { SettingSelectAccountItem } from "./items/select-account";
import { useSmartNavigation } from "../../../navigation";

export const SettingScreen: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <PageWithScrollView>
      <SettingSelectAccountItem />
      <SettingSectionTitle title="General" />
      <SettingItem
        label="Currency"
        right={<RightArrow paragraph="USD" />}
        topBorder={true}
      />
      <SettingItem
        label="Address Book"
        right={<RightArrow />}
        onPress={() => {
          smartNavigation.navigateSmart("AddressBook", {});
        }}
      />
    </PageWithScrollView>
  );
};

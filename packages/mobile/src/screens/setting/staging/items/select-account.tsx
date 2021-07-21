import React, { FunctionComponent } from "react";
import { RightArrow, SettingItem } from "../components";
import { useStyle } from "../../../../styles";
import { useSmartNavigation } from "../../../../navigation";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

export const SettingSelectAccountItem: FunctionComponent = observer(() => {
  const { chainStore, accountStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  return (
    <SettingItem
      containerStyle={style.flatten(["height-80"])}
      labelStyle={style.flatten(["h5", "color-text-black-medium"])}
      label={account.name || "Keplr Account"}
      right={<RightArrow />}
      onPress={() => {
        smartNavigation.navigateSmart("SettingSelectAccount", {});
      }}
    />
  );
});

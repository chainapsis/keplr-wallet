import { observer } from "mobx-react-lite";
import { useState } from "react";

import { useStore } from "../../../stores";
import { DropDownPicker } from "./drop-down-picker";

export const WalletsPicker = observer(() => {
  const { walletsStore } = useStore();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(() => {
    return walletsStore.wallets.map((wallet, index) => {
      return {
        value: index,
        label: wallet.shortenedAddress ?? wallet.type,
      };
    });
  });
  const [value, setValue] = useState(walletsStore.currentWalletIndex);

  // TODO: update items if walletsStore.wallets changes
  // TODO: update value if walletsStore.wallets changes

  if (walletsStore.wallets.length === 0) return null;

  return (
    <DropDownPicker
      items={items}
      setItems={setItems}
      open={open}
      setOpen={setOpen}
      value={value}
      setValue={setValue}
      itemKey="value"
      itemSeparator={false}
      closeAfterSelecting={true}
      style={{
        backgroundColor: "transparent",
        borderWidth: 0,
      }}
      textStyle={{
        fontSize: 16,
        color: "#F6F5FF",
        textAlign: "left",
        backgroundColor: "transparent",
      }}
      maxHeight={300}
      disableBorderRadius={true}
      stickyHeader={true}
      showArrowIcon={true}
      showTickIcon={false}
      hideSelectedItemIcon={false}
      placeholder="Select a wallet"
      onChangeValue={(value) => {
        void walletsStore.setCurrentWallet(value);
      }}
    />
  );
});

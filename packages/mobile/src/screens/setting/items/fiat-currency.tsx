import React, { FunctionComponent, useMemo, useState } from "react";
import { RightArrow, SettingItem } from "../components";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { SelectorModal } from "../../../components/input";

export const SettingFiatCurrencyItem: FunctionComponent<{
  topBorder?: boolean;
}> = observer(({ topBorder }) => {
  const { priceStore } = useStore();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const currencyItems = useMemo(() => {
    return Object.keys(priceStore.supportedVsCurrencies).map((key) => {
      return {
        key,
        label: key.toUpperCase(),
      };
    });
  }, [priceStore.supportedVsCurrencies]);

  return (
    <React.Fragment>
      <SelectorModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        maxItemsToShow={4}
        selectedKey={priceStore.defaultVsCurrency}
        setSelectedKey={(key) => key && priceStore.setDefaultVsCurrency(key)}
        items={currencyItems}
      />
      <SettingItem
        topBorder={topBorder}
        label="Currency"
        right={
          <RightArrow paragraph={priceStore.defaultVsCurrency.toUpperCase()} />
        }
        onPress={() => {
          setIsOpenModal(true);
        }}
      />
    </React.Fragment>
  );
});

import React, { FunctionComponent, useMemo, useState } from "react";
import { SelectorModal } from "../../../components/input";
import { RightArrow, SettingItem } from "../components";
import { useStyleThemeController } from "../../../styles";

export const SettingThemeItem: FunctionComponent<{
  topBorder?: boolean;
}> = ({ topBorder }) => {
  const themeController = useStyleThemeController();

  const [isOpenModal, setIsOpenModal] = useState(false);

  const selectableItems = useMemo(() => {
    return [
      {
        key: "light",
        label: "Light",
      },
      {
        key: "dark",
        label: "Dark",
      },
      {
        key: "automatic",
        label: "Automatic",
      },
    ];
  }, []);

  const selectedKey = useMemo(() => {
    if (themeController.isAutomatic) {
      return "automatic";
    }

    return themeController.theme;
  }, [themeController.isAutomatic, themeController.theme]);

  return (
    <React.Fragment>
      <SelectorModal
        isOpen={isOpenModal}
        close={() => setIsOpenModal(false)}
        maxItemsToShow={4}
        selectedKey={selectedKey}
        setSelectedKey={(key) => {
          switch (key) {
            case "light":
              themeController.setTheme("light");
              break;
            case "dark":
              themeController.setTheme("dark");
              break;
            default:
              themeController.setTheme(null);
              break;
          }
        }}
        items={selectableItems}
      />
      <SettingItem
        topBorder={topBorder}
        label="Theme"
        right={
          <RightArrow
            paragraph={
              selectableItems.find((item) => item.key === selectedKey)?.label
            }
          />
        }
        onPress={() => {
          setIsOpenModal(true);
        }}
      />
    </React.Fragment>
  );
};

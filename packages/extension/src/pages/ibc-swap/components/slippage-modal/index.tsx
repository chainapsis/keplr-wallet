import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { XAxis, YAxis } from "../../../../components/axis";
import { Body2, Subtitle2, Subtitle3 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { HorizontalRadioGroup } from "../../../../components/radio-group";
import { Toggle } from "../../../../components/toggle";
import { VerticalCollapseTransition } from "../../../../components/transition/vertical-collapse";
import { TextInput } from "../../../../components/input";
import { Modal } from "../../../../components/modal";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";

export const SlippageModal: FunctionComponent<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}> = observer(({ isOpen, setIsOpen }) => {
  const { uiConfigStore } = useStore();

  const selectables = ["0.1", "0.5", "1.0"];

  return (
    <Modal
      isOpen={isOpen}
      align="center"
      close={() => {
        if (uiConfigStore.ibcSwapConfig.slippageIsValid) {
          setIsOpen(false);
        }
      }}
    >
      <YAxis alignX="center">
        <Box
          borderRadius="1.25rem"
          backgroundColor={ColorPalette["gray-600"]}
          padding="1.25rem"
          width="95%"
          maxWidth="18.75rem"
        >
          <XAxis alignY="center">
            <Subtitle2 color={ColorPalette["white"]}>Settings</Subtitle2>
            <div style={{ flex: 1 }} />
          </XAxis>

          <Gutter size="1.75rem" />

          <XAxis alignY="center">
            <Gutter size="0.5rem" />
            <Subtitle3 color={ColorPalette["gray-100"]}>
              Slippage Tolerance
            </Subtitle3>
          </XAxis>

          <Gutter size="0.62rem" />
          <HorizontalRadioGroup
            size="default"
            items={selectables.map((selectable) => ({
              key: selectable,
              text: selectable + "%",
            }))}
            selectedKey={
              uiConfigStore.ibcSwapConfig.slippageIsCustom
                ? "null"
                : uiConfigStore.ibcSwapConfig.slippage
            }
            onSelect={(key) => {
              uiConfigStore.ibcSwapConfig.setSlippage(key);
              uiConfigStore.ibcSwapConfig.setSlippageIsCustom(false);
            }}
          />

          <Gutter size="1.25rem" />
          <XAxis alignY="center">
            <Gutter size="0.5rem" />
            <Subtitle3 color={ColorPalette["gray-100"]}>
              Custom Slippage
            </Subtitle3>
            <Gutter size="0.5rem" />
            <Toggle
              isOpen={uiConfigStore.ibcSwapConfig.slippageIsCustom}
              setIsOpen={(value) => {
                uiConfigStore.ibcSwapConfig.setSlippageIsCustom(value);

                if (!value) {
                  const selectableNums = selectables.map((s) => parseFloat(s));
                  const i = selectableNums.indexOf(
                    uiConfigStore.ibcSwapConfig.slippageNum
                  );
                  if (i >= 0) {
                    uiConfigStore.ibcSwapConfig.setSlippage(selectables[i]);
                  } else {
                    uiConfigStore.ibcSwapConfig.setSlippage(
                      selectables[Math.floor(selectables.length / 2)]
                    );
                  }
                }
              }}
            />
          </XAxis>

          <VerticalCollapseTransition
            collapsed={!uiConfigStore.ibcSwapConfig.slippageIsCustom}
          >
            <Gutter size="0.7rem" />
            <TextInput
              type="number"
              errorBorder={!uiConfigStore.ibcSwapConfig.slippageIsValid}
              value={uiConfigStore.ibcSwapConfig.slippage}
              right={<Body2 color={ColorPalette["gray-300"]}>%</Body2>}
              onChange={(e) => {
                e.preventDefault();

                let value = e.target.value;

                if (value === "") {
                  uiConfigStore.ibcSwapConfig.setSlippage("");
                  return;
                }

                if (value.startsWith(".")) {
                  value = "0" + value;
                }
                const num = parseFloat(value);
                if (!Number.isNaN(num) && num >= 0) {
                  uiConfigStore.ibcSwapConfig.setSlippage(value);
                }
              }}
            />
          </VerticalCollapseTransition>
        </Box>
      </YAxis>
    </Modal>
  );
});

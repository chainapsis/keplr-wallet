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
import { useTheme } from "styled-components";
import { FormattedMessage } from "react-intl";

export const SlippageModal: FunctionComponent<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}> = observer(({ isOpen, setIsOpen }) => {
  const { uiConfigStore } = useStore();

  const theme = useTheme();

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
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-600"]
          }
          padding="1.25rem"
          width="95%"
          maxWidth="18.75rem"
        >
          <XAxis alignY="center">
            <Subtitle2
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            >
              <FormattedMessage id="page.ibc-swap.components.slippage-modal.title" />
            </Subtitle2>
            <div style={{ flex: 1 }} />
            <Box
              width="1.5rem"
              height="1.5rem"
              cursor={
                uiConfigStore.ibcSwapConfig.slippageIsValid
                  ? "pointer"
                  : undefined
              }
              onClick={(e) => {
                e.preventDefault();

                if (uiConfigStore.ibcSwapConfig.slippageIsValid) {
                  setIsOpen(false);
                }
              }}
            >
              {uiConfigStore.ibcSwapConfig.slippageIsValid ? (
                <CloseIcon
                  width="1.5rem"
                  height="1.5rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-200"]
                      : ColorPalette["gray-300"]
                  }
                />
              ) : null}
            </Box>
          </XAxis>

          <Gutter size="1.75rem" />

          <XAxis alignY="center">
            <Gutter size="0.5rem" />
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-100"]
              }
            >
              <FormattedMessage id="page.ibc-swap.components.slippage-modal.label.slippage-tolerance" />
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
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-500"]
                  : ColorPalette["gray-100"]
              }
            >
              <FormattedMessage id="page.ibc-swap.components.slippage-modal.label.slippage-custom" />
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

const CloseIcon: FunctionComponent<{
  width: string;
  height: string;
  color: string;
}> = ({ width, height, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      stroke="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color || "currentColor"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import { Box } from "../../../../components/box";
import { YAxis } from "../../../../components/axis";
import { Columns } from "../../../../components/column";
import { CheckIcon } from "../../../../components/icon";
import { Body3, Subtitle3 } from "../../../../components/typography";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { EcosystemSection, OptionItem } from "./types";

export const OptionSelector: FunctionComponent<{
  options: OptionItem[];
  selectedValue: string;
  onSelect: (value: string) => Promise<void>;
  getSecondaryText?: (key: string) => string | undefined;
}> = ({ options, selectedValue, onSelect, getSecondaryText }) => {
  const theme = useTheme();

  return (
    <React.Fragment>
      {options.map((option) => {
        const isSelected = selectedValue === option.key;
        const secondaryText = getSecondaryText
          ? getSecondaryText(option.key)
          : option.secondaryText;

        return (
          <Box
            key={option.key}
            paddingX="1rem"
            paddingY="0.75rem"
            cursor="pointer"
            backgroundColor={
              isSelected
                ? theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-650"]
                : theme.mode === "light"
                ? ColorPalette["white"]
                : ColorPalette["gray-600"]
            }
            style={{
              borderBottomStyle: "solid",
              borderBottomWidth: "1px",
              borderBottomColor:
                theme.mode === "light"
                  ? ColorPalette["gray-100"]
                  : ColorPalette["gray-500"],
            }}
            hover={{
              backgroundColor:
                theme.mode === "light"
                  ? ColorPalette["gray-50"]
                  : ColorPalette["gray-550"],
            }}
            onClick={() => onSelect(option.key)}
          >
            <Columns sum={1} alignY="center" gutter="0.5rem">
              <YAxis>
                <Subtitle3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["white"]
                  }
                >
                  {option.label}
                </Subtitle3>
                {secondaryText && (
                  <React.Fragment>
                    <Gutter size="0.25rem" />
                    <Body3 color={ColorPalette["gray-300"]}>
                      {secondaryText}
                    </Body3>
                  </React.Fragment>
                )}
              </YAxis>
              <div style={{ flex: 1 }} />
              {isSelected && (
                <CheckIcon
                  width="1.25rem"
                  height="1.25rem"
                  color={
                    theme.mode === "light"
                      ? ColorPalette["blue-400"]
                      : ColorPalette["gray-200"]
                  }
                />
              )}
            </Columns>
          </Box>
        );
      })}
    </React.Fragment>
  );
};

export const EcosystemSpecificOptionsSelector: FunctionComponent<{
  ecosystemSection: EcosystemSection;
  optionKey: string;
}> = ({ ecosystemSection, optionKey }) => {
  const specificOption = ecosystemSection.specificOptions?.find(
    (option) => option.key === optionKey
  );

  if (!specificOption) {
    return null;
  }

  return (
    <OptionSelector
      options={specificOption.options.map((opt) => ({
        key: opt.key,
        label: opt.label,
        secondaryText: opt.secondaryText,
      }))}
      selectedValue={specificOption.currentValue}
      onSelect={specificOption.onSelect}
      getSecondaryText={specificOption.getSecondaryText}
    />
  );
};

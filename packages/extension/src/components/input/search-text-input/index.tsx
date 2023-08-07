import React, { forwardRef } from "react";
import { Box } from "../../box";
import { SearchIcon } from "../../icon";
import { TextInput } from "../text-input";
import { ColorPalette } from "../../../styles";
import { useTheme } from "styled-components";

// 사실 딱히 기능은 없는데 약간의 데코레이션이 들어가 있어서 그냥 따로 뺌
// eslint-disable-next-line react/display-name
export const SearchTextInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof TextInput>, "left">
>((props, ref) => {
  const theme = useTheme();

  return (
    <TextInput
      {...props}
      ref={ref}
      left={
        <Box
          style={{
            color: (() => {
              if (props.value && typeof props.value === "string") {
                return props.value.trim().length > 0
                  ? theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["gray-200"]
                  : undefined;
              }
            })(),
          }}
        >
          <SearchIcon width="1.25rem" height="1.25rem" />
        </Box>
      }
    />
  );
});

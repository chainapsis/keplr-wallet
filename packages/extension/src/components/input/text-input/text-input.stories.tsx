import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TextInput as CompTextInput, TextInputProps } from "./index";
import { MenuIcon } from "../../icon";
import { Box } from "../../box";
import { Stack } from "../../stack";

export default {
  title: "Components/TextInput",
  component: CompTextInput,
  argTypes: {
    className: {
      control: false,
    },
    style: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: "3em" }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof CompTextInput>;

const Template: ComponentStory<typeof CompTextInput> = (
  props: TextInputProps
) => {
  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <Stack gutter="1rem">
        <CompTextInput {...props} placeholder="test" />
        <CompTextInput
          {...props}
          right={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput
          {...props}
          rightLabel={
            <Box
              style={{
                fontStyle: "normal",
                fontWeight: 500,
                fontSize: "14px",
                textDecoration: "underline",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              Max: 1000 ATOM
            </Box>
          }
        />
        <CompTextInput
          {...props}
          disabled
          right={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput {...props} disabled />

        <CompTextInput {...props} error="Invalid Error" />
      </Stack>
    </div>
  );
};

export const TextInput = Template.bind({});
TextInput.args = {
  label: "Label",
};

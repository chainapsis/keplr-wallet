import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TextInput as CompTextInput, TextInputProps } from "./index";
import { MenuIcon } from "../../icon";
import { Box } from "../../box";
import { Stack } from "../../stack";
import { H1 } from "../../typography";

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
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
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
        <H1>Default / Active</H1>

        <CompTextInput {...props} placeholder="Password" />

        <CompTextInput
          {...props}
          placeholder="Password"
          right={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput
          {...props}
          placeholder="Password"
          left={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput
          {...props}
          placeholder="Password"
          left={<MenuIcon width="20px" height="20px" />}
          right={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput
          {...props}
          placeholder="Password"
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

        <H1>Disabled</H1>

        <CompTextInput {...props} placeholder="Password" disabled />

        <CompTextInput
          {...props}
          placeholder="Password"
          disabled
          right={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput
          {...props}
          placeholder="Password"
          disabled
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

        <H1>Error</H1>

        <CompTextInput
          {...props}
          placeholder="Password"
          error="Invalid Error"
        />

        <CompTextInput
          {...props}
          placeholder="Password"
          error="Invalid Error"
          right={<MenuIcon width="20px" height="20px" />}
        />

        <CompTextInput
          {...props}
          placeholder="Password"
          error="Invalid Error"
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
      </Stack>
    </div>
  );
};

export const TextInput = Template.bind({});
TextInput.args = {
  label: "Label",
};

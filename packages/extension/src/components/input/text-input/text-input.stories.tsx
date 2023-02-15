import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TextInput as CompTextInput, TextInputProps } from "./index";

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
      <CompTextInput {...props} />
      <CompTextInput {...props} />
      <CompTextInput {...props} />
    </div>
  );
};

export const TextInput = Template.bind({});
TextInput.args = {
  label: "Label",
};

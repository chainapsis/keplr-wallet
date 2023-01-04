import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TextInput, TextInputProps } from ".";

export default {
  title: "Components/TextInput",
  component: TextInput,
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
} as ComponentMeta<typeof TextInput>;

const Template: ComponentStory<typeof TextInput> = (props: TextInputProps) => {
  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <TextInput {...props} />
      <TextInput {...props} />
      <TextInput {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  label: "Label",
};

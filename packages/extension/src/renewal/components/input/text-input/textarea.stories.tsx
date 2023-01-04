import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Textarea, TextInputProps } from ".";

export default {
  title: "Components/Textarea",
  component: Textarea,
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
} as ComponentMeta<typeof Textarea>;

const Template: ComponentStory<typeof Textarea> = (props: TextInputProps) => {
  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <Textarea {...props} />
      <Textarea {...props} />
      <Textarea {...props} />
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  label: "Label",
};

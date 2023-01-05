import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Textarea as CompTextarea, TextInputProps } from ".";

export default {
  title: "Components/Textarea",
  component: CompTextarea,
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
} as ComponentMeta<typeof CompTextarea>;

const Template: ComponentStory<typeof CompTextarea> = (
  props: TextInputProps
) => {
  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <CompTextarea {...props} />
      <CompTextarea {...props} />
      <CompTextarea {...props} />
    </div>
  );
};

export const Textarea = Template.bind({});
Textarea.args = {
  label: "Label",
};

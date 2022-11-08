import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";

import { Input, InputProps } from ".";

export default {
  title: "Example/Input",
  component: Input,
} as ComponentMeta<typeof Input>;

const Template: ComponentStory<typeof Input> = (props: InputProps) => (
  <Input {...props}>Test</Input>
);

export const Common = Template.bind({});

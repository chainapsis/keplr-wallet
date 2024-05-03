import React from "react";
import { Story, Meta } from "@storybook/react";
import { ButtonToggle, ButtonToggleProps } from "./index";

export default {
  title: "Components/ToggleButton",
  component: ButtonToggle,
} as Meta;

const Template: Story<ButtonToggleProps> = (args) => <ButtonToggle {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: "Toggle Button",
  content: "This is the content to be displayed when button is toggled.",
};

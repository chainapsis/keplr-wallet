import React from "react";
import { Story, Meta } from "@storybook/react";
import { ButtonV2, Props } from "./index";

export default {
  title: "Components/Button",
  component: ButtonV2,
} as Meta;

const Template: Story<Props> = (args) => <ButtonV2 {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  text: "Click me",
  gradientText: "Awesome",
  onClick: () => console.log("Button clicked"),
};

export const Disabled = Template.bind({});
Disabled.args = {
  text: "Disabled Button",
  gradientText: "Unavailable",
  onClick: () => console.log("Button clicked"),
  disabled: true,
};

export const Loading = Template.bind({});
Loading.args = {
  text: "Loading Button",
  gradientText: "Loading...",
  onClick: () => console.log("Button clicked"),
  dataLoading: true,
};

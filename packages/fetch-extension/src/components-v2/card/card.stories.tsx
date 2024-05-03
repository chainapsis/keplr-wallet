import React from "react";
import { Card, CardProps } from "./index";
import { Story } from "@storybook/react";

export default {
  title: "Components/Card",
  component: Card,
};

const Template: Story<CardProps> = (args: CardProps) => <Card {...args} />;

export const Default = Template.bind({});
Default.args = {
  heading: "Card Heading",
  subheading: "Card Subheading",
  rightContent: "Right Content",
  isActive: false,
};

export const WithImage = Template.bind({});
WithImage.args = {
  heading: "Card with Image",
  leftImage: (
    <img
      src="https://assets.coingecko.com/coins/images/5395/standard/ImageCoin.png?1696505877"
      width={20}
    />
  ),
  subheading: "Card Subheading",
  rightContent: "Right Content",
  isActive: false,
};

export const ActiveCard = Template.bind({});
ActiveCard.args = {
  heading: "Active Card",
  rightContent: "Right Content",
  isActive: true,
};

export const CustomContent = Template.bind({});
CustomContent.args = {
  heading: "Custom Content",
  subheading: "Card Subheading",
  rightContent: "Custom Right Content",
  isActive: false,
};

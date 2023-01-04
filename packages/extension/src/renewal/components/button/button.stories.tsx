import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Button, ButtonColor, ButtonProps } from ".";
import { Stack } from "../stack";

export default {
  title: "Components/Button",
  component: Button,
  argTypes: {
    mode: {
      control: false,
    },
    color: {
      control: false,
    },
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
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (props: ButtonProps) => {
  const colors: ButtonColor[] = ["primary", "danger", "info"];

  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <Stack gutter="1rem">
        {colors.map((color) => {
          return (
            <div key={color}>
              <div
                style={{
                  marginBottom: "0.3rem",
                  textTransform: "capitalize",
                }}
              >
                {color}
              </div>
              <Button text="Button" {...props} color={color} />
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

export const Fill = Template.bind({});
Fill.args = {
  color: "primary",
  mode: "fill",
};

export const Light = Template.bind({});
Light.args = {
  color: "primary",
  mode: "light",
};

export const Text = Template.bind({});
Text.args = {
  color: "primary",
  mode: "text",
};

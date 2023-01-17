import React, { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { HorizontalButtonGroup, ButtonGroupProps } from ".";
import { Box } from "../box";
import { Gutter } from "../gutter";

export default {
  title: "Components/ButtonGroup",
  component: HorizontalButtonGroup,
  argTypes: {
    className: {
      control: false,
    },
    style: {
      control: false,
    },
    buttons: {
      control: false,
    },
    selectedKey: {
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
} as ComponentMeta<typeof HorizontalButtonGroup>;

const Template: ComponentStory<typeof HorizontalButtonGroup> = (
  props: ButtonGroupProps
) => {
  const [key, setKey] = useState("button1");

  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <div>Button group in full width</div>
      <Box>
        <HorizontalButtonGroup
          {...props}
          key={key}
          onSelect={(key) => {
            setKey(key);
          }}
          selectedKey={key}
        />
      </Box>
      <Gutter size="1rem" />
      <Box alignX="center">
        <div>Button group with element width</div>
        <HorizontalButtonGroup
          {...props}
          key={key}
          onSelect={(key) => {
            setKey(key);
          }}
          selectedKey={key}
        />
      </Box>
      <Gutter size="1rem" />
      <Box alignX="center">
        <div>Button group should overflow</div>
        <Box maxWidth="0.1rem">
          <HorizontalButtonGroup
            {...props}
            key={key}
            onSelect={(key) => {
              setKey(key);
            }}
            selectedKey={key}
          />
        </Box>
      </Box>
    </div>
  );
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  buttons: [
    {
      key: "button1",
      text: "Alice",
    },
    {
      key: "button2",
      text: "Bob",
    },
    {
      key: "button3",
      text: "Charlie",
    },
  ],
};

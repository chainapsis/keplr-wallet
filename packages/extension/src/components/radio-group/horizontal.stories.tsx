import React, { useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { HorizontalRadioGroup, RadioGroupProps } from "./index";
import { Box } from "../box";
import { Gutter } from "../gutter";

export default {
  title: "Components/RadioGroup/Horizontal",
  component: HorizontalRadioGroup,
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
      <div style={{ padding: "3em", backgroundColor: "#2B2B2B" }}>
        {Story()}
      </div>
    ),
  ],
} as ComponentMeta<typeof HorizontalRadioGroup>;

const Template: ComponentStory<typeof HorizontalRadioGroup> = (
  props: RadioGroupProps
) => {
  const [key, setKey] = useState("button1");

  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <div>Radio group in full width</div>
      <Box>
        <HorizontalRadioGroup
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
        <div>Radio group with element width</div>
        <HorizontalRadioGroup
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
        <div>Radio group with element min width (3rem)</div>
        <HorizontalRadioGroup
          {...props}
          key={key}
          onSelect={(key) => {
            setKey(key);
          }}
          selectedKey={key}
          itemMinWidth="3rem"
        />
      </Box>
    </div>
  );
};

export const Horizontal = Template.bind({});
Horizontal.args = {
  items: [
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

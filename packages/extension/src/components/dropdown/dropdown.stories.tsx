import React from "react";
import { DropDown as CompDropDown } from "./dropdown";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { DropdownItemProps, DropdownProps } from "./types";
import { Stack } from "../stack";
import { H1 } from "../typography";

export default {
  title: "Components/DropDown",
  component: CompDropDown,
  decorators: [
    (Story) => (
      <div style={{ margin: "3em" }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof CompDropDown>;

const Template: ComponentStory<typeof CompDropDown> = (
  props: DropdownProps
) => {
  const [selected1, setSelected1] = React.useState("");
  const [selected2, setSelected2] = React.useState("");

  const items: DropdownItemProps[] = [
    { key: "atom", label: "ATOM" },
    { key: "osmo", label: "OSMO" },
  ];

  return (
    <Stack gutter="1rem">
      <H1>Default</H1>
      <CompDropDown
        {...props}
        items={items}
        selectedItemKey={selected1}
        onSelect={(key) => setSelected1(key)}
      />

      <H1>Placeholder</H1>
      <CompDropDown
        {...props}
        items={items}
        selectedItemKey={selected2}
        onSelect={(key) => setSelected2(key)}
        placeholder="Select a token"
      />
    </Stack>
  );
};

export const DropDown = Template.bind({});

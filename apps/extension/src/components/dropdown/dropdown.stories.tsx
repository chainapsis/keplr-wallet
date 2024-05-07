import React from "react";
import { Dropdown as CompDropdown } from "./dropdown";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { DropdownItemProps, DropdownProps } from "./types";
import { Stack } from "../stack";
import { H1 } from "../typography";

export default {
  title: "Components/Dropdown",
  component: CompDropdown,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof CompDropdown>;

const Template: ComponentStory<typeof CompDropdown> = (
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
      <CompDropdown
        {...props}
        items={items}
        selectedItemKey={selected1}
        onSelect={(key) => setSelected1(key)}
      />

      <H1>Placeholder</H1>
      <CompDropdown
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

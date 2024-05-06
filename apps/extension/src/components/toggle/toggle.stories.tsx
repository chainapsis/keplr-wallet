import React from "react";
import { Toggle as CompToggle } from "./toggle";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ToggleProps } from "./types";
import { Stack } from "../stack";
import { H1 } from "../typography";

export default {
  title: "Components/Toggle",
  component: CompToggle,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof CompToggle>;

const Template: ComponentStory<typeof CompToggle> = (props: ToggleProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Stack gutter="1rem">
      <H1>Default</H1>
      <CompToggle {...props} isOpen={isOpen} setIsOpen={setIsOpen} />
      <CompToggle {...props} isOpen={!isOpen} setIsOpen={setIsOpen} />

      <H1>Disabled</H1>
      <CompToggle {...props} isOpen={false} disabled />
      <CompToggle {...props} isOpen={true} disabled />
    </Stack>
  );
};

export const Toggle = Template.bind({});

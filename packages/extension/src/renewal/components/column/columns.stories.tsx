import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Column, Columns, ColumnsProps } from ".";
import { Gutter } from "../gutter";

export default {
  title: "Components/Columns",
  component: Columns,
  argTypes: {
    sum: {
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
} as ComponentMeta<typeof Columns>;

const Template: ComponentStory<typeof Columns> = (props: ColumnsProps) => {
  return (
    <div>
      <Columns {...props}>
        <Column weight={2}>test</Column>
        <Column weight={6}>
          test
          <br />
          test
        </Column>
        <Column weight={2}>test</Column>
      </Columns>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  sum: 10,
};

const ComplexGutterTemplate: ComponentStory<typeof Columns> = (
  props: ColumnsProps
) => {
  return (
    <div>
      <Columns {...props}>
        <Gutter size="0.5rem" />
        <Column weight={2}>test</Column>
        <Gutter size="1rem" />
        <Column weight={6}>
          test
          <br />
          test
        </Column>
        <Column weight={2}>test</Column>
      </Columns>
    </div>
  );
};

export const ComplexGutter = ComplexGutterTemplate.bind({});
ComplexGutter.args = {
  sum: 10,
  gutter: "0.5rem",
};

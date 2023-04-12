import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Column, Columns, ColumnsProps } from "./index";
import { Gutter } from "../gutter";
import { Box } from "../box";

export default {
  title: "Components/Columns",
  component: Columns,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof Columns>;

const Template: ComponentStory<typeof Columns> = (props: ColumnsProps) => {
  return (
    <div
      style={{
        color: "white",
      }}
    >
      <Columns {...props}>
        <Column weight={3}>
          <Box padding="1rem" backgroundColor="#333333">
            3
          </Box>
        </Column>
        <Column weight={6}>
          <Box padding="2rem" backgroundColor="#444444">
            6
          </Box>
        </Column>
        <Column weight={1}>
          <Box padding="1.5rem" backgroundColor="#555555">
            1
          </Box>
        </Column>
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
    <div style={{ color: "white" }}>
      <Columns {...props}>
        <Gutter size="1rem" />
        <Column weight={3}>
          <Box padding="1rem" backgroundColor="#333333">
            3
          </Box>
        </Column>
        <Gutter size="2rem" />
        <Column weight={6}>
          <Box padding="2rem" backgroundColor="#444444">
            6
          </Box>
        </Column>
        <Column weight={1}>
          <Box padding="1.5rem" backgroundColor="#555555">
            1
          </Box>
        </Column>
      </Columns>
    </div>
  );
};

export const ComplexGutter = ComplexGutterTemplate.bind({});
ComplexGutter.args = {
  sum: 10,
  gutter: "0.5rem",
};

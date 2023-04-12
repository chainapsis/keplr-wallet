import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {
  VerticalCollapseTransition,
  VerticalCollapseTransitionProps,
} from "./index";
import { Box } from "../../box";

export default {
  title: "Transitions/Collapse",
  component: VerticalCollapseTransition,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof VerticalCollapseTransition>;

const Template: ComponentStory<typeof VerticalCollapseTransition> = (
  props: VerticalCollapseTransitionProps
) => {
  return (
    <VerticalCollapseTransition {...props}>
      <Box padding="3rem" backgroundColor="#AAAAAA">
        This can be collapsed
      </Box>
    </VerticalCollapseTransition>
  );
};

export const Vertical = Template.bind({});

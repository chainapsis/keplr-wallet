import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {
  HorizontalCollapseTransition,
  HorizontalCollapseTransitionProps,
} from "./index";
import { Box } from "../../box";

export default {
  title: "Transitions/HorizontalCollapse",
  component: HorizontalCollapseTransition,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof HorizontalCollapseTransition>;

const Template: ComponentStory<typeof HorizontalCollapseTransition> = (
  props: HorizontalCollapseTransitionProps
) => {
  return (
    <React.Fragment>
      <HorizontalCollapseTransition {...props}>
        <Box padding="3rem" backgroundColor="#AAAAAA">
          This can be collapsed
        </Box>
      </HorizontalCollapseTransition>
      <HorizontalCollapseTransition {...props}>
        <Box padding="3rem" backgroundColor="#AAAAAA" width="20rem">
          This can be collapsed
        </Box>
      </HorizontalCollapseTransition>
    </React.Fragment>
  );
};

export const Horizontal = Template.bind({});

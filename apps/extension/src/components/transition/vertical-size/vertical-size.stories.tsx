import React, { FunctionComponent, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {
  VerticalResizeTransition,
  VerticalResizeTransitionProps,
} from "./index";
import { Button } from "../../button";
import { Stack } from "../../stack";

export default {
  title: "Transitions/Resize",
  component: VerticalResizeTransition,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof VerticalResizeTransition>;

const RandomHeightBoxes: FunctionComponent<{
  seed: number;
}> = ({ seed }) => {
  const length = Math.abs(Math.floor(Math.sin(seed) * 5));

  return (
    <React.Fragment>
      {Array.from(Array(length)).map((_, i) => {
        const num = Math.abs(Math.floor(Math.sin(seed + i) * 0xffffff));

        return (
          <div
            key={i}
            style={{
              height: `${num % 60}px`,
              backgroundColor: `#${num.toString(16).padStart(6, "0")}`,
              marginBottom: i === length - 1 ? 0 : `${num % 20}px`,
            }}
          />
        );
      })}
    </React.Fragment>
  );
};

const Template: ComponentStory<typeof VerticalResizeTransition> = (
  props: VerticalResizeTransitionProps
) => {
  const [num, setNum] = useState(0);

  return (
    <div
      style={{
        maxWidth: "30rem",
        padding: "1rem",
        backgroundColor: "#AAAAAA",
      }}
    >
      <VerticalResizeTransition {...props}>
        <Stack gutter="0.2rem">
          <RandomHeightBoxes seed={num} />
          <Button
            text="Resize"
            onClick={() => {
              setNum((prev) => prev + 1);
            }}
          />
        </Stack>
      </VerticalResizeTransition>
    </div>
  );
};

export const Vertical = Template.bind({});

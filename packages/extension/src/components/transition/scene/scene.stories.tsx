import React, { FunctionComponent, useRef, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import {
  SceneTransitionProps,
  SceneTransition,
  SceneTransitionRef,
} from "./index";
import { Button } from "../../button";
import { Stack } from "../../stack";

export default {
  title: "Transitions/Scene",
  component: SceneTransition,
  argTypes: {
    scenes: {
      control: false,
    },
    initialSceneProps: {
      control: false,
    },
  },
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof SceneTransition>;

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

const Template: ComponentStory<typeof SceneTransition> = (
  props: SceneTransitionProps
) => {
  const [num, setNum] = useState(0);

  const ref = useRef<SceneTransitionRef>(null);

  return (
    <div
      style={{
        maxWidth: "30rem",
        padding: "1rem",
        backgroundColor: "#AAAAAA",
      }}
    >
      <Stack gutter="0.5rem">
        <SceneTransition
          {...props}
          ref={ref}
          initialSceneProps={{
            name: "RandBox",
            props: {
              seed: num,
            },
          }}
          scenes={[
            {
              name: "RandBox",
              element: RandomHeightBoxes,
            },
          ]}
        />
        <Button
          text="Push"
          onClick={() => {
            setNum(num + 1);

            if (ref.current) {
              ref.current.push("RandBox", {
                seed: num + 1,
              });
            }
          }}
        />
        <Button
          text="Pop"
          onClick={() => {
            if (ref.current) {
              ref.current.pop();
            }
          }}
        />
      </Stack>
    </div>
  );
};

export const Scene = Template.bind({});

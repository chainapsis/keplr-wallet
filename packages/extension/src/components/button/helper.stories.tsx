import { ComponentStory } from "@storybook/react";
import { Button } from "./button";
import { ButtonColor, ButtonProps } from "./types";
import { Stack } from "../stack";
import React from "react";

export const Template: ComponentStory<typeof Button> = (props: ButtonProps) => {
  const colors: ButtonColor[] = ["primary", "danger", "info"];

  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <Stack gutter="1rem">
        {colors.map((color) => {
          return (
            <div key={color}>
              <div
                style={{
                  marginBottom: "0.3rem",
                  textTransform: "capitalize",
                }}
              >
                {color}
              </div>
              <Button text="Button" {...props} color={color} />
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

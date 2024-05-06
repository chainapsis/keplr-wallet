// eslint-disable-next-line import/no-extraneous-dependencies
import { ComponentStory } from "@storybook/react";
import { Button } from "./button";
import { ButtonColor, ButtonProps } from "./types";
import { Stack } from "../stack";
import React from "react";
import { H1 } from "../typography";
import { MenuIcon } from "../icon";

export const Template: ComponentStory<typeof Button> = (props: ButtonProps) => {
  const colors: ButtonColor[] = ["primary", "secondary", "danger"];

  return (
    <div
      style={{
        maxWidth: "30rem",
      }}
    >
      <Stack gutter="1rem">
        <H1>Color</H1>
        {colors.map((color) => {
          return <Button key={color} text="Button" {...props} color={color} />;
        })}

        <H1>Disabled</H1>
        {colors.map((color) => {
          return (
            <Button
              key={color}
              text="Button"
              {...props}
              disabled
              color={color}
            />
          );
        })}

        <H1>Has Icon</H1>
        {colors.map((color) => {
          return (
            <Button
              key={color}
              text="Button"
              {...props}
              right={<MenuIcon width="12px" height="12px" />}
              color={color}
            />
          );
        })}

        <H1>Size</H1>
        {colors.map((color) => {
          return (
            <Stack key={color} gutter="0.5rem">
              <Button
                text="extraSmall"
                {...props}
                size="extraSmall"
                color={color}
              />
              <Button text="small" {...props} size="small" color={color} />
              <Button text="medium" {...props} size="medium" color={color} />
              <Button text="large" {...props} size="large" color={color} />
            </Stack>
          );
        })}
      </Stack>
    </div>
  );
};

import { ComponentStory } from "@storybook/react";
import { Button } from "./button";
import { ButtonColor, ButtonProps } from "./types";
import { Stack } from "../stack";
import React from "react";
import { H1 } from "../typography";
import { MenuIcon } from "../icon";

export const Template: ComponentStory<typeof Button> = (props: ButtonProps) => {
  const colors: ButtonColor[] = ["primary", "secondary"];

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
        <Button text="Button" {...props} disabled />
        <Button text="Button" {...props} disabled color="secondary" />

        <H1>Has Icon</H1>
        <Button
          text="Button"
          {...props}
          right={<MenuIcon width="12px" height="12px" />}
        />
        <Button
          text="Button"
          {...props}
          right={<MenuIcon width="12px" height="12px" />}
          color="secondary"
        />

        <H1>Size</H1>
        <Button text="extraSmall" {...props} size="extraSmall" />
        <Button text="small" {...props} size="small" />
        <Button text="medium" {...props} size="medium" />
        <Button text="large" {...props} size="large" />

        <Button
          text="extraSmall"
          {...props}
          color="secondary"
          size="extraSmall"
        />
        <Button text="small" {...props} color="secondary" size="small" />
        <Button text="medium" {...props} color="secondary" size="medium" />
        <Button text="large" {...props} color="secondary" size="large" />
      </Stack>
    </div>
  );
};

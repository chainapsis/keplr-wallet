import React from "react";
import { GuideBox as CompGuideBox } from "./guide-box";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { GuideBoxColor, GuideBoxProps } from "./types";
import { Stack } from "../stack";
import { H1 } from "../typography";
import { ColorPalette } from "../../styles";

export default {
  title: "Components/GuideBox",
  component: CompGuideBox,
  decorators: [(Story) => <div style={{ margin: "3em" }}>{Story()}</div>],
} as ComponentMeta<typeof CompGuideBox>;

const Template: ComponentStory<typeof CompGuideBox> = (
  props: GuideBoxProps
) => {
  const colors: GuideBoxColor[] = ["default", "warning", "danger"];

  return (
    <Stack gutter="1rem">
      <H1>Default</H1>
      {colors.map((color) => (
        <CompGuideBox
          {...props}
          key={color}
          color={color}
          title="Experimental Feature"
          paragraph="For the brave-hearted cosmonaauts"
        />
      ))}

      <H1>Bottom</H1>
      <CompGuideBox
        {...props}
        title="Experimental Feature"
        paragraph="For the brave-hearted cosmonaauts"
        bottom={
          <div
            style={{
              color: ColorPalette["gray-100"],
              fontWeight: 500,
              fontSize: "13px",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Experimental Feature
          </div>
        }
      />
    </Stack>
  );
};

export const GuideBox = Template.bind({});

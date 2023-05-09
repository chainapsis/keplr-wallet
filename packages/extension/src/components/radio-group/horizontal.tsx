import React, { FunctionComponent } from "react";
import { RadioGroupProps } from "./types";
import { Styles } from "./styles";
import { Gutter } from "../gutter";

export const HorizontalRadioGroup: FunctionComponent<RadioGroupProps> = ({
  style,
  className,
  size = "default",
  items,
  selectedKey,
  itemMinWidth,
  onSelect,
}) => {
  return (
    <Styles.Container style={style} className={className} size={size}>
      <Gutter size="0.25rem" />
      {items.map((item) => {
        const selected = item.key === selectedKey;

        return (
          <React.Fragment key={item.key}>
            <Styles.Button
              type="button"
              size={size}
              selected={selected}
              itemMinWidth={itemMinWidth}
              onClick={(e) => {
                e.preventDefault();
                onSelect(item.key);
              }}
            >
              {item.text}
            </Styles.Button>
            <Gutter size="0.25rem" />
          </React.Fragment>
        );
      })}
    </Styles.Container>
  );
};

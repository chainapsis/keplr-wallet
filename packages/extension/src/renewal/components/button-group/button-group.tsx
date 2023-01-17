import React, { FunctionComponent } from "react";
import { ButtonGroupProps } from "./types";
import { Styles } from "./styles";

export const HorizontalButtonGroup: FunctionComponent<ButtonGroupProps> = ({
  style,
  className,
  buttons,
  selectedKey,
  buttonMinWidth,
  onSelect,
}) => {
  return (
    <Styles.Container style={style} className={className}>
      {buttons.map((button, i) => {
        return (
          <React.Fragment key={button.key}>
            <Styles.Button
              selected={button.key === selectedKey}
              buttonMinWidth={buttonMinWidth}
              onClick={(e) => {
                e.preventDefault();
                onSelect(button.key);
              }}
            >
              {button.text}
            </Styles.Button>
            {i !== buttons.length - 1 ? <Styles.Divider /> : null}
          </React.Fragment>
        );
      })}
    </Styles.Container>
  );
};

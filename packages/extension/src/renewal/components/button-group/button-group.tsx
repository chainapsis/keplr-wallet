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
        const selected = button.key === selectedKey;
        const nextIsSelected = (() => {
          if (i + 1 < buttons.length) {
            const button = buttons[i + 1];
            return button.key === selectedKey;
          }
          return false;
        })();

        return (
          <React.Fragment key={button.key}>
            <Styles.Button
              selected={selected}
              buttonMinWidth={buttonMinWidth}
              onClick={(e) => {
                e.preventDefault();
                onSelect(button.key);
              }}
            >
              {button.text}
            </Styles.Button>
            {i !== buttons.length - 1 ? (
              <Styles.Divider besideSelected={selected || nextIsSelected} />
            ) : null}
          </React.Fragment>
        );
      })}
    </Styles.Container>
  );
};

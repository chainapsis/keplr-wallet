import React, { FunctionComponent } from "react";
import { ButtonProps } from "./types";
import { Styles } from "./styles";
import { LoadingIcon } from "../icon";
import { Box } from "../box";

export const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  style,
  className,
  text,
  right,
  isLoading,
  textOverrideIcon,
  ...otherProps
}) => {
  return (
    <Styles.Container
      style={style}
      className={className}
      mode={otherProps.mode}
    >
      <Styles.Button
        {...otherProps}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();

            onClick();
          }
        }}
      >
        {isLoading ? (
          <Styles.Loading buttonColor={otherProps.color}>
            <LoadingIcon width="1rem" height="1rem" />
          </Styles.Loading>
        ) : null}

        {!isLoading && textOverrideIcon ? (
          <Styles.TextOverrideIcon>{textOverrideIcon}</Styles.TextOverrideIcon>
        ) : null}

        <Box style={{ opacity: isLoading || textOverrideIcon ? 0 : 1 }}>
          {text}
        </Box>

        {right ? <Styles.Right>{right}</Styles.Right> : null}
      </Styles.Button>
    </Styles.Container>
  );
};

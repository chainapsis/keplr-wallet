import React, { FunctionComponent } from "react";
import { ButtonProps } from "./types";
import { Styles } from "./styles";
import { LoadingIcon } from "../icon";
import { Box } from "../box";
import { useTheme } from "styled-components";

export const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  style,
  className,
  left,
  text,
  right,
  isLoading,
  suppressDefaultLoadingIndicator,
  showTextWhileLoading,
  textOverrideIcon,
  type,
  buttonStyle,
  ...otherProps
}) => {
  const theme = useTheme();
  return (
    <Styles.Container
      style={style}
      className={className}
      mode={otherProps.mode}
    >
      <Styles.Button
        isLoading={isLoading}
        style={buttonStyle}
        type={type || "button"}
        {...otherProps}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();

            if (!isLoading) {
              onClick();
            }
          }
        }}
      >
        {left ? <Styles.Left>{left}</Styles.Left> : null}

        {isLoading && !suppressDefaultLoadingIndicator ? (
          <Styles.Loading buttonColor={otherProps.color} theme={theme}>
            <LoadingIcon width="1rem" height="1rem" />
          </Styles.Loading>
        ) : null}

        {!isLoading && textOverrideIcon ? (
          <Styles.TextOverrideIcon>{textOverrideIcon}</Styles.TextOverrideIcon>
        ) : null}

        <Box
          style={{
            opacity:
              (isLoading && !showTextWhileLoading) || textOverrideIcon ? 0 : 1,
          }}
        >
          {text}
        </Box>

        {right ? <Styles.Right>{right}</Styles.Right> : null}
      </Styles.Button>
    </Styles.Container>
  );
};

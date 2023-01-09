import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";

export const RegisterSceneBox: FunctionComponent = ({ children }) => {
  return (
    <Box paddingX="5rem" paddingY="3.125rem">
      {children}
    </Box>
  );
};

const Styles = {
  RegisterSceneBoxHeader: styled.div`
    font-weight: 600;
    font-size: 2rem;
    line-height: 2rem;
    text-align: center;
    color: ${ColorPalette["platinum-500"]};

    margin-bottom: 2rem;
  `,
};

export const RegisterSceneBoxHeader: FunctionComponent = ({ children }) => {
  return (
    <Styles.RegisterSceneBoxHeader>{children}</Styles.RegisterSceneBoxHeader>
  );
};

import React, { FunctionComponent, ReactElement, useContext } from "react";
import { Box, BoxProps } from "../box";
import { ColumnsContext } from "./context";

export interface ColumnsProps extends BoxProps {
  children: ReactElement<ColumnProps>[];
  space: string;
}

export const Columns: FunctionComponent<ColumnsProps> = ({
  children,
  space,
  ...props
}) => {
  return (
    <Box {...props} display="flex" flexDirection="row" marginLeft={`-${space}`}>
      <ColumnsContext.Provider value={{ space }}>
        {children}
      </ColumnsContext.Provider>
    </Box>
  );
};

export interface ColumnProps extends BoxProps {
  width?: string;
}

export const Column: FunctionComponent<ColumnProps> = ({
  children,
  width,
  ...props
}) => {
  const { space } = useContext(ColumnsContext);

  return (
    <Box {...props} width={width} paddingLeft={space}>
      {children}
    </Box>
  );
};

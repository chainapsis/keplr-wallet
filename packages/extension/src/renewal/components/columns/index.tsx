import React, { FunctionComponent, ReactElement, useContext } from "react";
import { Box } from "../box";
import { ColumnsContext } from "./context";

export interface ColumnsProps {
  children: ReactElement<ColumnProps>[];
  space: string;
  paddingTop?: string;
}

export const Columns: FunctionComponent<ColumnsProps> = ({
  children,
  space,
  paddingTop,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      marginLeft={`-${space}`}
      paddingTop={paddingTop}
    >
      <ColumnsContext.Provider value={{ space }}>
        {children}
      </ColumnsContext.Provider>
    </Box>
  );
};

export interface ColumnProps {
  width?: string;
}

export const Column: FunctionComponent<ColumnProps> = ({ children, width }) => {
  const { space } = useContext(ColumnsContext);

  return (
    <Box width={width} paddingLeft={space}>
      {children}
    </Box>
  );
};

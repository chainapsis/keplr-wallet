import React, { FunctionComponent } from "react";
import { Column, Columns } from "../../../../components/column";
import { Stack } from "../../../../components/stack";
import { Styles } from "./styles";

export const AmountView: FunctionComponent = () => {
  return (
    <Styles.Container>
      <Columns sum={1} alignY="center">
        <Stack gutter="0.5rem">
          <Styles.Title>Amount</Styles.Title>
          <Styles.Title>Memo</Styles.Title>
        </Stack>

        <Column weight={1} />

        <Stack gutter="0.5rem">
          <Styles.Amount>23.452 ATOM</Styles.Amount>
          <Styles.Empty>(empty memo)</Styles.Empty>
        </Stack>
      </Columns>
    </Styles.Container>
  );
};

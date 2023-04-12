import React, { FunctionComponent, useState } from "react";
import { Styles } from "./styles";
import { Body2, H1, Subtitle3 } from "../../../../components/typography";
import { MessageTitle } from "../message-title";
import { Columns } from "../../../../components/column";
import { Stack } from "../../../../components/stack";
export const IBCTransferView: FunctionComponent = () => {
  const [isRawData, setIsRawData] = useState(true);

  return (
    <Styles.Container alignX="center">
      <H1>14.289 ATOM</H1>
      <Styles.Price>$346.3</Styles.Price>

      <Styles.DataContainer gutter="0.5rem">
        <MessageTitle
          title="IBC Transfer"
          onClick={() => setIsRawData(!isRawData)}
        />

        <Styles.MessageContainer>
          <Styles.TransferContainer>
            <Columns sum={1}>
              <Stack gutter="0.25rem">
                <Styles.Text>From</Styles.Text>
                <Subtitle3>Cosmos</Subtitle3>
                <Styles.Text>ATOM</Styles.Text>
                <Styles.Divider />
                <Body2>cosmos....wszvs</Body2>
              </Stack>
            </Columns>
          </Styles.TransferContainer>
        </Styles.MessageContainer>
      </Styles.DataContainer>
    </Styles.Container>
  );
};

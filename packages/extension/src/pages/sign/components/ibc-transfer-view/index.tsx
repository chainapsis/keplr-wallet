import React, { FunctionComponent, useState } from "react";
import { Styles } from "./styles";
import { H1, Subtitle3 } from "../../../../components/typography";
import { MessageTitle } from "../message-title";
import { Columns } from "../../../../components/column";
import { ArrowRightSolidIcon } from "../../../../components/icon";

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
          {isRawData ? (
            <Styles.ViewData>
              {`{
               "account_number": "2244",
               "chain_id": "regen-1",
               "fee": {
                  "gas": "906519",
                  "amount": [
                              {
                                "denom": "uregen",
                                "amount": "22663"
                               }
                             ]
                }, 
                "memo": "Delegate(rewards)", 
                "msgs": [ 
                    { 
                       "type": "cosmos-sdk/MsgDelegate", 
                       "value": { 
                          "amount": { 
                              "amount": "12792", "denom": "uregen" 
                          }, 
                          "delegator_address": "`}
            </Styles.ViewData>
          ) : (
            <Styles.TransferContainer>
              <Columns sum={1}>
                <Styles.TokenItem gutter="0.25rem">
                  <Styles.Text>From</Styles.Text>
                  <Subtitle3>Cosmos</Subtitle3>
                  <Styles.Text>ATOM</Styles.Text>
                  <Styles.Divider />
                  <Styles.Address>persistence....wszvs</Styles.Address>
                </Styles.TokenItem>

                <Styles.Arrow>
                  <ArrowRightSolidIcon width="1.25rem" height="1.25rem" />
                </Styles.Arrow>

                <Styles.TokenItem gutter="0.25rem">
                  <Styles.Text>From</Styles.Text>
                  <Subtitle3>Cosmos</Subtitle3>
                  <Styles.Text>ATOM</Styles.Text>
                  <Styles.Divider />
                  <Styles.Address>persistence....wszvs</Styles.Address>
                </Styles.TokenItem>
              </Columns>
            </Styles.TransferContainer>
          )}
        </Styles.MessageContainer>
      </Styles.DataContainer>
    </Styles.Container>
  );
};

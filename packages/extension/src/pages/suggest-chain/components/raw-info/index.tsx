import React, { FunctionComponent } from "react";
import { Box } from "../../../../components/box";
import { XAxis } from "../../../../components/axis";
import { Gutter } from "../../../../components/gutter";
import { ColorPalette } from "../../../../styles";
import { Checkbox } from "../../../../components/checkbox";
import { Body2 } from "../../../../components/typography";
import { GuideBox } from "../../../../components/guide-box";
import styled from "styled-components";

const Styles = {
  Chip: styled.div`
    color: ${ColorPalette["gray-200"]};
    background-color: ${ColorPalette["gray-500"]};

    padding: 0.375rem 0.75rem;
    border-radius: 2.5rem;
  `,
};

export const RawInfoView: FunctionComponent<{ isDeveloper: boolean }> = ({
  isDeveloper,
}) => {
  return (
    <Box paddingX="0.75rem" height="100%">
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Styles.Chip>hub.injective.network</Styles.Chip>

        <Gutter size="0.375rem" />

        <Box
          style={{
            display: "flex",
            width: "100%",
            padding: "1rem",
            backgroundColor: ColorPalette["gray-600"],
            borderRadius: "0.375rem",

            overflow: "scroll",
          }}
        >
          <Box as={"pre"} style={{ margin: 0 }}>
            {`{
      "chain_id": "cosmoshub-4",
      "account_number": "115578",
      "sequence": "95",
      "fee": {
        "gas": "251890",
        "amount": [
          {
            "denom": "uatom",
            "amount": "6298"
          }
        ]
      },
      "msgs": [
        {
          "type": "cosmos-sdk/MsgWithdrawDelegationReward",
          "value": {
            "delegator_address": "cosmos14ky6udatsvdx859050mrnr7rvml0huue2wszvs",
            "validator_address": "cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8"
          }
          {
          "type": "cosmos-sdk/MsgWithdrawDelegationReward",
          "value": {
            "delegator_address": "cosmos14ky6udatsvdx859050mrnr7rvml0huue2wszvs",
            "validator_address": "cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8"
          }
          
          {
          "type": "cosmos-sdk/MsgWithdrawDelegationReward",
          "value": {
            "delegator_address": "cosmos14ky6udatsvdx859050mrnr7rvml0huue2wszvs",
            "validator_address": "cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8"
          }
          ]
          `}
          </Box>
        </Box>

        {isDeveloper ? (
          <Box paddingY="0.375rem">
            <XAxis alignY="top">
              <Checkbox size="small" checked onChange={() => {}} />

              <Gutter size="0.375rem" />

              <Body2 style={{ color: ColorPalette["gray-300"], flex: 1 }}>
                Use this as the preferred code string and override info
                registered on the community repo
              </Body2>
            </XAxis>
          </Box>
        ) : null}

        <Gutter size="0.75rem" />

        <Box style={{ flex: 1 }} />

        <GuideBox
          title="Before You Approve"
          paragraph="Keplr recommends that ‘suggest chain’info be managed by the community. At this time, this chain’s info has not been registered."
          bottom="Click here to update chain info on Github"
        />
      </Box>
    </Box>
  );
};

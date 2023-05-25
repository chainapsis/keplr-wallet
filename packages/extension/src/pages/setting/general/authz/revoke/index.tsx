import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import { AuthZ } from "@keplr-wallet/stores";
import { useStore } from "../../../../../stores";
import { BackButton } from "../../../../../layouts/header/components";
import { HeaderLayout } from "../../../../../layouts/header";
import { Box } from "../../../../../components/box";
import styled from "styled-components";
import { Stack } from "../../../../../components/stack";
import { ColorPalette } from "../../../../../styles";
import { Body3, H4, Subtitle3 } from "../../../../../components/typography";
import { CopyOutlineIcon } from "../../../../../components/icon";
import { Columns } from "../../../../../components/column";
import { FormattedDate } from "react-intl";
import { useNavigate } from "react-router";
import { useNotification } from "../../../../../hooks/notification";

const Styles = {
  Card: styled(Stack)`
    padding: 0.875rem;
    background-color: ${ColorPalette["gray-600"]};
  `,
  Title: styled(Subtitle3)`
    color: ${ColorPalette["gray-200"]};
  `,
  Paragraph: styled(Body3)`
    color: ${ColorPalette["gray-10"]};
    word-break: keep-all;
    word-wrap: break-word;
  `,
  JSON: styled.pre`
    overflow: auto;
    white-space: pre-wrap;
  `,
};

export const SettingGeneralAuthZRevokePage: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();

  const state: { title: string; grant: AuthZ.Grant; chainId: string } =
    location.state;

  const account = accountStore.getAccount(state.chainId);

  const onClickRevokeButton = async (grant: AuthZ.Grant) => {
    let messageType: string = "";

    if (
      grant.authorization["@type"] === "/cosmos.bank.v1beta1.SendAuthorization"
    ) {
      messageType = "/cosmos.bank.v1beta1.MsgSend";
    }

    if (
      grant.authorization["@type"] ===
      "/cosmos.staking.v1beta1.StakeAuthorization"
    ) {
      if (
        (grant.authorization as AuthZ.StakeAuthorization).authorization_type ===
        "AUTHORIZATION_TYPE_DELEGATE"
      ) {
        messageType = "/cosmos.staking.v1beta1.MsgDelegate";
      }

      if (
        (grant.authorization as AuthZ.StakeAuthorization).authorization_type ===
        "AUTHORIZATION_TYPE_REDELEGATE"
      ) {
        messageType = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
      }

      if (
        (grant.authorization as AuthZ.StakeAuthorization).authorization_type ===
        "AUTHORIZATION_TYPE_UNDELEGATE"
      ) {
        messageType = "/cosmos.staking.v1beta1.MsgUndelegate";
      }
    }

    if (
      grant.authorization["@type"] ===
      "/cosmos.authz.v1beta1.GenericAuthorization"
    ) {
      messageType = (grant.authorization as AuthZ.GenericAuthorization).msg;
    }

    const tx = account.cosmos.makeRevokeMsg(grant.grantee, messageType);

    try {
      // TODO: Move to config
      let gas = 120000;

      // Gas adjustment is 1.5
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      try {
        gas = (await tx.simulate()).gasUsed * 1.5;
      } catch (e) {
        console.log(e);
        return;
      }

      await tx.send(
        { amount: [], gas: gas.toString() },
        "",
        {},
        {
          onFulfill: (tx: any) => {
            if (tx.code != null && tx.code !== 0) {
              console.log(tx.log ?? tx.raw_log);
              notification.show("failed", "Transaction Failed", "");
              return;
            }
            notification.show("success", "Transaction Success", "");
          },
        }
      );

      navigate("/", {
        replace: true,
      });
    } catch (e) {
      if (e.message === "Request rejected") {
        if (location.pathname === "/setting/general/authz/revoke") {
          return;
        }

        navigate(-1);
        return;
      }

      console.log(e);
      notification.show("failed", "Transaction Failed", "");
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <HeaderLayout
      title="Authz Details"
      left={<BackButton />}
      bottomButton={{
        text: "Revoke",
        color: "danger",
        size: "large",
        onClick: () => onClickRevokeButton(state.grant),
      }}
    >
      <Box paddingX="0.75rem">
        <Stack gutter="0.5rem">
          <H4 style={{ color: ColorPalette["gray-50"] }}>{state.title}</H4>
          <Styles.Card gutter="0.5rem">
            <Styles.Title>Grantee Address</Styles.Title>
            <Styles.Paragraph>
              {state.grant.grantee}
              <CopyOutlineIcon width="0.875rem" height="0.875rem" />
            </Styles.Paragraph>
          </Styles.Card>

          <Styles.Card gutter="0.5rem">
            <Styles.Title>Expiration dates</Styles.Title>
            <Styles.Paragraph>
              {state.grant.expiration ? (
                new Date() < new Date(state.grant.expiration) ? (
                  <Columns sum={1}>
                    <FormattedDate
                      value={state.grant.expiration}
                      year="numeric"
                      month="2-digit"
                      day="2-digit"
                      hour="2-digit"
                      minute="2-digit"
                      hour12={false}
                    />
                  </Columns>
                ) : null
              ) : (
                "No expiration"
              )}
            </Styles.Paragraph>
          </Styles.Card>

          <Styles.Card gutter="0.5rem">
            <Styles.Paragraph>
              <Styles.JSON>
                {JSON.stringify(state.grant.authorization, undefined, 2)}
              </Styles.JSON>
            </Styles.Paragraph>
          </Styles.Card>
        </Stack>
      </Box>
    </HeaderLayout>
  );
});

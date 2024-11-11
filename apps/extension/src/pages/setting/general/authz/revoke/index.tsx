import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";
import { AuthZ } from "@keplr-wallet/stores";
import { useStore } from "../../../../../stores";
import { BackButton } from "../../../../../layouts/header/components";
import { HeaderLayout } from "../../../../../layouts/header";
import { Box } from "../../../../../components/box";
import styled, { useTheme } from "styled-components";
import { Stack } from "../../../../../components/stack";
import { ColorPalette } from "../../../../../styles";
import { Body3, H4, Subtitle3 } from "../../../../../components/typography";
import { CopyOutlineIcon } from "../../../../../components/icon";
import { Columns } from "../../../../../components/column";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useNotification } from "../../../../../hooks/notification";

const Styles = {
  Card: styled(Stack)`
    padding: 0.875rem;
    background-color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-10"]
        : ColorPalette["gray-600"]};

    border-radius: 0.25rem;
  `,
  Title: styled(Subtitle3)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-300"]
        : ColorPalette["gray-200"]};
  `,
  Paragraph: styled(Body3)`
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-10"]};
    word-break: keep-all;
    word-wrap: break-word;

    cursor: pointer;
  `,
  JSON: styled.pre`
    overflow: auto;
    white-space: pre-wrap;

    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-400"]
        : ColorPalette["gray-10"]};
  `,
};

export const SettingGeneralAuthZRevokePage: FunctionComponent = observer(() => {
  const { accountStore } = useStore();

  const intl = useIntl();
  const theme = useTheme();
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

      // Gas adjustment is 2
      // Since there is currently no convenient way to adjust the gas adjustment on the UI,
      // Use high gas adjustment to prevent failure.
      // XXX: 원래는 1.5였는데 왜인지 모르겠지만 오스모시스에서 시뮬레이션 결과와 실제 소모하는 가스가 많이 다르기 땜시 일단 대충 2로 처리함.
      try {
        gas = (await tx.simulate()).gasUsed * 2;
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
              notification.show(
                "failed",
                intl.formatMessage({ id: "error.transaction-failed" }),
                ""
              );
              return;
            }
            notification.show(
              "success",
              intl.formatMessage({
                id: "notification.transaction-success",
              }),
              ""
            );
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
      title={intl.formatMessage({
        id: "page.setting.general.authz.revoke.title",
      })}
      left={<BackButton />}
      bottomButtons={[
        {
          text: intl.formatMessage({
            id: "page.setting.general.authz.revoke.revoke-button",
          }),
          color: "danger",
          size: "large",
          onClick: () => onClickRevokeButton(state.grant),
        },
      ]}
    >
      <Box paddingX="0.75rem">
        <Stack gutter="0.5rem">
          <H4
            style={{
              color:
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-50"],
            }}
          >
            {state.title}
          </H4>
          <Styles.Card gutter="0.5rem">
            <Styles.Title>
              <FormattedMessage id="page.setting.general.authz.revoke.grantee-address" />
            </Styles.Title>
            <Styles.Paragraph
              onClick={async (e) => {
                e.preventDefault();

                await navigator.clipboard.writeText(state.grant.grantee);

                notification.show(
                  "success",
                  intl.formatMessage({
                    id: "pages.register.components.copy-to-clipboard.button-after",
                  }),
                  ""
                );
              }}
            >
              {state.grant.grantee}
              <CopyOutlineIcon width="0.875rem" height="0.875rem" />
            </Styles.Paragraph>
          </Styles.Card>

          <Styles.Card gutter="0.5rem">
            <Styles.Title>
              <FormattedMessage id="page.setting.general.authz.revoke.expiration-dates" />
            </Styles.Title>
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
                <FormattedMessage id="page.setting.general.authz.grant-view.no-expiration" />
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

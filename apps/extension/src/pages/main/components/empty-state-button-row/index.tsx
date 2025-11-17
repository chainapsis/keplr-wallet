import styled from "styled-components";
import React, { FunctionComponent, useMemo } from "react";
import { IconProps } from "../../../../components/icon/types";
import { Body3 } from "../../../../components/typography";
import { useIntl } from "react-intl";
import { ColorPalette } from "../../../../styles";
import { useStore } from "../../../../stores";
import { Dec } from "@keplr-wallet/unit";
import { useNavigate } from "react-router";
import { COMMON_HOVER_OPACITY } from "../../../../styles/constant";

export const EmptyStateButtonRow = ({
  onClickDeposit,
}: {
  onClickDeposit: () => void;
}) => {
  const intl = useIntl();
  const { hugeQueriesStore } = useStore();
  const navigate = useNavigate();

  const balances = hugeQueriesStore.getAllBalances({
    allowIBCToken: true,
  });

  const hasBalance = useMemo(() => {
    return balances.find((bal) => bal.token.toDec().gt(new Dec(0))) != null;
  }, [balances]);

  const onClickSend = () => {
    navigate(
      `/send/select-asset?navigateReplace=true&navigateTo=${encodeURIComponent(
        "/send?chainId={chainId}&coinMinimalDenom={coinMinimalDenom}"
      )}`
    );
  };
  const onClickSwap = () => {
    navigate(`/ibc-swap`);
  };

  return (
    <Styles.Grid>
      <Styles.EmptyStateButton onClick={onClickDeposit}>
        <ArrowDownIcon width="1rem" height="1rem" />
        <Body3>
          {intl.formatMessage({
            id: "page.main.components.buttons.deposit-button",
          })}
        </Body3>
      </Styles.EmptyStateButton>
      <Styles.EmptyStateButton
        disabled={!hasBalance}
        onClick={hasBalance ? onClickSend : undefined}
      >
        <ArrowRightUpIcon width="1rem" height="1rem" />
        <Body3>
          {intl.formatMessage({
            id: "page.main.components.buttons.send-button",
          })}
        </Body3>
      </Styles.EmptyStateButton>
      <Styles.EmptyStateButton
        disabled={!hasBalance}
        onClick={hasBalance ? onClickSwap : undefined}
      >
        <ArrowLeftRightIcon width="1rem" height="1rem" />
        <Body3>
          {intl.formatMessage({
            id: "page.main.components.buttons.swap-button",
          })}
        </Body3>
      </Styles.EmptyStateButton>
    </Styles.Grid>
  );
};

const Styles = {
  EmptyStateButton: styled.div<{ disabled?: boolean }>`
    display: flex;
    padding: 0.75rem 0;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 222px;
    background: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-50"]
        : "rgba(255, 255, 255, 0.05)"};
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["blue-500"]
        : ColorPalette.white};

    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};

    &:hover {
      opacity: ${COMMON_HOVER_OPACITY};
    }
  `,
  Grid: styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.625rem;
  `,
};

const ArrowDownIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
    >
      <mask
        id="mask0_1329_5239"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <rect width="16" height="16" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1329_5239)">
        <path
          d="M7.33322 10.7833V3.33329C7.33322 3.1444 7.39711 2.98607 7.52489 2.85829C7.65267 2.73051 7.811 2.66663 7.99989 2.66663C8.18878 2.66663 8.34711 2.73051 8.47489 2.85829C8.60267 2.98607 8.66656 3.1444 8.66656 3.33329V10.7833L11.9332 7.51663C12.0666 7.38329 12.2221 7.3194 12.3999 7.32496C12.5777 7.33051 12.7332 7.39996 12.8666 7.53329C12.9888 7.66663 13.0527 7.82218 13.0582 7.99996C13.0638 8.17774 12.9999 8.33329 12.8666 8.46663L8.46656 12.8666C8.39989 12.9333 8.32767 12.9805 8.24989 13.0083C8.17211 13.0361 8.08878 13.05 7.99989 13.05C7.911 13.05 7.82767 13.0361 7.74989 13.0083C7.67211 12.9805 7.59989 12.9333 7.53322 12.8666L3.13322 8.46663C3.011 8.3444 2.94989 8.19163 2.94989 8.00829C2.94989 7.82496 3.011 7.66663 3.13322 7.53329C3.26656 7.39996 3.42489 7.33329 3.60822 7.33329C3.79156 7.33329 3.94989 7.39996 4.08322 7.53329L7.33322 10.7833Z"
          fill={color || "currentColor"}
        />
      </g>
    </svg>
  );
};

const ArrowRightUpIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
    >
      <mask
        id="mask0_1329_5244"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <rect width="16" height="16" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1329_5244)">
        <path
          d="M10.5473 6.26456L5.27933 11.5325C5.14576 11.6661 4.98863 11.7329 4.80793 11.7329C4.62722 11.7329 4.47009 11.6661 4.33652 11.5325C4.20296 11.3989 4.13617 11.2418 4.13617 11.0611C4.13617 10.8804 4.20296 10.7233 4.33652 10.5897L9.60447 5.32175H4.9847C4.79614 5.32175 4.64097 5.25693 4.51919 5.1273C4.39741 4.99766 4.33652 4.83856 4.33652 4.65C4.34438 4.46929 4.4092 4.31412 4.53098 4.18449C4.65275 4.05485 4.80793 3.99003 4.99649 3.99003L11.219 3.99003C11.3133 3.99003 11.3978 4.00771 11.4724 4.04307C11.547 4.07842 11.6158 4.12753 11.6786 4.19038C11.7415 4.25323 11.7906 4.32198 11.826 4.39662C11.8613 4.47126 11.879 4.55572 11.879 4.65L11.879 10.8725C11.879 11.0454 11.8142 11.1966 11.6845 11.3263C11.5549 11.4559 11.3997 11.5246 11.219 11.5325C11.0305 11.5325 10.8714 11.4677 10.7417 11.338C10.6121 11.2084 10.5473 11.0493 10.5473 10.8608L10.5473 6.26456Z"
          fill={color || "currentColor"}
        />
      </g>
    </svg>
  );
};

const ArrowLeftRightIcon: FunctionComponent<IconProps> = ({
  width,
  height,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 17 17"
      fill="none"
    >
      <path
        d="M5.83081 8.57971C6.08465 8.83355 6.49689 8.83355 6.75073 8.57971C7.00449 8.32586 7.00454 7.9136 6.75073 7.65979L4.83179 5.74085H11.5916C11.9505 5.74081 12.2419 5.44942 12.2419 5.09045C12.2419 4.73151 11.9505 4.4401 11.5916 4.44006H4.83179L6.75073 2.52112C7.00448 2.26728 7.00451 1.85501 6.75073 1.6012C6.49692 1.3474 6.08465 1.34745 5.83081 1.6012L2.80151 4.63049C2.67964 4.75237 2.61111 4.9181 2.61108 5.09045C2.61109 5.26283 2.67963 5.42853 2.80151 5.55042L5.83081 8.57971ZM10.3738 15.3961C10.6276 15.65 11.0399 15.65 11.2937 15.3961L14.323 12.3668C14.4448 12.2449 14.5134 12.0792 14.5134 11.9069C14.5134 11.7345 14.4449 11.5688 14.323 11.4469L11.2937 8.4176C11.0399 8.16381 10.6276 8.16384 10.3738 8.4176C10.12 8.67144 10.12 9.08369 10.3738 9.33753L12.2917 11.2555H5.53296C5.17407 11.2555 4.88273 11.547 4.88257 11.9059C4.88257 12.2649 5.17397 12.5563 5.53296 12.5563H12.2937L10.3738 14.4762C10.1199 14.73 10.12 15.1423 10.3738 15.3961Z"
        fill={color || "currentColor"}
      />
    </svg>
  );
};

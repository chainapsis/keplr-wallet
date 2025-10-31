import React, { FunctionComponent, MouseEvent } from "react";
import { Styles } from "./styles";
import { Gutter } from "../../../../components/gutter";
import { TextInput } from "../../../../components/input";
import { ColorPalette } from "../../../../styles";
import { BIP44PathState } from "./state";
import { observer } from "mobx-react-lite";
import { useConfirm } from "../../../../hooks/confirm";
import { FormattedMessage, useIntl } from "react-intl";
import { Tooltip } from "../../../../components/tooltip";
import { InformationOutlineIcon } from "../../../../components/icon";
import { XAxis } from "../../../../components/axis";
import { useTheme } from "styled-components";

const CloseSvg: FunctionComponent<{ size: number | string; color: string }> = ({
  size,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

export const SetBip44PathCard: FunctionComponent<{
  coinType?: number;

  state: BIP44PathState;

  // ledger에서는 100까지밖에 허용안됨
  isLedger?: boolean;

  onClose: () => void;
}> = observer(({ coinType, state, onClose }) => {
  const confirm = useConfirm();
  const intl = useIntl();
  const theme = useTheme();
  const onClickReset = async (e: MouseEvent) => {
    e.preventDefault();

    if (
      await confirm.confirm(
        "",
        intl.formatMessage({
          id: "pages.register.components.bip-44-path.confirm-paragraph",
        })
      )
    ) {
      state.reset();
      onClose();
    }
  };

  return (
    <Styles.Container>
      <Styles.Title>
        <FormattedMessage id="pages.register.components.bip-44-path.title" />
      </Styles.Title>
      <Styles.CloseContainer onClick={onClickReset}>
        <CloseSvg size="1.5rem" color={ColorPalette["gray-300"]} />
      </Styles.CloseContainer>
      <Gutter size="1.125rem" />
      <ul>
        <li>
          <FormattedMessage id="pages.register.components.bip-44-path.paragraph-from-one-recovery-path" />
        </li>
        <li>
          <FormattedMessage id="pages.register.components.bip-44-path.paragraph-lost" />
        </li>
        <li>
          <FormattedMessage
            id="pages.register.components.bip-44-path.paragraph-unfamiliar"
            values={{
              reset: (...chunks: any) => (
                <span
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={onClickReset}
                >
                  {chunks}
                </span>
              ),
            }}
          />
        </li>
      </ul>
      <Gutter size="1.5rem" />
      <XAxis alignY="center" gap="0.5rem">
        <Styles.SubTitle>
          <FormattedMessage id="pages.register.components.bip-44-path.hd-path-subtitle" />
        </Styles.SubTitle>
        <Tooltip
          content={
            <FormattedMessage id="pages.register.components.bip-44-path.hd-path-tooltip" />
          }
          forceWidth="15.5rem"
          backgroundColor={theme.mode === "light" ? "#424247E5" : undefined}
        >
          <InformationOutlineIcon
            width="1.25rem"
            height="1.25rem"
            color={
              theme.mode === "light"
                ? ColorPalette["gray-200"]
                : ColorPalette["gray-300"]
            }
          />
        </Tooltip>
      </XAxis>
      <Gutter size="0.5rem" />
      <Styles.InputsContainer>
        <div>{`m/-'/${coinType != null ? coinType : "-"}'/`}</div>
        <Gutter size="0.5rem" />
        <Styles.InputContainer>
          <TextInput
            type="number"
            min={0}
            max={2147483647}
            value={state.accountText}
            onChange={(e) => {
              e.preventDefault();

              state.setAccountText(e.target.value);
            }}
            errorBorder={!state.isAccountValid()}
          />
        </Styles.InputContainer>
        <Gutter size="0.5rem" />
        <Styles.LightText>{`'/`}</Styles.LightText>
        <Gutter size="0.5rem" />
        <Styles.InputContainer>
          <TextInput
            type="number"
            min={0}
            max={1}
            value={state.changeText}
            onChange={(e) => {
              e.preventDefault();

              state.setChangeText(e.target.value);
            }}
            errorBorder={!state.isChangeValid()}
          />
        </Styles.InputContainer>
        <Gutter size="0.5rem" />
        <Styles.LightText>/</Styles.LightText>
        <Gutter size="0.5rem" />
        <Styles.InputContainer>
          <TextInput
            type="number"
            min={0}
            max={4294967295}
            value={state.addressIndexText}
            onChange={(e) => {
              e.preventDefault();

              state.setAddressIndexText(e.target.value);
            }}
            errorBorder={!state.isAddressIndexValid()}
          />
        </Styles.InputContainer>
      </Styles.InputsContainer>
    </Styles.Container>
  );
});

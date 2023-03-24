import React, { FunctionComponent } from "react";
import { Styles } from "./styles";
import { Gutter } from "../../../../components/gutter";
import { TextInput } from "../../../../components/input";
import { ColorPalette } from "../../../../styles";
import { BIP44PathState } from "./state";
import { observer } from "mobx-react-lite";

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
        strokeWidth="2"
        d="M18 6L6 18m12 0L6 6"
      />
    </svg>
  );
};

export const SetBip44PathCard: FunctionComponent<{
  coinType?: number;

  state: BIP44PathState;

  onClose: () => void;
}> = observer(({ coinType, state, onClose }) => {
  return (
    <Styles.Container>
      <Styles.Title>Set the BIP Path</Styles.Title>
      <Styles.CloseContainer
        onClick={(e) => {
          e.preventDefault();

          state.reset();
          onClose();
        }}
      >
        <CloseSvg size="1.5rem" color={ColorPalette["platinum-200"]} />
      </Styles.CloseContainer>
      <Gutter size="1.125rem" />
      <ul>
        <li>You can create multiple addresses from one mnemonic.</li>
        <li>
          You may not be able to recover account if you lose the values you
          entered.
        </li>
        <li>
          If you are not familiar with the feature, please skip this step. For
          cancelling the setup, please go to RESET SETTINGS.
        </li>
      </ul>
      <Gutter size="1.5rem" />
      <Styles.SubTitle>HD Derivation Path</Styles.SubTitle>
      <Gutter size="0.5rem" />
      <Styles.InputsContainer>
        <div>{`m/44'/${coinType != null ? coinType : "..."}'`}</div>
        <Gutter size="0.5rem" />
        <Styles.InputContainer>
          <TextInput
            type="number"
            min={0}
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

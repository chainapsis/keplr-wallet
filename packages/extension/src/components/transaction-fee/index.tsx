import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { Column, Columns } from "../column";
import { Subtitle3, Subtitle4 } from "../typography";
import { Stack } from "../stack";
import { ArrowRightIcon, SettingIcon } from "../icon";
import { TransactionFeeModal } from "./modal";
import { Modal } from "../modal";

const Styles = {
  Container: styled.div`
    padding: 0.875rem 0.25rem 0.875rem 1rem;
    margin-bottom: 5.25rem;

    background-color: ${ColorPalette["gray-600"]};

    border: 1.5px solid rgba(44, 75, 226, 0.5);
    border-radius: 0.375rem;

    cursor: pointer;
  `,
  IconContainer: styled.div`
    color: ${ColorPalette["gray-300"]};
  `,
};

export const TransactionFee: FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Styles.Container onClick={() => setIsOpen(true)}>
      <Columns sum={1} alignY="center">
        <Columns sum={1} alignY="center">
          <Subtitle4>Transaction Fee</Subtitle4>
          <SettingIcon width="1rem" height="1rem" />
        </Columns>

        <Column weight={1} />

        <Columns sum={1} gutter="0.25rem" alignY="center">
          <Stack gutter="0.25rem" alignX="right">
            <Subtitle3>12.53 ATOM</Subtitle3>
            <Subtitle3 style={{ color: ColorPalette["gray-300"] }}>
              $153.50
            </Subtitle3>
          </Stack>

          <Styles.IconContainer>
            <ArrowRightIcon />
          </Styles.IconContainer>
        </Columns>
      </Columns>

      <Modal isOpen={isOpen}>
        <TransactionFeeModal setIsOpen={setIsOpen} />
      </Modal>
    </Styles.Container>
  );
};

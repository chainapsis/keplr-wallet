import React, { FunctionComponent, useRef } from "react";
import { useClickOutside } from "../../../../hooks";
import styled from "styled-components";
import { ColorPalette } from "../../../../styles";
import { Body2 } from "../../../../components/typography";
import { Column, Columns } from "../../../../components/column";
import { Button } from "../../../../components/button";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    margin-left: 2rem;
    margin-right: 2rem;
    padding: 1.5rem 1.25rem;

    background-color: ${ColorPalette["gray-600"]};
    border-radius: 0.5rem;
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
};

export const TokenDeleteModal: FunctionComponent<{
  setIsOpen: (isOpen: boolean) => void;
}> = ({ setIsOpen }) => {
  const wrapperRef = useRef<HTMLInputElement>(null);
  useClickOutside(wrapperRef, () => setIsOpen(false));

  return (
    <Styles.Container ref={wrapperRef}>
      <Styles.Paragraph>
        Are you sure you’d like to disable this token? You will not be able to
        see your balance or transfer until you add it again.
      </Styles.Paragraph>

      <Columns sum={1} gutter="0.75rem">
        <Column weight={1} />
        <Button text="Cancel" color="text" size="small" />
        <Button text="Yes" color="primary" size="small" />
      </Columns>
    </Styles.Container>
  );
};

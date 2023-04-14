import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { Body2, Caption1, Subtitle2 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";

export const Styles = {
  Container: styled(Stack)`
    margin-top: 1.25rem;
  `,
  Price: styled(Subtitle2)`
    margin-top: 0.375rem;
    color: ${ColorPalette["gray-300"]};
  `,
  DataContainer: styled(Stack)`
    width: 100%;

    margin-top: 1.25rem;
  `,
  MessageContainer: styled.div`
    height: 11.75rem;

    overflow: scroll;

    border-radius: 0.375rem;
  `,
  TransferContainer: styled.div`
    padding: 1rem;

    background-color: ${ColorPalette["gray-600"]};
  `,
  ViewData: styled.pre`
    overflow: scroll;
    background-color: ${ColorPalette["gray-600"]};
  `,
  TokenItem: styled(Stack)`
    min-width: 8rem;
    width: 0;
  `,
  Text: styled(Caption1)`
    color: ${ColorPalette["gray-300"]};
  `,
  Address: styled(Body2)`
    word-break: break-word;
  `,
  Divider: styled.div`
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid ${ColorPalette["gray-500"]};
  `,
  Arrow: styled.div`
    width: 2rem;
    height: 2rem;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 3.15rem 0.5rem 0 0.5rem;

    border-radius: 50%;
    background-color: ${ColorPalette["gray-400"]};
  `,
};

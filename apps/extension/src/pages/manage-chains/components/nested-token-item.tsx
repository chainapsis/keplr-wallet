import React, { FunctionComponent, useMemo } from "react";
import { observer } from "mobx-react-lite";
import styled, { useTheme } from "styled-components";

import { ViewToken } from "../../main/index";
import { useStore } from "../../../stores";

import { Columns, Column } from "../../../components/column";
import { Stack } from "../../../components/stack";
import { Gutter } from "../../../components/gutter";
import { Subtitle2, Subtitle3 } from "../../../components/typography";
import { CurrencyImageFallback } from "../../../components/image";
import { ColorPalette } from "../../../styles";
import { useTokenTag } from "../../../hooks/use-token-tag";
import { TokenTag } from "../../main/components/token/token-tag";

const Container = styled.div`
  background-color: transparent;
  border-radius: 0.375rem;
  padding: 0.5625rem 1rem;
`;

interface NestedTokenItemProps {
  viewToken: ViewToken;
}

export const NestedTokenItem: FunctionComponent<NestedTokenItemProps> =
  observer(({ viewToken }) => {
    const { uiConfigStore, priceStore } = useStore();
    const theme = useTheme();

    const tag = useTokenTag(viewToken);

    const amountText = useMemo(() => {
      return uiConfigStore.hideStringIfPrivacyMode(
        viewToken.token
          .hideDenom(true)
          .maxDecimals(6)
          .inequalitySymbol(true)
          .shrink(true)
          .toString(),
        2
      );
    }, [uiConfigStore, viewToken.token]);

    const pricePretty = priceStore.calculatePrice(viewToken.token);

    const priceText = useMemo(() => {
      return uiConfigStore.hideStringIfPrivacyMode(
        pricePretty ? pricePretty.inequalitySymbol(true).toString() : "-",
        2
      );
    }, [uiConfigStore, pricePretty]);

    return (
      <Container>
        <Columns sum={1} gutter="0.5rem" alignY="center">
          <CurrencyImageFallback
            chainInfo={viewToken.chainInfo}
            currency={viewToken.token.currency}
            size="1.5rem"
          />

          <Gutter size="0.75rem" />

          <Subtitle2
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-10"]
            }
            style={{ wordBreak: "break-all", lineHeight: "normal" }}
          >
            {viewToken.token.hideAmount(true).hideIBCMetadata(true).toString()}
          </Subtitle2>
          <Gutter size="0.25rem" />
          {tag ? <TokenTag text={tag.text} tooltip={tag.tooltip} /> : null}

          <Column weight={1} />

          <Stack gutter="0.25rem" alignX="right">
            <Subtitle3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["gray-10"]
              }
            >
              {amountText}
            </Subtitle3>
            <Subtitle3 color={ColorPalette["gray-300"]}>{priceText}</Subtitle3>
          </Stack>
        </Columns>
      </Container>
    );
  });

import React, { FunctionComponent, useState } from "react";
import { CollapsibleListProps } from "./types";
import { Stack } from "../stack";
import { Box } from "../box";
import { Button2, Subtitle4 } from "../typography";
import { ColorPalette } from "../../styles";
import { ArrowDownIcon, ArrowUpIcon } from "../icon";
import { Columns } from "../column";
import { VerticalCollapseTransition } from "../transition/vertical-collapse";
import { Gutter } from "../gutter";
import { XAxis } from "../axis";
import styled, { useTheme } from "styled-components";
import { useIntl } from "react-intl";

const Styles = {
  MoreViewContainer: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    cursor: pointer;

    color: ${ColorPalette["gray-300"]};

    :hover {
      color: ${ColorPalette["gray-400"]};
    }
  `,
};

export const CollapsibleList: FunctionComponent<CollapsibleListProps> = ({
  title,
  items,
  lenAlwaysShown,
}) => {
  if (!lenAlwaysShown || lenAlwaysShown < 0) {
    lenAlwaysShown = items.length;
  }

  const intl = useIntl();
  const theme = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const alwaysShown = items.slice(0, lenAlwaysShown);
  const hidden = items.slice(lenAlwaysShown);

  return (
    <Stack>
      <Box
        marginBottom="0.5rem"
        paddingX="0.375rem"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <Columns sum={1} alignY="center">
          <Subtitle4
            style={{
              color:
                theme.mode === "light"
                  ? ColorPalette["blue-400"]
                  : ColorPalette["gray-50"],
            }}
          >
            {items.length}
          </Subtitle4>

          <Gutter size="0.25rem" />

          {title}
        </Columns>
      </Box>

      <Stack gutter="0.5rem">{alwaysShown}</Stack>

      <VerticalCollapseTransition collapsed={isCollapsed}>
        <Gutter size="0.5rem" />
        <Stack gutter="0.5rem">{hidden}</Stack>
      </VerticalCollapseTransition>

      {hidden.length > 0 ? (
        <Styles.MoreViewContainer
          onClick={(e) => {
            e.preventDefault();

            setIsCollapsed(!isCollapsed);
          }}
        >
          <Gutter size="0.75rem" />
          <XAxis alignY="center">
            <Button2 color={ColorPalette["gray-300"]}>
              {isCollapsed
                ? intl.formatMessage(
                    { id: "components.collapsible-list.view-more-tokens" },
                    { remain: hidden.length }
                  )
                : intl.formatMessage({
                    id: "components.collapsible-list.collapse",
                  })}
            </Button2>

            <Gutter size="0.25rem" />

            {isCollapsed ? (
              <ArrowDownIcon width="1rem" height="1rem" />
            ) : (
              <ArrowUpIcon width="1rem" height="1rem" />
            )}
          </XAxis>
        </Styles.MoreViewContainer>
      ) : null}
    </Stack>
  );
};

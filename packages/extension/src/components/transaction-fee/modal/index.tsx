import React, { FunctionComponent, useRef, useState } from "react";
import { useClickOutside } from "../../../hooks";
import { Caption1, Caption2, H5, Subtitle1, Subtitle3 } from "../../typography";
import { ColorPalette } from "../../../styles";
import styled from "styled-components";
import { Stack } from "../../stack";
import { DropDown } from "../../dropdown";
import { Column, Columns } from "../../column";
import { Toggle } from "../../toggle";
import { TextInput } from "../../input";
import { Button } from "../../button";

const Styles = {
  Container: styled.div`
    display: flex;
    flex-direction: column;

    width: 100%;

    padding: 1.25rem;
    gap: 0.75rem;

    background-color: ${ColorPalette["gray-600"]};
  `,
  Divider: styled.div`
    border: 1px solid ${ColorPalette["gray-500"]};
  `,
};

export const TransactionFeeModal: FunctionComponent<{
  setIsOpen: (isOpen: boolean) => void;
}> = ({ setIsOpen }) => {
  const [isAuto, setIsAuto] = useState<boolean>(true);
  const wrapperRef = useRef<HTMLInputElement>(null);
  useClickOutside(wrapperRef, () => setIsOpen(false));

  return (
    <Styles.Container ref={wrapperRef}>
      <Subtitle1 style={{ marginBottom: "1.5rem" }}>Fee Set</Subtitle1>

      <Stack gutter="0.75rem">
        <Stack gutter="0.375rem">
          <Subtitle3>Fee</Subtitle3>
          <FeeSelector />
        </Stack>

        <Stack gutter="0.375rem">
          <Subtitle3>Fee Token</Subtitle3>
          <DropDown
            items={[
              { key: "0", label: "Atom" },
              { key: "1", label: "Osmo" },
            ]}
            selectedItemKey={"0"}
            onSelect={() => {}}
            size="large"
          />
        </Stack>

        <Styles.Divider />

        <Columns sum={1} alignY="center">
          <Subtitle3 style={{ color: ColorPalette["gray-200"] }}>Gas</Subtitle3>

          <Column weight={1} />

          <Columns sum={1} gutter="0.5rem" alignY="center">
            <Subtitle3>Auto</Subtitle3>
            <Toggle isOpen={isAuto} setIsOpen={() => setIsAuto(!isAuto)} />
          </Columns>
        </Columns>

        <TextInput label="Gas Amount" />

        <Button text="Confirm" color="secondary" size="large" />
      </Stack>
    </Styles.Container>
  );
};

type FeeType = "low" | "average" | "high";
const FeeSelectorStyle = {
  Item: styled.div<{ selected: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;

    gap: 0.125rem;

    background-color: ${({ selected }) =>
      selected ? ColorPalette["blue-400"] : ColorPalette["gray-500"]}};
  `,
  Title: styled(H5)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["white"] : ColorPalette["gray-50"]}};
  `,
  Price: styled(Caption2)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-200"] : ColorPalette["gray-300"]}};
  `,
  Amount: styled(Caption1)<{ selected: boolean }>`
    color: ${({ selected }) =>
      selected ? ColorPalette["blue-100"] : ColorPalette["gray-200"]}};
  `,
};

const FeeSelector: FunctionComponent = () => {
  const [selected, setSelected] = useState<FeeType>("average");

  return (
    <Columns sum={3}>
      <Column weight={1}>
        <FeeSelectorStyle.Item
          style={{
            borderRadius: "0.5rem 0 0 0.5rem",
            borderRight: `1px solid ${ColorPalette["gray-400"]}`,
          }}
          onClick={() => setSelected("low")}
          selected={selected === "low"}
        >
          <FeeSelectorStyle.Title selected={selected === "low"}>
            Low
          </FeeSelectorStyle.Title>
          <FeeSelectorStyle.Price selected={selected === "low"}>
            $0.0097
          </FeeSelectorStyle.Price>
          <FeeSelectorStyle.Amount selected={selected === "low"}>
            0.002ATOM
          </FeeSelectorStyle.Amount>
        </FeeSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeSelectorStyle.Item
          onClick={() => setSelected("average")}
          selected={selected === "average"}
        >
          <FeeSelectorStyle.Title selected={selected === "average"}>
            Average
          </FeeSelectorStyle.Title>
          <FeeSelectorStyle.Price selected={selected === "average"}>
            $0.0097
          </FeeSelectorStyle.Price>
          <FeeSelectorStyle.Amount selected={selected === "average"}>
            0.002ATOM
          </FeeSelectorStyle.Amount>
        </FeeSelectorStyle.Item>
      </Column>

      <Column weight={1}>
        <FeeSelectorStyle.Item
          style={{
            borderRadius: "0 0.5rem 0.5rem 0",
            borderLeft: `1px solid ${ColorPalette["gray-400"]}`,
          }}
          onClick={() => setSelected("high")}
          selected={selected === "high"}
        >
          <FeeSelectorStyle.Title selected={selected === "high"}>
            High
          </FeeSelectorStyle.Title>
          <FeeSelectorStyle.Price selected={selected === "high"}>
            $0.0097
          </FeeSelectorStyle.Price>
          <FeeSelectorStyle.Amount selected={selected === "high"}>
            0.002ATOM
          </FeeSelectorStyle.Amount>
        </FeeSelectorStyle.Item>
      </Column>
    </Columns>
  );
};

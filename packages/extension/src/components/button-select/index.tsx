import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import { ColorPalette } from "../../styles";

export interface ButtonSelectProps<ItemId> {
  items: {
    id: ItemId;
    label: string;
  }[];
  activeItemId: ItemId;
  onClickItem: (itemId: ItemId) => void;
}

export const ButtonSelect = <ItemId,>({
  items,
  activeItemId,
  onClickItem,
}: PropsWithChildren<ButtonSelectProps<ItemId>>) => {
  return (
    <div>
      {items.map((item, index) => (
        <SelectItem
          key={index}
          index={index}
          itemCount={items.length - 1}
          isActive={activeItemId === item.id}
          onClick={() => onClickItem(item.id)}
        >
          {item.label}
        </SelectItem>
      ))}
    </div>
  );
};

interface SelectItemProps {
  index: number;
  itemCount: number;
  isActive: boolean;
  onClick: () => void;
}

const SelectItem = styled.button<SelectItemProps>`
  padding: 7px 12.5px;
  background: ${({ isActive }) =>
    isActive ? ColorPalette["blue-100"] : ColorPalette["white"]};
  border-width: ${({ index, itemCount }) =>
    `1px ${index === itemCount ? 1 : 0}px 1px ${index === 0 ? 1 : 0}px`};
  border-style: solid;
  border-color: #f2f2f7;
  border-radius: ${({ index, itemCount }) =>
    index === 0
      ? `8px 0px 0px 8px`
      : index === itemCount
      ? `0px 8px 8px 0px`
      : "0px"};

  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: ${({ isActive }) =>
    isActive ? ColorPalette["blue-400"] : ColorPalette["gray-300"]};
`;

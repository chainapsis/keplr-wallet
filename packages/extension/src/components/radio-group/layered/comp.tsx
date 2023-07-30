import React, { FunctionComponent } from "react";
import { Skeleton } from "../../skeleton";
import { RadioGroupProps } from "../types";
import { LayeredStyles } from "./styles";

export const LayeredHorizontalRadioGroup: FunctionComponent<
  RadioGroupProps & {
    isNotReady?: boolean;
  }
> = ({
  style,
  className,
  size = "default",
  items,
  selectedKey,
  itemMinWidth,
  isNotReady = false,
  onSelect,
}) => {
  return (
    <Skeleton type="circle" isNotReady={isNotReady}>
      <LayeredStyles.Container
        style={style}
        className={className}
        size={size}
        isNotReady={isNotReady}
      >
        {items.map((item) => {
          const selected = item.key === selectedKey;

          return (
            <LayeredStyles.Button
              key={item.key}
              isNotReady={isNotReady}
              type="button"
              size={size}
              selected={selected}
              itemMinWidth={itemMinWidth}
              onClick={(e) => {
                e.preventDefault();
                onSelect(item.key);
              }}
            >
              {item.text}
            </LayeredStyles.Button>
          );
        })}
      </LayeredStyles.Container>
    </Skeleton>
  );
};

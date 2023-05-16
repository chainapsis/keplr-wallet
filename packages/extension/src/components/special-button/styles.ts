import styled from "styled-components";
import { ColorPalette } from "../../styles";
import { ButtonRadius, getButtonHeightRem } from "../button";
import { SpecialButtonProps } from "./types";
import { animated } from "@react-spring/web";

export const SpecialButtonHeightRem = getButtonHeightRem("large");

export const Styles = {
  Container: styled.div`
    // Used for making button fill parent horizontally.
    display: flex;
    flex-direction: column;
    align-items: center;
  `,

  // "onClick" field should be omitted because "onClick" prop already exists on html button component.
  // If not omitted, they are intersected with each other.
  Button: styled(animated.button)<SpecialButtonProps>`
    width: 100%;
    height: ${SpecialButtonHeightRem}rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${ButtonRadius};
    cursor: ${({ disabled, isLoading }) =>
      disabled ? "not-allowed" : isLoading ? "wait" : "pointer"};
    overflow: hidden;

    font-weight: 500;
    font-size: 1rem;
    letter-spacing: 0.2px;

    white-space: nowrap;

    // Remove normalized css properties.
    border-width: 0;
    border-style: none;
    border-color: transparent;
    border-image: none;
    padding: 0 0.75rem;

    color: ${ColorPalette["white"]};
    svg {
      fill: ${ColorPalette["white"]};
      stroke: ${ColorPalette["white"]};
    }
  `,
  Left: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-right: 0.25rem;
  `,
  Right: styled.span`
    height: 100%;
    display: flex;
    align-items: center;
    margin-left: 0.25rem;
  `,
  Loading: styled.div`
    display: flex;
    align-items: center;

    position: absolute;
    color: ${ColorPalette["blue-200"]};
  `,
  TextOverrideIcon: styled.div`
    display: flex;
    align-items: center;

    position: absolute;
    svg {
      fill: none;
    }
  `,
};

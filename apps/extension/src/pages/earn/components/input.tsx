import styled from "styled-components";
import { ColorPalette } from "../../../styles";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import Color from "color";

export const Input: FunctionComponent<
  React.InputHTMLAttributes<HTMLInputElement> & {
    warning?: boolean;
    suffix?: string;
  }
> = ({ warning, suffix, value, ...props }) => {
  if (!value) {
    suffix = undefined;
  }
  if (suffix) {
    suffix = " " + suffix;
  }

  const widthCheckRef = useRef<HTMLSpanElement | null>(null);
  const [textWidth, setTextWidth] = useState<number | null>(null);
  useEffect(() => {
    if (widthCheckRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          const boxSize = Array.isArray(entry.borderBoxSize)
            ? entry.borderBoxSize[0]
            : entry.borderBoxSize;

          const width = boxSize.inlineSize;
          setTextWidth(width);
        }
      });
      resizeObserver.observe(widthCheckRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  const inputWidthCheckRef = useRef<HTMLInputElement | null>(null);
  const [textInputWidth, setTextInputWidth] = useState<number | null>(null);
  useEffect(() => {
    if (inputWidthCheckRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          const boxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;

          const width = boxSize.inlineSize;
          setTextInputWidth(width);
        }
      });
      resizeObserver.observe(inputWidthCheckRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  const suffixWidthCheckRef = useRef<HTMLDivElement | null>(null);
  const [suffixTextWidth, setSuffixTextWidth] = useState<number | null>(null);
  useEffect(() => {
    if (suffixWidthCheckRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const entry = entries[0];
          const boxSize = Array.isArray(entry.borderBoxSize)
            ? entry.borderBoxSize[0]
            : entry.borderBoxSize;

          const width = boxSize.inlineSize;
          setSuffixTextWidth(width);
        }
      });
      resizeObserver.observe(suffixWidthCheckRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  return (
    <InputContainer>
      <div
        style={{
          position: "relative",
          opacity: 0,
          visibility: "hidden",
        }}
      >
        <TextInputWidthChecker ref={widthCheckRef}>
          {value}
        </TextInputWidthChecker>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
        }}
      >
        <StyledInput
          ref={inputWidthCheckRef}
          value={value}
          warning={warning}
          {...props}
        />
        <div
          style={(() => {
            if (suffixTextWidth == null || !suffix) {
              return {
                width: 0,
                opacity: 0,
              };
            }
            return {
              width: suffixTextWidth + "px",
              // 옆의 마진이 왜 필요한지 모른다...
              // 어쨋든 실행시켜서 살펴보면 이 요소는 의도보다 오른쪽으로 치우져진다
              // 사실 24px도 정확한 값은 아닌데... 원인을 못 찾았으므로 일단 대강 처리
              marginRight: "24px",
            };
          })()}
        />
        <Suffix
          ref={suffixWidthCheckRef}
          isWarning={!!warning}
          textWidth={(() => {
            if (textWidth != null && textInputWidth != null) {
              return Math.min(textWidth, textInputWidth);
            }
            if (textWidth != null) {
              return textWidth;
            }
            if (textInputWidth != null) {
              return textInputWidth;
            }

            return 0;
          })()}
        >
          {suffix}
        </Suffix>
      </div>
    </InputContainer>
  );
};

const StyledInput = styled.input<{ warning?: boolean }>`
  width: 100%;
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 2.25rem;

  background: none;

  border: 0;

  color: ${(props) =>
    props.warning
      ? ColorPalette["red-300"]
      : props.theme.mode === "light"
      ? ColorPalette["gray-700"]
      : ColorPalette.white};

  ::placeholder {
    color: ${(props) =>
      props.theme.mode === "light"
        ? ColorPalette["gray-200"]
        : ColorPalette["gray-300"]};
  }

  // Remove normalized css properties
  outline: none;

  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const TextInputWidthChecker = styled.span`
  position: fixed;
  visibility: hidden;
  opacity: 0;
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 2.25rem;
  white-space: pre;
`;

const InputContainer = styled.div`
  position: relative;

  overflow: scroll;
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: center;

  margin: 0;
  padding: 0.25rem 0.125rem;
  padding-bottom: 0.75rem;

  border-bottom: 1px solid
    ${(props) =>
      props.theme.mode === "light"
        ? Color(ColorPalette["gray-200"]).alpha(0.5).toString()
        : Color(ColorPalette["gray-300"]).alpha(0.5).toString()};
`;

const Suffix = styled.span<{ isWarning?: boolean; textWidth?: number }>`
  position: absolute;
  white-space: pre;
  top: 50%;
  transform: translateY(-50%);
  left: ${({ textWidth }) => (textWidth ? `${textWidth + 2}px` : 0)};

  font-weight: 700;
  font-size: 1.75rem;
  line-height: 2.25rem;

  color: ${(props) =>
    props.isWarning
      ? ColorPalette["red-300"]
      : props.theme.mode === "light"
      ? ColorPalette["gray-700"]
      : ColorPalette.white};
`;

import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { HoldButtonProps } from "./types";
import { Styles } from "../button/styles";
import { LoadingIcon } from "../icon";
import { Box } from "../box";
import { useTheme } from "styled-components";
import { CircularProgress } from "./circular-progress";

const UPDATE_INTERVAL_MS = 16;
const MIN_HOLD_DURATION_MS = 100;

export const HoldButton: FunctionComponent<HoldButtonProps> = ({
  holdDurationMs,
  onConfirm,
  onHoldStart,
  onHoldEnd,
  onProgressChange,
  type = "button",
  progressSize = "1.25rem",
  style,
  className,
  text,
  holdingText,
  left,
  right,
  isLoading,
  disabled,
  ...otherProps
}) => {
  const theme = useTheme();

  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const confirmedRef = useRef(false);

  const clearHoldInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startHold = useCallback(() => {
    if (disabled || isLoading) {
      return;
    }

    clearHoldInterval();

    confirmedRef.current = false;
    setIsHolding(true);
    setProgress(0);
    holdStartTimeRef.current = Date.now();
    onHoldStart?.();

    intervalRef.current = window.setInterval(() => {
      if (holdStartTimeRef.current === null) {
        return;
      }

      const elapsed = Date.now() - holdStartTimeRef.current;
      const newProgress = Math.min(
        elapsed / Math.max(holdDurationMs, MIN_HOLD_DURATION_MS),
        1
      );

      setProgress(newProgress);
      onProgressChange?.(newProgress);

      if (newProgress >= 1 && !confirmedRef.current) {
        confirmedRef.current = true;
        clearHoldInterval();
        setIsHolding(false);
        setProgress(0);
        holdStartTimeRef.current = null;

        onHoldEnd?.();
        onConfirm?.();

        if (type === "submit" && buttonRef.current?.form) {
          buttonRef.current.form.requestSubmit();
        }
      }
    }, UPDATE_INTERVAL_MS);
  }, [
    disabled,
    isLoading,
    holdDurationMs,
    onHoldStart,
    onHoldEnd,
    onProgressChange,
    onConfirm,
    type,
    clearHoldInterval,
  ]);

  const endHold = useCallback(() => {
    // Check if there's an active interval or hold instead of relying on state
    // This prevents race conditions when quickly holding and releasing
    if (intervalRef.current === null && holdStartTimeRef.current === null) {
      return;
    }

    clearHoldInterval();
    setIsHolding(false);
    setProgress(0);
    holdStartTimeRef.current = null;
    onHoldEnd?.();
  }, [clearHoldInterval, onHoldEnd]);

  useEffect(() => {
    return () => {
      clearHoldInterval();
    };
  }, [clearHoldInterval]);

  const displayText = isHolding && holdingText ? holdingText : text;

  // CircularProgress is default left content
  const leftContent =
    left !== undefined ? (
      left
    ) : (
      <CircularProgress
        progress={progress}
        size={progressSize}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    );

  return (
    <Styles.Container
      style={style}
      className={className}
      mode={otherProps.mode}
    >
      <Styles.Button
        ref={buttonRef}
        isLoading={isLoading}
        type="button" // prevent default form submit behavior
        disabled={disabled}
        {...otherProps}
        style={{ gap: "0.25rem" }}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
        data-holding={isHolding}
        data-progress={progress}
      >
        {leftContent ? <Styles.Left>{leftContent}</Styles.Left> : null}

        {isLoading ? (
          <Styles.Loading buttonColor={otherProps.color} theme={theme}>
            <LoadingIcon width="1rem" height="1rem" />
          </Styles.Loading>
        ) : null}

        <Box style={{ opacity: isLoading ? 0 : 1 }}>{displayText}</Box>

        {right ? <Styles.Right>{right}</Styles.Right> : null}
      </Styles.Button>
    </Styles.Container>
  );
};

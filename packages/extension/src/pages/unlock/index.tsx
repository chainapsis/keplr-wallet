import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { TextInput } from "../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button } from "../../components/button";
import { useInteractionInfo } from "../../hooks";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { TextButton } from "../../components/button-text";
import { ColorPalette } from "../../styles";
import { H1 } from "../../components/typography";
import { Tooltip } from "../../components/tooltip";
import AnimLogo from "../../public/assets/lottie/unlock/logo.json";
import lottie, { AnimationItem } from "lottie-web";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();

  const interactionInfo = useInteractionInfo(() => {
    interactionStore.rejectAll("unlock");
  });
  const [password, setPassword] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      // Focus the input element at start.
      inputRef.current.focus();
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [isOnCapsLock, setIsOnCapsLock] = useState(false);

  const animContainerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  useEffect(() => {
    if (animContainerRef.current) {
      const anim = lottie.loadAnimation({
        container: animContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: AnimLogo,
      });

      animRef.current = anim;

      return () => {
        anim.destroy();

        animRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    // 현실적으로는 이 애니메이션은 마이그레이션 과정 중에서만 보이고 그게 의도이다.
    if (animRef.current) {
      if (isLoading) {
        animRef.current.goToAndPlay(0);
      } else {
        // page가 넘어가기 직전에 애니메이션이 멈추지 않도록 약간의 delay를 준다.
        setTimeout(() => {
          animRef.current?.goToAndStop(0);
        }, 50);
      }
    }
  }, [isLoading]);

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
      }}
      onSubmit={async (e) => {
        e.preventDefault();

        try {
          setIsLoading(true);

          await keyRingStore.unlock(password);

          if (interactionInfo.interaction) {
            // Approve all waiting interaction for the enabling key ring.
            const interactions = interactionStore.getAllData("unlock");
            await interactionStore.approveWithProceedNextV2(
              interactions.map((interaction) => interaction.id),
              {},
              (proceedNext) => {
                if (
                  interactionInfo.interaction &&
                  !interactionInfo.interactionInternal
                ) {
                  if (!proceedNext) {
                    window.close();
                  }
                }
              }
            );
          }

          setError(undefined);
        } catch (e) {
          console.log(e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <Box alignX="center">
        <Gutter size="7.375rem" />

        <div
          ref={animContainerRef}
          style={{
            width: "12rem",
            height: "9.5rem",
          }}
        />
        {keyRingStore.needMigration ? (
          <H1>TODO: In migration</H1>
        ) : (
          <H1>Welcome Back</H1>
        )}

        <Gutter size="1.75rem" />

        <Box position="relative" width="100%">
          <Box
            position="absolute"
            alignY="center"
            style={{
              top: 0,
              left: 20,
              bottom: 0,
            }}
          >
            <Tooltip
              content={
                <div style={{ whiteSpace: "nowrap" }}>CapsLock is on</div>
              }
              enabled={false}
              isAlwaysOpen={isOnCapsLock}
            >
              <div />
            </Tooltip>
          </Box>

          <TextInput
            ref={inputRef}
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              e.preventDefault();

              setPassword(e.target.value);

              // Clear error if the user is typing.
              setError(undefined);
            }}
            onBlur={() => {
              setIsOnCapsLock(false);
            }}
            onKeyUp={(e) => {
              if (e.getModifierState("CapsLock")) {
                setIsOnCapsLock(true);
              } else {
                setIsOnCapsLock(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.getModifierState("CapsLock")) {
                setIsOnCapsLock(true);
              } else {
                setIsOnCapsLock(false);
              }
            }}
            error={error ? "Invalid password" : undefined}
          />
        </Box>

        <Gutter size="2.125rem" />

        <Button
          type="submit"
          text="Unlock"
          size="large"
          disabled={password.length === 0}
          style={{ width: "100%" }}
          isLoading={
            isLoading ||
            (() => {
              if (interactionInfo.interaction) {
                const interactions = interactionStore.getAllData("unlock");
                for (const interaction of interactions) {
                  if (interactionStore.isObsoleteInteraction(interaction.id)) {
                    return true;
                  }
                }
              }
              return false;
            })()
          }
        />

        <Gutter size="3.125rem" />

        <TextButton
          text="Forgot Password?"
          type="button"
          size="small"
          color="faint"
          onClick={() => {}}
          style={{ width: "100%", color: ColorPalette["gray-300"] }}
        />
      </Box>
    </form>
  );
});

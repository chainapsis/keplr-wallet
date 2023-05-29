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
import { H1, Subtitle4 } from "../../components/typography";
import { Tooltip } from "../../components/tooltip";
import AnimLogo from "../../public/assets/lottie/unlock/logo.json";
import lottie, { AnimationItem } from "lottie-web";
import { GuideBox } from "../../components/guide-box";
import { LoadingIcon } from "../../components/icon";
import { XAxis } from "../../components/axis";
import { autorun } from "mobx";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();

  const [isStartWithMigrating] = useState(() => keyRingStore.isMigrating);
  useEffect(() => {
    // 계정이 많으면 migration이 오래 걸릴 수 있다.
    // 이걸 못 참고 유저가 UI를 끄고 다시 킬수도 있기 때문에
    // migration이 진행 중이라는 것에 대해서 우선적으로 UI를 처리해준다.
    // 근데 이건 view에서만 처리해주고...
    // background와의 통신이 단방향이기 때문에 migration이 끝났을 때 무슨 행동을 취하기가 어렵다.
    // 어쨋든 이런 상황은 거의 발생하지 않기 때문에
    // mobx를 통해서 추적하고 migration이 끝나면 그냥 window를 close한다.
    if (isStartWithMigrating) {
      autorun(() => {
        if (!keyRingStore.isMigrating) {
          window.close();
        }
      });
    }
  }, [isStartWithMigrating, keyRingStore.isMigrating]);

  const interactionInfo = useInteractionInfo(() => {
    interactionStore.rejectAll("unlock");
  });
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const [isMigrationSecondPhase, setIsMigrationSecondPhase] = useState(false);
  // 유저가 enter를 누르고 처리하는 딜레이 동안 키보드를 또 누를수도 있다...
  // 그 경우를 위해서 따로 state를 관리한다.
  const [migrationSecondPhasePassword, setMigrationSecondPhasePassword] =
    useState("");

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

  const animLoading = isLoading || keyRingStore.isMigrating;
  useEffect(() => {
    // 현실적으로는 이 애니메이션은 마이그레이션 과정 중에서만 보이고 그게 의도이다.
    if (animRef.current) {
      if (animLoading) {
        animRef.current.goToAndPlay(0);
      } else {
        // page가 넘어가기 직전에 애니메이션이 멈추지 않도록 약간의 delay를 준다.
        setTimeout(() => {
          animRef.current?.goToAndStop(0);
        }, 50);
      }
    }
  }, [animLoading]);

  const tryUnlock = async (password: string) => {
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

      // 사실 migration이 오류로 실패하면 이미 답이 없는 상황임...
      setIsMigrationSecondPhase(false);
      setMigrationSecondPhasePassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box height="100vh" paddingX="1.5rem">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (isMigrationSecondPhase) {
            // Migration은 enter를 눌러서 진행할 수 없고 명시적으로 버튼을 눌러야한다.
            // 근데 사실 migration 버튼은 type이 button이라 onSubmit이 발생할일은 없음.
            return;
          }

          if (keyRingStore.needMigration) {
            try {
              setIsLoading(true);

              await keyRingStore.checkLegacyKeyRingPassword(password);
              setIsMigrationSecondPhase(true);
              setMigrationSecondPhasePassword(password);

              setError(undefined);
            } catch (e) {
              console.log(e);
              setError(e);
            } finally {
              setIsLoading(false);
            }
          } else {
            await tryUnlock(password);
          }
        }}
      >
        <Box alignX="center">
          <Gutter size="6rem" />

          <div
            ref={animContainerRef}
            style={{
              width: "12rem",
              height: "9.5rem",
            }}
          />
        </Box>

        <ParagraphSection
          needMigration={keyRingStore.needMigration}
          isMigrationSecondPhase={
            isMigrationSecondPhase || keyRingStore.isMigrating
          }
        />

        <BottomFormSection
          password={password}
          setPassword={setPassword}
          error={error}
          setError={setError}
          isMigrationSecondPhase={
            isMigrationSecondPhase || keyRingStore.isMigrating
          }
        />

        {(() => {
          if (isMigrationSecondPhase || keyRingStore.isMigrating) {
            // keyRingStore.isMigrating은 migration을 누르고 UI을 껏다 켰을때 여전히 진행 중일 가능성이 있다.
            // 그러므로 keyRingStore.isMigrating 처리에 우선권이 있어야한다는 점을 주의해야한다.
            return (
              <Box position="relative">
                <Button
                  type="button"
                  text="Start Migration"
                  size="large"
                  disabled={keyRingStore.isMigrating}
                  style={{
                    opacity: keyRingStore.isMigrating ? 0 : 1,
                  }}
                  isLoading={isLoading}
                  onClick={() => {
                    tryUnlock(migrationSecondPhasePassword);
                  }}
                />

                {keyRingStore.isMigrating ? (
                  <Box
                    position="absolute"
                    style={{
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}
                    alignX="center"
                    alignY="center"
                  >
                    <XAxis alignY="center">
                      <Subtitle4 color={ColorPalette["gray-200"]}>
                        Upgrade in progress
                      </Subtitle4>
                      <Gutter size="0.5rem" />
                      <LoadingIcon
                        color={ColorPalette["gray-200"]}
                        width="1.5rem"
                        height="1.5rem"
                      />
                    </XAxis>
                  </Box>
                ) : null}
              </Box>
            );
          }

          return (
            <Button
              type="submit"
              text="Unlock"
              size="large"
              disabled={password.length === 0}
              isLoading={
                isLoading ||
                (() => {
                  if (interactionInfo.interaction) {
                    const interactions = interactionStore.getAllData("unlock");
                    for (const interaction of interactions) {
                      if (
                        interactionStore.isObsoleteInteraction(interaction.id)
                      ) {
                        return true;
                      }
                    }
                  }
                  return false;
                })()
              }
            />
          );
        })()}

        <Gutter size="3.125rem" />

        {!isMigrationSecondPhase && !keyRingStore.isMigrating ? (
          <TextButton
            text="Forgot Password?"
            type="button"
            size="small"
            color="faint"
            onClick={() => {
              browser.tabs.create({
                url: `https://help.keplr.app/faq`,
              });
            }}
            style={{ width: "100%", color: ColorPalette["gray-300"] }}
          />
        ) : null}
      </form>
    </Box>
  );
});

const ParagraphSection: FunctionComponent<{
  needMigration: boolean;
  isMigrationSecondPhase: boolean;
}> = ({ needMigration, isMigrationSecondPhase }) => {
  return (
    <React.Fragment>
      <Box
        minHeight={needMigration ? "5rem" : "3.5rem"}
        alignX="center"
        alignY="center"
        style={{
          textAlign: "center",
        }}
      >
        {needMigration ? (
          <React.Fragment>
            <H1 color={ColorPalette["white"]}>💫 Keplr 2.0 is here!</H1>
            <Gutter size="0.75rem" />
            <Subtitle4
              color={ColorPalette["gray-200"]}
              style={{
                opacity: isMigrationSecondPhase ? 0 : 1,
              }}
            >
              Enter your password to upgrade.
            </Subtitle4>

            {/* 대충 위치를 맞추기 위해서 밑에 대충 뭐를 채운다 */}
            <Gutter size="1.25rem" />
          </React.Fragment>
        ) : (
          <H1 color={ColorPalette["white"]}>Welcome Back</H1>
        )}
      </Box>
    </React.Fragment>
  );
};

const BottomFormSection: FunctionComponent<{
  password: string;
  setPassword: (password: string) => void;
  error: Error | undefined;
  setError: (error: Error | undefined) => void;

  // Migration second phase면 text input을 감추고 guide box를 띄워준다.
  isMigrationSecondPhase: boolean;
}> = ({ password, setPassword, error, setError, isMigrationSecondPhase }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      // Focus the input element at start.
      inputRef.current.focus();
    }
  }, []);

  const [isOnCapsLock, setIsOnCapsLock] = useState(false);

  return (
    <React.Fragment>
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
            content={<div style={{ whiteSpace: "nowrap" }}>CapsLock is on</div>}
            enabled={false}
            isAlwaysOpen={isOnCapsLock}
          >
            <div />
          </Tooltip>
        </Box>

        <Gutter size="0.75rem" />
        <Box position="relative">
          <TextInput
            disabled={isMigrationSecondPhase}
            style={{
              opacity: isMigrationSecondPhase ? 0 : 1,
            }}
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

          {/*
            Second phase에서는 layout을 바꾸지 않으면서 guide box를 띄워야한다...
            그래서 상위에 relative를 주고 text input은 유저에게만 안보이게 만든다음 absolute로 그린다.
           */}
          {isMigrationSecondPhase ? (
            <Box
              position="absolute"
              style={{
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <GuideBox
                color="warning"
                title="Don’t close your browser during update"
                paragraph="Migration for users with many accounts can take up to several minutes."
              />
            </Box>
          ) : null}
        </Box>
      </Box>

      <Gutter size="2.125rem" />
    </React.Fragment>
  );
};

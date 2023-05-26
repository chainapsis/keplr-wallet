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
import { Columns } from "../../components/column";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();
  const [isShowMigration, setIsShowMigration] = useState(
    keyRingStore.isMigrating
  );

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
  }, [isShowMigration]);

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

  useEffect(() => {
    //나중에 true는 needMigration으로 수정
    if (error && keyRingStore.needMigration) {
      console.log("error", error);
      setIsShowMigration(false);
    }
  }, [error]);

  return (
    <React.Fragment>
      {isShowMigration ? (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
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
            <Box
              minHeight="4.375rem"
              alignY="center"
              style={{
                textAlign: "center",
              }}
            >
              <React.Fragment>
                <H1 color={ColorPalette["white"]}> 💫 Keplr 2.0 is here!</H1>
                <Gutter size="0.5rem" />
              </React.Fragment>
            </Box>
            <Gutter size="2rem" />
            <GuideBox
              title="Don’t close your browser during update"
              color="warning"
              paragraph={
                <Box>
                  Migration for users with many accounts can take up to several
                  minutes.
                </Box>
              }
            />
            <Gutter size="2.125rem" />
            {/* 나중에 keyRingStore.isMigrating 으로 변경되야함 */}
            {keyRingStore.isMigrating ? (
              <Columns sum={1} alignY="center" gutter="0.25rem">
                <Subtitle4 color={ColorPalette["gray-200"]}>
                  Upgrade in progress
                </Subtitle4>
                <LoadingIcon />
              </Columns>
            ) : (
              <Button
                type="submit"
                text="Start Migration"
                size="large"
                disabled={password.length === 0}
                style={{ width: "100%" }}
                onClick={async () => {
                  try {
                    setIsLoading(true);

                    await keyRingStore.unlock(password);

                    if (interactionInfo.interaction) {
                      // Approve all waiting interaction for the enabling key ring.
                      const interactions =
                        interactionStore.getAllData("unlock");
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
              />
            )}
          </Box>
        </Box>
      ) : (
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

            //NOTE 나중에  keyRingStore.needMigration으로 변경해야함
            if (keyRingStore.needMigration) {
              setIsShowMigration(true);
            } else {
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

            <Box
              minHeight="4.375rem"
              alignY="center"
              style={{
                textAlign: "center",
              }}
            >
              {/* 나중에 keyRingStore.needMigration으로 변경해야함 */}
              {keyRingStore.needMigration ? (
                <React.Fragment>
                  <H1 color={ColorPalette["white"]}>💫 Keplr 2.0 is here!</H1>
                  <Gutter size="0.5rem" />
                  <Subtitle4 color={ColorPalette["gray-200"]}>
                    Enter your password to upgrade.
                  </Subtitle4>
                </React.Fragment>
              ) : (
                <H1 color={ColorPalette["white"]}>Welcome Back</H1>
              )}
            </Box>

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

              <Gutter size="0.75rem" />
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

            <Gutter size="3.125rem" />

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
          </Box>
        </form>
      )}
    </React.Fragment>
  );
});

import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { TextInput } from "../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button } from "../../components/button";
import { Gutter } from "../../components/gutter";
import { Box } from "../../components/box";
import { TextButton } from "../../components/button-text";
import { ColorPalette } from "../../styles";
import { H1, Subtitle4 } from "../../components/typography";
import { Tooltip } from "../../components/tooltip";
import AnimLogo from "../../public/assets/lottie/unlock/logo.json";
import AnimLogoLight from "../../public/assets/lottie/unlock/logo-light.json";
import lottie, { AnimationItem } from "lottie-web";
import { GuideBox } from "../../components/guide-box";
import { LoadingIcon } from "../../components/icon";
import { XAxis } from "../../components/axis";
import { autorun } from "mobx";
import { FormattedMessage, useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { Buffer } from "buffer/";
import { handleExternalInteractionWithNoProceedNext } from "../../utils";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore, interactionStore } = useStore();
  const intl = useIntl();
  const theme = useTheme();

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
        animationData: theme.mode === "light" ? AnimLogoLight : AnimLogo,
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

  // post message를 쓸때 browser.extension.getViews()를 쓰는데 자기 자신을 제외하는 옵션은 없는 것 같음.
  // 그냥 대충 각 view가 고유의 id를 가상으로 가지게 해서 처리한다.
  const [viewPostMessageId] = useState(() => {
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes).toString("hex");
  });

  const tryUnlock = async (password: string) => {
    try {
      setIsLoading(true);

      await keyRingStore.unlockWithoutSyncStatus(password);

      let closeWindowAfterProceedNext = false;

      // Approve all waiting interaction for the enabling key ring.
      const interactions = interactionStore.getAllData("unlock");
      if (interactions.length > 0) {
        let onlyHasExternal = true;
        for (const interaction of interactions) {
          if (interaction.isInternal) {
            onlyHasExternal = false;
          }
        }
        await interactionStore.approveWithProceedNextV2(
          interactions.map((interaction) => interaction.id),
          {},
          (proceedNext) => {
            if (onlyHasExternal) {
              if (!proceedNext) {
                closeWindowAfterProceedNext = true;
              }
            }
          }
        );
      }

      for (const view of browser.extension.getViews()) {
        view.postMessage(
          {
            type: "__keplr_unlocked_from_view",
            viewId: viewPostMessageId,
          },
          window.location.origin
        );
      }

      if (closeWindowAfterProceedNext) {
        handleExternalInteractionWithNoProceedNext();
      }

      await keyRingStore.refreshKeyRingStatus();

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

  // view가 여러개일때 (예를들어 extension popup의 unlock 창과 외부 요청에 의해 unlock window가 열린 상태일때
  // 한 곳에서 unlock이 완료되면 다른 view에서도 적절하게 처리해준다.
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (e.data?.type === "__keplr_unlocked_from_view") {
        if (e.data.viewId !== viewPostMessageId) {
          let closeWindowAfterProceedNext = false;

          // Approve all waiting interaction for the enabling key ring.
          const interactions = interactionStore.getAllData("unlock");
          if (interactions.length > 0) {
            let onlyHasExternal = true;
            for (const interaction of interactions) {
              if (interaction.isInternal) {
                onlyHasExternal = false;
              }
            }
            await interactionStore.approveWithProceedNextV2(
              interactions.map((interaction) => interaction.id),
              {},
              (proceedNext) => {
                if (onlyHasExternal) {
                  if (!proceedNext) {
                    closeWindowAfterProceedNext = true;
                  }
                }
              }
            );
          }

          if (closeWindowAfterProceedNext) {
            handleExternalInteractionWithNoProceedNext();
          }

          keyRingStore.refreshKeyRingStatus();
        }
      }
    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [interactionStore, keyRingStore, viewPostMessageId]);

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
                  text={intl.formatMessage({
                    id: "page.unlock.star-migration-button",
                  })}
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
                      <Subtitle4
                        color={
                          theme.mode === "light"
                            ? ColorPalette["gray-300"]
                            : ColorPalette["gray-200"]
                        }
                      >
                        <FormattedMessage id="page.unlock.upgrade-in-progress" />
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
              text={intl.formatMessage({ id: "page.unlock.unlock-button" })}
              size="large"
              disabled={password.length === 0}
              isLoading={
                isLoading ||
                (() => {
                  const interactions = interactionStore.getAllData("unlock");
                  for (const interaction of interactions) {
                    if (
                      interactionStore.isObsoleteInteraction(interaction.id)
                    ) {
                      return true;
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
            text={intl.formatMessage({
              id: "page.unlock.forgot-password-button",
            })}
            type="button"
            size="small"
            color="faint"
            onClick={() => {
              browser.tabs.create({
                url: `https://help.keplr.app/faq?tab=3&topic=5`,
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
  const theme = useTheme();

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
            <H1
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-700"]
                  : ColorPalette["white"]
              }
            >
              <FormattedMessage id="page.unlock.paragraph-section.keplr-here" />
            </H1>
            <Gutter size="0.75rem" />
            <Subtitle4
              color={ColorPalette["gray-200"]}
              style={{
                opacity: isMigrationSecondPhase ? 0 : 1,
              }}
            >
              <FormattedMessage id="page.unlock.paragraph-section.enter-password-to-upgrade" />
            </Subtitle4>

            {/* 대충 위치를 맞추기 위해서 밑에 대충 뭐를 채운다 */}
            <Gutter size="1.25rem" />
          </React.Fragment>
        ) : (
          <H1
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["white"]
            }
          >
            <FormattedMessage id="page.unlock.paragraph-section.welcome-back" />
          </H1>
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
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
            content={
              <div style={{ whiteSpace: "nowrap" }}>
                <FormattedMessage id="page.unlock.bottom-section.capslock-tooltip" />
              </div>
            }
            enabled={false}
            isAlwaysOpen={isOnCapsLock}
          >
            <div />
          </Tooltip>
        </Box>

        <Gutter size="0.75rem" />
        <Box position="relative">
          <TextInput
            right={
              <VisibilityIconButton
                isVisible={isPasswordVisible}
                onClick={() => setIsPasswordVisible((prev) => !prev)}
              />
            }
            disabled={isMigrationSecondPhase}
            style={{
              opacity: isMigrationSecondPhase ? 0 : 1,
            }}
            ref={inputRef}
            label={intl.formatMessage({
              id: "page.unlock.bottom-section.password-input-label",
            })}
            placeholder={intl.formatMessage({
              id: "page.unlock.bottom-section.password-input-placeholder",
            })}
            type={isPasswordVisible ? "text" : "password"}
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
            error={
              error
                ? intl.formatMessage({ id: "error.invalid-password" })
                : undefined
            }
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
                title={intl.formatMessage({
                  id: "page.unlock.bottom-section.guide-title",
                })}
                paragraph={intl.formatMessage({
                  id: "page.unlock.bottom-section.guide-paragraph",
                })}
              />
            </Box>
          ) : null}
        </Box>
      </Box>

      <Gutter size="2.125rem" />
    </React.Fragment>
  );
};

const VisibilityIconButton: FunctionComponent<{
  isVisible: boolean;
  onClick: () => void;
}> = ({ isVisible, onClick }) => {
  return (
    <div
      style={{
        width: "1.75rem",
        height: "1.75rem",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {isVisible ? (
        <VisibleIcon width="1.75rem" height="1.75rem" />
      ) : (
        <InvisibleIcon width="1.75rem" height="1.75rem" />
      )}
    </div>
  );
};

const InvisibleIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);

  const fillColor =
    theme.mode === "light"
      ? isHover
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-200"]
      : isHover
      ? ColorPalette["gray-400"]
      : ColorPalette["gray-300"];

  return (
    <div
      style={{ width, height }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0833 6.58203C11.029 6.58203 8.28267 7.8082 6.304 9.3272C5.31233 10.0879 4.49917 10.9325 3.92867 11.7539C3.36867 12.5612 3 13.4082 3 14.1654C3 14.9225 3.36983 15.7695 3.92867 16.5757C4.50033 17.3982 5.31233 18.2429 6.304 19.0024C8.28267 20.5237 11.029 21.7487 14.0833 21.7487C17.1377 21.7487 19.884 20.5225 21.8627 19.0035C22.8543 18.2429 23.6675 17.3982 24.2368 16.5769C24.7968 15.7695 25.1667 14.9225 25.1667 14.1654C25.1667 13.4082 24.7968 12.5612 24.2368 11.755C23.6675 10.9325 22.8543 10.0879 21.8627 9.32836C19.884 7.80703 17.1377 6.58203 14.0833 6.58203ZM9.70833 14.1654C9.70833 13.005 10.1693 11.8922 10.9897 11.0718C11.8102 10.2513 12.923 9.79036 14.0833 9.79036C15.2437 9.79036 16.3565 10.2513 17.1769 11.0718C17.9974 11.8922 18.4583 13.005 18.4583 14.1654C18.4583 15.3257 17.9974 16.4385 17.1769 17.259C16.3565 18.0794 15.2437 18.5404 14.0833 18.5404C12.923 18.5404 11.8102 18.0794 10.9897 17.259C10.1693 16.4385 9.70833 15.3257 9.70833 14.1654Z"
          fill={fillColor}
        />
        <path
          d="M7.0835 6L22.2502 21.1667"
          stroke={theme.mode === "light" ? "#FEFEFE" : "#09090A"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.9165 7.16602L20.4998 21.7493"
          stroke={fillColor}
          strokeWidth="2.33333"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const VisibleIcon: FunctionComponent<{
  width: string;
  height: string;
}> = ({ width, height }) => {
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);

  const fillColor =
    theme.mode === "light"
      ? isHover
        ? ColorPalette["gray-100"]
        : ColorPalette["gray-200"]
      : isHover
      ? ColorPalette["gray-400"]
      : ColorPalette["gray-300"];

  return (
    <div
      style={{ width, height }}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
      >
        <path
          d="M14.0835 10.959C13.3873 10.959 12.7196 11.2355 12.2273 11.7278C11.7351 12.2201 11.4585 12.8878 11.4585 13.584C11.4585 14.2802 11.7351 14.9479 12.2273 15.4401C12.7196 15.9324 13.3873 16.209 14.0835 16.209C14.7797 16.209 15.4474 15.9324 15.9397 15.4401C16.4319 14.9479 16.7085 14.2802 16.7085 13.584C16.7085 12.8878 16.4319 12.2201 15.9397 11.7278C15.4474 11.2355 14.7797 10.959 14.0835 10.959Z"
          fill={fillColor}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.0833 6C11.029 6 8.28267 7.22617 6.304 8.74517C5.31233 9.50583 4.49917 10.3505 3.92867 11.1718C3.36867 11.9792 3 12.8262 3 13.5833C3 14.3405 3.36983 15.1875 3.92867 15.9937C4.50033 16.8162 5.31233 17.6608 6.304 18.4203C8.28267 19.9417 11.029 21.1667 14.0833 21.1667C17.1377 21.1667 19.884 19.9405 21.8627 18.4215C22.8543 17.6608 23.6675 16.8162 24.2368 15.9948C24.7968 15.1875 25.1667 14.3405 25.1667 13.5833C25.1667 12.8262 24.7968 11.9792 24.2368 11.173C23.6675 10.3505 22.8543 9.50583 21.8627 8.74633C19.884 7.225 17.1377 6 14.0833 6ZM9.70833 13.5833C9.70833 12.423 10.1693 11.3102 10.9897 10.4897C11.8102 9.66927 12.923 9.20833 14.0833 9.20833C15.2437 9.20833 16.3565 9.66927 17.1769 10.4897C17.9974 11.3102 18.4583 12.423 18.4583 13.5833C18.4583 14.7437 17.9974 15.8565 17.1769 16.6769C16.3565 17.4974 15.2437 17.9583 14.0833 17.9583C12.923 17.9583 11.8102 17.4974 10.9897 16.6769C10.1693 15.8565 9.70833 14.7437 9.70833 13.5833Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};

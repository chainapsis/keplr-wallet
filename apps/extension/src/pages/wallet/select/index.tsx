import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { observer } from "mobx-react-lite";
import { KeyInfo } from "@keplr-wallet/background";
import { useStore } from "../../../stores";
import { BackButton } from "../../../layouts/header/components";
import { HeaderLayout } from "../../../layouts/header";
import { Box } from "../../../components/box";
import {
  Body2,
  Subtitle2,
  Subtitle3,
  Subtitle4,
} from "../../../components/typography";
import { XAxis, YAxis } from "../../../components/axis";
import { ColorPalette } from "../../../styles";
import { Gutter } from "../../../components/gutter";
import { Stack } from "../../../components/stack";
import { Column, Columns } from "../../../components/column";
import { useNavigate } from "react-router";
import { EllipsisIcon } from "../../../components/icon";
import { Button } from "../../../components/button";
import styled, { useTheme } from "styled-components";
import { FloatingDropdown } from "../../../components/dropdown";
import { FormattedMessage, useIntl } from "react-intl";
import { App, AppCoinType } from "@keplr-wallet/ledger-cosmos";
import { SearchTextInput } from "../../../components/input";
import { SpringValue, animated, to, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../../styles/spring";
import { useGlobalSimpleBar } from "../../../hooks/global-simplebar";
import { EmptyView } from "../../../components/empty-view";
import { dispatchGlobalEventExceptSelf } from "../../../utils/global-events";
import { useSearchKeyInfos } from "../../../hooks/use-search-key-infos";
import {
  KEYRING_SORT_KEY,
  useKeyringSort,
  useGetKeyInfosSeparatedByType,
} from "../../../hooks/use-key-ring-sort";

const AnimatedBox = animated(Box);

const Styles = {
  Container: styled(Stack)`
    padding: 0.75rem;
  `,
  AddButton: styled.div`
    position: absolute;
    top: 8.125rem;
    right: 0.75rem;
  `,
  Content: styled(Stack)`
    margin-top: 1.125rem;
  `,
};

export const WalletSelectPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();
  const intl = useIntl();

  const { searchText, setSearchText, searchedKeyInfos } = useSearchKeyInfos();

  const keyInfos = searchedKeyInfos ?? keyRingStore.keyInfos;

  const {
    mnemonicKeys,
    socialPrivateKeyInfoByType,
    privateKeyInfos,
    ledgerKeys,
    keystoneKeys,
    unknownKeys,
  } = useGetKeyInfosSeparatedByType(keyInfos);

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.wallet.title" })}
      left={<BackButton />}
    >
      <Styles.Container>
        <Box marginBottom="0.25rem">
          <SearchTextInput
            value={searchText}
            placeholder={intl.formatMessage({
              id: "page.wallet.input.search.placeholder",
            })}
            onChange={(e) => {
              e.preventDefault();

              setSearchText(e.target.value);
            }}
          />
        </Box>
        <Styles.AddButton>
          <Button
            text={intl.formatMessage({ id: "page.wallet.add-wallet-button" })}
            size="extraSmall"
            color="secondary"
            onClick={async () => {
              await browser.tabs.create({
                url: "/register.html",
              });
            }}
          />
        </Styles.AddButton>

        {searchText.trim().length > 0 && keyInfos.length === 0 ? (
          <Box marginTop="6rem">
            <EmptyView>
              <Stack alignX="center" gutter="0.1rem">
                <Subtitle3 style={{ fontWeight: 700 }}>
                  <FormattedMessage id="page.main.spendable.search-empty-view-title" />
                </Subtitle3>
                <Subtitle3>
                  <FormattedMessage id="page.main.spendable.search-empty-view-paragraph" />
                </Subtitle3>
              </Stack>
            </EmptyView>
          </Box>
        ) : (
          <Styles.Content gutter="1.25rem">
            {mnemonicKeys.length > 0 ? (
              <KeyInfoList
                sortKey={KEYRING_SORT_KEY.MNEMONIC}
                title={intl.formatMessage({
                  id: "page.wallet.recovery-phrase-title",
                })}
                keyInfos={mnemonicKeys}
              />
            ) : null}

            {socialPrivateKeyInfoByType.map((info) => {
              return (
                <KeyInfoList
                  key={info.type}
                  sortKey={`sort-social-${info.type}`}
                  title={intl.formatMessage(
                    { id: "page.wallet.connect-with-social-account-title" },
                    {
                      social:
                        info.type.length > 0
                          ? info.type[0].toUpperCase() + info.type.slice(1)
                          : info.type,
                    }
                  )}
                  keyInfos={info.keyInfos}
                />
              );
            })}

            {privateKeyInfos.length > 0 ? (
              <KeyInfoList
                sortKey={KEYRING_SORT_KEY.PRIVATE_KEY}
                title={intl.formatMessage({
                  id: "page.wallet.private-key-title",
                })}
                keyInfos={privateKeyInfos}
              />
            ) : null}

            {ledgerKeys.length > 0 ? (
              <KeyInfoList
                sortKey={KEYRING_SORT_KEY.LEDGER}
                title={intl.formatMessage({ id: "page.wallet.ledger-title" })}
                keyInfos={ledgerKeys}
              />
            ) : null}

            {keystoneKeys.length > 0 ? (
              <KeyInfoList
                sortKey={KEYRING_SORT_KEY.KEYSTONE}
                title="Keystone"
                keyInfos={keystoneKeys}
              />
            ) : null}

            {unknownKeys.length > 0 ? (
              <KeyInfoList
                sortKey={KEYRING_SORT_KEY.UNKNOWN}
                title={intl.formatMessage({ id: "page.wallet.unknown-title" })}
                keyInfos={unknownKeys}
              />
            ) : null}
          </Styles.Content>
        )}
      </Styles.Container>
    </HeaderLayout>
  );
});

const KeyInfoList: FunctionComponent<{
  sortKey: string;
  title: string;
  keyInfos: KeyInfo[];
}> = observer(({ sortKey, title, keyInfos }) => {
  const { uiConfigStore } = useStore();

  const globalSimpleBar = useGlobalSimpleBar();
  const scrollAnim = useSpringValue(0, {
    config: defaultSpringConfig,
  });

  const { sortedKeyInfos } = useKeyringSort(sortKey, keyInfos);

  const separatorPx = 8;
  const [drapMap, _setDragMap] = useState(
    new Map<
      string,
      {
        delta: number;
        y: SpringValue<number>;
      }
    >()
  );
  const [refMap] = useState(
    new Map<
      string,
      {
        ref: React.RefObject<HTMLDivElement>;
      }
    >()
  );

  const getDrag = (id: string) => {
    const drag = drapMap.get(id);
    if (!drag) {
      const y = new SpringValue(0, {
        config: defaultSpringConfig,
      });
      const delta = 0;
      drapMap.set(id, { y, delta });
      return { y, delta };
    }
    return drag;
  };

  const clearDragMap = () => {
    _setDragMap(new Map());
  };

  const getRef = (id: string) => {
    const ref = refMap.get(id);
    if (!ref) {
      const ref = React.createRef<HTMLDivElement>();
      refMap.set(id, { ref });
      return ref;
    }
    return ref.ref;
  };

  const [selected, setSelected] = useState<
    | {
        id: string;
        initialY: number;
        initialIndex: number;
        prevOrder: string[];
        newOrder: string[];
        isReleased: boolean;
      }
    | undefined
  >(undefined);

  const scrollDyRef = useRef(0);
  const prevDy = useRef(0);
  const prevScrollDy = useRef(0);
  const scrollDeltaDyRef = useRef(0);
  const refDragDelta = useRef(0);

  // 드래그 중에 가장 밑으로 내려가면 해당 아이템이 기존의 컨테이너 하이트를 넘으면서 scroll height를 늘려버린다.
  // 이 부분을 처리하기 위해서 드래그가 시작되는 시점의 scroll height를 기록한다.
  const simpleBarScrollHeightRef = useRef(0);

  // 마우스를 놓은 후 마지막 순간의 트랜지션 중에
  // 드래그가 실행되는 경우가 있을 수 있다
  // 이 경우는 처리하기가 너무 힘들기 때문에 그냥 막아버린다.
  const refIsDuringFinish = useRef(false);

  const handleMouseMove = (dy: number) => {
    if (refIsDuringFinish.current) {
      return;
    }

    if (selected && selected.initialIndex >= 0) {
      dy += scrollDeltaDyRef.current;

      const drag = getDrag(selected.id);
      drag.y.set(dy);

      const newOrder = selected.newOrder.slice();
      if (dy - prevDy.current < 0) {
        let selfIndex = newOrder.findIndex((o) => o === selected.id);
        let lowerIndex = selfIndex - 1;
        while (
          selfIndex >= 0 &&
          selfIndex < newOrder.length &&
          lowerIndex >= 0 &&
          lowerIndex < newOrder.length
        ) {
          const selfRef = getRef(newOrder[selfIndex]);
          const lowerRef = getRef(newOrder[lowerIndex]);
          const lowerId = newOrder[lowerIndex];

          if (selfRef.current && lowerRef.current) {
            const selfRect = selfRef.current.getBoundingClientRect();
            const selfHeight = selfRect.height;
            const lowerRect = lowerRef.current.getBoundingClientRect();
            const lowerHeight = lowerRect.height;

            if (dy + refDragDelta.current < -(selfHeight + separatorPx) / 2) {
              const lowerDrag = getDrag(lowerId);
              lowerDrag.y.start(lowerDrag.delta + selfHeight + separatorPx);
              lowerDrag.delta += selfHeight + separatorPx;

              refDragDelta.current += lowerHeight + separatorPx;
              [newOrder[selfIndex], newOrder[lowerIndex]] = [
                newOrder[lowerIndex],
                newOrder[selfIndex],
              ];

              selfIndex--;
              lowerIndex--;
            } else {
              break;
            }
          } else {
            break;
          }
        }
      } else if (dy - prevDy.current > 0) {
        let selfIndex = newOrder.findIndex((o) => o === selected.id);
        let upperIndex = selfIndex + 1;
        while (
          selfIndex >= 0 &&
          selfIndex < newOrder.length &&
          upperIndex >= 0 &&
          upperIndex < newOrder.length
        ) {
          const selfRef = getRef(newOrder[selfIndex]);
          const upperRef = getRef(newOrder[upperIndex]);
          const upperId = newOrder[upperIndex];

          if (selfRef.current && upperRef.current) {
            const selfRect = selfRef.current.getBoundingClientRect();
            const selfHeight = selfRect.height;
            const upperRect = upperRef.current.getBoundingClientRect();
            const upperHeight = upperRect.height;

            if (dy + refDragDelta.current > (selfHeight + separatorPx) / 2) {
              const upperDrag = getDrag(upperId);
              upperDrag.y.start(upperDrag.delta - (selfHeight + separatorPx));
              upperDrag.delta += -(selfHeight + separatorPx);

              refDragDelta.current -= upperHeight + separatorPx;
              [newOrder[selfIndex], newOrder[upperIndex]] = [
                newOrder[upperIndex],
                newOrder[selfIndex],
              ];

              selfIndex++;
              upperIndex++;
            } else {
              break;
            }
          } else {
            break;
          }
        }
      }

      setSelected({
        ...selected,
        newOrder,
      });

      prevDy.current = dy;
    }
  };

  return (
    <Box
      onMouseMove={(e) => {
        e.preventDefault();

        if (selected) {
          const dy = e.clientY - selected.initialY;
          scrollDyRef.current = dy;

          handleMouseMove(dy);

          if (!selected.isReleased) {
            if (dy - prevScrollDy.current > 2) {
              if (document.body.scrollHeight - e.clientY < 100) {
                const simpleBarScrollRef =
                  globalSimpleBar.ref.current?.getScrollElement();
                if (
                  simpleBarScrollHeightRef.current > 0 &&
                  simpleBarScrollRef &&
                  !scrollAnim.isAnimating
                ) {
                  scrollAnim.start(
                    Math.min(
                      simpleBarScrollRef.scrollTop + 200,
                      simpleBarScrollHeightRef.current -
                        simpleBarScrollRef.clientHeight
                    ),
                    {
                      from: simpleBarScrollRef.scrollTop,
                      onChange: (anim: any) => {
                        // XXX: 이거 실제 파라미터랑 타입스크립트 인터페이스가 다르다...???
                        const v = anim.value != null ? anim.value : anim;
                        if (typeof v === "number") {
                          const prev = simpleBarScrollRef.scrollTop;
                          simpleBarScrollRef.scrollTop = v;

                          const delta = v - prev;
                          scrollDeltaDyRef.current += delta;
                        }
                      },
                    }
                  );
                }
              }
            } else if (dy - prevScrollDy.current < -2) {
              if (e.clientY < 100) {
                const simpleBarScrollRef =
                  globalSimpleBar.ref.current?.getScrollElement();
                if (
                  simpleBarScrollHeightRef.current > 0 &&
                  simpleBarScrollRef &&
                  !scrollAnim.isAnimating
                ) {
                  scrollAnim.start(
                    Math.max(simpleBarScrollRef.scrollTop - 200, 0),
                    {
                      from: simpleBarScrollRef.scrollTop,
                      onChange: (anim: any) => {
                        // XXX: 이거 실제 파라미터랑 타입스크립트 인터페이스가 다르다...???
                        const v = anim.value != null ? anim.value : anim;
                        if (typeof v === "number") {
                          const prev = simpleBarScrollRef.scrollTop;
                          simpleBarScrollRef.scrollTop = v;

                          const delta = v - prev;
                          scrollDeltaDyRef.current += delta;
                        }
                      },
                    }
                  );
                }
              }
            }
          }

          prevScrollDy.current = dy;
        }
      }}
      onMouseUp={(e) => {
        e.preventDefault();

        if (refIsDuringFinish.current) {
          return;
        }

        if (selected) {
          refIsDuringFinish.current = true;

          const onLastTransitionEnd = (newOrder: string[]) => {
            setSelected(undefined);
            scrollDyRef.current = 0;
            prevDy.current = 0;
            prevScrollDy.current = 0;
            scrollDeltaDyRef.current = 0;
            refDragDelta.current = 0;
            simpleBarScrollHeightRef.current = 0;

            clearDragMap();
            refIsDuringFinish.current = false;

            uiConfigStore.selectWalletConfig.setKeyToSortVaultIds(
              sortKey,
              newOrder
            );
          };

          const drag = getDrag(selected.id);
          if (selected.initialIndex >= 0) {
            const newIndex = selected.newOrder.findIndex(
              (o) => o === selected.id
            );
            if (newIndex >= 0) {
              let prevYPosition = 0;
              for (let i = 0; i < selected.initialIndex; i++) {
                const ref = getRef(selected.prevOrder[i]);
                if (ref.current) {
                  prevYPosition += ref.current.getBoundingClientRect().height;
                  prevYPosition += separatorPx;
                }
              }

              let newYPosition = 0;
              for (let i = 0; i < newIndex; i++) {
                const ref = getRef(selected.newOrder[i]);
                if (ref.current) {
                  newYPosition += ref.current.getBoundingClientRect().height;
                  newYPosition += separatorPx;
                }
              }
              setSelected((selected) => {
                if (!selected) {
                  return;
                }

                return {
                  ...selected,
                  isReleased: true,
                };
              });
              drag.y.start(newYPosition - prevYPosition).then(() => {
                onLastTransitionEnd(selected.newOrder);
              });
            } else {
              // can't happen. But, just in case.
              setSelected((selected) => {
                if (!selected) {
                  return;
                }

                return {
                  ...selected,
                  isReleased: true,
                };
              });
              drag.y.start(0).then(() => {
                onLastTransitionEnd(selected.newOrder);
              });
            }
          } else {
            // can't happen. But, just in case.
            setSelected((selected) => {
              if (!selected) {
                return;
              }

              return {
                ...selected,
                isReleased: true,
              };
            });
            drag.y.start(0).then(() => {
              onLastTransitionEnd(selected.newOrder);
            });
          }
        }
      }}
    >
      <YAxis>
        <Subtitle4
          color={ColorPalette["gray-300"]}
          style={{
            paddingLeft: "0.5rem",
          }}
        >
          {title}
        </Subtitle4>
        <Gutter size="0.5rem" />
        {sortedKeyInfos.map((keyInfo, i) => {
          const drag = getDrag(keyInfo.id);
          const ref = getRef(keyInfo.id);

          return (
            <React.Fragment key={keyInfo.id}>
              <KeyringItem
                ref={ref}
                keyInfo={keyInfo}
                isDragSelected={selected?.id === keyInfo.id}
                isDragSelectedButReleased={
                  selected?.id === keyInfo.id && selected.isReleased
                }
                onDragMouseDown={(e) => {
                  e.preventDefault();

                  if (!selected) {
                    scrollDyRef.current = 0;
                    prevDy.current = 0;
                    prevScrollDy.current = 0;
                    scrollDeltaDyRef.current = 0;
                    refDragDelta.current = 0;
                    if (globalSimpleBar.ref.current) {
                      const scrollElement =
                        globalSimpleBar.ref.current.getScrollElement();
                      if (scrollElement) {
                        simpleBarScrollHeightRef.current =
                          scrollElement.scrollHeight;
                      }
                    }
                    setSelected({
                      id: keyInfo.id,
                      initialY: e.clientY,
                      initialIndex: sortedKeyInfos.findIndex(
                        (k) => k.id === keyInfo.id
                      ),
                      prevOrder: sortedKeyInfos.map((k) => k.id),
                      newOrder: sortedKeyInfos.map((k) => k.id),
                      isReleased: false,
                    });
                  }
                }}
                dragY={drag.y}
              />
              {sortedKeyInfos.length - 1 !== i ? (
                <Gutter size={`${separatorPx}px`} />
              ) : null}
            </React.Fragment>
          );
        })}
      </YAxis>
    </Box>
  );
});

const KeyringItem = observer<
  {
    keyInfo: KeyInfo;

    isDragSelected: boolean;
    isDragSelectedButReleased: boolean;
    onDragMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    dragY: SpringValue<number>;
  },
  HTMLDivElement
>(
  (
    {
      keyInfo,
      isDragSelected,
      isDragSelectedButReleased,
      onDragMouseDown,
      dragY,
    },
    ref
  ) => {
    const { chainStore, keyRingStore } = useStore();
    const intl = useIntl();
    const theme = useTheme();

    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const paragraph = useMemo(() => {
      if (keyInfo.insensitive["bip44Path"]) {
        const bip44Path = keyInfo.insensitive["bip44Path"] as any;

        // -1 means it can be multiple coin type.
        let coinType = -1;
        if (keyInfo.type === "ledger") {
          const ledgerAppCandidate: (
            | App
            | "Ethereum"
            | "Starknet"
            | "Bitcoin"
            | "Bitcoin Test"
          )[] = [
            "Cosmos",
            "Terra",
            "Secret",
            "THORChain",
            "Ethereum",
            "Starknet",
            "Bitcoin",
            "Bitcoin Test",
          ];

          const app: (
            | App
            | "Ethereum"
            | "Starknet"
            | "Bitcoin"
            | "Bitcoin Test"
          )[] = [];
          for (const ledgerApp of ledgerAppCandidate) {
            if (keyInfo.insensitive[ledgerApp] != null) {
              app.push(ledgerApp);
            }
          }

          if (app.length === 0 || app.length >= 2) {
            coinType = -1;
          } else if (app[0] === "Ethereum") {
            coinType = 60;
          } else if (app[0] === "Starknet") {
            coinType = 9004;
          } else if (app[0] === "Bitcoin") {
            coinType = 0;
          } else if (app[0] === "Bitcoin Test") {
            coinType = 1;
          } else {
            const c = AppCoinType[app[0]];
            if (c != null) {
              coinType = c;
            } else {
              coinType = -1;
            }
          }

          if (
            app.length === 1 &&
            app.includes("Cosmos") &&
            bip44Path.account === 0 &&
            bip44Path.change === 0 &&
            bip44Path.addressIndex === 0
          ) {
            return;
          }

          return `m/-'/${coinType >= 0 ? coinType : "-"}'/${
            bip44Path.account
          }'/${bip44Path.change}/${bip44Path.addressIndex}${(() => {
            if (app.length === 1) {
              if (
                app[0] !== "Cosmos" &&
                app[0] !== "Ethereum" &&
                app[0] !== "Starknet" &&
                app[0] !== "Bitcoin" &&
                app[0] !== "Bitcoin Test"
              ) {
                return ` ${intl.formatMessage({
                  id: `page.wallet.keyring-item.bip44-path-${app[0]}-text`,
                })}`;
              }
            }

            return "";
          })()}`;
        }

        if (
          bip44Path.account === 0 &&
          bip44Path.change === 0 &&
          bip44Path.addressIndex === 0
        ) {
          return;
        }

        return `m/-'/${coinType >= 0 ? coinType : "-"}'/${bip44Path.account}'/${
          bip44Path.change
        }/${bip44Path.addressIndex}`;
      }

      if (
        keyInfo.type === "private-key" &&
        typeof keyInfo.insensitive === "object" &&
        keyInfo.insensitive["keyRingMeta"] &&
        typeof keyInfo.insensitive["keyRingMeta"] === "object" &&
        keyInfo.insensitive["keyRingMeta"]["web3Auth"] &&
        typeof keyInfo.insensitive["keyRingMeta"]["web3Auth"] === "object"
      ) {
        const web3Auth = keyInfo.insensitive["keyRingMeta"]["web3Auth"];
        if (
          web3Auth["type"] &&
          web3Auth["email"] &&
          typeof web3Auth["type"] === "string" &&
          typeof web3Auth["email"] === "string"
        ) {
          return web3Auth["email"];
        }
      }
    }, [intl, keyInfo.insensitive, keyInfo.type]);

    const dropdownItems = (() => {
      const defaults = [
        {
          key: "change-wallet-name",
          label: intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.change-wallet-name-title",
          }),
          onSelect: () => navigate(`/wallet/change-name?id=${keyInfo.id}`),
        },
        {
          key: "delete-wallet",
          label: intl.formatMessage({
            id: "page.wallet.keyring-item.dropdown.delete-wallet-title",
          }),
          onSelect: () => navigate(`/wallet/delete?id=${keyInfo.id}`),
        },
      ];

      switch (keyInfo.type) {
        case "mnemonic": {
          defaults.unshift({
            key: "view-recovery-phrase",
            label: intl.formatMessage({
              id: "page.wallet.keyring-item.dropdown.view-recovery-path-title",
            }),
            onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
          });
          break;
        }
        case "private-key": {
          defaults.unshift({
            key: "view-recovery-phrase",
            label: intl.formatMessage({
              id: "page.wallet.keyring-item.dropdown.view-private-key-title",
            }),
            onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
          });
          break;
        }
      }

      return defaults;
    })();

    const isSelected = keyRingStore.selectedKeyInfo?.id === keyInfo.id;

    const scale = useSpringValue(1, {
      config: defaultSpringConfig,
    });

    useEffect(() => {
      if (isDragSelected && !isDragSelectedButReleased) {
        scale.start(1.02);
      } else {
        scale.start(1);
      }
    }, [scale, isDragSelected, isDragSelectedButReleased]);

    const [isContainerHover, setIsContainerHover] = useState(false);

    return (
      <div ref={ref}>
        <AnimatedBox
          position="relative"
          zIndex={
            // 아마도 css transform의 문제인지 menu가 나타날때 따로 zIndex를 설정해주지 않으면
            // 같은 zIndex라도 밑의 item에 의해서 menu가 짤린다.
            // 이 문제 때문에 menu가 open된 상태에서는 따로 zIndex를 준다.
            isMenuOpen
              ? 1
              : to([isDragSelected, dragY], (isDragSelected, y) => {
                  return isDragSelected
                    ? 100
                    : Math.abs(y as number) <= 1
                    ? undefined
                    : 10;
                })
          }
          minHeight="4.625rem"
          backgroundColor={(() => {
            if (
              (!isSelected && isContainerHover) ||
              (isDragSelected && !isDragSelectedButReleased)
            ) {
              return theme.mode === "light"
                ? ColorPalette["gray-50"]
                : ColorPalette["gray-550"];
            }

            return theme.mode === "light"
              ? ColorPalette["gray-10"]
              : ColorPalette["gray-600"];
          })()}
          onHoverStateChange={(hover) => {
            setIsContainerHover(hover);
          }}
          borderRadius="0.375rem"
          alignY="center"
          cursor={!isSelected ? "pointer" : undefined}
          onClick={async () => {
            if (isSelected) {
              return;
            }

            await keyRingStore.selectKeyRing(keyInfo.id);
            await chainStore.waitSyncedEnabledChains();

            dispatchGlobalEventExceptSelf("keplr_keyring_changed");

            navigate(-1);
          }}
          style={{
            border: isSelected
              ? `1px solid ${
                  theme.mode === "light"
                    ? ColorPalette["blue-400"]
                    : ColorPalette["white"]
                }`
              : undefined,
            transform: to([dragY, scale], (y, scale) => {
              return `scale(${scale}) translate(0px, ${y}px)`;
            }),
          }}
        >
          <Columns sum={1} alignY="center">
            <Box
              width="2.375rem"
              height="4.625rem"
              alignX="center"
              alignY="center"
              cursor={
                isDragSelected && !isDragSelectedButReleased
                  ? "grabbing"
                  : "grab"
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.preventDefault();

                onDragMouseDown(e);
              }}
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-300"]
              }
              hover={{
                color:
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-400"],
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                stroke="none"
                viewBox="0 0 24 24"
              >
                <rect width="14" height="3" x="5" y="7.5" rx="1.5" />
                <rect width="14" height="3" x="5" y="13.5" rx="1.5" />
              </svg>
            </Box>
            <YAxis>
              <XAxis alignY="center">
                <Subtitle2
                  style={{
                    color:
                      theme.mode === "light"
                        ? ColorPalette["gray-700"]
                        : ColorPalette["gray-10"],
                  }}
                >
                  {keyInfo.name}
                </Subtitle2>
              </XAxis>
              {paragraph ? (
                <React.Fragment>
                  <Gutter size="0.375rem" />
                  <Body2
                    style={{
                      color: ColorPalette["gray-300"],
                    }}
                  >
                    {paragraph}
                  </Body2>
                </React.Fragment>
              ) : null}
            </YAxis>
            <Column weight={1} />
            <XAxis alignY="center">
              <Box
                cursor="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FloatingDropdown
                  isOpen={isMenuOpen}
                  close={() => setIsMenuOpen(false)}
                  items={dropdownItems}
                >
                  <Box
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ color: ColorPalette["gray-10"] }}
                    paddingRight="1rem"
                  >
                    <EllipsisIcon
                      width="1.5rem"
                      height="1.5rem"
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-200"]
                          : ColorPalette["gray-10"]
                      }
                    />
                  </Box>
                </FloatingDropdown>
              </Box>
            </XAxis>
          </Columns>
        </AnimatedBox>
      </div>
    );
  },
  {
    forwardRef: true,
  }
);

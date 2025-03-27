import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { useTheme } from "styled-components";
import { ColorPalette } from "../../styles";
import {
  FixedWidthSceneTransition,
  SceneTransitionRef,
} from "../../components/transition";
import { RegisterIntroScene } from "./intro";
import { NewMnemonicScene } from "./new-mnemonic";
import { Box } from "../../components/box";
import { VerifyMnemonicScene } from "./verify-mnemonic";
import { RecoverMnemonicScene } from "./recover-mnemonic";
import { RegisterIntroNewUserScene } from "./intro-new-user";
import {
  RegisterHeader,
  RegisterHeaderProvider,
  useRegisterHeaderContext,
} from "./components/header";
import { RegisterIntroExistingUserScene } from "./intro-existing-user";
import { RegisterNamePasswordScene } from "./name-password";
import { ConnectHardwareWalletScene } from "./connect-hardware";
import { ConnectLedgerScene } from "./connect-ledger";
import { RegisterNamePasswordHardwareScene } from "./name-password-hardware";
import { FinalizeKeyScene } from "./finalize-key";
import { EnableChainsScene } from "./enable-chains";
import { SelectDerivationPathScene } from "./select-derivation-path";
import { useStore } from "../../stores";
import { useSearchParams } from "react-router-dom";
import * as KeplrWalletPrivate from "keplr-wallet-private";
import { BackUpPrivateKeyScene } from "./back-up-private-key";
import {
  ConnectKeystoneQRScene,
  ConnectKeystoneUSBScene,
} from "./connect-keystone";
import { ScanKeystoneScene } from "./connect-keystone/scan";

const Container = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const RegisterPage: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore } = useStore();

  const isReady = useMemo(() => {
    // state 변화를 다 다루기 힘들기 때문에 미리 초기화 되어있어야만 하는 store들이 있다.
    // 매우 빠르게 초기화가 완료되기 때문에 유저는 이를 인지하기 어렵다.
    if (chainStore.isInitializing) {
      return false;
    }

    if (!keyRingStore.isInitialized) {
      return false;
    }

    if (keyRingStore.status === "locked") {
      // 잠겨있으면 애초에 먼가 잘못된거고 유저가 이상한 경로로 접근한 것이다...
      // 처리할 방법이 없으니 그냥 끈다.
      window.close();
    }

    return true;
  }, [
    chainStore.isInitializing,
    keyRingStore.isInitialized,
    keyRingStore.status,
  ]);

  // 여러번 실행될 가능성이 있는지 모르겠지만... 혹시나 해서 함
  const intervalOnce = useRef(false);
  useEffect(() => {
    if (isReady && !intervalOnce.current) {
      intervalOnce.current = true;
      setInterval(() => {
        // 위와같은 이유로 locked 상태에서는 어차피 아무것도 처리를 못한다.
        // 그러니 그냥 끈다.
        keyRingStore.fetchKeyRingStatus().then((status) => {
          if (status === "locked") {
            window.close();
          }
        });
      }, 5000);
    }
  }, [isReady, keyRingStore]);

  return <Container>{isReady ? <RegisterPageImpl /> : null}</Container>;
});

const RegisterPageImpl: FunctionComponent = observer(() => {
  const { chainStore } = useStore();

  const sceneRef = useRef<SceneTransitionRef | null>(null);
  const theme = useTheme();

  const [searchParams] = useSearchParams();

  const [initials] = useState(() => {
    const route = searchParams.get("route");
    const vaultId = searchParams.get("vaultId");
    const skipWelcome = searchParams.get("skipWelcome") === "true";
    const fallbackStarknetLedgerApp =
      searchParams.get("fallbackStarknetLedgerApp") === "true";
    const fallbackEthereumLedgerApp =
      searchParams.get("fallbackEthereumLedgerApp") === "true";

    if (vaultId) {
      // 이 시점에서 chainStore가 초기화 되어있는게 보장된다.
      if (chainStore.lastSyncedEnabledChainsVaultId !== vaultId) {
        // 잘못된 vaultId로 접근한 것이다.
        // 유저가 manage chains를 통해서 들어온 후에 계정을 바꾸고 이 페이지를 새로고침하면 발생할 수 있는데
        // 이 경우에는 그냥 끈다.
        // 구조상 처리하기가 너무 빡세진다.
        window.close();
      }
    }

    if (route === "enable-chains") {
      const initialSearchValue = searchParams.get("initialSearchValue");

      return {
        header: {
          // TODO: ...
          mode: "intro" as const,
        },
        scene: {
          name: "enable-chains",
          props: {
            vaultId,
            stepPrevious: -1,
            stepTotal: 0,
            skipWelcome,
            initialSearchValue,
            fallbackStarknetLedgerApp,
            fallbackEthereumLedgerApp,
          },
        },
      };
    }

    const chainIds = searchParams.get("chainIds");
    if (route === "select-derivation-path" && chainIds) {
      return {
        header: {
          // TODO: ...
          mode: "intro" as const,
        },
        scene: {
          name: "select-derivation-path",
          props: {
            vaultId,
            chainIds: chainIds.split(",").map((chainId) => chainId.trim()),
            totalCount: chainIds.split(",").length,
            skipWelcome,
          },
        },
      };
    }

    const ledgerApp = searchParams.get("ledgerApp");
    const account = searchParams.get("account");
    const change = searchParams.get("change");
    const addressIndex = searchParams.get("addressIndex");
    if (
      route === "connect-ledger" &&
      (ledgerApp === "Starknet" || ledgerApp === "Ethereum")
    ) {
      return {
        header: {
          mode: "direct" as const,
        },
        scene: {
          name: "connect-ledger",
          props: {
            name: "",
            password: "",
            app: ledgerApp,
            bip44Path: {
              account,
              change,
              addressIndex,
            },
            appendModeInfo: {
              vaultId,
              // 이더리움 렛저 앱을 연결하면 이더리움 메인넷을 자동으로 enable 하고
              // 스타크넷 렛저 앱을 연결하면 스타크넷 메인넷을 자동으로 enable 한다.
              afterEnableChains: [
                ledgerApp === "Ethereum" ? "eip155:1" : "starknet:SN_MAIN",
              ],
            },
          },
        },
      };
    }

    return {
      header: {
        mode: "intro" as const,
      },
      scene: {
        name: "intro",
      },
    };
  });

  const headerContext = useRegisterHeaderContext(initials.header);

  return (
    <RegisterHeaderProvider {...headerContext}>
      <RegisterHeader sceneRef={sceneRef} />
      <Box
        position="relative"
        marginX="auto"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        borderRadius="1.5rem"
        style={{
          boxShadow:
            theme.mode === "light"
              ? "0px 1px 4px 0px rgba(43, 39, 55, 0.10)"
              : "none",
        }}
      >
        <FixedWidthSceneTransition
          ref={sceneRef}
          scenes={[
            {
              name: "intro",
              element: RegisterIntroScene,
              width: "31rem",
            },
            {
              name: "new-user",
              element: RegisterIntroNewUserScene,
              width: "53.75rem",
            },
            {
              name: "existing-user",
              element: RegisterIntroExistingUserScene,
              width: "53.75rem",
            },
            {
              name: "new-mnemonic",
              element: NewMnemonicScene,
              width: "33.75rem",
            },
            {
              name: "verify-mnemonic",
              element: VerifyMnemonicScene,
              width: "35rem",
            },
            {
              name: "recover-mnemonic",
              element: RecoverMnemonicScene,
              width: "33.75rem",
            },
            {
              name: "connect-hardware-wallet",
              element: ConnectHardwareWalletScene,
              width: "31rem",
            },
            {
              name: "connect-ledger",
              element: ConnectLedgerScene,
              width: "40rem",
            },
            {
              name: "connect-keystone-qr",
              element: ConnectKeystoneQRScene,
              width: "40rem",
            },
            {
              name: "connect-keystone-usb",
              element: ConnectKeystoneUSBScene,
              width: "40rem",
            },
            {
              name: "scan-keystone",
              element: ScanKeystoneScene,
              width: "31.25rem",
            },
            {
              name: "back-up-private-key",
              element: BackUpPrivateKeyScene,
              width: "28rem",
            },
            {
              name: "name-password",
              element: RegisterNamePasswordScene,
              width: "29rem",
            },
            {
              name: "name-password-hardware",
              element: RegisterNamePasswordHardwareScene,
              width: "29rem",
            },
            {
              name: "finalize-key",
              element: FinalizeKeyScene,
              width: "17.5rem",
            },
            {
              name: "enable-chains",
              element: EnableChainsScene,
              width: "34.5rem",
            },
            {
              name: "select-derivation-path",
              element: SelectDerivationPathScene,
              width: "40rem",
            },
            ...KeplrWalletPrivate.RegisterScenes,
          ]}
          initialSceneProps={initials.scene}
          transitionAlign="center"
        />
      </Box>
    </RegisterHeaderProvider>
  );
});

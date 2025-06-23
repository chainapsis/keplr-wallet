import { useMemo, useRef, useState } from "react";
import { useStore } from "../../../../stores";
import { useInteractionInfo } from "../../../../hooks";
import { useUnmount } from "../../../../hooks/use-unmount";
import { SignEthereumInteractionStore } from "@keplr-wallet/stores-core";
import { KeystoneUR } from "../../utils/keystone";
import { Buffer } from "buffer/";

export interface UseEthereumSigningCommonProps {
  interactionData: NonNullable<SignEthereumInteractionStore["waitingData"]>;
  emptySigningDataBuff?: boolean;
}

export const useEthereumSigningCommon = ({
  interactionData,
  emptySigningDataBuff = false,
}: UseEthereumSigningCommonProps) => {
  const { signEthereumInteractionStore } = useStore();

  const interactionInfo = useInteractionInfo({
    onUnmount: async () => {
      await signEthereumInteractionStore.rejectWithProceedNext(
        interactionData.id,
        () => {}
      );
    },
  });

  const signerInfo = useMemo(
    () => ({
      name:
        typeof interactionData.data.keyInsensitive["keyRingName"] === "string"
          ? interactionData.data.keyInsensitive["keyRingName"]
          : "",
      address: interactionData.data.signer || "",
    }),
    [interactionData.data.keyInsensitive, interactionData.data.signer]
  );

  const [signingDataBuff, setSigningDataBuff] = useState<Buffer>(() => {
    if (emptySigningDataBuff) {
      return Buffer.from("");
    }
    return Buffer.from(interactionData.data.message);
  });

  const [isLedgerInteracting, setIsLedgerInteracting] = useState(false);
  const [ledgerInteractingError, setLedgerInteractingError] = useState<
    Error | undefined
  >(undefined);

  const isKeystoneUSB =
    interactionData.data.keyType === "keystone" &&
    interactionData.data.keyInsensitive["connectionType"] === "USB";

  const [isKeystoneInteracting, setIsKeystoneInteracting] = useState(false);
  const [keystoneUR, setKeystoneUR] = useState<KeystoneUR>();
  const keystoneScanResolve = useRef<(ur: KeystoneUR) => void>();
  const [keystoneInteractingError, setKeystoneInteractingError] = useState<
    Error | undefined
  >(undefined);

  const [unmountPromise] = useState(() => {
    let resolver: () => void;
    const promise = new Promise<void>((resolve) => {
      resolver = resolve;
    });

    return {
      promise,
      resolver: resolver!,
    };
  });

  useUnmount(() => {
    unmountPromise.resolver();
  });

  const isLoading =
    signEthereumInteractionStore.isObsoleteInteractionApproved(
      interactionData.id
    ) ||
    isLedgerInteracting ||
    isKeystoneInteracting;

  return {
    interactionInfo,
    signerInfo,
    signingDataBuff,
    setSigningDataBuff,
    isLedgerInteracting,
    setIsLedgerInteracting,
    ledgerInteractingError,
    setLedgerInteractingError,
    isKeystoneUSB,
    isKeystoneInteracting,
    setIsKeystoneInteracting,
    keystoneUR,
    setKeystoneUR,
    keystoneScanResolve,
    keystoneInteractingError,
    setKeystoneInteractingError,
    unmountPromise,
    isLoading,
  };
};

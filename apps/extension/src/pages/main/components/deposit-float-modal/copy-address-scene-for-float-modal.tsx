import React, { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useTheme } from "styled-components";
import { useFocusOnMount } from "../../../../hooks/use-focus-on-mount";
import { Box } from "../../../../components/box";
import { ColorPalette } from "../../../../styles";
import { Gutter } from "../../../../components/gutter";
import { SearchTextInput } from "../../../../components/input";
import SimpleBar from "simplebar-react";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../../components/transition";
import { useGetAddressesOnCopyAddress } from "../../hooks/use-get-addresses-copy-address";
import { NoResultBox } from "../deposit-modal-no-search-box";
import { Address } from "../deposit-modal/copy-address-scene";
import {
  CopyAddressItemList,
  EnterTag,
} from "../copy-address-item/copy-address-item-list";

export const CopyAddressSceneForFloatModal: FunctionComponent<{
  close: () => void;
}> = observer(({ close }) => {
  const intl = useIntl();
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const searchRef = useFocusOnMount<HTMLInputElement>();
  const sceneTransition = useSceneTransition();
  const [showEnterTag, setShowEnterTag] = useState(false);

  useSceneEvents({
    onDidVisible: () => {
      if (searchRef.current) {
        // XXX: Scene transition 컴포넌트가 최초 scene의 경우 onDidVisible를 발생 못시키는 문제가 있다.
        //      이 문제 때문에 그냥 mount일때와 onDidVisible일때 모두 focus를 준다.
        searchRef.current.focus();
      }
    },
  });

  const [blockInteraction, setBlockInteraction] = useState(false);
  const { sortedAddresses, setSortPriorities } =
    useGetAddressesOnCopyAddress(search);

  const hasAddresses = sortedAddresses.length > 0;
  const isShowNoResult = !hasAddresses;

  return (
    <Box
      paddingTop="1rem"
      backgroundColor={
        theme.mode === "light"
          ? ColorPalette["gray-10"]
          : ColorPalette["gray-650"]
      }
    >
      <Box paddingX="0.75rem">
        <SearchTextInput
          ref={searchRef}
          value={search}
          onChange={(e) => {
            e.preventDefault();
            setSearch(e.target.value);
          }}
          placeholder={
            showEnterTag
              ? ""
              : intl.formatMessage({
                  id: "page.main.components.deposit-modal.search-placeholder",
                })
          }
          suffix={showEnterTag ? <EnterTag /> : undefined}
        />
      </Box>

      <Gutter size="0.75rem" />

      <SimpleBar
        style={{
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          height: "21.5rem",
        }}
      >
        {isShowNoResult && <NoResultBox />}

        <CopyAddressItemList
          sortedAddresses={sortedAddresses}
          close={close}
          blockInteraction={blockInteraction}
          setBlockInteraction={setBlockInteraction}
          setSortPriorities={setSortPriorities}
          search={search}
          onClickIcon={(address: Address) => {
            sceneTransition.push("qr-code", {
              chainId: address.modularChainInfo.chainId,
              address:
                address.starknetAddress ||
                address.ethereumAddress ||
                address.bech32Address ||
                address.bitcoinAddress?.bech32Address,
              close,
              isOnTheFloatingModal: true,
            });
          }}
          setShowEnterTag={setShowEnterTag}
        />

        <Gutter size="0.75rem" />
      </SimpleBar>
    </Box>
  );
});

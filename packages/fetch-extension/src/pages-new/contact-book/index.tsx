import { Card } from "@components-v2/card";
import { useConfirm } from "@components/confirm";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  AddressBookSelectHandler,
  IIBCChannelConfig,
  useAddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@keplr-wallet/hooks";
import { shortenAgentAddress } from "@utils/validate-agent";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";
import { Modal, ModalBody } from "reactstrap";
import { useStore } from "../../stores";
import {
  default as style,
  default as styleAddressBook,
} from "./style.module.scss";
import { ButtonV2 } from "@components-v2/buttons/button";
import { SearchBar } from "@components-v2/search-bar";
import { getFilteredAddressValues } from "@utils/filters";
import { AddAddress } from "../more/address-book/add-address";

export interface chatSectionParams {
  openModal: boolean;
  addressInputValue: string;
}

export const defaultParamValues: chatSectionParams = {
  openModal: false,
  addressInputValue: "",
};

export const ContactBookPage: FunctionComponent<{
  onBackButton?: () => void;
  selectHandler?: AddressBookSelectHandler;
  ibcChannelConfig?: IIBCChannelConfig;
}> = observer(({ onBackButton, selectHandler, ibcChannelConfig }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { chainStore, uiConfigStore } = useStore();
  const current = chainStore.current;
  const location = useLocation();
  const chatSectionParams =
    (location.state as chatSectionParams) || defaultParamValues;
  const [selectedChainId] = useState(
    ibcChannelConfig?.channel
      ? ibcChannelConfig.channel.counterpartyChainId
      : current.chainId
  );

  const recipientConfig = useRecipientConfig(chainStore, selectedChainId, {
    allowHexAddressOnEthermint: true,
    icns: uiConfigStore.icnsInfo,
  });
  const memoConfig = useMemoConfig(chainStore, selectedChainId);

  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    selectHandler
      ? selectHandler
      : {
          setRecipient: (): void => {
            // noop
          },
          setMemo: (): void => {
            // noop
          },
        }
  );

  const [addAddressModalOpen, setAddAddressModalOpen] = useState(
    chatSectionParams.openModal || false
  );
  const [addAddressModalIndex, setAddAddressModalIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatSectionParams.openModal) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } else {
      setLoading(false);
    }
  }, [chatSectionParams.openModal]);

  const confirm = useConfirm();
  const closeModal = () => {
    if (chatSectionParams.openModal) {
      navigate(-1);
    }
    setAddAddressModalOpen(false);
    setAddAddressModalIndex(-1);
  };
  const addressBookIcons = (index: number) => {
    return (
      <div style={{ display: "flex", gap: "5px" }}>
        <img
          src={require("@assets/svg/edit-icon.svg")}
          draggable={false}
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setAddAddressModalOpen(true);
            setAddAddressModalIndex(index);
          }}
        />
        <img
          src={require("@assets/svg/trash-icon.svg")}
          draggable={false}
          style={{ cursor: "pointer" }}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (
              await confirm.confirm({
                img: (
                  <img
                    alt=""
                    src={require("@assets/img/trash.svg")}
                    style={{ height: "80px" }}
                  />
                ),
                title: intl.formatMessage({
                  id: "setting.address-book.confirm.delete-address.title",
                }),
                paragraph: intl.formatMessage({
                  id: "setting.address-book.confirm.delete-address.paragraph",
                }),
              })
            ) {
              setAddAddressModalOpen(false);
              setAddAddressModalIndex(-1);
              await addressBookConfig.removeAddressBook(index);
            }
          }}
        />
      </div>
    );
  };

  const handleAddressClick = (
    e: React.MouseEvent<HTMLDivElement>,
    address: string,
    i: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!address.startsWith("agent")) {
      addressBookConfig.selectAddressAt(i);

      if (onBackButton) {
        onBackButton();
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <React.Fragment>
      <Modal
        isOpen={addAddressModalOpen}
        backdrop={false}
        className={styleAddressBook["fullModal"]}
        wrapClassName={styleAddressBook["fullModal"]}
        contentClassName={styleAddressBook["fullModal"]}
      >
        <ModalBody className={styleAddressBook["fullModal"]}>
          <AddAddress
            closeModal={() => closeModal()}
            recipientConfig={recipientConfig}
            memoConfig={memoConfig}
            addressBookConfig={addressBookConfig}
            index={addAddressModalIndex}
            chainId={selectedChainId}
          />
        </ModalBody>
      </Modal>
      {loading ? (
        <div className={styleAddressBook["loader"]}>Loading ....</div>
      ) : (
        <div className={style["container"]}>
          <SearchBar
            valuesArray={addressBookConfig.addressBookDatas}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterFunction={getFilteredAddressValues}
            disabled={addressBookConfig.addressBookDatas.length === 0}
            renderResult={(data, i) => (
              <Card
                key={i.toString()}
                heading={data.name}
                subheading={
                  data.address.indexOf(
                    chainStore.getChain(selectedChainId).bech32Config
                      .bech32PrefixAccAddr
                  ) === 0
                    ? Bech32Address.shortenAddress(data.address, 34)
                    : data.address.startsWith("agent")
                    ? shortenAgentAddress(data.address)
                    : Bech32Address.shortenAddress(data.address, 34, true)
                }
                rightContent={addressBookIcons(i)}
                data-index={i}
                onClick={(e: any) => handleAddressClick(e, data.address, i)}
                style={{ cursor: selectHandler ? undefined : "auto" }}
              />
            )}
          />
          <div>
            {addressBookConfig.addressBookDatas.length === 0 && (
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  opacity: 0.8,
                  textAlign: "center",
                  color: "white",
                }}
              >
                You haven’t saved any addresses yet
              </div>
            )}
          </div>
          <ButtonV2
            styleProps={{
              height: "56px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.4)",
              color: "white",
              marginTop: "24px",
            }}
            text={"Add an address"}
            onClick={() => setAddAddressModalOpen(true)}
          />
        </div>
      )}
    </React.Fragment>
  );
});

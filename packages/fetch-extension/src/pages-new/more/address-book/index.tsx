import React, { FunctionComponent, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";
import style from "./style.module.scss";
import { Modal, ModalBody } from "reactstrap";
import styleAddressBook from "./style.module.scss";
import { useStore } from "../../../stores";
import { ExtensionKVStore } from "@keplr-wallet/common";
import { useConfirm } from "@components/confirm";
import {
  AddressBookSelectHandler,
  IIBCChannelConfig,
  useAddressBookConfig,
  useMemoConfig,
  useRecipientConfig,
} from "@keplr-wallet/hooks";

import { HeaderLayout } from "@layouts-v2/header-layout";
import styles from "../token/manage/style.module.scss";
import { AddAddress } from "./add-address";
import { AddressRow } from "./address-row";
export interface chatSectionParams {
  openModal: boolean;
  addressInputValue: string;
}
export const defaultParamValues: chatSectionParams = {
  openModal: false,
  addressInputValue: "",
};
export const AddressBookPage: FunctionComponent<{
  onBackButton?: () => void;
  hideChainDropdown?: boolean;
  selectHandler?: AddressBookSelectHandler;
  ibcChannelConfig?: IIBCChannelConfig;
}> = observer(({ onBackButton, selectHandler, ibcChannelConfig }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { chainStore, uiConfigStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const location = useLocation();
  const chatSectionParams =
    (location.state as chatSectionParams) || defaultParamValues;
  const [selectedChainId, _setSelectedChainId] = useState(
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

  return (
    <HeaderLayout
      showTopMenu={true}
      smallTitle={true}
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.address-book",
      })}
      onBackButton={
        onBackButton
          ? onBackButton
          : () => {
              analyticsStore.logEvent("back_click", {
                pageName: "Address Book Page",
              });
              navigate(-1);
            }
      }
      rightRenderer={
        <button
          className={styles["plusIcon"]}
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            analyticsStore.logEvent("add_new_address_click", {
              pageName: "Drawer",
            });
            setAddAddressModalOpen(true);
          }}
        >
          +
        </button>
      }
    >
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
          {addressBookConfig.addressBookDatas.map((data, i) => {
            return (
              <AddressRow
                selectHandler={selectHandler}
                selectedChainId={selectedChainId}
                chainStore={chainStore}
                key={i}
                data={data}
                index={i}
                onSelect={(index) => {
                  if (onBackButton) {
                    onBackButton();
                  }
                  addressBookConfig.selectAddressAt(index);
                }}
                onEdit={(index) => {
                  setAddAddressModalOpen(true);
                  setAddAddressModalIndex(index);
                }}
                onDelete={async (index) => {
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
                    await addressBookConfig.removeAddressBook(index);
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </HeaderLayout>
  );
});

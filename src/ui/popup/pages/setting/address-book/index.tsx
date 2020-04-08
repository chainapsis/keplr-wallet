import React, {
  FunctionComponent,
  MouseEvent,
  useCallback,
  useEffect,
  useState
} from "react";
import { observer } from "mobx-react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import style from "../style.module.scss";
import {
  Button,
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody
} from "reactstrap";
import styleAddressBook from "./style.module.scss";
import { useStore } from "../../../stores";
import { PageButton } from "../page-button";
import { AddAddressModal } from "./add-address-modal";
import { AddressBookData } from "./types";
import { AddressBookKVStore } from "./kvStore";
import { BrowserKVStore } from "../../../../../common/kvstore";
import { ChainInfo } from "../../../../../background/chains";
import { shortenAddress } from "../../../../../common/address";

export const AddressBookPage: FunctionComponent = observer(() => {
  const intl = useIntl();
  const history = useHistory();
  const { chainStore } = useStore();

  const [addressBook, setAddressBook] = useState<AddressBookData[]>([]);

  const [addressBookKVStore] = useState(
    new AddressBookKVStore(new BrowserKVStore("address-book"))
  );

  const refreshAddressBook = useCallback(
    async (chainInfo: ChainInfo) => {
      setAddressBook(await addressBookKVStore.getAddressBook(chainInfo));
    },
    [addressBookKVStore]
  );

  useEffect(() => {
    refreshAddressBook(chainStore.chainInfo);
  }, [addressBookKVStore, chainStore.chainInfo, refreshAddressBook]);

  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  const [addAddressModalOpen, setAddressModalOpen] = useState(false);

  const openAddAddressModal = useCallback(() => {
    setAddressModalOpen(true);
  }, []);

  const closeAddAddressModal = useCallback(() => {
    setAddressModalOpen(false);
  }, []);

  const addAddressBook = useCallback(
    async (data: AddressBookData) => {
      closeAddAddressModal();
      await addressBookKVStore.addAddressBook(chainStore.chainInfo, data);
      await refreshAddressBook(chainStore.chainInfo);
    },
    [
      addressBookKVStore,
      chainStore.chainInfo,
      closeAddAddressModal,
      refreshAddressBook
    ]
  );

  const removeAddressBook = useCallback(
    async (index: number) => {
      closeAddAddressModal();
      await addressBookKVStore.removeAddressBook(chainStore.chainInfo, index);
      await refreshAddressBook(chainStore.chainInfo);
    },
    [
      addressBookKVStore,
      chainStore.chainInfo,
      closeAddAddressModal,
      refreshAddressBook
    ]
  );

  const removeAddressBookClick = useCallback(
    async (e: MouseEvent) => {
      const indexStr = e.currentTarget.getAttribute("data-index");
      if (indexStr) {
        const index = parseInt(indexStr);

        if (index != null && !Number.isNaN(index) && index >= 0) {
          await removeAddressBook(index);
        }
      }
    },
    [removeAddressBook]
  );

  const addressBookIcons = useCallback(
    (index: number) => {
      return [
        <i key="edit" className="fas fa-pen" data-index={index} />,
        <i
          key="remove"
          className="fas fa-times"
          style={{ fontSize: "20px" }}
          data-index={index}
          onClick={removeAddressBookClick}
        />
      ];
    },
    [removeAddressBookClick]
  );

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={intl.formatMessage({
        id: "main.menu.address-book"
      })}
      onBackButton={useCallback(() => {
        history.goBack();
      }, [history])}
    >
      <Modal
        isOpen={addAddressModalOpen}
        backdrop={false}
        className={styleAddressBook.fullModal}
        wrapClassName={styleAddressBook.fullModal}
        contentClassName={styleAddressBook.fullModal}
      >
        <ModalBody className={styleAddressBook.fullModal}>
          <AddAddressModal
            closeModal={closeAddAddressModal}
            addAddressBook={addAddressBook}
          />
        </ModalBody>
      </Modal>
      <div className={style.container}>
        <div className={styleAddressBook.innerTopContainer}>
          <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle caret style={{ boxShadow: "none" }}>
              {chainStore.chainInfo.chainName}
            </DropdownToggle>
            <DropdownMenu>
              {chainStore.chainList.map(chainInfo => {
                return (
                  <DropdownItem
                    key={chainInfo.chainId}
                    onClick={useCallback(() => {
                      chainStore.setChain(chainInfo.chainId);
                    }, [chainInfo.chainId])}
                  >
                    {chainInfo.chainName}
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </ButtonDropdown>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Button color="primary" size="sm" onClick={openAddAddressModal}>
              <i
                className="fas fa-plus"
                style={{ marginRight: "4px", fontSize: "8px" }}
              />
              Add New
            </Button>
          </div>
        </div>
        <div style={{ flex: "1 1 0", overflowY: "auto" }}>
          {addressBook.map((data, i) => {
            return (
              <PageButton
                key={i.toString()}
                title={data.name}
                paragraph={
                  data.address.indexOf(
                    chainStore.chainInfo.bech32Config.bech32PrefixAccAddr
                  ) === 0
                    ? shortenAddress(data.address, 34)
                    : data.address
                }
                subParagraph={data.memo}
                icons={addressBookIcons(i)}
              />
            );
          })}
        </div>
      </div>
    </HeaderLayout>
  );
});

export * from "./types";

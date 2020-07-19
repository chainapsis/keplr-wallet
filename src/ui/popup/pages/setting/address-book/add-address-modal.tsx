import React, {
  FunctionComponent,
  useCallback,
  useState,
  useEffect
} from "react";
import { HeaderLayout } from "../../../layouts/header-layout";
import { AddressInput, Input, MemoInput } from "../../../../components/form";
import { Button } from "reactstrap";
import { AddressBookData } from "./types";
import { AddressBookKVStore } from "./kvStore";
import { ChainInfo } from "../../../../../background/chains";
import { FormattedMessage, useIntl } from "react-intl";
import { useTxState, withTxStateProvider } from "../../../../contexts/tx";

/**
 *
 * @param closeModal
 * @param addAddressBook
 * @param chainInfo
 * @param index If index is lesser than 0, it is considered as adding address book. If index is equal or greater than 0, it is considered as editing address book.
 * @param addressBookKVStore
 * @constructor
 */
export const AddAddressModal: FunctionComponent<{
  closeModal: () => void;
  addAddressBook: (data: AddressBookData) => void;
  chainInfo: ChainInfo;
  index: number;
  addressBookKVStore: AddressBookKVStore;
}> = withTxStateProvider(
  ({ closeModal, addAddressBook, chainInfo, index, addressBookKVStore }) => {
    const intl = useIntl();

    const [name, setName] = useState("");

    const txState = useTxState();

    // Make sure to load the editables only once.
    const [editingLoaded, setEditingLoaded] = useState(false);

    useEffect(() => {
      if (!editingLoaded) {
        if (index >= 0) {
          addressBookKVStore.getAddressBook(chainInfo).then(datas => {
            const data = datas[index];
            setName(data.name);
            txState.setRawAddress(data.address);
            txState.setMemo(data.memo);
          });
          setEditingLoaded(true);
        }
      }
    }, [addressBookKVStore, chainInfo, editingLoaded, index, txState]);

    return (
      <HeaderLayout
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={
          index >= 0
            ? intl.formatMessage({
                id: "setting.address-book.edit-address.title"
              })
            : intl.formatMessage({
                id: "setting.address-book.add-address.title"
              })
        }
        onBackButton={closeModal}
      >
        <form
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Input
            type="text"
            label={intl.formatMessage({ id: "setting.address-book.name" })}
            autoComplete="off"
            value={name}
            onChange={useCallback(e => {
              setName(e.target.value);
            }, [])}
          />
          <AddressInput
            label={intl.formatMessage({ id: "setting.address-book.address" })}
            bech32Prefix={chainInfo.bech32Config.bech32PrefixAccAddr}
            coinType={chainInfo.coinType}
            errorTexts={{
              invalidBech32Address: intl.formatMessage({
                id: "setting.address-book.address.error.invalid"
              }),
              invalidENSName: intl.formatMessage({
                id: "send.input.recipient.error.ens-invalid-name"
              }),
              ensNameNotFound: intl.formatMessage({
                id: "send.input.recipient.error.ens-not-found"
              }),
              ensUnsupported: intl.formatMessage({
                id: "send.input.recipient.error.ens-not-supported"
              }),
              ensUnknownError: intl.formatMessage({
                id: "sned.input.recipient.error.ens-unknown-error"
              })
            }}
            disableAddressBook={true}
          />
          <MemoInput
            label={intl.formatMessage({ id: "setting.address-book.memo" })}
          />
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            color="primary"
            disabled={!name || !txState.isValid("recipient", "memo")}
            onClick={useCallback(
              e => {
                if (!txState.recipient) {
                  throw new Error("Invalid address");
                }

                addAddressBook({
                  name,
                  address: txState.rawAddress,
                  memo: txState.memo
                });

                e.preventDefault();
              },
              [
                addAddressBook,
                name,
                txState.memo,
                txState.rawAddress,
                txState.recipient
              ]
            )}
          >
            <FormattedMessage id={"setting.address-book.button.save"} />
          </Button>
        </form>
      </HeaderLayout>
    );
  }
);

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FunctionComponent, useEffect, useState } from "react";
import { HeaderLayout } from "../../../layouts";
//import { AnyWithUnpacked } from "@keplr-wallet/cosmos";
import { AddressInput, Input, PermissionInput } from "../../../components/form";
import { Button } from "reactstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { observer } from "mobx-react-lite";
import {
  ChildAccountConfig,
  PermissionConfig,
  RecipientConfig,
} from "@keplr-wallet/hooks";
//import { renderDirectMessage } from "../../sign/direct";
import {
  MsgGrant,
  /*MsgRevoke,*/
} from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { useStore } from "../../../stores";

/**
 *
 * @param closeModal
 * @param addAddressBook
 * @param chainInfo
 * @param index If index is lesser than 0, it is considered as adding child accounts. If index is equal or greater than 0, it is considered as editing child accounts.
 * @param addressBookKVStore
 * @constructor
 */
export const AddChildAccountModal: FunctionComponent<{
  closeModal: () => void;
  recipientConfig: RecipientConfig;
  permissionConfig: PermissionConfig;
  childAccountConfig: ChildAccountConfig;
  index: number;
  chainId: string;
}> = observer(
  ({
    closeModal,
    recipientConfig,
    permissionConfig,
    childAccountConfig,
    index,
  }) => {
    const intl = useIntl();

    const [name, setName] = useState("");

    const { accountStore, chainStore } = useStore();

    const testAuthZ = (parent: string, child: string) => {
      const grant_message = {
        granter: parent,
        grantee: child,
        authorization: "cosmwasm.wasm.v1.MsgExecuteContract",
        period: 500000,
      };

      const msg = MsgGrant.fromJSON(grant_message);
      const msgAny = {
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: msg,
      };
      /*const fee = {
        amount: [
          {
            denom: "uatom",
            amount: "2000",
          },
        ],
        gas: "180000", // 180k
      };
      const memo = "Use your power wisely";
      const result = await client.signAndBroadcast(
        firstAccount.address,
        [msgAny],
        fee,
        memo
      );*/
      console.error(JSON.stringify(msgAny));
    };

    useEffect(() => {
      if (index >= 0) {
        const data = childAccountConfig.addressBookDatas[index];
        setName(data.name);
        recipientConfig.setRawRecipient(data.address);
        permissionConfig.setPermission(data.permission);
      }
    }, [
      childAccountConfig.addressBookDatas,
      index,
      permissionConfig,
      recipientConfig,
    ]);

    return (
      <HeaderLayout
        showChainName={false}
        canChangeChainInfo={false}
        alternativeTitle={
          index >= 0
            ? intl.formatMessage({
                id: "setting.child-accounts.edit-child-account.title",
              })
            : intl.formatMessage({
                id: "setting.child-accounts.add-child-account.title",
              })
        }
        onBackButton={() => {
          // Clear the recipient and memo before closing
          recipientConfig.setRawRecipient("");
          permissionConfig.setPermission({
            icon: "",
            name: "",
            contract: "",
            message_name: "",
            fields: null,
          });
          closeModal();
        }}
      >
        <form
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Input
            type="text"
            label={intl.formatMessage({ id: "setting.address-book.name" })}
            autoComplete="off"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <AddressInput
            recipientConfig={recipientConfig}
            label={intl.formatMessage({ id: "setting.address-book.address" })}
            disableAddressBook={false}
            isChildAccounts={true}
          />
          <PermissionInput
            permissionConfig={permissionConfig}
            label={intl.formatMessage({
              id: "setting.child-account.permission",
            })}
          />
          <div style={{ flex: 1 }} />
          <Button
            type="submit"
            color="primary"
            disabled={
              !name ||
              recipientConfig.error != null ||
              permissionConfig.error != null
            }
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!recipientConfig.recipient) {
                throw new Error("Invalid address");
              }

              testAuthZ(
                accountStore.getAccount(chainStore.current.chainId)
                  .bech32Address,
                recipientConfig.recipient
              );

              if (index < 0) {
                await childAccountConfig.addAddressBook({
                  name,
                  address: recipientConfig.recipient,
                  permission: permissionConfig.permission,
                });
              } else {
                await childAccountConfig.editAddressBookAt(index, {
                  name,
                  address: recipientConfig.recipient,
                  permission: permissionConfig.permission,
                });
              }

              // Clear the recipient and memo before closing
              recipientConfig.setRawRecipient("");
              permissionConfig.setPermission({
                icon: "",
                name: "",
                contract: "",
                message_name: "",
                fields: null,
              });
              closeModal();
            }}
          >
            <FormattedMessage id={"setting.address-book.button.save"} />
          </Button>
        </form>
      </HeaderLayout>
    );
  }
);

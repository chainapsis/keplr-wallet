import { ExtensionKVStore } from "@keplr-wallet/common";
import {
  useAddressBookConfig,
  useIBCTransferConfig,
} from "@keplr-wallet/hooks";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { HeaderLayout } from "../../layouts";
import rightArrowIcon from "../../public/assets/icon/right-arrow.png";
import searchIcon from "../../public/assets/icon/search.png";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import chevronLeft from "../../public/assets/icon/chevron-left.png";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { SwitchUser } from "../../components/switch-user";
import { EthereumEndpoint } from "../../config.ui";
import { NameAddress } from "../chat/users";
import { formatAddress } from "../../utils/format";
import { fetchPublicKey } from "../../utils/fetch-public-key";
import { useSelector } from "react-redux";
import { userDetails } from "../../chatStore/user-slice";
import { Menu } from "../main/menu";
import { PrivacySetting } from "@keplr-wallet/background/build/messaging/types";
import jazzicon from "@metamask/jazzicon";
import ReactHtmlParser from "react-html-parser";
import { fromBech32 } from "@cosmjs/encoding";
import { ChatLoader } from "../../components/chat-loader";

const NewUser = (props: { address: NameAddress }) => {
  const history = useHistory();
  const user = useSelector(userDetails);
  const { chainStore } = useStore();
  const { name, address } = props.address;
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const current = chainStore.current;
  useEffect(() => {
    const isUserActive = async () => {
      try {
        const pubKey = await fetchPublicKey(
          user.accessToken,
          current.chainId,
          address
        );
        if (!pubKey || !pubKey.publicKey || !(pubKey.publicKey.length > 0))
          setIsActive(false);
      } catch (e) {
        console.log("NewUser/isUserActive error", e);
      } finally {
        setIsLoading(false);
      }
    };
    isUserActive();
  }, [
    address,
    user.accessToken,
    user.messagingPubKey.privacySetting,
    current.chainId,
  ]);

  const handleClick = () => {
    if (!isLoading) history.push(`/chat/${address}`);
  };

  return (
    <div
      className={style.messageContainer}
      {...(isActive && { onClick: handleClick })}
    >
      <div className={style.initials}>
        {ReactHtmlParser(
          jazzicon(24, parseInt(fromBech32(address).data.toString(), 16))
            .outerHTML
        )}
      </div>
      <div className={style.messageInner}>
        <div className={style.name}>{formatAddress(name)}</div>
        {!isActive && <div className={style.name}>Inactive</div>}
      </div>
      <div>
        {isLoading ? (
          <i className="fas fa-spinner fa-spin ml-1" />
        ) : (
          <img src={rightArrowIcon} style={{ width: "80%" }} alt="message" />
        )}
      </div>
    </div>
  );
};
export const NewChat: FunctionComponent = observer(() => {
  const history = useHistory();
  const user = useSelector(userDetails);
  const [inputVal, setInputVal] = useState("");
  const [addresses, setAddresses] = useState<NameAddress[]>([]);
  const [randomAddress, setRandomAddress] = useState<NameAddress | undefined>();

  const { chainStore, accountStore, queriesStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const walletAddress = accountInfo.bech32Address;
  // address book values
  const queries = queriesStore.get(chainStore.current.chainId);
  const ibcTransferConfigs = useIBCTransferConfig(
    chainStore,
    chainStore.current.chainId,
    accountInfo.msgOpts.ibcTransfer,
    accountInfo.bech32Address,
    queries.queryBalances,
    EthereumEndpoint
  );

  const [selectedChainId] = useState(
    ibcTransferConfigs.channelConfig?.channel
      ? ibcTransferConfigs.channelConfig.channel.counterpartyChainId
      : current.chainId
  );
  const addressBookConfig = useAddressBookConfig(
    new ExtensionKVStore("address-book"),
    chainStore,
    selectedChainId,
    {
      setRecipient: (): void => {
        // noop
      },
      setMemo: (): void => {
        // noop
      },
    }
  );

  const useraddresses: NameAddress[] = addressBookConfig.addressBookDatas.map(
    (data) => {
      return { name: data.name, address: data.address };
    }
  );

  useEffect(() => {
    setAddresses(useraddresses.filter((a) => a.address !== walletAddress));
  }, [addressBookConfig.addressBookDatas]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const searchedVal = e.target.value.toLowerCase();
    const addresses = useraddresses.filter(
      (address: NameAddress) =>
        address.address !== walletAddress &&
        (address.name.toLowerCase().includes(searchedVal) ||
          address.address.toLowerCase().includes(searchedVal))
    );

    if (
      addresses.length === 0 &&
      searchedVal &&
      searchedVal !== walletAddress &&
      user?.messagingPubKey.privacySetting === PrivacySetting.Everybody
    ) {
      try {
        //check if searchedVal is valid address
        Bech32Address.validate(
          searchedVal,
          chainStore.current.bech32Config.bech32PrefixAccAddr
        );
        const address: NameAddress = {
          name: formatAddress(searchedVal),
          address: searchedVal,
        };
        setRandomAddress(address);
        setAddresses([]);
        // setAddresses([address]);
      } catch (e) {
        setAddresses([]);
        setRandomAddress(undefined);
      }
    } else {
      setRandomAddress(undefined);
      setAddresses(addresses);
    }
  };
  return (
    <HeaderLayout
      showChainName={true}
      canChangeChainInfo={true}
      menuRenderer={<Menu />}
      rightRenderer={<SwitchUser />}
    >
      {!addressBookConfig.isLoaded ? (
        <ChatLoader message="Loading contacts, please wait..." />
      ) : (
        <div>
          <div className={style.newChatContainer}>
            <div className={style.leftBox}>
              <img
                alt=""
                className={style.backBtn}
                src={chevronLeft}
                onClick={() => {
                  history.goBack();
                }}
              />
              <span className={style.title}>New Chat</span>
            </div>
          </div>
          <div className={style.searchContainer}>
            <div className={style.searchBox}>
              <img src={searchIcon} alt="search" />
              <input
                placeholder="Search by name or address"
                value={inputVal}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className={style.searchHelp}>
            You can search your contacts or paste any valid {current.chainName}{" "}
            address to start a conversation.
          </div>
          <div className={style.messagesContainer}>
            {randomAddress && (
              <NewUser address={randomAddress} key={randomAddress.address} />
            )}
            <div className={style.contacts}>
              <div>Your contacts</div>
              <i
                className="fa fa-user-plus"
                style={{ margin: "2px 0 0 12px", cursor: "pointer" }}
                aria-hidden="true"
                onClick={() => {
                  history.push("/setting/address-book");
                }}
              />
            </div>
            {addresses.map((address: NameAddress) => {
              return <NewUser address={address} key={address.address} />;
            })}
          </div>
          {addresses.length === 0 && (
            <div>
              <div className={style.resultText}>
                No results in your contacts.
              </div>
              {user?.messagingPubKey.privacySetting ===
                PrivacySetting.Contacts && (
                <div className={style.resultText}>
                  If you are searching for an address not in your address book,
                  you can&apos;t see them due to your selected privacy settings
                  being &quot;contact only&quot;. Please add the address to your
                  address book to be able to chat with them or change your
                  privacy settings.
                  <br />
                  <a
                    href="#"
                    style={{
                      textDecoration: "underline",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      history.push("/setting/chat/privacy");
                    }}
                  >
                    Go to chat privacy settings
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </HeaderLayout>
  );
});

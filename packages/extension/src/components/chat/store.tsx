import React, { FunctionComponent, useEffect } from "react";
import { Provider } from "react-redux";
import { useStore } from "../../stores";
import { setNotifications } from "@chatStore/user-slice";
import { NotyphiOrganisation } from "@notificationTypes";
import {
  fetchFollowedOrganisations,
  followOrganisation,
} from "@utils/fetch-notification";
import { store } from "@chatStore/index";
import { fetchAndPopulateNotifications } from "@utils/populate-notifications";
import { observer } from "mobx-react-lite";
import { NOTYPHI_FETCH_ORG_ID } from "../../config.ui.var";

export const ChatStoreProvider: FunctionComponent = observer((props) => {
  const { children } = props;

  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  useEffect(() => {
    if (!accountInfo.bech32Address) {
      return;
    }

    const fetchOrganisation = async () => {
      const followOrganisationList: NotyphiOrganisation[] = await fetchFollowedOrganisations(
        accountInfo.bech32Address
      );

      if (followOrganisationList.length > 0) {
        store.dispatch(
          setNotifications({
            organisations: followOrganisationList,
          })
        );
      } else {
        /// Follow fetch org and tag by default for new user
        followOrganisation(
          accountInfo.bech32Address,
          NOTYPHI_FETCH_ORG_ID
        ).then((_) => {
          localStorage.setItem(
            `topics-${accountInfo.bech32Address}`,
            JSON.stringify([{ name: "fetch.ai" }])
          );
          fetchOrganisation();
        });
      }
    };
    fetchOrganisation();
    fetchAndPopulateNotifications(accountInfo.bech32Address);
    const intervalCall = setInterval(() => {
      fetchAndPopulateNotifications(accountInfo.bech32Address);
    }, 60000);
    return () => {
      clearInterval(intervalCall);
    };
  }, [accountInfo.bech32Address]);

  return <Provider store={store}>{children}</Provider>;
});

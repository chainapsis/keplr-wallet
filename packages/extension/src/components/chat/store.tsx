import React, { FunctionComponent, useEffect } from "react";
import { Provider } from "react-redux";
import { useStore } from "../../stores";
import { setNotifications } from "@chatStore/user-slice";
import { NotyphiOrganisation } from "@notificationTypes";
import {
  fetchFollowedOrganisations,
  fetchOrganisations,
  fetchTopics,
  followOrganisation,
} from "@utils/fetch-notification";
import { store } from "@chatStore/index";
import { fetchAndPopulateNotifications } from "@utils/populate-notifications";
import { observer } from "mobx-react-lite";

export const ChatStoreProvider: FunctionComponent = observer((props) => {
  const { children } = props;

  const { chainStore, accountStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  useEffect(() => {
    if (!accountInfo.bech32Address) {
      return;
    }

    const setOrganisations = async () => {
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
        // Auto followed all org and tags by default for new user

        fetchOrganisations().then((res) => {
          res.items.map((org: NotyphiOrganisation) => {
            followOrganisation(accountInfo.bech32Address, org.id);
          });
          fetchTopics().then((res) => {
            localStorage.setItem(
              `topics-${accountInfo.bech32Address}`,
              JSON.stringify(res.items)
            );
          });
          setOrganisations();
        });
      }
    };
    setOrganisations();
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

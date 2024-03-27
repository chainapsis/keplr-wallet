import React, { FunctionComponent, useEffect } from "react";
import { useStore } from "../../stores";
import { NotyphiOrganisation } from "@notificationTypes";
import {
  fetchFollowedOrganisations,
  fetchOrganisations,
  fetchTopics,
  followOrganisation,
} from "@utils/fetch-notification";
import { fetchAndPopulateNotifications } from "@utils/populate-notifications";
import { observer } from "mobx-react-lite";

export const ChatStoreProvider: FunctionComponent = observer((props) => {
  const { children } = props;

  const { chainStore, accountStore, chatStore } = useStore();
  const accountInfo = accountStore.getAccount(chainStore.current.chainId);

  useEffect(() => {
    if (!accountInfo.bech32Address) {
      return;
    }

    const setOrganisations = async () => {
      const followOrganisationList = await fetchFollowedOrganisations(
        accountInfo.bech32Address
      );

      if (followOrganisationList.length > 0) {
        chatStore.userDetailsStore.setNotifications({
          organisations: followOrganisationList,
        });
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
    fetchAndPopulateNotifications(accountInfo.bech32Address).then(
      (notifications) => {
        chatStore.userDetailsStore.setNotifications({
          unreadNotification: Object.values(notifications).length > 0,
          allNotifications: Object.values(notifications),
        });
      }
    );
    const intervalCall = setInterval(() => {
      fetchAndPopulateNotifications(accountInfo.bech32Address).then(
        (notifications) => {
          chatStore.userDetailsStore.setNotifications({
            unreadNotification: Object.values(notifications).length > 0,
            allNotifications: Object.values(notifications),
          });
        }
      );
    }, 60000);
    return () => {
      clearInterval(intervalCall);
    };
  }, [
    chainStore.current.chainId,
    accountInfo.bech32Address,
    chatStore.userDetailsStore,
  ]);

  return <React.Fragment>{children}</React.Fragment>;
});

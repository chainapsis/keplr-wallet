import React, { FunctionComponent, useEffect } from "react";
import { Provider } from "react-redux";
import { useStore } from "../../stores";
import { setNotifications } from "@chatStore/user-slice";
import { NotyphiOrganisation } from "@notificationTypes";
import { fetchFollowedOrganisations } from "@utils/fetch-notification";
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

    fetchFollowedOrganisations(accountInfo.bech32Address).then(
      (followOrganisationList: NotyphiOrganisation[]) => {
        store.dispatch(
          setNotifications({
            organisations: followOrganisationList,
          })
        );
      }
    );
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

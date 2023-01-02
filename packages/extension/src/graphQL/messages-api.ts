import { ApolloClient, gql, InMemoryCache, split } from "@apollo/client";
import {
  getMainDefinition,
  ObservableSubscription,
} from "@apollo/client/utilities";
import { store } from "../chatStore";
import {
  setBlockedList,
  setBlockedUser,
  setMessageError,
  setUnblockedUser,
  updateMessages,
  updateLatestSentMessage,
  updateGroupsData,
} from "../chatStore/messages-slice";
import { CHAT_PAGE_COUNT, GROUP_PAGE_COUNT } from "../config.ui.var";
import { encryptAllData } from "../utils/encrypt-message";
import { encryptGroupTimestamp } from "../utils/encrypt-group";
import { client, createWSLink, httpLink } from "./client";
import {
  block,
  blockedList,
  groups,
  groupsWithAddresses,
  groupReadUnread,
  listenMessages,
  mailbox,
  mailboxWithTimestamp,
  NewMessageUpdate,
  sendMessages,
  unblock,
  updateGroupLastSeen,
} from "./messages-queries";
import { recieveGroups } from "./recieve-messages";
let querySubscription: ObservableSubscription;
let queryGroupReadUnreadSubscription: ObservableSubscription;

interface messagesVariables {
  page?: number;
  pageCount?: number;
  groupId: string;
  afterTimestamp?: string;
}
export const fetchMessages = async (
  groupId: string,
  afterTimestamp: string | null | undefined,
  page: number
) => {
  const state = store.getState();
  let variables: messagesVariables = {
    groupId: groupId,
  };
  if (!!afterTimestamp) {
    variables = { ...variables, afterTimestamp: afterTimestamp };
  } else {
    variables = {
      ...variables,
      page,
      pageCount: CHAT_PAGE_COUNT,
    };
  }

  const messageQuery = !!afterTimestamp ? mailboxWithTimestamp : mailbox;
  const { data, errors } = await client.query({
    query: gql(messageQuery),
    fetchPolicy: "no-cache",
    context: {
      headers: {
        Authorization: `Bearer ${state.user.accessToken}`,
      },
    },
    variables,
  });

  if (errors) console.log("errors", errors);

  return data.mailbox;
};

interface groupQueryVariables {
  page: number;
  pageCount: number;
  addresses?: string[];
  addressQueryString?: string;
}

export const fetchGroups = async (
  page: number,
  addressQueryString: string,
  addresses: string[]
) => {
  const groupsQuery = addresses.length ? groupsWithAddresses : groups;
  const variables: groupQueryVariables = {
    page,
    pageCount: GROUP_PAGE_COUNT,
  };
  if (addresses.length) variables["addresses"] = addresses;
  else variables["addressQueryString"] = addressQueryString;
  const state = store.getState();
  const { data, errors } = await client.query({
    query: gql(groupsQuery),
    fetchPolicy: "no-cache",
    context: {
      headers: {
        Authorization: `Bearer ${state.user.accessToken}`,
      },
    },
    variables: variables,
  });
  if (errors) console.log("errors", errors);
  return data.groups;
};

export const fetchBlockList = async () => {
  const state = store.getState();
  try {
    const { data } = await client.query({
      query: gql(blockedList),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${state.user.accessToken}`,
        },
      },
      variables: {
        channelId: "MESSAGING",
      },
    });
    store.dispatch(setBlockedList(data.blockedList));
  } catch (e) {
    console.log(e);
    store.dispatch(
      setMessageError({
        type: "block",
        message: "Something went wrong, Please try again in sometime.",
        level: 2,
      })
    );
    throw e;
  }
};

export const blockUser = async (address: string) => {
  const state = store.getState();
  try {
    const { data } = await client.mutate({
      mutation: gql(block),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${state.user.accessToken}`,
        },
      },
      variables: {
        blockedAddress: address,
        channelId: "MESSAGING",
      },
    });
    store.dispatch(setBlockedUser(data.block));
  } catch (e) {
    console.log(e);
    store.dispatch(
      setMessageError({
        type: "block",
        message: "Something went wrong, Please try again in sometime.",
        level: 1,
      })
    );
    throw e;
  }
};

export const unblockUser = async (address: string) => {
  const state = store.getState();
  try {
    const { data } = await client.mutate({
      mutation: gql(unblock),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${state.user.accessToken}`,
        },
      },
      variables: {
        blockedAddress: address,
        channelId: "MESSAGING",
      },
    });
    store.dispatch(setUnblockedUser(data.unblock));
  } catch (e) {
    console.log(e);
    store.dispatch(
      setMessageError({
        type: "unblock",
        message: "Something went wrong, Please try again in sometime.",
        level: 1,
      })
    );
    throw e;
  }
};

export const deliverMessages = async (
  accessToken: string,
  chainId: string,
  newMessage: any,
  senderAddress: string,
  targetAddress: string
) => {
  const state = store.getState();
  try {
    if (newMessage) {
      const encryptedData = await encryptAllData(
        accessToken,
        chainId,
        newMessage,
        senderAddress,
        targetAddress
      );
      const { data } = await client.mutate({
        mutation: gql(sendMessages),
        variables: {
          messages: [
            {
              contents: `${encryptedData}`,
            },
          ],
        },
        context: {
          headers: {
            Authorization: `Bearer ${state.user.accessToken}`,
          },
        },
      });

      if (data?.dispatchMessages?.length > 0) {
        store.dispatch(updateLatestSentMessage(data?.dispatchMessages[0]));
        return data?.dispatchMessages[0];
      }
      return null;
    }
  } catch (e: any) {
    store.dispatch(
      setMessageError({
        type: "delivery",
        message:
          e?.message || "Something went wrong, Message can't be delivered",
        level: 1,
      })
    );
    return null;
  }
};

export const messageListener = () => {
  const state = store.getState();
  const wsLink = createWSLink(state.user.accessToken);
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );
  const newClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
  querySubscription = newClient
    .subscribe({
      query: gql(listenMessages),
      context: {
        headers: {
          authorization: `Bearer ${state.user.accessToken}`,
        },
      },
    })
    .subscribe({
      next({ data }: { data: { newMessageUpdate: NewMessageUpdate } }) {
        store.dispatch(updateMessages(data.newMessageUpdate.message));
        recieveGroups(0, data.newMessageUpdate.message.target);
      },
      error(err) {
        console.error("err", err);
        store.dispatch(
          setMessageError({
            type: "subscription",
            message: "Something went wrong, Cant fetch latest messages",
            level: 1,
          })
        );
      },
      complete() {
        console.log("completed");
      },
    });
};

export const groupReadUnreadListener = (userAddress: string) => {
  const state = store.getState();
  const wsLink = createWSLink(state.user.accessToken);
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );
  const newClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
  queryGroupReadUnreadSubscription = newClient
    .subscribe({
      query: gql(groupReadUnread),
      context: {
        headers: {
          authorization: `Bearer ${state.user.accessToken}`,
        },
      },
    })
    .subscribe({
      next({ data }: { data: any }) {
        const group = data.groupUpdate.group;

        group.userAddress =
          group.id.split("-")[0].toLowerCase() !== userAddress.toLowerCase()
            ? group.id.split("-")[0]
            : group.id.split("-")[1];
        store.dispatch(updateGroupsData(group));
      },
      error(err) {
        console.error("err", err);
        store.dispatch(
          setMessageError({
            type: "subscription",
            message: "Something went wrong, Cant fetch latest messages",
            level: 1,
          })
        );
      },
      complete() {
        console.log("completed");
      },
    });
};

export const messageAndGroupListenerUnsubscribe = () => {
  if (querySubscription) querySubscription.unsubscribe();
  if (queryGroupReadUnreadSubscription)
    queryGroupReadUnreadSubscription.unsubscribe();
};

export const updateGroupTimestamp = async (
  groupId: string,
  accessToken: string,
  chainId: string,
  senderAddress: string,
  targetAddress: string,
  lastSeenTimestamp: Date,
  groupLastSeenTimestamp: Date
) => {
  const state = store.getState();
  try {
    /// Encrypting last seen timestamp
    const encryptedLastSeenTimestamp = await encryptGroupTimestamp(
      accessToken,
      chainId,
      lastSeenTimestamp,
      senderAddress,
      targetAddress
    );
    /// Encrypting group last seen timestamp
    const encryptedGroupLastSeenTimestamp = await encryptGroupTimestamp(
      accessToken,
      chainId,
      groupLastSeenTimestamp,
      senderAddress,
      targetAddress
    );
    const { data } = await client.mutate({
      mutation: gql(updateGroupLastSeen),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${state.user.accessToken}`,
        },
      },
      variables: {
        groupId,
        lastSeenTimestamp: encryptedLastSeenTimestamp,
        groupLastSeenTimestamp: encryptedGroupLastSeenTimestamp,
      },
    });

    /// Updating the last seen status
    const group = data.updateGroupLastSeen;
    group.userAddress = targetAddress;
    store.dispatch(updateGroupsData(group));
  } catch (err) {
    console.error("err", err);
  }
};

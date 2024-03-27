import { ApolloClient, gql, InMemoryCache, split } from "@apollo/client";
import {
  getMainDefinition,
  ObservableSubscription,
} from "@apollo/client/utilities";
import { CHAT_PAGE_COUNT, GROUP_PAGE_COUNT } from "../config.ui.var";
import { encryptAllData } from "@utils/encrypt-message";
import {
  encryptGroupMessage,
  encryptGroupTimestamp,
  GroupMessageType,
} from "@utils/encrypt-group";
import { client, createWSLink, httpLink } from "./client";
import {
  block,
  blockedList,
  groups,
  groupsWithAddresses,
  listenGroups,
  listenMessages,
  mailbox,
  mailboxWithTimestamp,
  sendMessages,
  unblock,
  updateGroupLastSeen,
} from "./messages-queries";
import { recieveGroups } from "./recieve-messages";
import { NewMessageUpdate } from "@chatTypes";
import { MessagesStore } from "@keplr-wallet/stores/build/chat/message-store";
let querySubscription: ObservableSubscription;
let queryGroupSubscription: ObservableSubscription;

interface messagesVariables {
  page?: number;
  pageCount?: number;
  groupId: string;
  isDm: boolean;
  afterTimestamp?: string;
}
export const fetchMessages = async (
  groupId: string,
  isDm: boolean,
  afterTimestamp: string | null | undefined,
  page: number,
  accessToken: string
) => {
  let variables: messagesVariables = {
    groupId,
    isDm,
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
        Authorization: `Bearer ${accessToken}`,
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
  addresses: string[],
  accessToken: string
) => {
  const groupsQuery = addresses.length ? groupsWithAddresses : groups;
  const variables: groupQueryVariables = {
    page,
    pageCount: GROUP_PAGE_COUNT,
  };
  if (addresses.length) variables["addresses"] = addresses;
  else variables["addressQueryString"] = addressQueryString;
  const { data, errors } = await client.query({
    query: gql(groupsQuery),
    fetchPolicy: "no-cache",
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    variables: variables,
  });
  if (errors) console.log("errors", errors);
  return data.groups;
};

export const fetchBlockList = async (accessToken: string) => {
  try {
    const { data } = await client.query({
      query: gql(blockedList),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        channelId: "MESSAGING",
      },
    });
    return data.blockedList;
  } catch (e) {
    console.log(e);
    return {
      type: "block",
      message: "Something went wrong, Please try again in sometime.",
      level: 2,
    };
  }
};

export const blockUser = async (address: string, accessToken: string) => {
  try {
    const { data } = await client.mutate({
      mutation: gql(block),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        blockedAddress: address,
        channelId: "MESSAGING",
      },
    });
    return data;
  } catch (e) {
    console.log(e);
    return {
      type: "block",
      message: "Something went wrong, Please try again in sometime.",
      level: 1,
    };
  }
};

export const unblockUser = async (address: string, accessToken: string) => {
  try {
    const { data } = await client.mutate({
      mutation: gql(unblock),
      fetchPolicy: "no-cache",
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      variables: {
        blockedAddress: address,
        channelId: "MESSAGING",
      },
    });
    return data.unblock;
  } catch (e) {
    console.log(e);
    return {
      type: "unblock",
      message: "Something went wrong, Please try again in sometime.",
      level: 1,
    };
  }
};

export const deliverMessages = async (
  accessToken: string,
  chainId: string,
  newMessage: any,
  senderAddress: string,
  targetAddress: string,
  messagesStore: MessagesStore
) => {
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
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      if (data?.dispatchMessages?.length > 0) {
        messagesStore.updateLatestSentMessage(data?.dispatchMessages[0]);
      }
      return null;
    }
  } catch (e: any) {
    return {
      type: "delivery",
      message: e?.message || "Something went wrong, Message can't be delivered",
      level: 1,
    };
  }
};

export const deliverGroupMessages = async (
  accessToken: string,
  chainId: string,
  newMessage: any,
  encryptedSymmetricKey: string,
  messageType: GroupMessageType,
  senderAddress: string,
  groupId: string
) => {
  try {
    if (newMessage) {
      const encryptedData = await encryptGroupMessage(
        chainId,
        newMessage,
        messageType,
        encryptedSymmetricKey,
        senderAddress,
        groupId,
        accessToken
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
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      if (data?.dispatchMessages?.length > 0) {
        return data?.dispatchMessages[0];
      }
      return null;
    }
  } catch (e: any) {
    console.error(e);
    return {
      type: "delivery",
      message: "Something went wrong, Message can't be delivered",
      level: 1,
    };
  }
};

export const messageListener = (
  userAddress: string,
  accessToken: string,
  messageStore: MessagesStore
) => {
  const wsLink = createWSLink(accessToken);
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
          authorization: `Bearer ${accessToken}`,
        },
      },
    })
    .subscribe({
      next({ data }: { data: { newMessageUpdate: NewMessageUpdate } }) {
        const { target, groupId } = data.newMessageUpdate.message;
        /// Distinguish between Group and Single chat
        const id = groupId.split("-").length == 2 ? target : userAddress;

        messageStore.updateMessages(data.newMessageUpdate.message);
        /// Adding timeout for temporaray as Remove At Group subscription not working
        setTimeout(() => {
          recieveGroups(0, id, accessToken, messageStore);
        }, 100);
      },
      error(err) {
        console.error("err", err);
        return {
          type: "subscription",
          message: "Something went wrong, Cant fetch latest messages",
          level: 1,
        };
      },
      complete() {
        console.log("completed");
      },
    });
};

export const groupsListener = (
  userAddress: string,
  accessToken: string,
  messageStore: MessagesStore
) => {
  const wsLink = createWSLink(accessToken);
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
  queryGroupSubscription = newClient
    .subscribe({
      query: gql(listenGroups),
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    })
    .subscribe({
      next({ data }: { data: any }) {
        const group = data.groupUpdate.group;

        if (group.isDm) {
          const ids = group.id.split("-");
          group.userAddress =
            ids[0].toLowerCase() !== userAddress.toLowerCase()
              ? ids[0]
              : ids[1];
        } else {
          group.userAddress = group.id;
        }
        messageStore.updateGroupsData(group);
      },
      error(err) {
        console.error("err", err);
        return {
          type: "subscription",
          message: "Something went wrong, Cant fetch latest messages",
          level: 1,
        };
      },
      complete() {
        console.log("completed");
      },
    });
};

export const messageAndGroupListenerUnsubscribe = () => {
  if (querySubscription) querySubscription.unsubscribe();
  if (queryGroupSubscription) queryGroupSubscription.unsubscribe();
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
          Authorization: `Bearer ${accessToken}`,
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
    return group;
  } catch (err) {
    console.error("err", err);
  }
};

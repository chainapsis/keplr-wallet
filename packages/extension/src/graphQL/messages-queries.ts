export const sendMessages = `mutation Mutation($messages: [InputMessage!]!) {
    dispatchMessages(messages: $messages) {
      id
      sender
      target
      contents
      expiryTimestamp
      commitTimestamp
    }
  }`;

// TODO(!!!): I expect these also need types associated for all of the queries
//            here
export const mailbox = `query Mailbox($groupId: String, $page: Int, $pageCount: Int) {
  mailbox(groupId: $groupId, page: $page, pageCount: $pageCount) {
    messages {
      id
      target
      sender
      groupId
      contents
      expiryTimestamp
      commitTimestamp
    }
    pagination {
      lastPage
      page
      pageCount
      total
    }
  }
}`;

export const groups = `query Query($addressQueryString: String, $page: Int, $pageCount: Int) {
  groups(addressQueryString: $addressQueryString, page: $page, pageCount: $pageCount) {
    groups {
      createdAt
      id
      lastMessageSender
      lastMessageContents
      name
      lastMessageTimestamp
    }
    pagination {
      lastPage
      page
      total
      pageCount
    }
  }
}`;

export const groupsWithAddresses = `query Query($page: Int, $pageCount: Int, $addresses: [String!]) {
  groups(page: $page, pageCount: $pageCount, addresses: $addresses) {
    groups {
      createdAt
      id
      lastMessageSender
      lastMessageContents
      name
      lastMessageTimestamp
    }
    pagination {
      lastPage
      page
      total
      pageCount
    }
  }
}`;

export interface Message {
  id: string;
  sender: string;
  target: string;
  contents: string;
  groupId: string;
  expiryTimestamp: string;
  commitTimestamp: string;
}

export interface NewMessageUpdate {
  type: string;
  message: Message;
}

export const listenMessages = `subscription NewMessageUpdate {
    newMessageUpdate {
      type
      message {
        id
        sender
        target
        contents
        expiryTimestamp
        commitTimestamp
      }
    }
  }`;

export const blockedList = `query Query($channelId: ChannelId!) {
    blockedList(channelId: $channelId) {
      id
      blockerAddress
      blockedAddress
      channelId
      timestamp
    }
  }`;

export const block = `mutation Mutation($blockedAddress: String!, $channelId: ChannelId!) {
    block(blockedAddress: $blockedAddress, channelId: $channelId) {
      id
      blockerAddress
      blockedAddress
      channelId
      timestamp
    }
  }`;

export const unblock = `mutation Mutation($blockedAddress: String!, $channelId: ChannelId!) {
  unblock(blockedAddress: $blockedAddress, channelId: $channelId) {
    id
    blockerAddress
    blockedAddress
    channelId
    timestamp
  }
}`;

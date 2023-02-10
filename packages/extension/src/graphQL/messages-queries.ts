export const sendMessages = `mutation Mutation($messages: [InputMessage!]!) {
    dispatchMessages(messages: $messages) {
      id
      sender
      target
      groupId
      contents
      expiryTimestamp
      commitTimestamp
    }
  }`;

// TODO(!!!): I expect these also need types associated for all of the queries
//            here

export const mailboxWithTimestamp = `query Query($groupId: String, $isDm: Boolean, $afterTimestamp: Date) {
  mailbox(groupId: $groupId, isDm: $isDm, afterTimestamp: $afterTimestamp) {
    messages {
      commitTimestamp
      contents
      expiryTimestamp
      groupId
      id
      target
      sender
    }
  }
}`;

export const mailbox = `query Mailbox($groupId: String, $isDm: Boolean, $page: Int, $pageCount: Int) {
  mailbox(groupId: $groupId, isDm: $isDm, page: $page, pageCount: $pageCount) {
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
      id
      name
      isDm
      description
      lastMessageContents
      lastMessageSender
      lastMessageTimestamp
      lastSeenTimestamp
      addresses {
        address
        pubKey
        lastSeenTimestamp
        groupLastSeenTimestamp
        encryptedSymmetricKey
        isAdmin
        removedAt
      }
      removedAt
      createdAt
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
      id
      name
      isDm
      description
      lastMessageContents
      lastMessageSender
      lastMessageTimestamp
      lastSeenTimestamp
      addresses {
        address
        pubKey
        lastSeenTimestamp
        groupLastSeenTimestamp
        encryptedSymmetricKey
        isAdmin
        removedAt
      }
      removedAt
      createdAt
    }
    pagination {
      lastPage
      page
      total
      pageCount
    }
  }
}`;

export const listenMessages = `subscription NewMessageUpdate {
    newMessageUpdate {
      type
      message {
        id
        groupId
        sender
        target
        contents
        expiryTimestamp
        commitTimestamp
      }
    }
  }`;

export interface Addresses {
  address: string;
  lastSeenTimestamp: string;
}

export const listenGroups = `subscription GroupUpdate {
  groupUpdate {
    group {
      id
      name
      isDm
      description
      lastMessageContents
      lastMessageSender
      lastMessageTimestamp
      lastSeenTimestamp
      addresses {
        address
        pubKey
        lastSeenTimestamp
        groupLastSeenTimestamp
        encryptedSymmetricKey
        isAdmin
        removedAt
      }
      createdAt
      removedAt
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

export const updateGroupLastSeen = `mutation Mutation($groupId: String!, $lastSeenTimestamp: String!, $groupLastSeenTimestamp: String!) {
  updateGroupLastSeen(groupId: $groupId, lastSeenTimestamp: $lastSeenTimestamp, groupLastSeenTimestamp: $groupLastSeenTimestamp) {
    id
    name
    isDm
    description
    lastMessageContents
    lastMessageSender
    lastMessageTimestamp
    lastSeenTimestamp
    addresses {
      address
      pubKey
      lastSeenTimestamp
      groupLastSeenTimestamp
      encryptedSymmetricKey
      isAdmin
      removedAt
    }
    createdAt
    removedAt
  }
}`;

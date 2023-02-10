export const UpdatePublicKey = `mutation UpdatePublicKey($publicKeyDetails: InputPublicKey!) {
  updatePublicKey(publicKeyDetails: $publicKeyDetails) {
    address
    channelId
    createdAt
    id
    privacySetting
    publicKey
    updatedAt
  }
}`;

export const Group = `mutation Mutation($groupDetails: GroupDetails!) {
  group(groupDetails: $groupDetails) {
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

export const leaveGroupMutation = `mutation Mutation($groupId: String) {
  leaveGroup(groupId: $groupId)
}`;

export const UpdateGroupLastSeen = `mutation Mutation($groupId: String!, $lastSeenTimestamp: Date!) {
  updateGroupLastSeen(groupId: $groupId, lastSeenTimestamp: $lastSeenTimestamp) {
    addresses {
      address
      encryptedSymmetricKey
      isAdmin
      lastSeenTimestamp
      pubKey
    }
    createdAt
    description
    id
    isDm
    lastMessageContents
    lastMessageSender
    lastMessageTimestamp
    lastSeenTimestamp
    name
  }
}`;

export interface Groups {
  [contactAddress: string]: Group;
}

export interface Group {
  id: string;
  name: string;
  isDm: boolean;
  addresses: GroupAddress[];
  lastMessageContents: string;
  lastMessageSender: string;
  lastMessageTimestamp: string;
  lastSeenTimestamp: string;
  description?: string;
  createdAt: string;
  removedAt: Date;
}
export interface GroupAddress {
  address: string;
  pubKey: string;
  lastSeenTimestamp: string;
  groupLastSeenTimestamp: string;
  encryptedSymmetricKey: string;
  isAdmin: boolean;
  removedAt: Date;
}

export interface Message {
  id: string;
  sender: string;
  target: string;
  contents: string;
  groupId: string;
  expiryTimestamp: string;
  commitTimestamp: string;
}

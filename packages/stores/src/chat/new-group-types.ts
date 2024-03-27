export interface NewGroupDetails {
  isEditGroup: boolean;
  group: GroupDetails;
}
export interface GroupDetails {
  contents: string;
  description: string | undefined;
  groupId: string;
  members: GroupMembers[];
  name: string;
  onlyAdminMessages: boolean;
}
export interface GroupMembers {
  address: string;
  pubKey: string;
  encryptedSymmetricKey: string;
  isAdmin: boolean;
}

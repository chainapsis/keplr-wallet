export enum PrivacySetting {
  Contacts = "CONTACTS",
  Everybody = "EVERYBODY",
  Nobody = "NOBODY",
}

export interface PubKey {
  publicKey: string | undefined;
  privacySetting: PrivacySetting | undefined;
}

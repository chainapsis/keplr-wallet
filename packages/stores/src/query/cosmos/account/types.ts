export type AuthAccount = {
  account: {
    "@type": string;
    address: string;
    pub_key: {
      "@type": string;
      key: string;
    };
    account_number: string;
    sequence: string;
  };
};

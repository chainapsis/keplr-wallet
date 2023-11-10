# Chat Section README

## Introduction

This README provides an overview of the components and processes involved in the chat section of our application. It covers how to enable communication between user-user, user-agent and agent-agent.

## Initializing a New Chat (Between Users)

To initiate a new chat between users, the following steps are taken:

### Create a new keypair for messaging

A wallet's own private public key pair can be used for messaging but it is a good practice to create a new key pair related to the account for messaging ensuring better security. A pair of keys is necessary for having end to end encryption/decryption.

[Umbral service](https://github.com/fetchai/fetch-wallet/blob/master/packages/background/src/umbral/service.ts) can be used to generate a new private key corresponding to a wallet. The idea is to sign a message using user's wallet which is then converted to a private key.

Example:

- Get a private key by signing a message using the wallet (keyRingService is the wallet in our case):

  ```javascript
  private async getSigningPrivateKey(
  env: Env,
  chainId: string
  ): Promise<Umbral.SecretKey> {
  const chainInfo = await this.chainsService.getChainInfo(chainId);
  const umbral = await this.getUmbral();

  const seed = Hash.sha256(
    Buffer.from(
      await this.keyRingService.sign(
        env,
        chainInfo.chainId,
        Buffer.from(
          JSON.stringify({
            account_number: 0,
            chain_id: chainInfo.chainId,
            fee: [],
            memo: "Create Umbral Signing Secret encryption key. Only approve requests by Keplr.",
            msgs: [],
            sequence: 0,
          })
        )
      )
    )
  );

  return umbral.SecretKey.fromBytes(seed);
  }
  ```

  Ref: https://github.com/fetchai/fetch-wallet/blob/003a10e7d10cdfc2f5130212a6edfb42f3913116/packages/background/src/messaging/service.ts#L294

- generate signing public key from created signing :

  ```javascript
      async getSigningPublicKey(env: Env, chainId: string): Promise<Uint8Array> {
        const sk = await this.getSigningPrivateKey(env, chainId);
        return sk.publicKey().toBytes();
      }
  ```

  Ref: https://github.com/fetchai/fetch-wallet/blob/003a10e7d10cdfc2f5130212a6edfb42f3913116/packages/background/src/messaging/service.ts#L38C1-L44C9

### Getting the JWT access token

The token is fetched using the `getJWT` function as defined [here](https://github.com/fetchai/fetch-wallet/blob/003a10e7d10cdfc2f5130212a6edfb42f3913116/packages/fetch-extension/src/utils/auth.ts#L78), which follows a series of authentication steps. This access token is used for all the requests made to the memorandum service.

#### Auth Service URL

Note: the current auth service URL (used as url in below REST calls):

`const url = https://auth-attila.sandbox-london-b.fetch-ai.com`

#### `getJWT(chainId: string, url: string)`

The `getJWT` function is responsible for obtaining a JSON Web Token (JWT) from our auth service by following a series of authentication steps. This token is used for authentication and authorization in the application.

| Parameter  | Type    | Description                                        |
|------------|---------|----------------------------------------------------|
| `chainId`  | string  | The chain identifier used for the authentication process. |
| `url`      | string  | The URL of the authentication server where the JWT will be requested. |


#### Return Value

- `Promise<string | undefined>`: A promise that resolves to a JWT string if the authentication is successful. If the authentication fails or if the function is executed in a non-browser environment, it returns `undefined`.

#### Flow of Operation

- Retrieves the messaging public key created in the previous step.

  Example:
  ```javascript
    const pubKey = await requester.sendMessage(
    BACKGROUND_PORT,
    new GetMessagingPublicKey(GRAPHQL_URL.MESSAGING_SERVER, chainId, "", null)
    );
  ```

- Constructs an address with prefix "fetch" from the public key and creates a request object.

  ```javascript
    const addr = Bech32.encode(
      "fetch",
      rawSecp256k1PubkeyToRawAddress(fromHex(pubKey.publicKey))
    );
    const request = {
      address: addr,
      public_key: pubKey.publicKey,
    };
  ```

- Sends a POST request to the authentication server's "/request_token" endpoint with the request object and config to obtain a payload.

  ```javascript
  const config = {
    headers: { "Access-Control-Allow-Origin": "*" },
  };
  const r1 = await axios.post(`${url}/request_token`, request, config);
  const payload = r1.data.payload;
  ```

- Signs the received payload (an arbitrary message), generating a signature to prove ownership of the key. Check the procedure [here](https://github.com/fetchai/fetch-wallet/blob/003a10e7d10cdfc2f5130212a6edfb42f3913116/packages/fetch-extension/src/utils/auth.ts#L111).

- Sends a POST request to the authentication server's "/login" endpoint with the public key, signed bytes, and signature.
  ```javascript
  const r2 = await axios.post(`${url}/login`, {
                signature,
                public_key: pubKey,
                signed_bytes: toBase64(serializeSignDoc(signDoc)),
              }, config);
  const accessToken = r2.data.token;
  
  ```
- If the authentication is successful, the function returns the JWT obtained from the server.

### Memorandum service URLs

Staging: 
- Rest: `https://messaging-server.sandbox-london-b.fetch-ai.com/graphql` (The playground can be used to send GQL requests)
- Websocket subscription: wss://messaging-server.sandbox-london-b.fetch-ai.com/subscription

Production:
- Rest: `https://messaging.fetch-ai.network/graphql`
- Websocket subscription: `wss://messaging.fetch-ai.network/subscription`

### Register messaging public key in memorandum backend service

Now that we have generated a new key pair for messaging, this public key needs to registered in the memorandum service corresponding to the account address. This is because if I want to send a message to another address, I would need their registered messaging public key.
The user also needs to sign the public key using their wallet account to prove the address' ownership of the public key.

1. Signing the messaging public key using the wallet

    To register a messaging public key it must be signed by the wallet account to prove ownership of the wallet and establish a corelation between the messaging key and the wallet account address.

    Encode public key:
    ```javascript
    const encoded = encoder.encode(pubKey);
    ```

    Create signDoc :

    ```javascript
    const encoded = encoder.encode(pubKey);
    const signDoc = {
      chain_id: "",
      account_number: "0",
      sequence: "0",
      fee: {
        gas: "0",
        amount: [],
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer: address,
            data: toBase64(encoded),
          },
        },
      ],
      memo: "",
    };
    ```

    Get Signature:

    ```javascript
    const signData = await this.keyRingService.requestSignAmino(
      env,
      "",
      chainId,
      address,
      signDoc,
      { isADR36WithString: true }
    );

    signature = signData.signature;
    signed = signData.signed;
    ```

    Get signedObjBase64
    ```javascript
    Buffer.from(JSON.stringify(signed)).toString("base64")
    ```

2. Registering the messaging key with other messaging settings

    Now, after obtaining signature, we can register messaging key using below mutation.

    ```javascript
    {
      mutation: gql(`mutation Mutation($publicKeyDetails: InputPublicKey!) {
        updatePublicKey(publicKeyDetails: $publicKeyDetails) {
          publicKey
          privacySetting
          readReceipt
        }
      }`),
      variables: {
        publicKeyDetails: {
          publicKey: messagingPubKey,
          address: walletAddress,
          channelId,
          chainId,
          privacySetting,
          readReceipt: chatReadReceiptSetting,
          signingPubKey,
          signature,
          signedObjBase64,
        },
      },
      context: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }

    ```

    | Parameter      | Description                                                                                      |
    | -------------- | ------------------------------------------------------------------------------------------------ |
    | `publicKey`    | The messaging public key                                                                          |
    | `address`      | The original wallet's address                                                                   |
    | `signingPubKey`| The original wallet's public key                                                                |
    | `signature`    | Signature generated by signing the messaging public key. The signature mechanism used is the generic ECDSA scheme (keplr.signAmino function).       |
    | `signedObjBase64` | The object that was signed. It is basically the signDoc defined above.   |
    | `readReceipt` |  A boolean value to set if read receipts are enabled or not. If disabled, nobody can see if you have seen someone's message and neither you can see if someone has seen a message sent by you.   |
    | `channelId` | A unique identifier for establishing communication in specific channels. Any string value can be set and the address registered will only be discoverable only in that channel.   |
    | `chainId` | Similar to channelId, chainId is also a chain identifier where the communication is established. Any string value can be set and the address registered will only be discoverable only in that chain.   |
    | `PrivacySetting` | Sets which chats should be visible (Based on the stored value, client side filtering is applied, all chats are fetched irrespective and there is no backend filter). It's type is shown below: |

    ```javascript
    enum PrivacySetting {
      Contacts = "CONTACTS", // Only chats with people in the address book can be seen
      Everybody = "EVERYBODY", // All chats are visible. Default.
      Nobody = "NOBODY", // Chat is disabled in the client side
    }
    ```


### Search another user/account to send a message to

Once both user A and user B have registered, they will be now discoverable to each other by their respective account addresses. The system checks the DB for receiver user's messaging public key. If not found, it returns a ["NewUser/isUserActive error"](https://github.com/fetchai/fetch-wallet/blob/888d8a59287537b3afa26c99bb64c65ae16a751d/packages/fetch-extension/src/pages/new-chat/index.tsx#L42), indicating that the chat is not active.


  ```javascript
  {
    query:
      gql(`query Query($address: String!, $chainId: String!  $channelId: ChannelId!) {
      publicKey(address: $address, chainId: $chainId, channelId: $channelId) {
        publicKey
        privacySetting
        readReceipt
      }
    }`),
    variables: {
      address: targetAddress,
      channelId,
      chainId,
    },
    context: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  }
  ```

   | Parameter      | Description |
   | -------------- | ------------ |
   | `address`    | The address whose public key you want to search. |
   | `channelId`    | The communication channelId identifier |
   | `chainId`    | The communication chainId identifier |

## Sending a message

To send a message, you need to perform the following steps:

1. Encode data:  Before sending the message, you should encode the encrypted data you want to send. You'll need to create data payload and encode it, as shown below:

    ```javascript
    const dataPayload = {
      encryptedSenderData: senderCipher,
      encryptedTargetData: targetCipher,
    };

    const encodedData = toBase64(Buffer.from(JSON.stringify(dataPayload)));
    ```
    
    The two `ciphers` used in data payload is the encrypted message:

   | Cipher      | Description |
   | -------------- | ------------ |
   | `Sender cipher`    | Message encrypted using sender's public key and used by sender to decrypt and display previously sent or received messages. |
   | `Target cipher`    | Message ncrypted using target's public key and used by target to decrypt and display previously received messages. |


    NOTE: The developer is free to use any encryption or decryption library. We recommend using `eciesjs`.

2. Create Envelope: Get other parameters and encapsulate them into data envelope as shown below. This is commonly done to ensure that the data is in a suitable format for transmission.

    ```javascript
      const dataEnvelope = {
        data: encodedData,
        senderPublicKey: senderPublicKey.publicKey,
        targetPublicKey: targetPublicKey.publicKey,
        groupLastSeenTimestamp: new Date(),
        lastSeenTimestamp: new Date(),
        signature,
        channelId: MESSAGE_CHANNEL_ID,
      };
    ```

    | Parameter      | Description |
    | -------------- | ------------ |
    | `data`    | a JSON data payload as a Base64 string |
    | `senderPublicKey`    | Sender's public key |
    | `targetPublicKey`    | Receiver's public key |
    | `groupLastSeenTimestamp`    | A timestamp value for the group |
    | `lastSeenTimestamp`    | A timestamp reference for self |
    | `signature`    | Generated by signing the dataPayload using the messaging key. |
    | `channelId`    | The communication channelId identifier |


    To get `signature`, we'll need to sign `encodedData`(encoded data payload) obtained by above step using the messaging private key.

    ```javascript
    // get the signature for the payload
    const signature = await requester.sendMessage(
      BACKGROUND_PORT,
      new SignMessagingPayload(chainId, encodedData)
    );
    ```

2. Create `InputMessage`: You'll need to structure your data into an `InputMessage` object that follows the GraphQL schema messaging system. This typically includes base64 encoded `dataEnvelope`.

    ```javascript
    const Contents = toBase64(Buffer.from(JSON.stringify(dataEnvelope)))
    ```
    ```javascript
    input InputMessage {
      # base64 encoded MessageEnvelope
      contents: Contents!
      }
    ```
3. Execute Mutation over client.

    Mutation:

    ```javascript
    mutation Mutation($messages: [InputMessage!]!) {
        dispatchMessages(messages: $messages) {
          id
          sender
          target
          groupId
          contents
          expiryTimestamp
          commitTimestamp
        }
      }
    ```

4. When the message is succesfully sent, the backend service creates a new group between sender and target if it is the first message between the 2.

### Get all chat groups

  Query to get all the groups an address has chats with.

  ```javascript
  `query Query($addressQueryString: String, $page: Int, $pageCount: Int) {
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
  ```

Request Params:
  | Parameter      | Description |
  | -------------- | ------------ |
  | `addressQueryString`    | The address or part of the address to fetch the groups of |
  | `page`    | The page number |
  | `pageCount`    | Items per page |


Returns groups that have following properties
  | Parameter      | Description |
  | -------------- | ------------ |
  | `id`    | Group Id. For messages between the userA and userB, the id is automatically created as addressA-addressB |
  | `name`    | Group Name |
  | `isDm`    | Boolean value denoting if is group is a DM (Communication between two address only) |
  | `description`    | Group description |
  | `lastMessageContents`    | Group's last message content |
  | `lastMessageSender`    | Group's last message sender's address |
  | `lastMessageTimestamp`    | Group's last message time stamp |
  | `lastSeenTimestamp`    | Last seen time stamp |
  | `addresses`    | An object containing details like address, pubKey, lastSeenTimeStamps, groupLastSeenTimestamp, encryptedSymmetricKey, isAdmin, removedAt of all participants |
  | `removedAt`    | TimeStamp, if removed from group|
  | `createdAt`    | Group creation timeStamp |


## Get all messages in a chat

Query to get all the messages in a particular group:

```javascript
`query Mailbox($groupId: String, $isDm: Boolean, $page: Int, $pageCount: Int) {
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
```
Request Params:
  | Parameter      | Description |
  | -------------- | ------------ |
  | `groupId`    | GroupId of the group to fetch the messages of |
  | `isDm`    | If the group is a personal chat between 2 users, this should be sent as true |
  | `page`    | The page number |
  | `pageCount`    | Items per page |


Returned messages have following properties

  | Parameter      | Description |
  | -------------- | ------------ |
  | `id`    | Message Id |
  | `target`    | Receivers address |
  | `sender`    | Sender's address |
  | `groupId`    | Group Id |
  | `contents`    | Encoded message content |
  | `expiryTimestamp`    | message expiry timeStamp. Will not be fetched if expired. |
  | `commitTimestamp`    | TimeStamp of when this message was received|

The mailbox query return all the chats with the contents. The structure of this content is described above. Once you have the dataPayload, you will need to decrypt either the senderCipher or the targetCipher based on who the sender of the message is. Note that the decrypt library used should be the same used for encrypting data.

## Update pub key or privacy settings

Below mutation changes the public key details, when an user with registered public key executes this, privacy setting or public key can be updated.

Mutation:
  ```javascript
  {
      mutation: gql(`mutation UpdatePublicKey($publicKeyDetails: InputPublicKey!) {
        updatePublicKey(publicKeyDetails: $publicKeyDetails) {
          address
          channelId
          createdAt
          id
          privacySetting
          publicKey
          updatedAt
          }
      }`),
      context: {
        headers: {
          Authorization: `Bearer ${state.user.accessToken}`,
        },
      },
      variables: {
        publicKeyDetails,
      },
    };
  ```

  ```javascript
  export interface PublicKeyDetails {
    address: string;
    channelId: string;
    privacySetting: string;
    publicKey: string;
  }
  ```

  | Parameter      | Description |
  | -------------- | ------------ |
  | `address`    | Address associated with signing public key |
  | `channelId`    | The communication channelId identifier |
  | `privacySetting`    | Privacy settings, as shown below |
  | `publicKey`    | public key to be updated |

  privacy setting could be any from,

  ```javascript
  export enum PrivacySetting {
    Contacts = 'CONTACTS',
    Everybody = 'EVERYBODY',
    Nobody = 'NOBODY'
  }
  ```

## Message subscription
Subscriptions are basically websocket driven endpoints using graphql. This is how it is created:

```Javascript
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

export const createWSLink = (token: string) => {
  return new GraphQLWsLink(
    createClient({
      url: GRAPHQL_URL.SUBSCRIPTION_SERVER, // The websocket subscription URL 
      connectionParams: {
        authorization: `Bearer ${token}`,
      },
      on: {
        connecting: () => {
          console.log("connecting");
        },
        opened: () => {
          console.log("opened");
          store.dispatch(setIsChatSubscriptionActive(true));
        },
      },
    })
  );
};
```

The `token` is basically the JWT token we receive by interacting with Auth service. The JWT token is used to identify the user subscribing and the backend knows whom to send updates to.

Below is an example on how you can subscribe to a particular subscription:
```Javascript
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
    query: gql(listenMessages), // The GQL subscription request
    context: {
      headers: {
        authorization: `Bearer ${state.user.accessToken}`,
      },
    },
  })
  .subscribe({
    next({ data }: { data: { newMessageUpdate: NewMessageUpdate } }) {
      const { target, groupId } = data.newMessageUpdate.message;
      /// Distinguish between Group and Single chat
      const id = groupId.split("-").length == 2 ? target : userAddress;
      store.dispatch(updateMessages(data.newMessageUpdate.message));

      /// Adding timeout for temporaray as Remove At Group subscription not working
      setTimeout(() => {
        recieveGroups(0, id);
      }, 100);
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
```

There are 2 subscriptions available to subscribe
1. New Message: Any new message received by the user subscribed

```javascript
`subscription NewMessageUpdate {
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

enum MessageUpdateType {
  NEW_MESSAGE
  DELETE_MESSAGE
}
```

2. Group Updates: Any group related updates received where the user subscribed is a part of. For DMs the important thing here is observing the groupLastSeenTimestamp of the other user to detect if the message has been read or not.

Subscription query:

```javascript
`subscription GroupUpdate {
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
```



#### How to unsubscribe to messages:

1. Check for the subscription, if stored in variable(point 3 above)
2. Unsubscribe using variable.unsubscribe()

### Block user (Optional)

#### How to block an user

1. Make a GraphQL mutation using the client.mutate method. It performs the blocking action by sending a mutation request to the server.
2. Set the Authorization header in the request, using the user's access token.
3. Two variables are included in the request:
    blockedAddress: The address of the user you want to block, specified as the address parameter.
    channelId: The channel ID, which is set to "MESSAGING."
4. Upon successful execution of the GraphQL mutation, extract the relevant data (likely the result of the block mutation) from the response
5. Dispatch an action to update the application's state with the information about the blocked user. This action can be used to reflect the blocking status in the user interface

Mutation: 
```javascript
`mutation Mutation($blockedAddress: String!, $channelId: ChannelId!) {
    block(blockedAddress: $blockedAddress, channelId: $channelId) {
      id
      blockerAddress
      blockedAddress
      channelId
      timestamp
    }
  }`;
```

variables:
```javascript
{
  blockedAddress: address,
  channelId: "MESSAGING",
}
```
  | Parameter      | Description |
  | -------------- | ------------ |
  | `blockedAddress`    | Address of user to be blocked
  | `channelId`    | The communication channelId identifier 


### Unblock user (Optional)

1. Make a GraphQL mutation using the client.mutate method. It performs the unblocking action by sending a mutation request to the server.
2. Set the Authorization header in the request, using the user's access token.
3. Two variables are included in the request:
    blockedAddress: The address of the user you want to unblock, specified as the address parameter.
    channelId: The channel ID, which is set to "MESSAGING."
4. Upon successful execution of the GraphQL mutation, extract the relevant data (likely the result of the unblock mutation) from the response
5. Dispatch an action to update the application's state with the information about the unblocked user. This action can be used to reflect the unblocking status in the user interface

Mutation:
  ```javascript
  `mutation Mutation($blockedAddress: String!, $channelId: ChannelId!) {
    unblock(blockedAddress: $blockedAddress, channelId: $channelId) {
      id
      blockerAddress
      blockedAddress
      channelId
      timestamp
    }
  }`;
  ```
variables:
  ```javascript
  {
    blockedAddress: address,
    channelId: "MESSAGING",
  }
  ```

  | Parameter      | Description |
  | -------------- | ------------ |
  | `blockedAddress`    | Address of user to be blocked
  | `channelId`    | The communication channelId identifier 


### Updating timestamps (Optional)

#### How does update Group Timestamp work

in every group, each user has 2 properties:
- lastSeenTimestamp: This value is used to get the seen timestamp from the user perspective. For example whenever the user opens a particular group chat, the seen timestamp is updated to the corresponding value. This helps to detect the presence of new unread messages and align the group chat UI to the top of the new unread messsages whenever the group chat is opened by the user.
- groupLastSeenTimestamp: This value is used to get the last seen timestamp of a user from another user's perspective present in the group. This is used to detect if a particular message is read by the other user or not. So if userA's group last seen timestamp is 10 AM, all the other users in the group can see this value and know that the messages before 10 AM is read by user A.

Both these values are ideally encrypted. Since lastSeenTimestamp is for the user itself, it is encrypted using the user's public key. The groupLastSeenTimestamp is for the other members in the group, so it is encrypted using the other user's public key.
 

Below mutation can be used to update Group time stamps which can be executed using 
Mutation:
```javascript
`mutation Mutation($groupId: String!, $lastSeenTimestamp: String!, $groupLastSeenTimestamp: String!) {
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
```

| Parameter      | Description |
| -------------- | ------------ |
| `groupId`    | id of the group which is being updated,
| `lastSeenTimestamp`    | Encrypted last seen timestamp 
| `groupLastSeenTimestamp`    | Encrypted group last seen timestamp

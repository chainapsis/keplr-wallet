import {
  QuerySharedContext,
  ObservablePostQuery,
  PostRequestOptions,
  ObservablePostQueryMap,
} from "@keplr-wallet/stores";
import { makeObservable } from "mobx";

export interface TxMsgDecoderResponse {
  result: {
    messages: Record<string, unknown>[];
  };
}

export interface TxMsgDecoderRequestBody {
  result: {
    messages: ProtoToAminoRequestMsg[];
  };
}

interface ProtoToAminoRequestMsg {
  typeUrl: string;
  value: string;
}

export class ObservablePostTxMsgDecoderInner extends ObservablePostQuery<
  TxMsgDecoderResponse,
  unknown,
  TxMsgDecoderRequestBody
> {
  constructor(
    sharedContext: QuerySharedContext,
    baseURL: string,
    url: string,
    body: TxMsgDecoderRequestBody,
    postOptions: PostRequestOptions
  ) {
    super(sharedContext, baseURL, url, body, postOptions);

    makeObservable(this);
  }
}

export class ObservablePostTxMsgDecoder extends ObservablePostQueryMap<
  TxMsgDecoderResponse,
  any,
  TxMsgDecoderRequestBody
> {
  constructor(sharedContext: QuerySharedContext, baseURL: string) {
    super((key: string) => {
      const { url, body, postOptions } = JSON.parse(key);

      return new ObservablePostTxMsgDecoderInner(
        sharedContext,
        baseURL,
        url,
        body,
        postOptions
      );
    });
  }

  protoToAmino(chainIdentifier: string, msgs: ProtoToAminoRequestMsg[]) {
    return this.get(
      JSON.stringify({
        url: `${chainIdentifier}/tx/proto-to-amino`,
        body: {
          messages: msgs,
        },
        postOptions: { headers: { "Content-Type": "application/json" } },
      })
    );
  }
}

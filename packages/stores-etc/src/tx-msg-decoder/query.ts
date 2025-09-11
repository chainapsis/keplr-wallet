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
    messages: ProtoToRawJsonRequestMsg[];
  };
}

interface ProtoToRawJsonRequestMsg {
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
  protected _baseURL: string = "";

  constructor(sharedContext: QuerySharedContext, baseURL: string) {
    super((key: string) => {
      const { url, body, postOptions } = JSON.parse(key);

      this._baseURL = baseURL;

      return new ObservablePostTxMsgDecoderInner(
        sharedContext,
        baseURL,
        url,
        body,
        postOptions
      );
    });
  }

  protoToRawJson(chainIdentifier: string, msgs: ProtoToRawJsonRequestMsg[]) {
    return this.get(
      JSON.stringify({
        baseURL: this._baseURL,
        url: `${chainIdentifier}/tx/proto-to-raw-json`,
        body: msgs,
        postOptions: { headers: { "Content-Type": "application/json" } },
      })
    );
  }
}

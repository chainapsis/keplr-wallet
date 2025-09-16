import { QuerySharedContext, ObservablePostQuery } from "@keplr-wallet/stores";

export interface TxMsgDecoderResponse {
  result: {
    messages: Record<string, unknown>[];
  };
}

export interface TxMsgDecoderRequestBody {
  messages: ProtoToAminoRequestMsg[];
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
    body: TxMsgDecoderRequestBody
  ) {
    super(
      sharedContext,
      baseURL,
      url,
      body,
      {},
      {
        disableCache: true,
      }
    );
  }
}

export class ObservablePostTxMsgDecoder {
  constructor(
    private readonly sharedContext: QuerySharedContext,
    private readonly baseURL: string
  ) {}

  protoToAmino(chainIdentifier: string, msgs: ProtoToAminoRequestMsg[]) {
    return new ObservablePostTxMsgDecoderInner(
      this.sharedContext,
      this.baseURL,
      `${chainIdentifier}/tx/proto-to-amino`,
      {
        messages: msgs,
      }
    );
  }
}

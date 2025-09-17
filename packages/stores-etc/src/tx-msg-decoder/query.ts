import { QuerySharedContext, ObservablePostQuery } from "@keplr-wallet/stores";
import { getTxInterpreterURLPrefix } from "./get-tx-interpreter-url-prefix";

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

  protoToAmino(bech32Prefix: string, msgs: ProtoToAminoRequestMsg[]) {
    const urlPrefix = getTxInterpreterURLPrefix(bech32Prefix);

    if (!urlPrefix.length) {
      console.log(
        `Url prefix not supported. Unable to send the request to the tx-codec, bech32Prefix: ${bech32Prefix}`
      );
    }

    return new ObservablePostTxMsgDecoderInner(
      this.sharedContext,
      this.baseURL,
      `${urlPrefix}/tx/proto-to-amino`,
      {
        messages: msgs,
      }
    );
  }
}

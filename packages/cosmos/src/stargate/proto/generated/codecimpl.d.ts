import * as $protobuf from "protobufjs";
/** Namespace cosmos. */
export namespace cosmos {
  /** Namespace auth. */
  namespace auth {
    /** Namespace v1beta1. */
    namespace v1beta1 {
      /** Properties of a BaseAccount. */
      interface IBaseAccount {
        /** BaseAccount address */
        address?: string | null;

        /** BaseAccount pubKey */
        pubKey?: google.protobuf.IAny | null;

        /** BaseAccount accountNumber */
        accountNumber?: Long | null;

        /** BaseAccount sequence */
        sequence?: Long | null;
      }

      /** Represents a BaseAccount. */
      class BaseAccount implements IBaseAccount {
        /**
         * Constructs a new BaseAccount.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IBaseAccount);

        /** BaseAccount address. */
        public address: string;

        /** BaseAccount pubKey. */
        public pubKey?: google.protobuf.IAny | null;

        /** BaseAccount accountNumber. */
        public accountNumber: Long;

        /** BaseAccount sequence. */
        public sequence: Long;

        /**
         * Creates a new BaseAccount instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BaseAccount instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IBaseAccount
        ): cosmos.auth.v1beta1.BaseAccount;

        /**
         * Encodes the specified BaseAccount message. Does not implicitly {@link cosmos.auth.v1beta1.BaseAccount.verify|verify} messages.
         * @param m BaseAccount message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IBaseAccount,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a BaseAccount message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns BaseAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.BaseAccount;

        /**
         * Creates a BaseAccount message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns BaseAccount
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.BaseAccount;

        /**
         * Creates a plain object from a BaseAccount message. Also converts values to other types if specified.
         * @param m BaseAccount
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.BaseAccount,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this BaseAccount to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a ModuleAccount. */
      interface IModuleAccount {
        /** ModuleAccount baseAccount */
        baseAccount?: cosmos.auth.v1beta1.IBaseAccount | null;

        /** ModuleAccount name */
        name?: string | null;

        /** ModuleAccount permissions */
        permissions?: string[] | null;
      }

      /** Represents a ModuleAccount. */
      class ModuleAccount implements IModuleAccount {
        /**
         * Constructs a new ModuleAccount.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IModuleAccount);

        /** ModuleAccount baseAccount. */
        public baseAccount?: cosmos.auth.v1beta1.IBaseAccount | null;

        /** ModuleAccount name. */
        public name: string;

        /** ModuleAccount permissions. */
        public permissions: string[];

        /**
         * Creates a new ModuleAccount instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ModuleAccount instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IModuleAccount
        ): cosmos.auth.v1beta1.ModuleAccount;

        /**
         * Encodes the specified ModuleAccount message. Does not implicitly {@link cosmos.auth.v1beta1.ModuleAccount.verify|verify} messages.
         * @param m ModuleAccount message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IModuleAccount,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a ModuleAccount message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ModuleAccount
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.ModuleAccount;

        /**
         * Creates a ModuleAccount message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ModuleAccount
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.ModuleAccount;

        /**
         * Creates a plain object from a ModuleAccount message. Also converts values to other types if specified.
         * @param m ModuleAccount
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.ModuleAccount,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this ModuleAccount to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Params. */
      interface IParams {
        /** Params maxMemoCharacters */
        maxMemoCharacters?: Long | null;

        /** Params txSigLimit */
        txSigLimit?: Long | null;

        /** Params txSizeCostPerByte */
        txSizeCostPerByte?: Long | null;

        /** Params sigVerifyCostEd25519 */
        sigVerifyCostEd25519?: Long | null;

        /** Params sigVerifyCostSecp256k1 */
        sigVerifyCostSecp256k1?: Long | null;
      }

      /** Represents a Params. */
      class Params implements IParams {
        /**
         * Constructs a new Params.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IParams);

        /** Params maxMemoCharacters. */
        public maxMemoCharacters: Long;

        /** Params txSigLimit. */
        public txSigLimit: Long;

        /** Params txSizeCostPerByte. */
        public txSizeCostPerByte: Long;

        /** Params sigVerifyCostEd25519. */
        public sigVerifyCostEd25519: Long;

        /** Params sigVerifyCostSecp256k1. */
        public sigVerifyCostSecp256k1: Long;

        /**
         * Creates a new Params instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Params instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IParams
        ): cosmos.auth.v1beta1.Params;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmos.auth.v1beta1.Params.verify|verify} messages.
         * @param m Params message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IParams,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.Params;

        /**
         * Creates a Params message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Params
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.Params;

        /**
         * Creates a plain object from a Params message. Also converts values to other types if specified.
         * @param m Params
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.Params,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Params to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Represents a Query */
      class Query extends $protobuf.rpc.Service {
        /**
         * Constructs a new Query service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        );

        /**
         * Creates new Query service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        ): Query;

        /**
         * Calls Account.
         * @param request QueryAccountRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QueryAccountResponse
         */
        public account(
          request: cosmos.auth.v1beta1.IQueryAccountRequest,
          callback: cosmos.auth.v1beta1.Query.AccountCallback
        ): void;

        /**
         * Calls Account.
         * @param request QueryAccountRequest message or plain object
         * @returns Promise
         */
        public account(
          request: cosmos.auth.v1beta1.IQueryAccountRequest
        ): Promise<cosmos.auth.v1beta1.QueryAccountResponse>;

        /**
         * Calls Params.
         * @param request QueryParamsRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QueryParamsResponse
         */
        public params(
          request: cosmos.auth.v1beta1.IQueryParamsRequest,
          callback: cosmos.auth.v1beta1.Query.ParamsCallback
        ): void;

        /**
         * Calls Params.
         * @param request QueryParamsRequest message or plain object
         * @returns Promise
         */
        public params(
          request: cosmos.auth.v1beta1.IQueryParamsRequest
        ): Promise<cosmos.auth.v1beta1.QueryParamsResponse>;
      }

      namespace Query {
        /**
         * Callback as used by {@link cosmos.auth.v1beta1.Query#account}.
         * @param error Error, if any
         * @param [response] QueryAccountResponse
         */
        type AccountCallback = (
          error: Error | null,
          response?: cosmos.auth.v1beta1.QueryAccountResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.auth.v1beta1.Query#params}.
         * @param error Error, if any
         * @param [response] QueryParamsResponse
         */
        type ParamsCallback = (
          error: Error | null,
          response?: cosmos.auth.v1beta1.QueryParamsResponse
        ) => void;
      }

      /** Properties of a QueryAccountRequest. */
      interface IQueryAccountRequest {
        /** QueryAccountRequest address */
        address?: string | null;
      }

      /** Represents a QueryAccountRequest. */
      class QueryAccountRequest implements IQueryAccountRequest {
        /**
         * Constructs a new QueryAccountRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IQueryAccountRequest);

        /** QueryAccountRequest address. */
        public address: string;

        /**
         * Creates a new QueryAccountRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryAccountRequest instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IQueryAccountRequest
        ): cosmos.auth.v1beta1.QueryAccountRequest;

        /**
         * Encodes the specified QueryAccountRequest message. Does not implicitly {@link cosmos.auth.v1beta1.QueryAccountRequest.verify|verify} messages.
         * @param m QueryAccountRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IQueryAccountRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryAccountRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryAccountRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.QueryAccountRequest;

        /**
         * Creates a QueryAccountRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryAccountRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.QueryAccountRequest;

        /**
         * Creates a plain object from a QueryAccountRequest message. Also converts values to other types if specified.
         * @param m QueryAccountRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.QueryAccountRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryAccountRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryAccountResponse. */
      interface IQueryAccountResponse {
        /** QueryAccountResponse account */
        account?: google.protobuf.IAny | null;
      }

      /** Represents a QueryAccountResponse. */
      class QueryAccountResponse implements IQueryAccountResponse {
        /**
         * Constructs a new QueryAccountResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IQueryAccountResponse);

        /** QueryAccountResponse account. */
        public account?: google.protobuf.IAny | null;

        /**
         * Creates a new QueryAccountResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryAccountResponse instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IQueryAccountResponse
        ): cosmos.auth.v1beta1.QueryAccountResponse;

        /**
         * Encodes the specified QueryAccountResponse message. Does not implicitly {@link cosmos.auth.v1beta1.QueryAccountResponse.verify|verify} messages.
         * @param m QueryAccountResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IQueryAccountResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryAccountResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryAccountResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.QueryAccountResponse;

        /**
         * Creates a QueryAccountResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryAccountResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.QueryAccountResponse;

        /**
         * Creates a plain object from a QueryAccountResponse message. Also converts values to other types if specified.
         * @param m QueryAccountResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.QueryAccountResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryAccountResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryParamsRequest. */
      interface IQueryParamsRequest {}

      /** Represents a QueryParamsRequest. */
      class QueryParamsRequest implements IQueryParamsRequest {
        /**
         * Constructs a new QueryParamsRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IQueryParamsRequest);

        /**
         * Creates a new QueryParamsRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryParamsRequest instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IQueryParamsRequest
        ): cosmos.auth.v1beta1.QueryParamsRequest;

        /**
         * Encodes the specified QueryParamsRequest message. Does not implicitly {@link cosmos.auth.v1beta1.QueryParamsRequest.verify|verify} messages.
         * @param m QueryParamsRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IQueryParamsRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryParamsRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryParamsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.QueryParamsRequest;

        /**
         * Creates a QueryParamsRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryParamsRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.QueryParamsRequest;

        /**
         * Creates a plain object from a QueryParamsRequest message. Also converts values to other types if specified.
         * @param m QueryParamsRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.QueryParamsRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryParamsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryParamsResponse. */
      interface IQueryParamsResponse {
        /** QueryParamsResponse params */
        params?: cosmos.auth.v1beta1.IParams | null;
      }

      /** Represents a QueryParamsResponse. */
      class QueryParamsResponse implements IQueryParamsResponse {
        /**
         * Constructs a new QueryParamsResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.auth.v1beta1.IQueryParamsResponse);

        /** QueryParamsResponse params. */
        public params?: cosmos.auth.v1beta1.IParams | null;

        /**
         * Creates a new QueryParamsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryParamsResponse instance
         */
        public static create(
          properties?: cosmos.auth.v1beta1.IQueryParamsResponse
        ): cosmos.auth.v1beta1.QueryParamsResponse;

        /**
         * Encodes the specified QueryParamsResponse message. Does not implicitly {@link cosmos.auth.v1beta1.QueryParamsResponse.verify|verify} messages.
         * @param m QueryParamsResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.auth.v1beta1.IQueryParamsResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryParamsResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryParamsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.auth.v1beta1.QueryParamsResponse;

        /**
         * Creates a QueryParamsResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryParamsResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.auth.v1beta1.QueryParamsResponse;

        /**
         * Creates a plain object from a QueryParamsResponse message. Also converts values to other types if specified.
         * @param m QueryParamsResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.auth.v1beta1.QueryParamsResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryParamsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace bank. */
  namespace bank {
    /** Namespace v1beta1. */
    namespace v1beta1 {
      /** Properties of a Params. */
      interface IParams {
        /** Params sendEnabled */
        sendEnabled?: cosmos.bank.v1beta1.ISendEnabled[] | null;

        /** Params defaultSendEnabled */
        defaultSendEnabled?: boolean | null;
      }

      /** Represents a Params. */
      class Params implements IParams {
        /**
         * Constructs a new Params.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IParams);

        /** Params sendEnabled. */
        public sendEnabled: cosmos.bank.v1beta1.ISendEnabled[];

        /** Params defaultSendEnabled. */
        public defaultSendEnabled: boolean;

        /**
         * Creates a new Params instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Params instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IParams
        ): cosmos.bank.v1beta1.Params;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmos.bank.v1beta1.Params.verify|verify} messages.
         * @param m Params message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IParams,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Params;

        /**
         * Creates a Params message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Params
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Params;

        /**
         * Creates a plain object from a Params message. Also converts values to other types if specified.
         * @param m Params
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Params,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Params to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a SendEnabled. */
      interface ISendEnabled {
        /** SendEnabled denom */
        denom?: string | null;

        /** SendEnabled enabled */
        enabled?: boolean | null;
      }

      /** Represents a SendEnabled. */
      class SendEnabled implements ISendEnabled {
        /**
         * Constructs a new SendEnabled.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.ISendEnabled);

        /** SendEnabled denom. */
        public denom: string;

        /** SendEnabled enabled. */
        public enabled: boolean;

        /**
         * Creates a new SendEnabled instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SendEnabled instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.ISendEnabled
        ): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Encodes the specified SendEnabled message. Does not implicitly {@link cosmos.bank.v1beta1.SendEnabled.verify|verify} messages.
         * @param m SendEnabled message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.ISendEnabled,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a SendEnabled message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SendEnabled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Creates a SendEnabled message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SendEnabled
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Creates a plain object from a SendEnabled message. Also converts values to other types if specified.
         * @param m SendEnabled
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.SendEnabled,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this SendEnabled to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of an Input. */
      interface IInput {
        /** Input address */
        address?: string | null;

        /** Input coins */
        coins?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents an Input. */
      class Input implements IInput {
        /**
         * Constructs a new Input.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IInput);

        /** Input address. */
        public address: string;

        /** Input coins. */
        public coins: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new Input instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Input instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IInput
        ): cosmos.bank.v1beta1.Input;

        /**
         * Encodes the specified Input message. Does not implicitly {@link cosmos.bank.v1beta1.Input.verify|verify} messages.
         * @param m Input message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IInput,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an Input message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Input
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Input;

        /**
         * Creates an Input message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Input
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Input;

        /**
         * Creates a plain object from an Input message. Also converts values to other types if specified.
         * @param m Input
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Input,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Input to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of an Output. */
      interface IOutput {
        /** Output address */
        address?: string | null;

        /** Output coins */
        coins?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents an Output. */
      class Output implements IOutput {
        /**
         * Constructs a new Output.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IOutput);

        /** Output address. */
        public address: string;

        /** Output coins. */
        public coins: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new Output instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Output instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IOutput
        ): cosmos.bank.v1beta1.Output;

        /**
         * Encodes the specified Output message. Does not implicitly {@link cosmos.bank.v1beta1.Output.verify|verify} messages.
         * @param m Output message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IOutput,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an Output message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Output
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Output;

        /**
         * Creates an Output message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Output
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Output;

        /**
         * Creates a plain object from an Output message. Also converts values to other types if specified.
         * @param m Output
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Output,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Output to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Supply. */
      interface ISupply {
        /** Supply total */
        total?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents a Supply. */
      class Supply implements ISupply {
        /**
         * Constructs a new Supply.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.ISupply);

        /** Supply total. */
        public total: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new Supply instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Supply instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.ISupply
        ): cosmos.bank.v1beta1.Supply;

        /**
         * Encodes the specified Supply message. Does not implicitly {@link cosmos.bank.v1beta1.Supply.verify|verify} messages.
         * @param m Supply message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.ISupply,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Supply message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Supply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Supply;

        /**
         * Creates a Supply message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Supply
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Supply;

        /**
         * Creates a plain object from a Supply message. Also converts values to other types if specified.
         * @param m Supply
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Supply,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Supply to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DenomUnit. */
      interface IDenomUnit {
        /** DenomUnit denom */
        denom?: string | null;

        /** DenomUnit exponent */
        exponent?: number | null;

        /** DenomUnit aliases */
        aliases?: string[] | null;
      }

      /** Represents a DenomUnit. */
      class DenomUnit implements IDenomUnit {
        /**
         * Constructs a new DenomUnit.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IDenomUnit);

        /** DenomUnit denom. */
        public denom: string;

        /** DenomUnit exponent. */
        public exponent: number;

        /** DenomUnit aliases. */
        public aliases: string[];

        /**
         * Creates a new DenomUnit instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DenomUnit instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IDenomUnit
        ): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Encodes the specified DenomUnit message. Does not implicitly {@link cosmos.bank.v1beta1.DenomUnit.verify|verify} messages.
         * @param m DenomUnit message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IDenomUnit,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DenomUnit message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DenomUnit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Creates a DenomUnit message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DenomUnit
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Creates a plain object from a DenomUnit message. Also converts values to other types if specified.
         * @param m DenomUnit
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.DenomUnit,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DenomUnit to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Metadata. */
      interface IMetadata {
        /** Metadata description */
        description?: string | null;

        /** Metadata denomUnits */
        denomUnits?: cosmos.bank.v1beta1.IDenomUnit[] | null;

        /** Metadata base */
        base?: string | null;

        /** Metadata display */
        display?: string | null;
      }

      /** Represents a Metadata. */
      class Metadata implements IMetadata {
        /**
         * Constructs a new Metadata.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IMetadata);

        /** Metadata description. */
        public description: string;

        /** Metadata denomUnits. */
        public denomUnits: cosmos.bank.v1beta1.IDenomUnit[];

        /** Metadata base. */
        public base: string;

        /** Metadata display. */
        public display: string;

        /**
         * Creates a new Metadata instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Metadata instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IMetadata
        ): cosmos.bank.v1beta1.Metadata;

        /**
         * Encodes the specified Metadata message. Does not implicitly {@link cosmos.bank.v1beta1.Metadata.verify|verify} messages.
         * @param m Metadata message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMetadata,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Metadata message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.Metadata;

        /**
         * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Metadata
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.Metadata;

        /**
         * Creates a plain object from a Metadata message. Also converts values to other types if specified.
         * @param m Metadata
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Metadata,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Metadata to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Represents a Query */
      class Query extends $protobuf.rpc.Service {
        /**
         * Constructs a new Query service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        );

        /**
         * Creates new Query service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        ): Query;

        /**
         * Calls Balance.
         * @param request QueryBalanceRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QueryBalanceResponse
         */
        public balance(
          request: cosmos.bank.v1beta1.IQueryBalanceRequest,
          callback: cosmos.bank.v1beta1.Query.BalanceCallback
        ): void;

        /**
         * Calls Balance.
         * @param request QueryBalanceRequest message or plain object
         * @returns Promise
         */
        public balance(
          request: cosmos.bank.v1beta1.IQueryBalanceRequest
        ): Promise<cosmos.bank.v1beta1.QueryBalanceResponse>;

        /**
         * Calls AllBalances.
         * @param request QueryAllBalancesRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QueryAllBalancesResponse
         */
        public allBalances(
          request: cosmos.bank.v1beta1.IQueryAllBalancesRequest,
          callback: cosmos.bank.v1beta1.Query.AllBalancesCallback
        ): void;

        /**
         * Calls AllBalances.
         * @param request QueryAllBalancesRequest message or plain object
         * @returns Promise
         */
        public allBalances(
          request: cosmos.bank.v1beta1.IQueryAllBalancesRequest
        ): Promise<cosmos.bank.v1beta1.QueryAllBalancesResponse>;

        /**
         * Calls TotalSupply.
         * @param request QueryTotalSupplyRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QueryTotalSupplyResponse
         */
        public totalSupply(
          request: cosmos.bank.v1beta1.IQueryTotalSupplyRequest,
          callback: cosmos.bank.v1beta1.Query.TotalSupplyCallback
        ): void;

        /**
         * Calls TotalSupply.
         * @param request QueryTotalSupplyRequest message or plain object
         * @returns Promise
         */
        public totalSupply(
          request: cosmos.bank.v1beta1.IQueryTotalSupplyRequest
        ): Promise<cosmos.bank.v1beta1.QueryTotalSupplyResponse>;

        /**
         * Calls SupplyOf.
         * @param request QuerySupplyOfRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QuerySupplyOfResponse
         */
        public supplyOf(
          request: cosmos.bank.v1beta1.IQuerySupplyOfRequest,
          callback: cosmos.bank.v1beta1.Query.SupplyOfCallback
        ): void;

        /**
         * Calls SupplyOf.
         * @param request QuerySupplyOfRequest message or plain object
         * @returns Promise
         */
        public supplyOf(
          request: cosmos.bank.v1beta1.IQuerySupplyOfRequest
        ): Promise<cosmos.bank.v1beta1.QuerySupplyOfResponse>;

        /**
         * Calls Params.
         * @param request QueryParamsRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and QueryParamsResponse
         */
        public params(
          request: cosmos.bank.v1beta1.IQueryParamsRequest,
          callback: cosmos.bank.v1beta1.Query.ParamsCallback
        ): void;

        /**
         * Calls Params.
         * @param request QueryParamsRequest message or plain object
         * @returns Promise
         */
        public params(
          request: cosmos.bank.v1beta1.IQueryParamsRequest
        ): Promise<cosmos.bank.v1beta1.QueryParamsResponse>;
      }

      namespace Query {
        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Query#balance}.
         * @param error Error, if any
         * @param [response] QueryBalanceResponse
         */
        type BalanceCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.QueryBalanceResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Query#allBalances}.
         * @param error Error, if any
         * @param [response] QueryAllBalancesResponse
         */
        type AllBalancesCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.QueryAllBalancesResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Query#totalSupply}.
         * @param error Error, if any
         * @param [response] QueryTotalSupplyResponse
         */
        type TotalSupplyCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.QueryTotalSupplyResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Query#supplyOf}.
         * @param error Error, if any
         * @param [response] QuerySupplyOfResponse
         */
        type SupplyOfCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.QuerySupplyOfResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Query#params}.
         * @param error Error, if any
         * @param [response] QueryParamsResponse
         */
        type ParamsCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.QueryParamsResponse
        ) => void;
      }

      /** Properties of a QueryBalanceRequest. */
      interface IQueryBalanceRequest {
        /** QueryBalanceRequest address */
        address?: string | null;

        /** QueryBalanceRequest denom */
        denom?: string | null;
      }

      /** Represents a QueryBalanceRequest. */
      class QueryBalanceRequest implements IQueryBalanceRequest {
        /**
         * Constructs a new QueryBalanceRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryBalanceRequest);

        /** QueryBalanceRequest address. */
        public address: string;

        /** QueryBalanceRequest denom. */
        public denom: string;

        /**
         * Creates a new QueryBalanceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryBalanceRequest instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryBalanceRequest
        ): cosmos.bank.v1beta1.QueryBalanceRequest;

        /**
         * Encodes the specified QueryBalanceRequest message. Does not implicitly {@link cosmos.bank.v1beta1.QueryBalanceRequest.verify|verify} messages.
         * @param m QueryBalanceRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryBalanceRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryBalanceRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryBalanceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryBalanceRequest;

        /**
         * Creates a QueryBalanceRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryBalanceRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryBalanceRequest;

        /**
         * Creates a plain object from a QueryBalanceRequest message. Also converts values to other types if specified.
         * @param m QueryBalanceRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryBalanceRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryBalanceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryBalanceResponse. */
      interface IQueryBalanceResponse {
        /** QueryBalanceResponse balance */
        balance?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a QueryBalanceResponse. */
      class QueryBalanceResponse implements IQueryBalanceResponse {
        /**
         * Constructs a new QueryBalanceResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryBalanceResponse);

        /** QueryBalanceResponse balance. */
        public balance?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new QueryBalanceResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryBalanceResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryBalanceResponse
        ): cosmos.bank.v1beta1.QueryBalanceResponse;

        /**
         * Encodes the specified QueryBalanceResponse message. Does not implicitly {@link cosmos.bank.v1beta1.QueryBalanceResponse.verify|verify} messages.
         * @param m QueryBalanceResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryBalanceResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryBalanceResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryBalanceResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryBalanceResponse;

        /**
         * Creates a QueryBalanceResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryBalanceResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryBalanceResponse;

        /**
         * Creates a plain object from a QueryBalanceResponse message. Also converts values to other types if specified.
         * @param m QueryBalanceResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryBalanceResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryBalanceResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryAllBalancesRequest. */
      interface IQueryAllBalancesRequest {
        /** QueryAllBalancesRequest address */
        address?: string | null;

        /** QueryAllBalancesRequest pagination */
        pagination?: cosmos.base.query.v1beta1.IPageRequest | null;
      }

      /** Represents a QueryAllBalancesRequest. */
      class QueryAllBalancesRequest implements IQueryAllBalancesRequest {
        /**
         * Constructs a new QueryAllBalancesRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryAllBalancesRequest);

        /** QueryAllBalancesRequest address. */
        public address: string;

        /** QueryAllBalancesRequest pagination. */
        public pagination?: cosmos.base.query.v1beta1.IPageRequest | null;

        /**
         * Creates a new QueryAllBalancesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryAllBalancesRequest instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryAllBalancesRequest
        ): cosmos.bank.v1beta1.QueryAllBalancesRequest;

        /**
         * Encodes the specified QueryAllBalancesRequest message. Does not implicitly {@link cosmos.bank.v1beta1.QueryAllBalancesRequest.verify|verify} messages.
         * @param m QueryAllBalancesRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryAllBalancesRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryAllBalancesRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryAllBalancesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryAllBalancesRequest;

        /**
         * Creates a QueryAllBalancesRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryAllBalancesRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryAllBalancesRequest;

        /**
         * Creates a plain object from a QueryAllBalancesRequest message. Also converts values to other types if specified.
         * @param m QueryAllBalancesRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryAllBalancesRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryAllBalancesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryAllBalancesResponse. */
      interface IQueryAllBalancesResponse {
        /** QueryAllBalancesResponse balances */
        balances?: cosmos.base.v1beta1.ICoin[] | null;

        /** QueryAllBalancesResponse pagination */
        pagination?: cosmos.base.query.v1beta1.IPageResponse | null;
      }

      /** Represents a QueryAllBalancesResponse. */
      class QueryAllBalancesResponse implements IQueryAllBalancesResponse {
        /**
         * Constructs a new QueryAllBalancesResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryAllBalancesResponse);

        /** QueryAllBalancesResponse balances. */
        public balances: cosmos.base.v1beta1.ICoin[];

        /** QueryAllBalancesResponse pagination. */
        public pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

        /**
         * Creates a new QueryAllBalancesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryAllBalancesResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryAllBalancesResponse
        ): cosmos.bank.v1beta1.QueryAllBalancesResponse;

        /**
         * Encodes the specified QueryAllBalancesResponse message. Does not implicitly {@link cosmos.bank.v1beta1.QueryAllBalancesResponse.verify|verify} messages.
         * @param m QueryAllBalancesResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryAllBalancesResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryAllBalancesResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryAllBalancesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryAllBalancesResponse;

        /**
         * Creates a QueryAllBalancesResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryAllBalancesResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryAllBalancesResponse;

        /**
         * Creates a plain object from a QueryAllBalancesResponse message. Also converts values to other types if specified.
         * @param m QueryAllBalancesResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryAllBalancesResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryAllBalancesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryTotalSupplyRequest. */
      interface IQueryTotalSupplyRequest {}

      /** Represents a QueryTotalSupplyRequest. */
      class QueryTotalSupplyRequest implements IQueryTotalSupplyRequest {
        /**
         * Constructs a new QueryTotalSupplyRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryTotalSupplyRequest);

        /**
         * Creates a new QueryTotalSupplyRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryTotalSupplyRequest instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryTotalSupplyRequest
        ): cosmos.bank.v1beta1.QueryTotalSupplyRequest;

        /**
         * Encodes the specified QueryTotalSupplyRequest message. Does not implicitly {@link cosmos.bank.v1beta1.QueryTotalSupplyRequest.verify|verify} messages.
         * @param m QueryTotalSupplyRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryTotalSupplyRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryTotalSupplyRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryTotalSupplyRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryTotalSupplyRequest;

        /**
         * Creates a QueryTotalSupplyRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryTotalSupplyRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryTotalSupplyRequest;

        /**
         * Creates a plain object from a QueryTotalSupplyRequest message. Also converts values to other types if specified.
         * @param m QueryTotalSupplyRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryTotalSupplyRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryTotalSupplyRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryTotalSupplyResponse. */
      interface IQueryTotalSupplyResponse {
        /** QueryTotalSupplyResponse supply */
        supply?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents a QueryTotalSupplyResponse. */
      class QueryTotalSupplyResponse implements IQueryTotalSupplyResponse {
        /**
         * Constructs a new QueryTotalSupplyResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryTotalSupplyResponse);

        /** QueryTotalSupplyResponse supply. */
        public supply: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new QueryTotalSupplyResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryTotalSupplyResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryTotalSupplyResponse
        ): cosmos.bank.v1beta1.QueryTotalSupplyResponse;

        /**
         * Encodes the specified QueryTotalSupplyResponse message. Does not implicitly {@link cosmos.bank.v1beta1.QueryTotalSupplyResponse.verify|verify} messages.
         * @param m QueryTotalSupplyResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryTotalSupplyResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryTotalSupplyResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryTotalSupplyResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryTotalSupplyResponse;

        /**
         * Creates a QueryTotalSupplyResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryTotalSupplyResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryTotalSupplyResponse;

        /**
         * Creates a plain object from a QueryTotalSupplyResponse message. Also converts values to other types if specified.
         * @param m QueryTotalSupplyResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryTotalSupplyResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryTotalSupplyResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QuerySupplyOfRequest. */
      interface IQuerySupplyOfRequest {
        /** QuerySupplyOfRequest denom */
        denom?: string | null;
      }

      /** Represents a QuerySupplyOfRequest. */
      class QuerySupplyOfRequest implements IQuerySupplyOfRequest {
        /**
         * Constructs a new QuerySupplyOfRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQuerySupplyOfRequest);

        /** QuerySupplyOfRequest denom. */
        public denom: string;

        /**
         * Creates a new QuerySupplyOfRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QuerySupplyOfRequest instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQuerySupplyOfRequest
        ): cosmos.bank.v1beta1.QuerySupplyOfRequest;

        /**
         * Encodes the specified QuerySupplyOfRequest message. Does not implicitly {@link cosmos.bank.v1beta1.QuerySupplyOfRequest.verify|verify} messages.
         * @param m QuerySupplyOfRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQuerySupplyOfRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QuerySupplyOfRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QuerySupplyOfRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QuerySupplyOfRequest;

        /**
         * Creates a QuerySupplyOfRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QuerySupplyOfRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QuerySupplyOfRequest;

        /**
         * Creates a plain object from a QuerySupplyOfRequest message. Also converts values to other types if specified.
         * @param m QuerySupplyOfRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QuerySupplyOfRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QuerySupplyOfRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QuerySupplyOfResponse. */
      interface IQuerySupplyOfResponse {
        /** QuerySupplyOfResponse amount */
        amount?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a QuerySupplyOfResponse. */
      class QuerySupplyOfResponse implements IQuerySupplyOfResponse {
        /**
         * Constructs a new QuerySupplyOfResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQuerySupplyOfResponse);

        /** QuerySupplyOfResponse amount. */
        public amount?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new QuerySupplyOfResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QuerySupplyOfResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQuerySupplyOfResponse
        ): cosmos.bank.v1beta1.QuerySupplyOfResponse;

        /**
         * Encodes the specified QuerySupplyOfResponse message. Does not implicitly {@link cosmos.bank.v1beta1.QuerySupplyOfResponse.verify|verify} messages.
         * @param m QuerySupplyOfResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQuerySupplyOfResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QuerySupplyOfResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QuerySupplyOfResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QuerySupplyOfResponse;

        /**
         * Creates a QuerySupplyOfResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QuerySupplyOfResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QuerySupplyOfResponse;

        /**
         * Creates a plain object from a QuerySupplyOfResponse message. Also converts values to other types if specified.
         * @param m QuerySupplyOfResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QuerySupplyOfResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QuerySupplyOfResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryParamsRequest. */
      interface IQueryParamsRequest {}

      /** Represents a QueryParamsRequest. */
      class QueryParamsRequest implements IQueryParamsRequest {
        /**
         * Constructs a new QueryParamsRequest.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryParamsRequest);

        /**
         * Creates a new QueryParamsRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryParamsRequest instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryParamsRequest
        ): cosmos.bank.v1beta1.QueryParamsRequest;

        /**
         * Encodes the specified QueryParamsRequest message. Does not implicitly {@link cosmos.bank.v1beta1.QueryParamsRequest.verify|verify} messages.
         * @param m QueryParamsRequest message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryParamsRequest,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryParamsRequest message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryParamsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryParamsRequest;

        /**
         * Creates a QueryParamsRequest message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryParamsRequest
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryParamsRequest;

        /**
         * Creates a plain object from a QueryParamsRequest message. Also converts values to other types if specified.
         * @param m QueryParamsRequest
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryParamsRequest,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryParamsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a QueryParamsResponse. */
      interface IQueryParamsResponse {
        /** QueryParamsResponse params */
        params?: cosmos.bank.v1beta1.IParams | null;
      }

      /** Represents a QueryParamsResponse. */
      class QueryParamsResponse implements IQueryParamsResponse {
        /**
         * Constructs a new QueryParamsResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IQueryParamsResponse);

        /** QueryParamsResponse params. */
        public params?: cosmos.bank.v1beta1.IParams | null;

        /**
         * Creates a new QueryParamsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QueryParamsResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IQueryParamsResponse
        ): cosmos.bank.v1beta1.QueryParamsResponse;

        /**
         * Encodes the specified QueryParamsResponse message. Does not implicitly {@link cosmos.bank.v1beta1.QueryParamsResponse.verify|verify} messages.
         * @param m QueryParamsResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IQueryParamsResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a QueryParamsResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns QueryParamsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.QueryParamsResponse;

        /**
         * Creates a QueryParamsResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns QueryParamsResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.QueryParamsResponse;

        /**
         * Creates a plain object from a QueryParamsResponse message. Also converts values to other types if specified.
         * @param m QueryParamsResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.QueryParamsResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this QueryParamsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Represents a Msg */
      class Msg extends $protobuf.rpc.Service {
        /**
         * Constructs a new Msg service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        );

        /**
         * Creates new Msg service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        ): Msg;

        /**
         * Calls Send.
         * @param request MsgSend message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgSendResponse
         */
        public send(
          request: cosmos.bank.v1beta1.IMsgSend,
          callback: cosmos.bank.v1beta1.Msg.SendCallback
        ): void;

        /**
         * Calls Send.
         * @param request MsgSend message or plain object
         * @returns Promise
         */
        public send(
          request: cosmos.bank.v1beta1.IMsgSend
        ): Promise<cosmos.bank.v1beta1.MsgSendResponse>;

        /**
         * Calls MultiSend.
         * @param request MsgMultiSend message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgMultiSendResponse
         */
        public multiSend(
          request: cosmos.bank.v1beta1.IMsgMultiSend,
          callback: cosmos.bank.v1beta1.Msg.MultiSendCallback
        ): void;

        /**
         * Calls MultiSend.
         * @param request MsgMultiSend message or plain object
         * @returns Promise
         */
        public multiSend(
          request: cosmos.bank.v1beta1.IMsgMultiSend
        ): Promise<cosmos.bank.v1beta1.MsgMultiSendResponse>;
      }

      namespace Msg {
        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Msg#send}.
         * @param error Error, if any
         * @param [response] MsgSendResponse
         */
        type SendCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.MsgSendResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Msg#multiSend}.
         * @param error Error, if any
         * @param [response] MsgMultiSendResponse
         */
        type MultiSendCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.MsgMultiSendResponse
        ) => void;
      }

      /** Properties of a MsgSend. */
      interface IMsgSend {
        /** MsgSend fromAddress */
        fromAddress?: string | null;

        /** MsgSend toAddress */
        toAddress?: string | null;

        /** MsgSend amount */
        amount?: cosmos.base.v1beta1.ICoin[] | null;
      }

      /** Represents a MsgSend. */
      class MsgSend implements IMsgSend {
        /**
         * Constructs a new MsgSend.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IMsgSend);

        /** MsgSend fromAddress. */
        public fromAddress: string;

        /** MsgSend toAddress. */
        public toAddress: string;

        /** MsgSend amount. */
        public amount: cosmos.base.v1beta1.ICoin[];

        /**
         * Creates a new MsgSend instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgSend instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IMsgSend
        ): cosmos.bank.v1beta1.MsgSend;

        /**
         * Encodes the specified MsgSend message. Does not implicitly {@link cosmos.bank.v1beta1.MsgSend.verify|verify} messages.
         * @param m MsgSend message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMsgSend,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgSend message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.MsgSend;

        /**
         * Creates a MsgSend message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSend
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.MsgSend;

        /**
         * Creates a plain object from a MsgSend message. Also converts values to other types if specified.
         * @param m MsgSend
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgSend,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgSend to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgSendResponse. */
      interface IMsgSendResponse {}

      /** Represents a MsgSendResponse. */
      class MsgSendResponse implements IMsgSendResponse {
        /**
         * Constructs a new MsgSendResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IMsgSendResponse);

        /**
         * Creates a new MsgSendResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgSendResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IMsgSendResponse
        ): cosmos.bank.v1beta1.MsgSendResponse;

        /**
         * Encodes the specified MsgSendResponse message. Does not implicitly {@link cosmos.bank.v1beta1.MsgSendResponse.verify|verify} messages.
         * @param m MsgSendResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMsgSendResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgSendResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSendResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.MsgSendResponse;

        /**
         * Creates a MsgSendResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSendResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.MsgSendResponse;

        /**
         * Creates a plain object from a MsgSendResponse message. Also converts values to other types if specified.
         * @param m MsgSendResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgSendResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgSendResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgMultiSend. */
      interface IMsgMultiSend {
        /** MsgMultiSend inputs */
        inputs?: cosmos.bank.v1beta1.IInput[] | null;

        /** MsgMultiSend outputs */
        outputs?: cosmos.bank.v1beta1.IOutput[] | null;
      }

      /** Represents a MsgMultiSend. */
      class MsgMultiSend implements IMsgMultiSend {
        /**
         * Constructs a new MsgMultiSend.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IMsgMultiSend);

        /** MsgMultiSend inputs. */
        public inputs: cosmos.bank.v1beta1.IInput[];

        /** MsgMultiSend outputs. */
        public outputs: cosmos.bank.v1beta1.IOutput[];

        /**
         * Creates a new MsgMultiSend instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgMultiSend instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IMsgMultiSend
        ): cosmos.bank.v1beta1.MsgMultiSend;

        /**
         * Encodes the specified MsgMultiSend message. Does not implicitly {@link cosmos.bank.v1beta1.MsgMultiSend.verify|verify} messages.
         * @param m MsgMultiSend message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMsgMultiSend,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgMultiSend message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgMultiSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.MsgMultiSend;

        /**
         * Creates a MsgMultiSend message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgMultiSend
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.MsgMultiSend;

        /**
         * Creates a plain object from a MsgMultiSend message. Also converts values to other types if specified.
         * @param m MsgMultiSend
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgMultiSend,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgMultiSend to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgMultiSendResponse. */
      interface IMsgMultiSendResponse {}

      /** Represents a MsgMultiSendResponse. */
      class MsgMultiSendResponse implements IMsgMultiSendResponse {
        /**
         * Constructs a new MsgMultiSendResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.bank.v1beta1.IMsgMultiSendResponse);

        /**
         * Creates a new MsgMultiSendResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgMultiSendResponse instance
         */
        public static create(
          properties?: cosmos.bank.v1beta1.IMsgMultiSendResponse
        ): cosmos.bank.v1beta1.MsgMultiSendResponse;

        /**
         * Encodes the specified MsgMultiSendResponse message. Does not implicitly {@link cosmos.bank.v1beta1.MsgMultiSendResponse.verify|verify} messages.
         * @param m MsgMultiSendResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMsgMultiSendResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgMultiSendResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgMultiSendResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.bank.v1beta1.MsgMultiSendResponse;

        /**
         * Creates a MsgMultiSendResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgMultiSendResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.bank.v1beta1.MsgMultiSendResponse;

        /**
         * Creates a plain object from a MsgMultiSendResponse message. Also converts values to other types if specified.
         * @param m MsgMultiSendResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgMultiSendResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgMultiSendResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace base. */
  namespace base {
    /** Namespace query. */
    namespace query {
      /** Namespace v1beta1. */
      namespace v1beta1 {
        /** Properties of a PageRequest. */
        interface IPageRequest {
          /** PageRequest key */
          key?: Uint8Array | null;

          /** PageRequest offset */
          offset?: Long | null;

          /** PageRequest limit */
          limit?: Long | null;

          /** PageRequest countTotal */
          countTotal?: boolean | null;
        }

        /** Represents a PageRequest. */
        class PageRequest implements IPageRequest {
          /**
           * Constructs a new PageRequest.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.base.query.v1beta1.IPageRequest);

          /** PageRequest key. */
          public key: Uint8Array;

          /** PageRequest offset. */
          public offset: Long;

          /** PageRequest limit. */
          public limit: Long;

          /** PageRequest countTotal. */
          public countTotal: boolean;

          /**
           * Creates a new PageRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns PageRequest instance
           */
          public static create(
            properties?: cosmos.base.query.v1beta1.IPageRequest
          ): cosmos.base.query.v1beta1.PageRequest;

          /**
           * Encodes the specified PageRequest message. Does not implicitly {@link cosmos.base.query.v1beta1.PageRequest.verify|verify} messages.
           * @param m PageRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.base.query.v1beta1.IPageRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a PageRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns PageRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.base.query.v1beta1.PageRequest;

          /**
           * Creates a PageRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns PageRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.base.query.v1beta1.PageRequest;

          /**
           * Creates a plain object from a PageRequest message. Also converts values to other types if specified.
           * @param m PageRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.base.query.v1beta1.PageRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this PageRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a PageResponse. */
        interface IPageResponse {
          /** PageResponse nextKey */
          nextKey?: Uint8Array | null;

          /** PageResponse total */
          total?: Long | null;
        }

        /** Represents a PageResponse. */
        class PageResponse implements IPageResponse {
          /**
           * Constructs a new PageResponse.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.base.query.v1beta1.IPageResponse);

          /** PageResponse nextKey. */
          public nextKey: Uint8Array;

          /** PageResponse total. */
          public total: Long;

          /**
           * Creates a new PageResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns PageResponse instance
           */
          public static create(
            properties?: cosmos.base.query.v1beta1.IPageResponse
          ): cosmos.base.query.v1beta1.PageResponse;

          /**
           * Encodes the specified PageResponse message. Does not implicitly {@link cosmos.base.query.v1beta1.PageResponse.verify|verify} messages.
           * @param m PageResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.base.query.v1beta1.IPageResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a PageResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns PageResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.base.query.v1beta1.PageResponse;

          /**
           * Creates a PageResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns PageResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.base.query.v1beta1.PageResponse;

          /**
           * Creates a plain object from a PageResponse message. Also converts values to other types if specified.
           * @param m PageResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.base.query.v1beta1.PageResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this PageResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }
    }

    /** Namespace v1beta1. */
    namespace v1beta1 {
      /** Properties of a Coin. */
      interface ICoin {
        /** Coin denom */
        denom?: string | null;

        /** Coin amount */
        amount?: string | null;
      }

      /** Represents a Coin. */
      class Coin implements ICoin {
        /**
         * Constructs a new Coin.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.base.v1beta1.ICoin);

        /** Coin denom. */
        public denom: string;

        /** Coin amount. */
        public amount: string;

        /**
         * Creates a new Coin instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Coin instance
         */
        public static create(
          properties?: cosmos.base.v1beta1.ICoin
        ): cosmos.base.v1beta1.Coin;

        /**
         * Encodes the specified Coin message. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
         * @param m Coin message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.ICoin,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.Coin;

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Coin
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.Coin;

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @param m Coin
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.Coin,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Coin to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DecCoin. */
      interface IDecCoin {
        /** DecCoin denom */
        denom?: string | null;

        /** DecCoin amount */
        amount?: string | null;
      }

      /** Represents a DecCoin. */
      class DecCoin implements IDecCoin {
        /**
         * Constructs a new DecCoin.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.base.v1beta1.IDecCoin);

        /** DecCoin denom. */
        public denom: string;

        /** DecCoin amount. */
        public amount: string;

        /**
         * Creates a new DecCoin instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DecCoin instance
         */
        public static create(
          properties?: cosmos.base.v1beta1.IDecCoin
        ): cosmos.base.v1beta1.DecCoin;

        /**
         * Encodes the specified DecCoin message. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
         * @param m DecCoin message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.IDecCoin,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DecCoin message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DecCoin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.DecCoin;

        /**
         * Creates a DecCoin message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DecCoin
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.DecCoin;

        /**
         * Creates a plain object from a DecCoin message. Also converts values to other types if specified.
         * @param m DecCoin
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.DecCoin,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DecCoin to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of an IntProto. */
      interface IIntProto {
        /** IntProto int */
        int?: string | null;
      }

      /** Represents an IntProto. */
      class IntProto implements IIntProto {
        /**
         * Constructs a new IntProto.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.base.v1beta1.IIntProto);

        /** IntProto int. */
        public int: string;

        /**
         * Creates a new IntProto instance using the specified properties.
         * @param [properties] Properties to set
         * @returns IntProto instance
         */
        public static create(
          properties?: cosmos.base.v1beta1.IIntProto
        ): cosmos.base.v1beta1.IntProto;

        /**
         * Encodes the specified IntProto message. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
         * @param m IntProto message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.IIntProto,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an IntProto message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns IntProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.IntProto;

        /**
         * Creates an IntProto message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns IntProto
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.IntProto;

        /**
         * Creates a plain object from an IntProto message. Also converts values to other types if specified.
         * @param m IntProto
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.IntProto,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this IntProto to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DecProto. */
      interface IDecProto {
        /** DecProto dec */
        dec?: string | null;
      }

      /** Represents a DecProto. */
      class DecProto implements IDecProto {
        /**
         * Constructs a new DecProto.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.base.v1beta1.IDecProto);

        /** DecProto dec. */
        public dec: string;

        /**
         * Creates a new DecProto instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DecProto instance
         */
        public static create(
          properties?: cosmos.base.v1beta1.IDecProto
        ): cosmos.base.v1beta1.DecProto;

        /**
         * Encodes the specified DecProto message. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
         * @param m DecProto message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.base.v1beta1.IDecProto,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DecProto message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DecProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.base.v1beta1.DecProto;

        /**
         * Creates a DecProto message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DecProto
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.base.v1beta1.DecProto;

        /**
         * Creates a plain object from a DecProto message. Also converts values to other types if specified.
         * @param m DecProto
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.DecProto,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DecProto to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace crypto. */
  namespace crypto {
    /** Namespace multisig. */
    namespace multisig {
      /** Namespace v1beta1. */
      namespace v1beta1 {
        /** Properties of a MultiSignature. */
        interface IMultiSignature {
          /** MultiSignature signatures */
          signatures?: Uint8Array[] | null;
        }

        /** Represents a MultiSignature. */
        class MultiSignature implements IMultiSignature {
          /**
           * Constructs a new MultiSignature.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.crypto.multisig.v1beta1.IMultiSignature);

          /** MultiSignature signatures. */
          public signatures: Uint8Array[];

          /**
           * Creates a new MultiSignature instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MultiSignature instance
           */
          public static create(
            properties?: cosmos.crypto.multisig.v1beta1.IMultiSignature
          ): cosmos.crypto.multisig.v1beta1.MultiSignature;

          /**
           * Encodes the specified MultiSignature message. Does not implicitly {@link cosmos.crypto.multisig.v1beta1.MultiSignature.verify|verify} messages.
           * @param m MultiSignature message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.crypto.multisig.v1beta1.IMultiSignature,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MultiSignature message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MultiSignature
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.crypto.multisig.v1beta1.MultiSignature;

          /**
           * Creates a MultiSignature message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MultiSignature
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.crypto.multisig.v1beta1.MultiSignature;

          /**
           * Creates a plain object from a MultiSignature message. Also converts values to other types if specified.
           * @param m MultiSignature
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.crypto.multisig.v1beta1.MultiSignature,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MultiSignature to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a CompactBitArray. */
        interface ICompactBitArray {
          /** CompactBitArray extraBitsStored */
          extraBitsStored?: number | null;

          /** CompactBitArray elems */
          elems?: Uint8Array | null;
        }

        /** Represents a CompactBitArray. */
        class CompactBitArray implements ICompactBitArray {
          /**
           * Constructs a new CompactBitArray.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.crypto.multisig.v1beta1.ICompactBitArray);

          /** CompactBitArray extraBitsStored. */
          public extraBitsStored: number;

          /** CompactBitArray elems. */
          public elems: Uint8Array;

          /**
           * Creates a new CompactBitArray instance using the specified properties.
           * @param [properties] Properties to set
           * @returns CompactBitArray instance
           */
          public static create(
            properties?: cosmos.crypto.multisig.v1beta1.ICompactBitArray
          ): cosmos.crypto.multisig.v1beta1.CompactBitArray;

          /**
           * Encodes the specified CompactBitArray message. Does not implicitly {@link cosmos.crypto.multisig.v1beta1.CompactBitArray.verify|verify} messages.
           * @param m CompactBitArray message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.crypto.multisig.v1beta1.ICompactBitArray,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a CompactBitArray message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns CompactBitArray
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.crypto.multisig.v1beta1.CompactBitArray;

          /**
           * Creates a CompactBitArray message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns CompactBitArray
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.crypto.multisig.v1beta1.CompactBitArray;

          /**
           * Creates a plain object from a CompactBitArray message. Also converts values to other types if specified.
           * @param m CompactBitArray
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.crypto.multisig.v1beta1.CompactBitArray,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this CompactBitArray to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }
    }

    /** Namespace secp256k1. */
    namespace secp256k1 {
      /** Properties of a PubKey. */
      interface IPubKey {
        /** PubKey key */
        key?: Uint8Array | null;
      }

      /** Represents a PubKey. */
      class PubKey implements IPubKey {
        /**
         * Constructs a new PubKey.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.crypto.secp256k1.IPubKey);

        /** PubKey key. */
        public key: Uint8Array;

        /**
         * Creates a new PubKey instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PubKey instance
         */
        public static create(
          properties?: cosmos.crypto.secp256k1.IPubKey
        ): cosmos.crypto.secp256k1.PubKey;

        /**
         * Encodes the specified PubKey message. Does not implicitly {@link cosmos.crypto.secp256k1.PubKey.verify|verify} messages.
         * @param m PubKey message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.crypto.secp256k1.IPubKey,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a PubKey message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns PubKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.crypto.secp256k1.PubKey;

        /**
         * Creates a PubKey message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns PubKey
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.crypto.secp256k1.PubKey;

        /**
         * Creates a plain object from a PubKey message. Also converts values to other types if specified.
         * @param m PubKey
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.crypto.secp256k1.PubKey,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this PubKey to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a PrivKey. */
      interface IPrivKey {
        /** PrivKey key */
        key?: Uint8Array | null;
      }

      /** Represents a PrivKey. */
      class PrivKey implements IPrivKey {
        /**
         * Constructs a new PrivKey.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.crypto.secp256k1.IPrivKey);

        /** PrivKey key. */
        public key: Uint8Array;

        /**
         * Creates a new PrivKey instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PrivKey instance
         */
        public static create(
          properties?: cosmos.crypto.secp256k1.IPrivKey
        ): cosmos.crypto.secp256k1.PrivKey;

        /**
         * Encodes the specified PrivKey message. Does not implicitly {@link cosmos.crypto.secp256k1.PrivKey.verify|verify} messages.
         * @param m PrivKey message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.crypto.secp256k1.IPrivKey,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a PrivKey message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns PrivKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.crypto.secp256k1.PrivKey;

        /**
         * Creates a PrivKey message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns PrivKey
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.crypto.secp256k1.PrivKey;

        /**
         * Creates a plain object from a PrivKey message. Also converts values to other types if specified.
         * @param m PrivKey
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.crypto.secp256k1.PrivKey,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this PrivKey to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace staking. */
  namespace staking {
    /** Namespace v1beta1. */
    namespace v1beta1 {
      /** Properties of a HistoricalInfo. */
      interface IHistoricalInfo {
        /** HistoricalInfo header */
        header?: tendermint.types.IHeader | null;

        /** HistoricalInfo valset */
        valset?: cosmos.staking.v1beta1.IValidator[] | null;
      }

      /** Represents a HistoricalInfo. */
      class HistoricalInfo implements IHistoricalInfo {
        /**
         * Constructs a new HistoricalInfo.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IHistoricalInfo);

        /** HistoricalInfo header. */
        public header?: tendermint.types.IHeader | null;

        /** HistoricalInfo valset. */
        public valset: cosmos.staking.v1beta1.IValidator[];

        /**
         * Creates a new HistoricalInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns HistoricalInfo instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IHistoricalInfo
        ): cosmos.staking.v1beta1.HistoricalInfo;

        /**
         * Encodes the specified HistoricalInfo message. Does not implicitly {@link cosmos.staking.v1beta1.HistoricalInfo.verify|verify} messages.
         * @param m HistoricalInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IHistoricalInfo,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a HistoricalInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns HistoricalInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.HistoricalInfo;

        /**
         * Creates a HistoricalInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns HistoricalInfo
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.HistoricalInfo;

        /**
         * Creates a plain object from a HistoricalInfo message. Also converts values to other types if specified.
         * @param m HistoricalInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.HistoricalInfo,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this HistoricalInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a CommissionRates. */
      interface ICommissionRates {
        /** CommissionRates rate */
        rate?: string | null;

        /** CommissionRates maxRate */
        maxRate?: string | null;

        /** CommissionRates maxChangeRate */
        maxChangeRate?: string | null;
      }

      /** Represents a CommissionRates. */
      class CommissionRates implements ICommissionRates {
        /**
         * Constructs a new CommissionRates.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.ICommissionRates);

        /** CommissionRates rate. */
        public rate: string;

        /** CommissionRates maxRate. */
        public maxRate: string;

        /** CommissionRates maxChangeRate. */
        public maxChangeRate: string;

        /**
         * Creates a new CommissionRates instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CommissionRates instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.ICommissionRates
        ): cosmos.staking.v1beta1.CommissionRates;

        /**
         * Encodes the specified CommissionRates message. Does not implicitly {@link cosmos.staking.v1beta1.CommissionRates.verify|verify} messages.
         * @param m CommissionRates message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.ICommissionRates,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a CommissionRates message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns CommissionRates
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.CommissionRates;

        /**
         * Creates a CommissionRates message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns CommissionRates
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.CommissionRates;

        /**
         * Creates a plain object from a CommissionRates message. Also converts values to other types if specified.
         * @param m CommissionRates
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.CommissionRates,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this CommissionRates to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Commission. */
      interface ICommission {
        /** Commission commissionRates */
        commissionRates?: cosmos.staking.v1beta1.ICommissionRates | null;

        /** Commission updateTime */
        updateTime?: google.protobuf.ITimestamp | null;
      }

      /** Represents a Commission. */
      class Commission implements ICommission {
        /**
         * Constructs a new Commission.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.ICommission);

        /** Commission commissionRates. */
        public commissionRates?: cosmos.staking.v1beta1.ICommissionRates | null;

        /** Commission updateTime. */
        public updateTime?: google.protobuf.ITimestamp | null;

        /**
         * Creates a new Commission instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Commission instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.ICommission
        ): cosmos.staking.v1beta1.Commission;

        /**
         * Encodes the specified Commission message. Does not implicitly {@link cosmos.staking.v1beta1.Commission.verify|verify} messages.
         * @param m Commission message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.ICommission,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Commission message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Commission
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Commission;

        /**
         * Creates a Commission message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Commission
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Commission;

        /**
         * Creates a plain object from a Commission message. Also converts values to other types if specified.
         * @param m Commission
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Commission,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Commission to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Description. */
      interface IDescription {
        /** Description moniker */
        moniker?: string | null;

        /** Description identity */
        identity?: string | null;

        /** Description website */
        website?: string | null;

        /** Description securityContact */
        securityContact?: string | null;

        /** Description details */
        details?: string | null;
      }

      /** Represents a Description. */
      class Description implements IDescription {
        /**
         * Constructs a new Description.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDescription);

        /** Description moniker. */
        public moniker: string;

        /** Description identity. */
        public identity: string;

        /** Description website. */
        public website: string;

        /** Description securityContact. */
        public securityContact: string;

        /** Description details. */
        public details: string;

        /**
         * Creates a new Description instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Description instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDescription
        ): cosmos.staking.v1beta1.Description;

        /**
         * Encodes the specified Description message. Does not implicitly {@link cosmos.staking.v1beta1.Description.verify|verify} messages.
         * @param m Description message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDescription,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Description message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Description
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Description;

        /**
         * Creates a Description message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Description
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Description;

        /**
         * Creates a plain object from a Description message. Also converts values to other types if specified.
         * @param m Description
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Description,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Description to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Validator. */
      interface IValidator {
        /** Validator operatorAddress */
        operatorAddress?: string | null;

        /** Validator consensusPubkey */
        consensusPubkey?: google.protobuf.IAny | null;

        /** Validator jailed */
        jailed?: boolean | null;

        /** Validator status */
        status?: cosmos.staking.v1beta1.BondStatus | null;

        /** Validator tokens */
        tokens?: string | null;

        /** Validator delegatorShares */
        delegatorShares?: string | null;

        /** Validator description */
        description?: cosmos.staking.v1beta1.IDescription | null;

        /** Validator unbondingHeight */
        unbondingHeight?: Long | null;

        /** Validator unbondingTime */
        unbondingTime?: google.protobuf.ITimestamp | null;

        /** Validator commission */
        commission?: cosmos.staking.v1beta1.ICommission | null;

        /** Validator minSelfDelegation */
        minSelfDelegation?: string | null;
      }

      /** Represents a Validator. */
      class Validator implements IValidator {
        /**
         * Constructs a new Validator.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IValidator);

        /** Validator operatorAddress. */
        public operatorAddress: string;

        /** Validator consensusPubkey. */
        public consensusPubkey?: google.protobuf.IAny | null;

        /** Validator jailed. */
        public jailed: boolean;

        /** Validator status. */
        public status: cosmos.staking.v1beta1.BondStatus;

        /** Validator tokens. */
        public tokens: string;

        /** Validator delegatorShares. */
        public delegatorShares: string;

        /** Validator description. */
        public description?: cosmos.staking.v1beta1.IDescription | null;

        /** Validator unbondingHeight. */
        public unbondingHeight: Long;

        /** Validator unbondingTime. */
        public unbondingTime?: google.protobuf.ITimestamp | null;

        /** Validator commission. */
        public commission?: cosmos.staking.v1beta1.ICommission | null;

        /** Validator minSelfDelegation. */
        public minSelfDelegation: string;

        /**
         * Creates a new Validator instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Validator instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IValidator
        ): cosmos.staking.v1beta1.Validator;

        /**
         * Encodes the specified Validator message. Does not implicitly {@link cosmos.staking.v1beta1.Validator.verify|verify} messages.
         * @param m Validator message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IValidator,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Validator message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Validator
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Validator;

        /**
         * Creates a Validator message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Validator
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Validator;

        /**
         * Creates a plain object from a Validator message. Also converts values to other types if specified.
         * @param m Validator
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Validator,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Validator to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** BondStatus enum. */
      enum BondStatus {
        BOND_STATUS_UNSPECIFIED = 0,
        BOND_STATUS_UNBONDED = 1,
        BOND_STATUS_UNBONDING = 2,
        BOND_STATUS_BONDED = 3,
      }

      /** Properties of a ValAddresses. */
      interface IValAddresses {
        /** ValAddresses addresses */
        addresses?: string[] | null;
      }

      /** Represents a ValAddresses. */
      class ValAddresses implements IValAddresses {
        /**
         * Constructs a new ValAddresses.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IValAddresses);

        /** ValAddresses addresses. */
        public addresses: string[];

        /**
         * Creates a new ValAddresses instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ValAddresses instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IValAddresses
        ): cosmos.staking.v1beta1.ValAddresses;

        /**
         * Encodes the specified ValAddresses message. Does not implicitly {@link cosmos.staking.v1beta1.ValAddresses.verify|verify} messages.
         * @param m ValAddresses message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IValAddresses,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a ValAddresses message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ValAddresses
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.ValAddresses;

        /**
         * Creates a ValAddresses message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ValAddresses
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.ValAddresses;

        /**
         * Creates a plain object from a ValAddresses message. Also converts values to other types if specified.
         * @param m ValAddresses
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.ValAddresses,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this ValAddresses to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DVPair. */
      interface IDVPair {
        /** DVPair delegatorAddress */
        delegatorAddress?: string | null;

        /** DVPair validatorAddress */
        validatorAddress?: string | null;
      }

      /** Represents a DVPair. */
      class DVPair implements IDVPair {
        /**
         * Constructs a new DVPair.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDVPair);

        /** DVPair delegatorAddress. */
        public delegatorAddress: string;

        /** DVPair validatorAddress. */
        public validatorAddress: string;

        /**
         * Creates a new DVPair instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DVPair instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDVPair
        ): cosmos.staking.v1beta1.DVPair;

        /**
         * Encodes the specified DVPair message. Does not implicitly {@link cosmos.staking.v1beta1.DVPair.verify|verify} messages.
         * @param m DVPair message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDVPair,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DVPair message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.DVPair;

        /**
         * Creates a DVPair message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVPair
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.DVPair;

        /**
         * Creates a plain object from a DVPair message. Also converts values to other types if specified.
         * @param m DVPair
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVPair,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DVPair to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DVPairs. */
      interface IDVPairs {
        /** DVPairs pairs */
        pairs?: cosmos.staking.v1beta1.IDVPair[] | null;
      }

      /** Represents a DVPairs. */
      class DVPairs implements IDVPairs {
        /**
         * Constructs a new DVPairs.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDVPairs);

        /** DVPairs pairs. */
        public pairs: cosmos.staking.v1beta1.IDVPair[];

        /**
         * Creates a new DVPairs instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DVPairs instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDVPairs
        ): cosmos.staking.v1beta1.DVPairs;

        /**
         * Encodes the specified DVPairs message. Does not implicitly {@link cosmos.staking.v1beta1.DVPairs.verify|verify} messages.
         * @param m DVPairs message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDVPairs,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DVPairs message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVPairs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.DVPairs;

        /**
         * Creates a DVPairs message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVPairs
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.DVPairs;

        /**
         * Creates a plain object from a DVPairs message. Also converts values to other types if specified.
         * @param m DVPairs
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVPairs,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DVPairs to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DVVTriplet. */
      interface IDVVTriplet {
        /** DVVTriplet delegatorAddress */
        delegatorAddress?: string | null;

        /** DVVTriplet validatorSrcAddress */
        validatorSrcAddress?: string | null;

        /** DVVTriplet validatorDstAddress */
        validatorDstAddress?: string | null;
      }

      /** Represents a DVVTriplet. */
      class DVVTriplet implements IDVVTriplet {
        /**
         * Constructs a new DVVTriplet.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDVVTriplet);

        /** DVVTriplet delegatorAddress. */
        public delegatorAddress: string;

        /** DVVTriplet validatorSrcAddress. */
        public validatorSrcAddress: string;

        /** DVVTriplet validatorDstAddress. */
        public validatorDstAddress: string;

        /**
         * Creates a new DVVTriplet instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DVVTriplet instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDVVTriplet
        ): cosmos.staking.v1beta1.DVVTriplet;

        /**
         * Encodes the specified DVVTriplet message. Does not implicitly {@link cosmos.staking.v1beta1.DVVTriplet.verify|verify} messages.
         * @param m DVVTriplet message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDVVTriplet,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DVVTriplet message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVVTriplet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.DVVTriplet;

        /**
         * Creates a DVVTriplet message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVVTriplet
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.DVVTriplet;

        /**
         * Creates a plain object from a DVVTriplet message. Also converts values to other types if specified.
         * @param m DVVTriplet
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVVTriplet,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DVVTriplet to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DVVTriplets. */
      interface IDVVTriplets {
        /** DVVTriplets triplets */
        triplets?: cosmos.staking.v1beta1.IDVVTriplet[] | null;
      }

      /** Represents a DVVTriplets. */
      class DVVTriplets implements IDVVTriplets {
        /**
         * Constructs a new DVVTriplets.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDVVTriplets);

        /** DVVTriplets triplets. */
        public triplets: cosmos.staking.v1beta1.IDVVTriplet[];

        /**
         * Creates a new DVVTriplets instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DVVTriplets instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDVVTriplets
        ): cosmos.staking.v1beta1.DVVTriplets;

        /**
         * Encodes the specified DVVTriplets message. Does not implicitly {@link cosmos.staking.v1beta1.DVVTriplets.verify|verify} messages.
         * @param m DVVTriplets message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDVVTriplets,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DVVTriplets message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVVTriplets
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.DVVTriplets;

        /**
         * Creates a DVVTriplets message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVVTriplets
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.DVVTriplets;

        /**
         * Creates a plain object from a DVVTriplets message. Also converts values to other types if specified.
         * @param m DVVTriplets
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVVTriplets,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DVVTriplets to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Delegation. */
      interface IDelegation {
        /** Delegation delegatorAddress */
        delegatorAddress?: string | null;

        /** Delegation validatorAddress */
        validatorAddress?: string | null;

        /** Delegation shares */
        shares?: string | null;
      }

      /** Represents a Delegation. */
      class Delegation implements IDelegation {
        /**
         * Constructs a new Delegation.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDelegation);

        /** Delegation delegatorAddress. */
        public delegatorAddress: string;

        /** Delegation validatorAddress. */
        public validatorAddress: string;

        /** Delegation shares. */
        public shares: string;

        /**
         * Creates a new Delegation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Delegation instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDelegation
        ): cosmos.staking.v1beta1.Delegation;

        /**
         * Encodes the specified Delegation message. Does not implicitly {@link cosmos.staking.v1beta1.Delegation.verify|verify} messages.
         * @param m Delegation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDelegation,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Delegation message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Delegation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Delegation;

        /**
         * Creates a Delegation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Delegation
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Delegation;

        /**
         * Creates a plain object from a Delegation message. Also converts values to other types if specified.
         * @param m Delegation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Delegation,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Delegation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of an UnbondingDelegation. */
      interface IUnbondingDelegation {
        /** UnbondingDelegation delegatorAddress */
        delegatorAddress?: string | null;

        /** UnbondingDelegation validatorAddress */
        validatorAddress?: string | null;

        /** UnbondingDelegation entries */
        entries?: cosmos.staking.v1beta1.IUnbondingDelegationEntry[] | null;
      }

      /** Represents an UnbondingDelegation. */
      class UnbondingDelegation implements IUnbondingDelegation {
        /**
         * Constructs a new UnbondingDelegation.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IUnbondingDelegation);

        /** UnbondingDelegation delegatorAddress. */
        public delegatorAddress: string;

        /** UnbondingDelegation validatorAddress. */
        public validatorAddress: string;

        /** UnbondingDelegation entries. */
        public entries: cosmos.staking.v1beta1.IUnbondingDelegationEntry[];

        /**
         * Creates a new UnbondingDelegation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnbondingDelegation instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IUnbondingDelegation
        ): cosmos.staking.v1beta1.UnbondingDelegation;

        /**
         * Encodes the specified UnbondingDelegation message. Does not implicitly {@link cosmos.staking.v1beta1.UnbondingDelegation.verify|verify} messages.
         * @param m UnbondingDelegation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IUnbondingDelegation,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an UnbondingDelegation message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UnbondingDelegation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.UnbondingDelegation;

        /**
         * Creates an UnbondingDelegation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns UnbondingDelegation
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.UnbondingDelegation;

        /**
         * Creates a plain object from an UnbondingDelegation message. Also converts values to other types if specified.
         * @param m UnbondingDelegation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.UnbondingDelegation,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this UnbondingDelegation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of an UnbondingDelegationEntry. */
      interface IUnbondingDelegationEntry {
        /** UnbondingDelegationEntry creationHeight */
        creationHeight?: Long | null;

        /** UnbondingDelegationEntry completionTime */
        completionTime?: google.protobuf.ITimestamp | null;

        /** UnbondingDelegationEntry initialBalance */
        initialBalance?: string | null;

        /** UnbondingDelegationEntry balance */
        balance?: string | null;
      }

      /** Represents an UnbondingDelegationEntry. */
      class UnbondingDelegationEntry implements IUnbondingDelegationEntry {
        /**
         * Constructs a new UnbondingDelegationEntry.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IUnbondingDelegationEntry);

        /** UnbondingDelegationEntry creationHeight. */
        public creationHeight: Long;

        /** UnbondingDelegationEntry completionTime. */
        public completionTime?: google.protobuf.ITimestamp | null;

        /** UnbondingDelegationEntry initialBalance. */
        public initialBalance: string;

        /** UnbondingDelegationEntry balance. */
        public balance: string;

        /**
         * Creates a new UnbondingDelegationEntry instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnbondingDelegationEntry instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IUnbondingDelegationEntry
        ): cosmos.staking.v1beta1.UnbondingDelegationEntry;

        /**
         * Encodes the specified UnbondingDelegationEntry message. Does not implicitly {@link cosmos.staking.v1beta1.UnbondingDelegationEntry.verify|verify} messages.
         * @param m UnbondingDelegationEntry message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IUnbondingDelegationEntry,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an UnbondingDelegationEntry message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns UnbondingDelegationEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.UnbondingDelegationEntry;

        /**
         * Creates an UnbondingDelegationEntry message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns UnbondingDelegationEntry
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.UnbondingDelegationEntry;

        /**
         * Creates a plain object from an UnbondingDelegationEntry message. Also converts values to other types if specified.
         * @param m UnbondingDelegationEntry
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.UnbondingDelegationEntry,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this UnbondingDelegationEntry to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a RedelegationEntry. */
      interface IRedelegationEntry {
        /** RedelegationEntry creationHeight */
        creationHeight?: Long | null;

        /** RedelegationEntry completionTime */
        completionTime?: google.protobuf.ITimestamp | null;

        /** RedelegationEntry initialBalance */
        initialBalance?: string | null;

        /** RedelegationEntry sharesDst */
        sharesDst?: string | null;
      }

      /** Represents a RedelegationEntry. */
      class RedelegationEntry implements IRedelegationEntry {
        /**
         * Constructs a new RedelegationEntry.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IRedelegationEntry);

        /** RedelegationEntry creationHeight. */
        public creationHeight: Long;

        /** RedelegationEntry completionTime. */
        public completionTime?: google.protobuf.ITimestamp | null;

        /** RedelegationEntry initialBalance. */
        public initialBalance: string;

        /** RedelegationEntry sharesDst. */
        public sharesDst: string;

        /**
         * Creates a new RedelegationEntry instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RedelegationEntry instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IRedelegationEntry
        ): cosmos.staking.v1beta1.RedelegationEntry;

        /**
         * Encodes the specified RedelegationEntry message. Does not implicitly {@link cosmos.staking.v1beta1.RedelegationEntry.verify|verify} messages.
         * @param m RedelegationEntry message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegationEntry,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a RedelegationEntry message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns RedelegationEntry
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.RedelegationEntry;

        /**
         * Creates a RedelegationEntry message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns RedelegationEntry
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.RedelegationEntry;

        /**
         * Creates a plain object from a RedelegationEntry message. Also converts values to other types if specified.
         * @param m RedelegationEntry
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.RedelegationEntry,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this RedelegationEntry to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Redelegation. */
      interface IRedelegation {
        /** Redelegation delegatorAddress */
        delegatorAddress?: string | null;

        /** Redelegation validatorSrcAddress */
        validatorSrcAddress?: string | null;

        /** Redelegation validatorDstAddress */
        validatorDstAddress?: string | null;

        /** Redelegation entries */
        entries?: cosmos.staking.v1beta1.IRedelegationEntry[] | null;
      }

      /** Represents a Redelegation. */
      class Redelegation implements IRedelegation {
        /**
         * Constructs a new Redelegation.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IRedelegation);

        /** Redelegation delegatorAddress. */
        public delegatorAddress: string;

        /** Redelegation validatorSrcAddress. */
        public validatorSrcAddress: string;

        /** Redelegation validatorDstAddress. */
        public validatorDstAddress: string;

        /** Redelegation entries. */
        public entries: cosmos.staking.v1beta1.IRedelegationEntry[];

        /**
         * Creates a new Redelegation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Redelegation instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IRedelegation
        ): cosmos.staking.v1beta1.Redelegation;

        /**
         * Encodes the specified Redelegation message. Does not implicitly {@link cosmos.staking.v1beta1.Redelegation.verify|verify} messages.
         * @param m Redelegation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegation,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Redelegation message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Redelegation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Redelegation;

        /**
         * Creates a Redelegation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Redelegation
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Redelegation;

        /**
         * Creates a plain object from a Redelegation message. Also converts values to other types if specified.
         * @param m Redelegation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Redelegation,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Redelegation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Params. */
      interface IParams {
        /** Params unbondingTime */
        unbondingTime?: google.protobuf.IDuration | null;

        /** Params maxValidators */
        maxValidators?: number | null;

        /** Params maxEntries */
        maxEntries?: number | null;

        /** Params historicalEntries */
        historicalEntries?: number | null;

        /** Params bondDenom */
        bondDenom?: string | null;
      }

      /** Represents a Params. */
      class Params implements IParams {
        /**
         * Constructs a new Params.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IParams);

        /** Params unbondingTime. */
        public unbondingTime?: google.protobuf.IDuration | null;

        /** Params maxValidators. */
        public maxValidators: number;

        /** Params maxEntries. */
        public maxEntries: number;

        /** Params historicalEntries. */
        public historicalEntries: number;

        /** Params bondDenom. */
        public bondDenom: string;

        /**
         * Creates a new Params instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Params instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IParams
        ): cosmos.staking.v1beta1.Params;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmos.staking.v1beta1.Params.verify|verify} messages.
         * @param m Params message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IParams,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Params;

        /**
         * Creates a Params message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Params
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Params;

        /**
         * Creates a plain object from a Params message. Also converts values to other types if specified.
         * @param m Params
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Params,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Params to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a DelegationResponse. */
      interface IDelegationResponse {
        /** DelegationResponse delegation */
        delegation?: cosmos.staking.v1beta1.IDelegation | null;

        /** DelegationResponse balance */
        balance?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a DelegationResponse. */
      class DelegationResponse implements IDelegationResponse {
        /**
         * Constructs a new DelegationResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IDelegationResponse);

        /** DelegationResponse delegation. */
        public delegation?: cosmos.staking.v1beta1.IDelegation | null;

        /** DelegationResponse balance. */
        public balance?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new DelegationResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DelegationResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IDelegationResponse
        ): cosmos.staking.v1beta1.DelegationResponse;

        /**
         * Encodes the specified DelegationResponse message. Does not implicitly {@link cosmos.staking.v1beta1.DelegationResponse.verify|verify} messages.
         * @param m DelegationResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDelegationResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a DelegationResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DelegationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.DelegationResponse;

        /**
         * Creates a DelegationResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DelegationResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.DelegationResponse;

        /**
         * Creates a plain object from a DelegationResponse message. Also converts values to other types if specified.
         * @param m DelegationResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DelegationResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this DelegationResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a RedelegationEntryResponse. */
      interface IRedelegationEntryResponse {
        /** RedelegationEntryResponse redelegationEntry */
        redelegationEntry?: cosmos.staking.v1beta1.IRedelegationEntry | null;

        /** RedelegationEntryResponse balance */
        balance?: string | null;
      }

      /** Represents a RedelegationEntryResponse. */
      class RedelegationEntryResponse implements IRedelegationEntryResponse {
        /**
         * Constructs a new RedelegationEntryResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IRedelegationEntryResponse);

        /** RedelegationEntryResponse redelegationEntry. */
        public redelegationEntry?: cosmos.staking.v1beta1.IRedelegationEntry | null;

        /** RedelegationEntryResponse balance. */
        public balance: string;

        /**
         * Creates a new RedelegationEntryResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RedelegationEntryResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IRedelegationEntryResponse
        ): cosmos.staking.v1beta1.RedelegationEntryResponse;

        /**
         * Encodes the specified RedelegationEntryResponse message. Does not implicitly {@link cosmos.staking.v1beta1.RedelegationEntryResponse.verify|verify} messages.
         * @param m RedelegationEntryResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegationEntryResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a RedelegationEntryResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns RedelegationEntryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.RedelegationEntryResponse;

        /**
         * Creates a RedelegationEntryResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns RedelegationEntryResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.RedelegationEntryResponse;

        /**
         * Creates a plain object from a RedelegationEntryResponse message. Also converts values to other types if specified.
         * @param m RedelegationEntryResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.RedelegationEntryResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this RedelegationEntryResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a RedelegationResponse. */
      interface IRedelegationResponse {
        /** RedelegationResponse redelegation */
        redelegation?: cosmos.staking.v1beta1.IRedelegation | null;

        /** RedelegationResponse entries */
        entries?: cosmos.staking.v1beta1.IRedelegationEntryResponse[] | null;
      }

      /** Represents a RedelegationResponse. */
      class RedelegationResponse implements IRedelegationResponse {
        /**
         * Constructs a new RedelegationResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IRedelegationResponse);

        /** RedelegationResponse redelegation. */
        public redelegation?: cosmos.staking.v1beta1.IRedelegation | null;

        /** RedelegationResponse entries. */
        public entries: cosmos.staking.v1beta1.IRedelegationEntryResponse[];

        /**
         * Creates a new RedelegationResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RedelegationResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IRedelegationResponse
        ): cosmos.staking.v1beta1.RedelegationResponse;

        /**
         * Encodes the specified RedelegationResponse message. Does not implicitly {@link cosmos.staking.v1beta1.RedelegationResponse.verify|verify} messages.
         * @param m RedelegationResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegationResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a RedelegationResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns RedelegationResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.RedelegationResponse;

        /**
         * Creates a RedelegationResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns RedelegationResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.RedelegationResponse;

        /**
         * Creates a plain object from a RedelegationResponse message. Also converts values to other types if specified.
         * @param m RedelegationResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.RedelegationResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this RedelegationResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a Pool. */
      interface IPool {
        /** Pool notBondedTokens */
        notBondedTokens?: string | null;

        /** Pool bondedTokens */
        bondedTokens?: string | null;
      }

      /** Represents a Pool. */
      class Pool implements IPool {
        /**
         * Constructs a new Pool.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IPool);

        /** Pool notBondedTokens. */
        public notBondedTokens: string;

        /** Pool bondedTokens. */
        public bondedTokens: string;

        /**
         * Creates a new Pool instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Pool instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IPool
        ): cosmos.staking.v1beta1.Pool;

        /**
         * Encodes the specified Pool message. Does not implicitly {@link cosmos.staking.v1beta1.Pool.verify|verify} messages.
         * @param m Pool message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IPool,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Pool message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.Pool;

        /**
         * Creates a Pool message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Pool
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.Pool;

        /**
         * Creates a plain object from a Pool message. Also converts values to other types if specified.
         * @param m Pool
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Pool,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Pool to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Represents a Msg */
      class Msg extends $protobuf.rpc.Service {
        /**
         * Constructs a new Msg service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        );

        /**
         * Creates new Msg service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(
          rpcImpl: $protobuf.RPCImpl,
          requestDelimited?: boolean,
          responseDelimited?: boolean
        ): Msg;

        /**
         * Calls CreateValidator.
         * @param request MsgCreateValidator message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgCreateValidatorResponse
         */
        public createValidator(
          request: cosmos.staking.v1beta1.IMsgCreateValidator,
          callback: cosmos.staking.v1beta1.Msg.CreateValidatorCallback
        ): void;

        /**
         * Calls CreateValidator.
         * @param request MsgCreateValidator message or plain object
         * @returns Promise
         */
        public createValidator(
          request: cosmos.staking.v1beta1.IMsgCreateValidator
        ): Promise<cosmos.staking.v1beta1.MsgCreateValidatorResponse>;

        /**
         * Calls EditValidator.
         * @param request MsgEditValidator message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgEditValidatorResponse
         */
        public editValidator(
          request: cosmos.staking.v1beta1.IMsgEditValidator,
          callback: cosmos.staking.v1beta1.Msg.EditValidatorCallback
        ): void;

        /**
         * Calls EditValidator.
         * @param request MsgEditValidator message or plain object
         * @returns Promise
         */
        public editValidator(
          request: cosmos.staking.v1beta1.IMsgEditValidator
        ): Promise<cosmos.staking.v1beta1.MsgEditValidatorResponse>;

        /**
         * Calls Delegate.
         * @param request MsgDelegate message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgDelegateResponse
         */
        public delegate(
          request: cosmos.staking.v1beta1.IMsgDelegate,
          callback: cosmos.staking.v1beta1.Msg.DelegateCallback
        ): void;

        /**
         * Calls Delegate.
         * @param request MsgDelegate message or plain object
         * @returns Promise
         */
        public delegate(
          request: cosmos.staking.v1beta1.IMsgDelegate
        ): Promise<cosmos.staking.v1beta1.MsgDelegateResponse>;

        /**
         * Calls BeginRedelegate.
         * @param request MsgBeginRedelegate message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgBeginRedelegateResponse
         */
        public beginRedelegate(
          request: cosmos.staking.v1beta1.IMsgBeginRedelegate,
          callback: cosmos.staking.v1beta1.Msg.BeginRedelegateCallback
        ): void;

        /**
         * Calls BeginRedelegate.
         * @param request MsgBeginRedelegate message or plain object
         * @returns Promise
         */
        public beginRedelegate(
          request: cosmos.staking.v1beta1.IMsgBeginRedelegate
        ): Promise<cosmos.staking.v1beta1.MsgBeginRedelegateResponse>;

        /**
         * Calls Undelegate.
         * @param request MsgUndelegate message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgUndelegateResponse
         */
        public undelegate(
          request: cosmos.staking.v1beta1.IMsgUndelegate,
          callback: cosmos.staking.v1beta1.Msg.UndelegateCallback
        ): void;

        /**
         * Calls Undelegate.
         * @param request MsgUndelegate message or plain object
         * @returns Promise
         */
        public undelegate(
          request: cosmos.staking.v1beta1.IMsgUndelegate
        ): Promise<cosmos.staking.v1beta1.MsgUndelegateResponse>;
      }

      namespace Msg {
        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#createValidator}.
         * @param error Error, if any
         * @param [response] MsgCreateValidatorResponse
         */
        type CreateValidatorCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgCreateValidatorResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#editValidator}.
         * @param error Error, if any
         * @param [response] MsgEditValidatorResponse
         */
        type EditValidatorCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgEditValidatorResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#delegate}.
         * @param error Error, if any
         * @param [response] MsgDelegateResponse
         */
        type DelegateCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgDelegateResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#beginRedelegate}.
         * @param error Error, if any
         * @param [response] MsgBeginRedelegateResponse
         */
        type BeginRedelegateCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgBeginRedelegateResponse
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#undelegate}.
         * @param error Error, if any
         * @param [response] MsgUndelegateResponse
         */
        type UndelegateCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgUndelegateResponse
        ) => void;
      }

      /** Properties of a MsgCreateValidator. */
      interface IMsgCreateValidator {
        /** MsgCreateValidator description */
        description?: cosmos.staking.v1beta1.IDescription | null;

        /** MsgCreateValidator commission */
        commission?: cosmos.staking.v1beta1.ICommissionRates | null;

        /** MsgCreateValidator minSelfDelegation */
        minSelfDelegation?: string | null;

        /** MsgCreateValidator delegatorAddress */
        delegatorAddress?: string | null;

        /** MsgCreateValidator validatorAddress */
        validatorAddress?: string | null;

        /** MsgCreateValidator pubkey */
        pubkey?: google.protobuf.IAny | null;

        /** MsgCreateValidator value */
        value?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a MsgCreateValidator. */
      class MsgCreateValidator implements IMsgCreateValidator {
        /**
         * Constructs a new MsgCreateValidator.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgCreateValidator);

        /** MsgCreateValidator description. */
        public description?: cosmos.staking.v1beta1.IDescription | null;

        /** MsgCreateValidator commission. */
        public commission?: cosmos.staking.v1beta1.ICommissionRates | null;

        /** MsgCreateValidator minSelfDelegation. */
        public minSelfDelegation: string;

        /** MsgCreateValidator delegatorAddress. */
        public delegatorAddress: string;

        /** MsgCreateValidator validatorAddress. */
        public validatorAddress: string;

        /** MsgCreateValidator pubkey. */
        public pubkey?: google.protobuf.IAny | null;

        /** MsgCreateValidator value. */
        public value?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new MsgCreateValidator instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgCreateValidator instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgCreateValidator
        ): cosmos.staking.v1beta1.MsgCreateValidator;

        /**
         * Encodes the specified MsgCreateValidator message. Does not implicitly {@link cosmos.staking.v1beta1.MsgCreateValidator.verify|verify} messages.
         * @param m MsgCreateValidator message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgCreateValidator,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgCreateValidator message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgCreateValidator
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgCreateValidator;

        /**
         * Creates a MsgCreateValidator message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgCreateValidator
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgCreateValidator;

        /**
         * Creates a plain object from a MsgCreateValidator message. Also converts values to other types if specified.
         * @param m MsgCreateValidator
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgCreateValidator,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgCreateValidator to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgCreateValidatorResponse. */
      interface IMsgCreateValidatorResponse {}

      /** Represents a MsgCreateValidatorResponse. */
      class MsgCreateValidatorResponse implements IMsgCreateValidatorResponse {
        /**
         * Constructs a new MsgCreateValidatorResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgCreateValidatorResponse);

        /**
         * Creates a new MsgCreateValidatorResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgCreateValidatorResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgCreateValidatorResponse
        ): cosmos.staking.v1beta1.MsgCreateValidatorResponse;

        /**
         * Encodes the specified MsgCreateValidatorResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgCreateValidatorResponse.verify|verify} messages.
         * @param m MsgCreateValidatorResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgCreateValidatorResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgCreateValidatorResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgCreateValidatorResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgCreateValidatorResponse;

        /**
         * Creates a MsgCreateValidatorResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgCreateValidatorResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgCreateValidatorResponse;

        /**
         * Creates a plain object from a MsgCreateValidatorResponse message. Also converts values to other types if specified.
         * @param m MsgCreateValidatorResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgCreateValidatorResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgCreateValidatorResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgEditValidator. */
      interface IMsgEditValidator {
        /** MsgEditValidator description */
        description?: cosmos.staking.v1beta1.IDescription | null;

        /** MsgEditValidator validatorAddress */
        validatorAddress?: string | null;

        /** MsgEditValidator commissionRate */
        commissionRate?: string | null;

        /** MsgEditValidator minSelfDelegation */
        minSelfDelegation?: string | null;
      }

      /** Represents a MsgEditValidator. */
      class MsgEditValidator implements IMsgEditValidator {
        /**
         * Constructs a new MsgEditValidator.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgEditValidator);

        /** MsgEditValidator description. */
        public description?: cosmos.staking.v1beta1.IDescription | null;

        /** MsgEditValidator validatorAddress. */
        public validatorAddress: string;

        /** MsgEditValidator commissionRate. */
        public commissionRate: string;

        /** MsgEditValidator minSelfDelegation. */
        public minSelfDelegation: string;

        /**
         * Creates a new MsgEditValidator instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgEditValidator instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgEditValidator
        ): cosmos.staking.v1beta1.MsgEditValidator;

        /**
         * Encodes the specified MsgEditValidator message. Does not implicitly {@link cosmos.staking.v1beta1.MsgEditValidator.verify|verify} messages.
         * @param m MsgEditValidator message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgEditValidator,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgEditValidator message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgEditValidator
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgEditValidator;

        /**
         * Creates a MsgEditValidator message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgEditValidator
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgEditValidator;

        /**
         * Creates a plain object from a MsgEditValidator message. Also converts values to other types if specified.
         * @param m MsgEditValidator
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgEditValidator,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgEditValidator to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgEditValidatorResponse. */
      interface IMsgEditValidatorResponse {}

      /** Represents a MsgEditValidatorResponse. */
      class MsgEditValidatorResponse implements IMsgEditValidatorResponse {
        /**
         * Constructs a new MsgEditValidatorResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgEditValidatorResponse);

        /**
         * Creates a new MsgEditValidatorResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgEditValidatorResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgEditValidatorResponse
        ): cosmos.staking.v1beta1.MsgEditValidatorResponse;

        /**
         * Encodes the specified MsgEditValidatorResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgEditValidatorResponse.verify|verify} messages.
         * @param m MsgEditValidatorResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgEditValidatorResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgEditValidatorResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgEditValidatorResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgEditValidatorResponse;

        /**
         * Creates a MsgEditValidatorResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgEditValidatorResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgEditValidatorResponse;

        /**
         * Creates a plain object from a MsgEditValidatorResponse message. Also converts values to other types if specified.
         * @param m MsgEditValidatorResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgEditValidatorResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgEditValidatorResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgDelegate. */
      interface IMsgDelegate {
        /** MsgDelegate delegatorAddress */
        delegatorAddress?: string | null;

        /** MsgDelegate validatorAddress */
        validatorAddress?: string | null;

        /** MsgDelegate amount */
        amount?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a MsgDelegate. */
      class MsgDelegate implements IMsgDelegate {
        /**
         * Constructs a new MsgDelegate.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgDelegate);

        /** MsgDelegate delegatorAddress. */
        public delegatorAddress: string;

        /** MsgDelegate validatorAddress. */
        public validatorAddress: string;

        /** MsgDelegate amount. */
        public amount?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new MsgDelegate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgDelegate instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgDelegate
        ): cosmos.staking.v1beta1.MsgDelegate;

        /**
         * Encodes the specified MsgDelegate message. Does not implicitly {@link cosmos.staking.v1beta1.MsgDelegate.verify|verify} messages.
         * @param m MsgDelegate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgDelegate,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgDelegate message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgDelegate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgDelegate;

        /**
         * Creates a MsgDelegate message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgDelegate
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgDelegate;

        /**
         * Creates a plain object from a MsgDelegate message. Also converts values to other types if specified.
         * @param m MsgDelegate
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgDelegate,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgDelegate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgDelegateResponse. */
      interface IMsgDelegateResponse {}

      /** Represents a MsgDelegateResponse. */
      class MsgDelegateResponse implements IMsgDelegateResponse {
        /**
         * Constructs a new MsgDelegateResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgDelegateResponse);

        /**
         * Creates a new MsgDelegateResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgDelegateResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgDelegateResponse
        ): cosmos.staking.v1beta1.MsgDelegateResponse;

        /**
         * Encodes the specified MsgDelegateResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgDelegateResponse.verify|verify} messages.
         * @param m MsgDelegateResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgDelegateResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgDelegateResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgDelegateResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgDelegateResponse;

        /**
         * Creates a MsgDelegateResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgDelegateResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgDelegateResponse;

        /**
         * Creates a plain object from a MsgDelegateResponse message. Also converts values to other types if specified.
         * @param m MsgDelegateResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgDelegateResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgDelegateResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgBeginRedelegate. */
      interface IMsgBeginRedelegate {
        /** MsgBeginRedelegate delegatorAddress */
        delegatorAddress?: string | null;

        /** MsgBeginRedelegate validatorSrcAddress */
        validatorSrcAddress?: string | null;

        /** MsgBeginRedelegate validatorDstAddress */
        validatorDstAddress?: string | null;

        /** MsgBeginRedelegate amount */
        amount?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a MsgBeginRedelegate. */
      class MsgBeginRedelegate implements IMsgBeginRedelegate {
        /**
         * Constructs a new MsgBeginRedelegate.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgBeginRedelegate);

        /** MsgBeginRedelegate delegatorAddress. */
        public delegatorAddress: string;

        /** MsgBeginRedelegate validatorSrcAddress. */
        public validatorSrcAddress: string;

        /** MsgBeginRedelegate validatorDstAddress. */
        public validatorDstAddress: string;

        /** MsgBeginRedelegate amount. */
        public amount?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new MsgBeginRedelegate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgBeginRedelegate instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgBeginRedelegate
        ): cosmos.staking.v1beta1.MsgBeginRedelegate;

        /**
         * Encodes the specified MsgBeginRedelegate message. Does not implicitly {@link cosmos.staking.v1beta1.MsgBeginRedelegate.verify|verify} messages.
         * @param m MsgBeginRedelegate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgBeginRedelegate,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgBeginRedelegate message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgBeginRedelegate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgBeginRedelegate;

        /**
         * Creates a MsgBeginRedelegate message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgBeginRedelegate
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgBeginRedelegate;

        /**
         * Creates a plain object from a MsgBeginRedelegate message. Also converts values to other types if specified.
         * @param m MsgBeginRedelegate
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgBeginRedelegate,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgBeginRedelegate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgBeginRedelegateResponse. */
      interface IMsgBeginRedelegateResponse {
        /** MsgBeginRedelegateResponse completionTime */
        completionTime?: google.protobuf.ITimestamp | null;
      }

      /** Represents a MsgBeginRedelegateResponse. */
      class MsgBeginRedelegateResponse implements IMsgBeginRedelegateResponse {
        /**
         * Constructs a new MsgBeginRedelegateResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgBeginRedelegateResponse);

        /** MsgBeginRedelegateResponse completionTime. */
        public completionTime?: google.protobuf.ITimestamp | null;

        /**
         * Creates a new MsgBeginRedelegateResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgBeginRedelegateResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgBeginRedelegateResponse
        ): cosmos.staking.v1beta1.MsgBeginRedelegateResponse;

        /**
         * Encodes the specified MsgBeginRedelegateResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgBeginRedelegateResponse.verify|verify} messages.
         * @param m MsgBeginRedelegateResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgBeginRedelegateResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgBeginRedelegateResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgBeginRedelegateResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgBeginRedelegateResponse;

        /**
         * Creates a MsgBeginRedelegateResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgBeginRedelegateResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgBeginRedelegateResponse;

        /**
         * Creates a plain object from a MsgBeginRedelegateResponse message. Also converts values to other types if specified.
         * @param m MsgBeginRedelegateResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgBeginRedelegateResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgBeginRedelegateResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgUndelegate. */
      interface IMsgUndelegate {
        /** MsgUndelegate delegatorAddress */
        delegatorAddress?: string | null;

        /** MsgUndelegate validatorAddress */
        validatorAddress?: string | null;

        /** MsgUndelegate amount */
        amount?: cosmos.base.v1beta1.ICoin | null;
      }

      /** Represents a MsgUndelegate. */
      class MsgUndelegate implements IMsgUndelegate {
        /**
         * Constructs a new MsgUndelegate.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgUndelegate);

        /** MsgUndelegate delegatorAddress. */
        public delegatorAddress: string;

        /** MsgUndelegate validatorAddress. */
        public validatorAddress: string;

        /** MsgUndelegate amount. */
        public amount?: cosmos.base.v1beta1.ICoin | null;

        /**
         * Creates a new MsgUndelegate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgUndelegate instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgUndelegate
        ): cosmos.staking.v1beta1.MsgUndelegate;

        /**
         * Encodes the specified MsgUndelegate message. Does not implicitly {@link cosmos.staking.v1beta1.MsgUndelegate.verify|verify} messages.
         * @param m MsgUndelegate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgUndelegate,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgUndelegate message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgUndelegate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgUndelegate;

        /**
         * Creates a MsgUndelegate message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgUndelegate
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgUndelegate;

        /**
         * Creates a plain object from a MsgUndelegate message. Also converts values to other types if specified.
         * @param m MsgUndelegate
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgUndelegate,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgUndelegate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a MsgUndelegateResponse. */
      interface IMsgUndelegateResponse {
        /** MsgUndelegateResponse completionTime */
        completionTime?: google.protobuf.ITimestamp | null;
      }

      /** Represents a MsgUndelegateResponse. */
      class MsgUndelegateResponse implements IMsgUndelegateResponse {
        /**
         * Constructs a new MsgUndelegateResponse.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.staking.v1beta1.IMsgUndelegateResponse);

        /** MsgUndelegateResponse completionTime. */
        public completionTime?: google.protobuf.ITimestamp | null;

        /**
         * Creates a new MsgUndelegateResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MsgUndelegateResponse instance
         */
        public static create(
          properties?: cosmos.staking.v1beta1.IMsgUndelegateResponse
        ): cosmos.staking.v1beta1.MsgUndelegateResponse;

        /**
         * Encodes the specified MsgUndelegateResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgUndelegateResponse.verify|verify} messages.
         * @param m MsgUndelegateResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgUndelegateResponse,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a MsgUndelegateResponse message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgUndelegateResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.staking.v1beta1.MsgUndelegateResponse;

        /**
         * Creates a MsgUndelegateResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgUndelegateResponse
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.staking.v1beta1.MsgUndelegateResponse;

        /**
         * Creates a plain object from a MsgUndelegateResponse message. Also converts values to other types if specified.
         * @param m MsgUndelegateResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgUndelegateResponse,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this MsgUndelegateResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace tx. */
  namespace tx {
    /** Namespace signing. */
    namespace signing {
      /** Namespace v1beta1. */
      namespace v1beta1 {
        /** SignMode enum. */
        enum SignMode {
          SIGN_MODE_UNSPECIFIED = 0,
          SIGN_MODE_DIRECT = 1,
          SIGN_MODE_TEXTUAL = 2,
          SIGN_MODE_LEGACY_AMINO_JSON = 127,
        }

        /** Properties of a SignatureDescriptors. */
        interface ISignatureDescriptors {
          /** SignatureDescriptors signatures */
          signatures?: cosmos.tx.signing.v1beta1.ISignatureDescriptor[] | null;
        }

        /** Represents a SignatureDescriptors. */
        class SignatureDescriptors implements ISignatureDescriptors {
          /**
           * Constructs a new SignatureDescriptors.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.tx.signing.v1beta1.ISignatureDescriptors);

          /** SignatureDescriptors signatures. */
          public signatures: cosmos.tx.signing.v1beta1.ISignatureDescriptor[];

          /**
           * Creates a new SignatureDescriptors instance using the specified properties.
           * @param [properties] Properties to set
           * @returns SignatureDescriptors instance
           */
          public static create(
            properties?: cosmos.tx.signing.v1beta1.ISignatureDescriptors
          ): cosmos.tx.signing.v1beta1.SignatureDescriptors;

          /**
           * Encodes the specified SignatureDescriptors message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptors.verify|verify} messages.
           * @param m SignatureDescriptors message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.tx.signing.v1beta1.ISignatureDescriptors,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a SignatureDescriptors message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns SignatureDescriptors
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.tx.signing.v1beta1.SignatureDescriptors;

          /**
           * Creates a SignatureDescriptors message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns SignatureDescriptors
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.tx.signing.v1beta1.SignatureDescriptors;

          /**
           * Creates a plain object from a SignatureDescriptors message. Also converts values to other types if specified.
           * @param m SignatureDescriptors
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.signing.v1beta1.SignatureDescriptors,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this SignatureDescriptors to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a SignatureDescriptor. */
        interface ISignatureDescriptor {
          /** SignatureDescriptor publicKey */
          publicKey?: google.protobuf.IAny | null;

          /** SignatureDescriptor data */
          data?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData | null;

          /** SignatureDescriptor sequence */
          sequence?: Long | null;
        }

        /** Represents a SignatureDescriptor. */
        class SignatureDescriptor implements ISignatureDescriptor {
          /**
           * Constructs a new SignatureDescriptor.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.tx.signing.v1beta1.ISignatureDescriptor);

          /** SignatureDescriptor publicKey. */
          public publicKey?: google.protobuf.IAny | null;

          /** SignatureDescriptor data. */
          public data?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData | null;

          /** SignatureDescriptor sequence. */
          public sequence: Long;

          /**
           * Creates a new SignatureDescriptor instance using the specified properties.
           * @param [properties] Properties to set
           * @returns SignatureDescriptor instance
           */
          public static create(
            properties?: cosmos.tx.signing.v1beta1.ISignatureDescriptor
          ): cosmos.tx.signing.v1beta1.SignatureDescriptor;

          /**
           * Encodes the specified SignatureDescriptor message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.verify|verify} messages.
           * @param m SignatureDescriptor message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.tx.signing.v1beta1.ISignatureDescriptor,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a SignatureDescriptor message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns SignatureDescriptor
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.tx.signing.v1beta1.SignatureDescriptor;

          /**
           * Creates a SignatureDescriptor message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns SignatureDescriptor
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.tx.signing.v1beta1.SignatureDescriptor;

          /**
           * Creates a plain object from a SignatureDescriptor message. Also converts values to other types if specified.
           * @param m SignatureDescriptor
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.signing.v1beta1.SignatureDescriptor,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this SignatureDescriptor to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        namespace SignatureDescriptor {
          /** Properties of a Data. */
          interface IData {
            /** Data single */
            single?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle | null;

            /** Data multi */
            multi?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti | null;
          }

          /** Represents a Data. */
          class Data implements IData {
            /**
             * Constructs a new Data.
             * @param [p] Properties to set
             */
            constructor(
              p?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData
            );

            /** Data single. */
            public single?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle | null;

            /** Data multi. */
            public multi?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti | null;

            /** Data sum. */
            public sum?: "single" | "multi";

            /**
             * Creates a new Data instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Data instance
             */
            public static create(
              properties?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData
            ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data;

            /**
             * Encodes the specified Data message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.verify|verify} messages.
             * @param m Data message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData,
              w?: $protobuf.Writer
            ): $protobuf.Writer;

            /**
             * Decodes a Data message from the specified reader or buffer.
             * @param r Reader or buffer to decode from
             * @param [l] Message length if known beforehand
             * @returns Data
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(
              r: $protobuf.Reader | Uint8Array,
              l?: number
            ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data;

            /**
             * Creates a Data message from a plain object. Also converts values to their respective internal types.
             * @param d Plain object
             * @returns Data
             */
            public static fromObject(d: {
              [k: string]: any;
            }): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data;

            /**
             * Creates a plain object from a Data message. Also converts values to other types if specified.
             * @param m Data
             * @param [o] Conversion options
             * @returns Plain object
             */
            public static toObject(
              m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data,
              o?: $protobuf.IConversionOptions
            ): { [k: string]: any };

            /**
             * Converts this Data to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
          }

          namespace Data {
            /** Properties of a Single. */
            interface ISingle {
              /** Single mode */
              mode?: cosmos.tx.signing.v1beta1.SignMode | null;

              /** Single signature */
              signature?: Uint8Array | null;
            }

            /** Represents a Single. */
            class Single implements ISingle {
              /**
               * Constructs a new Single.
               * @param [p] Properties to set
               */
              constructor(
                p?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle
              );

              /** Single mode. */
              public mode: cosmos.tx.signing.v1beta1.SignMode;

              /** Single signature. */
              public signature: Uint8Array;

              /**
               * Creates a new Single instance using the specified properties.
               * @param [properties] Properties to set
               * @returns Single instance
               */
              public static create(
                properties?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle
              ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single;

              /**
               * Encodes the specified Single message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.verify|verify} messages.
               * @param m Single message or plain object to encode
               * @param [w] Writer to encode to
               * @returns Writer
               */
              public static encode(
                m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle,
                w?: $protobuf.Writer
              ): $protobuf.Writer;

              /**
               * Decodes a Single message from the specified reader or buffer.
               * @param r Reader or buffer to decode from
               * @param [l] Message length if known beforehand
               * @returns Single
               * @throws {Error} If the payload is not a reader or valid buffer
               * @throws {$protobuf.util.ProtocolError} If required fields are missing
               */
              public static decode(
                r: $protobuf.Reader | Uint8Array,
                l?: number
              ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single;

              /**
               * Creates a Single message from a plain object. Also converts values to their respective internal types.
               * @param d Plain object
               * @returns Single
               */
              public static fromObject(d: {
                [k: string]: any;
              }): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single;

              /**
               * Creates a plain object from a Single message. Also converts values to other types if specified.
               * @param m Single
               * @param [o] Conversion options
               * @returns Plain object
               */
              public static toObject(
                m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single,
                o?: $protobuf.IConversionOptions
              ): { [k: string]: any };

              /**
               * Converts this Single to JSON.
               * @returns JSON object
               */
              public toJSON(): { [k: string]: any };
            }

            /** Properties of a Multi. */
            interface IMulti {
              /** Multi bitarray */
              bitarray?: cosmos.crypto.multisig.v1beta1.ICompactBitArray | null;

              /** Multi signatures */
              signatures?:
                | cosmos.tx.signing.v1beta1.SignatureDescriptor.IData[]
                | null;
            }

            /** Represents a Multi. */
            class Multi implements IMulti {
              /**
               * Constructs a new Multi.
               * @param [p] Properties to set
               */
              constructor(
                p?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti
              );

              /** Multi bitarray. */
              public bitarray?: cosmos.crypto.multisig.v1beta1.ICompactBitArray | null;

              /** Multi signatures. */
              public signatures: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData[];

              /**
               * Creates a new Multi instance using the specified properties.
               * @param [properties] Properties to set
               * @returns Multi instance
               */
              public static create(
                properties?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti
              ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi;

              /**
               * Encodes the specified Multi message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.verify|verify} messages.
               * @param m Multi message or plain object to encode
               * @param [w] Writer to encode to
               * @returns Writer
               */
              public static encode(
                m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti,
                w?: $protobuf.Writer
              ): $protobuf.Writer;

              /**
               * Decodes a Multi message from the specified reader or buffer.
               * @param r Reader or buffer to decode from
               * @param [l] Message length if known beforehand
               * @returns Multi
               * @throws {Error} If the payload is not a reader or valid buffer
               * @throws {$protobuf.util.ProtocolError} If required fields are missing
               */
              public static decode(
                r: $protobuf.Reader | Uint8Array,
                l?: number
              ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi;

              /**
               * Creates a Multi message from a plain object. Also converts values to their respective internal types.
               * @param d Plain object
               * @returns Multi
               */
              public static fromObject(d: {
                [k: string]: any;
              }): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi;

              /**
               * Creates a plain object from a Multi message. Also converts values to other types if specified.
               * @param m Multi
               * @param [o] Conversion options
               * @returns Plain object
               */
              public static toObject(
                m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi,
                o?: $protobuf.IConversionOptions
              ): { [k: string]: any };

              /**
               * Converts this Multi to JSON.
               * @returns JSON object
               */
              public toJSON(): { [k: string]: any };
            }
          }
        }
      }
    }

    /** Namespace v1beta1. */
    namespace v1beta1 {
      /** Properties of a Tx. */
      interface ITx {
        /** Tx body */
        body?: cosmos.tx.v1beta1.ITxBody | null;

        /** Tx authInfo */
        authInfo?: cosmos.tx.v1beta1.IAuthInfo | null;

        /** Tx signatures */
        signatures?: Uint8Array[] | null;
      }

      /** Represents a Tx. */
      class Tx implements ITx {
        /**
         * Constructs a new Tx.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.ITx);

        /** Tx body. */
        public body?: cosmos.tx.v1beta1.ITxBody | null;

        /** Tx authInfo. */
        public authInfo?: cosmos.tx.v1beta1.IAuthInfo | null;

        /** Tx signatures. */
        public signatures: Uint8Array[];

        /**
         * Creates a new Tx instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Tx instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.ITx
        ): cosmos.tx.v1beta1.Tx;

        /**
         * Encodes the specified Tx message. Does not implicitly {@link cosmos.tx.v1beta1.Tx.verify|verify} messages.
         * @param m Tx message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.ITx,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Tx message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Tx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.Tx;

        /**
         * Creates a Tx message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Tx
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.Tx;

        /**
         * Creates a plain object from a Tx message. Also converts values to other types if specified.
         * @param m Tx
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.Tx,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Tx to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a TxRaw. */
      interface ITxRaw {
        /** TxRaw bodyBytes */
        bodyBytes?: Uint8Array | null;

        /** TxRaw authInfoBytes */
        authInfoBytes?: Uint8Array | null;

        /** TxRaw signatures */
        signatures?: Uint8Array[] | null;
      }

      /** Represents a TxRaw. */
      class TxRaw implements ITxRaw {
        /**
         * Constructs a new TxRaw.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.ITxRaw);

        /** TxRaw bodyBytes. */
        public bodyBytes: Uint8Array;

        /** TxRaw authInfoBytes. */
        public authInfoBytes: Uint8Array;

        /** TxRaw signatures. */
        public signatures: Uint8Array[];

        /**
         * Creates a new TxRaw instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TxRaw instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.ITxRaw
        ): cosmos.tx.v1beta1.TxRaw;

        /**
         * Encodes the specified TxRaw message. Does not implicitly {@link cosmos.tx.v1beta1.TxRaw.verify|verify} messages.
         * @param m TxRaw message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.ITxRaw,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a TxRaw message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TxRaw
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.TxRaw;

        /**
         * Creates a TxRaw message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns TxRaw
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.TxRaw;

        /**
         * Creates a plain object from a TxRaw message. Also converts values to other types if specified.
         * @param m TxRaw
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.TxRaw,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this TxRaw to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a SignDoc. */
      interface ISignDoc {
        /** SignDoc bodyBytes */
        bodyBytes?: Uint8Array | null;

        /** SignDoc authInfoBytes */
        authInfoBytes?: Uint8Array | null;

        /** SignDoc chainId */
        chainId?: string | null;

        /** SignDoc accountNumber */
        accountNumber?: Long | null;
      }

      /** Represents a SignDoc. */
      class SignDoc implements ISignDoc {
        /**
         * Constructs a new SignDoc.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.ISignDoc);

        /** SignDoc bodyBytes. */
        public bodyBytes: Uint8Array;

        /** SignDoc authInfoBytes. */
        public authInfoBytes: Uint8Array;

        /** SignDoc chainId. */
        public chainId: string;

        /** SignDoc accountNumber. */
        public accountNumber: Long;

        /**
         * Creates a new SignDoc instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignDoc instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.ISignDoc
        ): cosmos.tx.v1beta1.SignDoc;

        /**
         * Encodes the specified SignDoc message. Does not implicitly {@link cosmos.tx.v1beta1.SignDoc.verify|verify} messages.
         * @param m SignDoc message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.ISignDoc,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a SignDoc message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignDoc
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.SignDoc;

        /**
         * Creates a SignDoc message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SignDoc
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.SignDoc;

        /**
         * Creates a plain object from a SignDoc message. Also converts values to other types if specified.
         * @param m SignDoc
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.SignDoc,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this SignDoc to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a TxBody. */
      interface ITxBody {
        /** TxBody messages */
        messages?: google.protobuf.IAny[] | null;

        /** TxBody memo */
        memo?: string | null;

        /** TxBody timeoutHeight */
        timeoutHeight?: Long | null;

        /** TxBody extensionOptions */
        extensionOptions?: google.protobuf.IAny[] | null;

        /** TxBody nonCriticalExtensionOptions */
        nonCriticalExtensionOptions?: google.protobuf.IAny[] | null;
      }

      /** Represents a TxBody. */
      class TxBody implements ITxBody {
        /**
         * Constructs a new TxBody.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.ITxBody);

        /** TxBody messages. */
        public messages: google.protobuf.IAny[];

        /** TxBody memo. */
        public memo: string;

        /** TxBody timeoutHeight. */
        public timeoutHeight: Long;

        /** TxBody extensionOptions. */
        public extensionOptions: google.protobuf.IAny[];

        /** TxBody nonCriticalExtensionOptions. */
        public nonCriticalExtensionOptions: google.protobuf.IAny[];

        /**
         * Creates a new TxBody instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TxBody instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.ITxBody
        ): cosmos.tx.v1beta1.TxBody;

        /**
         * Encodes the specified TxBody message. Does not implicitly {@link cosmos.tx.v1beta1.TxBody.verify|verify} messages.
         * @param m TxBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.ITxBody,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a TxBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TxBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.TxBody;

        /**
         * Creates a TxBody message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns TxBody
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.TxBody;

        /**
         * Creates a plain object from a TxBody message. Also converts values to other types if specified.
         * @param m TxBody
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.TxBody,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this TxBody to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of an AuthInfo. */
      interface IAuthInfo {
        /** AuthInfo signerInfos */
        signerInfos?: cosmos.tx.v1beta1.ISignerInfo[] | null;

        /** AuthInfo fee */
        fee?: cosmos.tx.v1beta1.IFee | null;
      }

      /** Represents an AuthInfo. */
      class AuthInfo implements IAuthInfo {
        /**
         * Constructs a new AuthInfo.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.IAuthInfo);

        /** AuthInfo signerInfos. */
        public signerInfos: cosmos.tx.v1beta1.ISignerInfo[];

        /** AuthInfo fee. */
        public fee?: cosmos.tx.v1beta1.IFee | null;

        /**
         * Creates a new AuthInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AuthInfo instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.IAuthInfo
        ): cosmos.tx.v1beta1.AuthInfo;

        /**
         * Encodes the specified AuthInfo message. Does not implicitly {@link cosmos.tx.v1beta1.AuthInfo.verify|verify} messages.
         * @param m AuthInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.IAuthInfo,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an AuthInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AuthInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.AuthInfo;

        /**
         * Creates an AuthInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns AuthInfo
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.AuthInfo;

        /**
         * Creates a plain object from an AuthInfo message. Also converts values to other types if specified.
         * @param m AuthInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.AuthInfo,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this AuthInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a SignerInfo. */
      interface ISignerInfo {
        /** SignerInfo publicKey */
        publicKey?: google.protobuf.IAny | null;

        /** SignerInfo modeInfo */
        modeInfo?: cosmos.tx.v1beta1.IModeInfo | null;

        /** SignerInfo sequence */
        sequence?: Long | null;
      }

      /** Represents a SignerInfo. */
      class SignerInfo implements ISignerInfo {
        /**
         * Constructs a new SignerInfo.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.ISignerInfo);

        /** SignerInfo publicKey. */
        public publicKey?: google.protobuf.IAny | null;

        /** SignerInfo modeInfo. */
        public modeInfo?: cosmos.tx.v1beta1.IModeInfo | null;

        /** SignerInfo sequence. */
        public sequence: Long;

        /**
         * Creates a new SignerInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignerInfo instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.ISignerInfo
        ): cosmos.tx.v1beta1.SignerInfo;

        /**
         * Encodes the specified SignerInfo message. Does not implicitly {@link cosmos.tx.v1beta1.SignerInfo.verify|verify} messages.
         * @param m SignerInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.ISignerInfo,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a SignerInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignerInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.SignerInfo;

        /**
         * Creates a SignerInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SignerInfo
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.SignerInfo;

        /**
         * Creates a plain object from a SignerInfo message. Also converts values to other types if specified.
         * @param m SignerInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.SignerInfo,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this SignerInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a ModeInfo. */
      interface IModeInfo {
        /** ModeInfo single */
        single?: cosmos.tx.v1beta1.ModeInfo.ISingle | null;

        /** ModeInfo multi */
        multi?: cosmos.tx.v1beta1.ModeInfo.IMulti | null;
      }

      /** Represents a ModeInfo. */
      class ModeInfo implements IModeInfo {
        /**
         * Constructs a new ModeInfo.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.IModeInfo);

        /** ModeInfo single. */
        public single?: cosmos.tx.v1beta1.ModeInfo.ISingle | null;

        /** ModeInfo multi. */
        public multi?: cosmos.tx.v1beta1.ModeInfo.IMulti | null;

        /** ModeInfo sum. */
        public sum?: "single" | "multi";

        /**
         * Creates a new ModeInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ModeInfo instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.IModeInfo
        ): cosmos.tx.v1beta1.ModeInfo;

        /**
         * Encodes the specified ModeInfo message. Does not implicitly {@link cosmos.tx.v1beta1.ModeInfo.verify|verify} messages.
         * @param m ModeInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.IModeInfo,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a ModeInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ModeInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.ModeInfo;

        /**
         * Creates a ModeInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ModeInfo
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.ModeInfo;

        /**
         * Creates a plain object from a ModeInfo message. Also converts values to other types if specified.
         * @param m ModeInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.ModeInfo,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this ModeInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      namespace ModeInfo {
        /** Properties of a Single. */
        interface ISingle {
          /** Single mode */
          mode?: cosmos.tx.signing.v1beta1.SignMode | null;
        }

        /** Represents a Single. */
        class Single implements ISingle {
          /**
           * Constructs a new Single.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.tx.v1beta1.ModeInfo.ISingle);

          /** Single mode. */
          public mode: cosmos.tx.signing.v1beta1.SignMode;

          /**
           * Creates a new Single instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Single instance
           */
          public static create(
            properties?: cosmos.tx.v1beta1.ModeInfo.ISingle
          ): cosmos.tx.v1beta1.ModeInfo.Single;

          /**
           * Encodes the specified Single message. Does not implicitly {@link cosmos.tx.v1beta1.ModeInfo.Single.verify|verify} messages.
           * @param m Single message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.tx.v1beta1.ModeInfo.ISingle,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Single message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Single
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.tx.v1beta1.ModeInfo.Single;

          /**
           * Creates a Single message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Single
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.tx.v1beta1.ModeInfo.Single;

          /**
           * Creates a plain object from a Single message. Also converts values to other types if specified.
           * @param m Single
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.v1beta1.ModeInfo.Single,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Single to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a Multi. */
        interface IMulti {
          /** Multi bitarray */
          bitarray?: cosmos.crypto.multisig.v1beta1.ICompactBitArray | null;

          /** Multi modeInfos */
          modeInfos?: cosmos.tx.v1beta1.IModeInfo[] | null;
        }

        /** Represents a Multi. */
        class Multi implements IMulti {
          /**
           * Constructs a new Multi.
           * @param [p] Properties to set
           */
          constructor(p?: cosmos.tx.v1beta1.ModeInfo.IMulti);

          /** Multi bitarray. */
          public bitarray?: cosmos.crypto.multisig.v1beta1.ICompactBitArray | null;

          /** Multi modeInfos. */
          public modeInfos: cosmos.tx.v1beta1.IModeInfo[];

          /**
           * Creates a new Multi instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Multi instance
           */
          public static create(
            properties?: cosmos.tx.v1beta1.ModeInfo.IMulti
          ): cosmos.tx.v1beta1.ModeInfo.Multi;

          /**
           * Encodes the specified Multi message. Does not implicitly {@link cosmos.tx.v1beta1.ModeInfo.Multi.verify|verify} messages.
           * @param m Multi message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.tx.v1beta1.ModeInfo.IMulti,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Multi message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Multi
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): cosmos.tx.v1beta1.ModeInfo.Multi;

          /**
           * Creates a Multi message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Multi
           */
          public static fromObject(d: {
            [k: string]: any;
          }): cosmos.tx.v1beta1.ModeInfo.Multi;

          /**
           * Creates a plain object from a Multi message. Also converts values to other types if specified.
           * @param m Multi
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.v1beta1.ModeInfo.Multi,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Multi to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }

      /** Properties of a Fee. */
      interface IFee {
        /** Fee amount */
        amount?: cosmos.base.v1beta1.ICoin[] | null;

        /** Fee gasLimit */
        gasLimit?: Long | null;

        /** Fee payer */
        payer?: string | null;

        /** Fee granter */
        granter?: string | null;
      }

      /** Represents a Fee. */
      class Fee implements IFee {
        /**
         * Constructs a new Fee.
         * @param [p] Properties to set
         */
        constructor(p?: cosmos.tx.v1beta1.IFee);

        /** Fee amount. */
        public amount: cosmos.base.v1beta1.ICoin[];

        /** Fee gasLimit. */
        public gasLimit: Long;

        /** Fee payer. */
        public payer: string;

        /** Fee granter. */
        public granter: string;

        /**
         * Creates a new Fee instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Fee instance
         */
        public static create(
          properties?: cosmos.tx.v1beta1.IFee
        ): cosmos.tx.v1beta1.Fee;

        /**
         * Encodes the specified Fee message. Does not implicitly {@link cosmos.tx.v1beta1.Fee.verify|verify} messages.
         * @param m Fee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.tx.v1beta1.IFee,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Fee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Fee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): cosmos.tx.v1beta1.Fee;

        /**
         * Creates a Fee message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Fee
         */
        public static fromObject(d: {
          [k: string]: any;
        }): cosmos.tx.v1beta1.Fee;

        /**
         * Creates a plain object from a Fee message. Also converts values to other types if specified.
         * @param m Fee
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.Fee,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Fee to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }
}

/** Namespace google. */
export namespace google {
  /** Namespace protobuf. */
  namespace protobuf {
    /** Properties of an Any. */
    interface IAny {
      /** Any type_url */
      type_url?: string | null;

      /** Any value */
      value?: Uint8Array | null;
    }

    /** Represents an Any. */
    class Any implements IAny {
      /**
       * Constructs a new Any.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IAny);

      /** Any type_url. */
      public type_url: string;

      /** Any value. */
      public value: Uint8Array;

      /**
       * Creates a new Any instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Any instance
       */
      public static create(
        properties?: google.protobuf.IAny
      ): google.protobuf.Any;

      /**
       * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
       * @param m Any message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IAny,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an Any message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Any
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.Any;

      /**
       * Creates an Any message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Any
       */
      public static fromObject(d: { [k: string]: any }): google.protobuf.Any;

      /**
       * Creates a plain object from an Any message. Also converts values to other types if specified.
       * @param m Any
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Any,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Any to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a FileDescriptorSet. */
    interface IFileDescriptorSet {
      /** FileDescriptorSet file */
      file?: google.protobuf.IFileDescriptorProto[] | null;
    }

    /** Represents a FileDescriptorSet. */
    class FileDescriptorSet implements IFileDescriptorSet {
      /**
       * Constructs a new FileDescriptorSet.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IFileDescriptorSet);

      /** FileDescriptorSet file. */
      public file: google.protobuf.IFileDescriptorProto[];

      /**
       * Creates a new FileDescriptorSet instance using the specified properties.
       * @param [properties] Properties to set
       * @returns FileDescriptorSet instance
       */
      public static create(
        properties?: google.protobuf.IFileDescriptorSet
      ): google.protobuf.FileDescriptorSet;

      /**
       * Encodes the specified FileDescriptorSet message. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
       * @param m FileDescriptorSet message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IFileDescriptorSet,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a FileDescriptorSet message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns FileDescriptorSet
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.FileDescriptorSet;

      /**
       * Creates a FileDescriptorSet message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns FileDescriptorSet
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.FileDescriptorSet;

      /**
       * Creates a plain object from a FileDescriptorSet message. Also converts values to other types if specified.
       * @param m FileDescriptorSet
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.FileDescriptorSet,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this FileDescriptorSet to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a FileDescriptorProto. */
    interface IFileDescriptorProto {
      /** FileDescriptorProto name */
      name?: string | null;

      /** FileDescriptorProto package */
      package?: string | null;

      /** FileDescriptorProto dependency */
      dependency?: string[] | null;

      /** FileDescriptorProto publicDependency */
      publicDependency?: number[] | null;

      /** FileDescriptorProto weakDependency */
      weakDependency?: number[] | null;

      /** FileDescriptorProto messageType */
      messageType?: google.protobuf.IDescriptorProto[] | null;

      /** FileDescriptorProto enumType */
      enumType?: google.protobuf.IEnumDescriptorProto[] | null;

      /** FileDescriptorProto service */
      service?: google.protobuf.IServiceDescriptorProto[] | null;

      /** FileDescriptorProto extension */
      extension?: google.protobuf.IFieldDescriptorProto[] | null;

      /** FileDescriptorProto options */
      options?: google.protobuf.IFileOptions | null;

      /** FileDescriptorProto sourceCodeInfo */
      sourceCodeInfo?: google.protobuf.ISourceCodeInfo | null;

      /** FileDescriptorProto syntax */
      syntax?: string | null;
    }

    /** Represents a FileDescriptorProto. */
    class FileDescriptorProto implements IFileDescriptorProto {
      /**
       * Constructs a new FileDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IFileDescriptorProto);

      /** FileDescriptorProto name. */
      public name: string;

      /** FileDescriptorProto package. */
      public package: string;

      /** FileDescriptorProto dependency. */
      public dependency: string[];

      /** FileDescriptorProto publicDependency. */
      public publicDependency: number[];

      /** FileDescriptorProto weakDependency. */
      public weakDependency: number[];

      /** FileDescriptorProto messageType. */
      public messageType: google.protobuf.IDescriptorProto[];

      /** FileDescriptorProto enumType. */
      public enumType: google.protobuf.IEnumDescriptorProto[];

      /** FileDescriptorProto service. */
      public service: google.protobuf.IServiceDescriptorProto[];

      /** FileDescriptorProto extension. */
      public extension: google.protobuf.IFieldDescriptorProto[];

      /** FileDescriptorProto options. */
      public options?: google.protobuf.IFileOptions | null;

      /** FileDescriptorProto sourceCodeInfo. */
      public sourceCodeInfo?: google.protobuf.ISourceCodeInfo | null;

      /** FileDescriptorProto syntax. */
      public syntax: string;

      /**
       * Creates a new FileDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns FileDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IFileDescriptorProto
      ): google.protobuf.FileDescriptorProto;

      /**
       * Encodes the specified FileDescriptorProto message. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
       * @param m FileDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IFileDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a FileDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns FileDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.FileDescriptorProto;

      /**
       * Creates a FileDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns FileDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.FileDescriptorProto;

      /**
       * Creates a plain object from a FileDescriptorProto message. Also converts values to other types if specified.
       * @param m FileDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.FileDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this FileDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a DescriptorProto. */
    interface IDescriptorProto {
      /** DescriptorProto name */
      name?: string | null;

      /** DescriptorProto field */
      field?: google.protobuf.IFieldDescriptorProto[] | null;

      /** DescriptorProto extension */
      extension?: google.protobuf.IFieldDescriptorProto[] | null;

      /** DescriptorProto nestedType */
      nestedType?: google.protobuf.IDescriptorProto[] | null;

      /** DescriptorProto enumType */
      enumType?: google.protobuf.IEnumDescriptorProto[] | null;

      /** DescriptorProto extensionRange */
      extensionRange?: google.protobuf.DescriptorProto.IExtensionRange[] | null;

      /** DescriptorProto oneofDecl */
      oneofDecl?: google.protobuf.IOneofDescriptorProto[] | null;

      /** DescriptorProto options */
      options?: google.protobuf.IMessageOptions | null;

      /** DescriptorProto reservedRange */
      reservedRange?: google.protobuf.DescriptorProto.IReservedRange[] | null;

      /** DescriptorProto reservedName */
      reservedName?: string[] | null;
    }

    /** Represents a DescriptorProto. */
    class DescriptorProto implements IDescriptorProto {
      /**
       * Constructs a new DescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IDescriptorProto);

      /** DescriptorProto name. */
      public name: string;

      /** DescriptorProto field. */
      public field: google.protobuf.IFieldDescriptorProto[];

      /** DescriptorProto extension. */
      public extension: google.protobuf.IFieldDescriptorProto[];

      /** DescriptorProto nestedType. */
      public nestedType: google.protobuf.IDescriptorProto[];

      /** DescriptorProto enumType. */
      public enumType: google.protobuf.IEnumDescriptorProto[];

      /** DescriptorProto extensionRange. */
      public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[];

      /** DescriptorProto oneofDecl. */
      public oneofDecl: google.protobuf.IOneofDescriptorProto[];

      /** DescriptorProto options. */
      public options?: google.protobuf.IMessageOptions | null;

      /** DescriptorProto reservedRange. */
      public reservedRange: google.protobuf.DescriptorProto.IReservedRange[];

      /** DescriptorProto reservedName. */
      public reservedName: string[];

      /**
       * Creates a new DescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns DescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IDescriptorProto
      ): google.protobuf.DescriptorProto;

      /**
       * Encodes the specified DescriptorProto message. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
       * @param m DescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a DescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns DescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.DescriptorProto;

      /**
       * Creates a DescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns DescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.DescriptorProto;

      /**
       * Creates a plain object from a DescriptorProto message. Also converts values to other types if specified.
       * @param m DescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.DescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this DescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace DescriptorProto {
      /** Properties of an ExtensionRange. */
      interface IExtensionRange {
        /** ExtensionRange start */
        start?: number | null;

        /** ExtensionRange end */
        end?: number | null;
      }

      /** Represents an ExtensionRange. */
      class ExtensionRange implements IExtensionRange {
        /**
         * Constructs a new ExtensionRange.
         * @param [p] Properties to set
         */
        constructor(p?: google.protobuf.DescriptorProto.IExtensionRange);

        /** ExtensionRange start. */
        public start: number;

        /** ExtensionRange end. */
        public end: number;

        /**
         * Creates a new ExtensionRange instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ExtensionRange instance
         */
        public static create(
          properties?: google.protobuf.DescriptorProto.IExtensionRange
        ): google.protobuf.DescriptorProto.ExtensionRange;

        /**
         * Encodes the specified ExtensionRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
         * @param m ExtensionRange message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: google.protobuf.DescriptorProto.IExtensionRange,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an ExtensionRange message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ExtensionRange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): google.protobuf.DescriptorProto.ExtensionRange;

        /**
         * Creates an ExtensionRange message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ExtensionRange
         */
        public static fromObject(d: {
          [k: string]: any;
        }): google.protobuf.DescriptorProto.ExtensionRange;

        /**
         * Creates a plain object from an ExtensionRange message. Also converts values to other types if specified.
         * @param m ExtensionRange
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: google.protobuf.DescriptorProto.ExtensionRange,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this ExtensionRange to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }

      /** Properties of a ReservedRange. */
      interface IReservedRange {
        /** ReservedRange start */
        start?: number | null;

        /** ReservedRange end */
        end?: number | null;
      }

      /** Represents a ReservedRange. */
      class ReservedRange implements IReservedRange {
        /**
         * Constructs a new ReservedRange.
         * @param [p] Properties to set
         */
        constructor(p?: google.protobuf.DescriptorProto.IReservedRange);

        /** ReservedRange start. */
        public start: number;

        /** ReservedRange end. */
        public end: number;

        /**
         * Creates a new ReservedRange instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ReservedRange instance
         */
        public static create(
          properties?: google.protobuf.DescriptorProto.IReservedRange
        ): google.protobuf.DescriptorProto.ReservedRange;

        /**
         * Encodes the specified ReservedRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
         * @param m ReservedRange message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: google.protobuf.DescriptorProto.IReservedRange,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a ReservedRange message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ReservedRange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): google.protobuf.DescriptorProto.ReservedRange;

        /**
         * Creates a ReservedRange message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ReservedRange
         */
        public static fromObject(d: {
          [k: string]: any;
        }): google.protobuf.DescriptorProto.ReservedRange;

        /**
         * Creates a plain object from a ReservedRange message. Also converts values to other types if specified.
         * @param m ReservedRange
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: google.protobuf.DescriptorProto.ReservedRange,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this ReservedRange to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }

    /** Properties of a FieldDescriptorProto. */
    interface IFieldDescriptorProto {
      /** FieldDescriptorProto name */
      name?: string | null;

      /** FieldDescriptorProto number */
      number?: number | null;

      /** FieldDescriptorProto label */
      label?: google.protobuf.FieldDescriptorProto.Label | null;

      /** FieldDescriptorProto type */
      type?: google.protobuf.FieldDescriptorProto.Type | null;

      /** FieldDescriptorProto typeName */
      typeName?: string | null;

      /** FieldDescriptorProto extendee */
      extendee?: string | null;

      /** FieldDescriptorProto defaultValue */
      defaultValue?: string | null;

      /** FieldDescriptorProto oneofIndex */
      oneofIndex?: number | null;

      /** FieldDescriptorProto jsonName */
      jsonName?: string | null;

      /** FieldDescriptorProto options */
      options?: google.protobuf.IFieldOptions | null;
    }

    /** Represents a FieldDescriptorProto. */
    class FieldDescriptorProto implements IFieldDescriptorProto {
      /**
       * Constructs a new FieldDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IFieldDescriptorProto);

      /** FieldDescriptorProto name. */
      public name: string;

      /** FieldDescriptorProto number. */
      public number: number;

      /** FieldDescriptorProto label. */
      public label: google.protobuf.FieldDescriptorProto.Label;

      /** FieldDescriptorProto type. */
      public type: google.protobuf.FieldDescriptorProto.Type;

      /** FieldDescriptorProto typeName. */
      public typeName: string;

      /** FieldDescriptorProto extendee. */
      public extendee: string;

      /** FieldDescriptorProto defaultValue. */
      public defaultValue: string;

      /** FieldDescriptorProto oneofIndex. */
      public oneofIndex: number;

      /** FieldDescriptorProto jsonName. */
      public jsonName: string;

      /** FieldDescriptorProto options. */
      public options?: google.protobuf.IFieldOptions | null;

      /**
       * Creates a new FieldDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns FieldDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IFieldDescriptorProto
      ): google.protobuf.FieldDescriptorProto;

      /**
       * Encodes the specified FieldDescriptorProto message. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
       * @param m FieldDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IFieldDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a FieldDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns FieldDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.FieldDescriptorProto;

      /**
       * Creates a FieldDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns FieldDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.FieldDescriptorProto;

      /**
       * Creates a plain object from a FieldDescriptorProto message. Also converts values to other types if specified.
       * @param m FieldDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.FieldDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this FieldDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace FieldDescriptorProto {
      /** Type enum. */
      enum Type {
        TYPE_DOUBLE = 1,
        TYPE_FLOAT = 2,
        TYPE_INT64 = 3,
        TYPE_UINT64 = 4,
        TYPE_INT32 = 5,
        TYPE_FIXED64 = 6,
        TYPE_FIXED32 = 7,
        TYPE_BOOL = 8,
        TYPE_STRING = 9,
        TYPE_GROUP = 10,
        TYPE_MESSAGE = 11,
        TYPE_BYTES = 12,
        TYPE_UINT32 = 13,
        TYPE_ENUM = 14,
        TYPE_SFIXED32 = 15,
        TYPE_SFIXED64 = 16,
        TYPE_SINT32 = 17,
        TYPE_SINT64 = 18,
      }

      /** Label enum. */
      enum Label {
        LABEL_OPTIONAL = 1,
        LABEL_REQUIRED = 2,
        LABEL_REPEATED = 3,
      }
    }

    /** Properties of an OneofDescriptorProto. */
    interface IOneofDescriptorProto {
      /** OneofDescriptorProto name */
      name?: string | null;

      /** OneofDescriptorProto options */
      options?: google.protobuf.IOneofOptions | null;
    }

    /** Represents an OneofDescriptorProto. */
    class OneofDescriptorProto implements IOneofDescriptorProto {
      /**
       * Constructs a new OneofDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IOneofDescriptorProto);

      /** OneofDescriptorProto name. */
      public name: string;

      /** OneofDescriptorProto options. */
      public options?: google.protobuf.IOneofOptions | null;

      /**
       * Creates a new OneofDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OneofDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IOneofDescriptorProto
      ): google.protobuf.OneofDescriptorProto;

      /**
       * Encodes the specified OneofDescriptorProto message. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
       * @param m OneofDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IOneofDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an OneofDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns OneofDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.OneofDescriptorProto;

      /**
       * Creates an OneofDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns OneofDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.OneofDescriptorProto;

      /**
       * Creates a plain object from an OneofDescriptorProto message. Also converts values to other types if specified.
       * @param m OneofDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.OneofDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this OneofDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of an EnumDescriptorProto. */
    interface IEnumDescriptorProto {
      /** EnumDescriptorProto name */
      name?: string | null;

      /** EnumDescriptorProto value */
      value?: google.protobuf.IEnumValueDescriptorProto[] | null;

      /** EnumDescriptorProto options */
      options?: google.protobuf.IEnumOptions | null;
    }

    /** Represents an EnumDescriptorProto. */
    class EnumDescriptorProto implements IEnumDescriptorProto {
      /**
       * Constructs a new EnumDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IEnumDescriptorProto);

      /** EnumDescriptorProto name. */
      public name: string;

      /** EnumDescriptorProto value. */
      public value: google.protobuf.IEnumValueDescriptorProto[];

      /** EnumDescriptorProto options. */
      public options?: google.protobuf.IEnumOptions | null;

      /**
       * Creates a new EnumDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns EnumDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IEnumDescriptorProto
      ): google.protobuf.EnumDescriptorProto;

      /**
       * Encodes the specified EnumDescriptorProto message. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
       * @param m EnumDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IEnumDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an EnumDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns EnumDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.EnumDescriptorProto;

      /**
       * Creates an EnumDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns EnumDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.EnumDescriptorProto;

      /**
       * Creates a plain object from an EnumDescriptorProto message. Also converts values to other types if specified.
       * @param m EnumDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.EnumDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this EnumDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of an EnumValueDescriptorProto. */
    interface IEnumValueDescriptorProto {
      /** EnumValueDescriptorProto name */
      name?: string | null;

      /** EnumValueDescriptorProto number */
      number?: number | null;

      /** EnumValueDescriptorProto options */
      options?: google.protobuf.IEnumValueOptions | null;
    }

    /** Represents an EnumValueDescriptorProto. */
    class EnumValueDescriptorProto implements IEnumValueDescriptorProto {
      /**
       * Constructs a new EnumValueDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IEnumValueDescriptorProto);

      /** EnumValueDescriptorProto name. */
      public name: string;

      /** EnumValueDescriptorProto number. */
      public number: number;

      /** EnumValueDescriptorProto options. */
      public options?: google.protobuf.IEnumValueOptions | null;

      /**
       * Creates a new EnumValueDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns EnumValueDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IEnumValueDescriptorProto
      ): google.protobuf.EnumValueDescriptorProto;

      /**
       * Encodes the specified EnumValueDescriptorProto message. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
       * @param m EnumValueDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IEnumValueDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an EnumValueDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns EnumValueDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.EnumValueDescriptorProto;

      /**
       * Creates an EnumValueDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns EnumValueDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.EnumValueDescriptorProto;

      /**
       * Creates a plain object from an EnumValueDescriptorProto message. Also converts values to other types if specified.
       * @param m EnumValueDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.EnumValueDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this EnumValueDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a ServiceDescriptorProto. */
    interface IServiceDescriptorProto {
      /** ServiceDescriptorProto name */
      name?: string | null;

      /** ServiceDescriptorProto method */
      method?: google.protobuf.IMethodDescriptorProto[] | null;

      /** ServiceDescriptorProto options */
      options?: google.protobuf.IServiceOptions | null;
    }

    /** Represents a ServiceDescriptorProto. */
    class ServiceDescriptorProto implements IServiceDescriptorProto {
      /**
       * Constructs a new ServiceDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IServiceDescriptorProto);

      /** ServiceDescriptorProto name. */
      public name: string;

      /** ServiceDescriptorProto method. */
      public method: google.protobuf.IMethodDescriptorProto[];

      /** ServiceDescriptorProto options. */
      public options?: google.protobuf.IServiceOptions | null;

      /**
       * Creates a new ServiceDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ServiceDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IServiceDescriptorProto
      ): google.protobuf.ServiceDescriptorProto;

      /**
       * Encodes the specified ServiceDescriptorProto message. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
       * @param m ServiceDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IServiceDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ServiceDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ServiceDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.ServiceDescriptorProto;

      /**
       * Creates a ServiceDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ServiceDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.ServiceDescriptorProto;

      /**
       * Creates a plain object from a ServiceDescriptorProto message. Also converts values to other types if specified.
       * @param m ServiceDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.ServiceDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ServiceDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MethodDescriptorProto. */
    interface IMethodDescriptorProto {
      /** MethodDescriptorProto name */
      name?: string | null;

      /** MethodDescriptorProto inputType */
      inputType?: string | null;

      /** MethodDescriptorProto outputType */
      outputType?: string | null;

      /** MethodDescriptorProto options */
      options?: google.protobuf.IMethodOptions | null;

      /** MethodDescriptorProto clientStreaming */
      clientStreaming?: boolean | null;

      /** MethodDescriptorProto serverStreaming */
      serverStreaming?: boolean | null;
    }

    /** Represents a MethodDescriptorProto. */
    class MethodDescriptorProto implements IMethodDescriptorProto {
      /**
       * Constructs a new MethodDescriptorProto.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IMethodDescriptorProto);

      /** MethodDescriptorProto name. */
      public name: string;

      /** MethodDescriptorProto inputType. */
      public inputType: string;

      /** MethodDescriptorProto outputType. */
      public outputType: string;

      /** MethodDescriptorProto options. */
      public options?: google.protobuf.IMethodOptions | null;

      /** MethodDescriptorProto clientStreaming. */
      public clientStreaming: boolean;

      /** MethodDescriptorProto serverStreaming. */
      public serverStreaming: boolean;

      /**
       * Creates a new MethodDescriptorProto instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MethodDescriptorProto instance
       */
      public static create(
        properties?: google.protobuf.IMethodDescriptorProto
      ): google.protobuf.MethodDescriptorProto;

      /**
       * Encodes the specified MethodDescriptorProto message. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
       * @param m MethodDescriptorProto message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IMethodDescriptorProto,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MethodDescriptorProto message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MethodDescriptorProto
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.MethodDescriptorProto;

      /**
       * Creates a MethodDescriptorProto message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MethodDescriptorProto
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.MethodDescriptorProto;

      /**
       * Creates a plain object from a MethodDescriptorProto message. Also converts values to other types if specified.
       * @param m MethodDescriptorProto
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.MethodDescriptorProto,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MethodDescriptorProto to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a FileOptions. */
    interface IFileOptions {
      /** FileOptions javaPackage */
      javaPackage?: string | null;

      /** FileOptions javaOuterClassname */
      javaOuterClassname?: string | null;

      /** FileOptions javaMultipleFiles */
      javaMultipleFiles?: boolean | null;

      /** FileOptions javaGenerateEqualsAndHash */
      javaGenerateEqualsAndHash?: boolean | null;

      /** FileOptions javaStringCheckUtf8 */
      javaStringCheckUtf8?: boolean | null;

      /** FileOptions optimizeFor */
      optimizeFor?: google.protobuf.FileOptions.OptimizeMode | null;

      /** FileOptions goPackage */
      goPackage?: string | null;

      /** FileOptions ccGenericServices */
      ccGenericServices?: boolean | null;

      /** FileOptions javaGenericServices */
      javaGenericServices?: boolean | null;

      /** FileOptions pyGenericServices */
      pyGenericServices?: boolean | null;

      /** FileOptions deprecated */
      deprecated?: boolean | null;

      /** FileOptions ccEnableArenas */
      ccEnableArenas?: boolean | null;

      /** FileOptions objcClassPrefix */
      objcClassPrefix?: string | null;

      /** FileOptions csharpNamespace */
      csharpNamespace?: string | null;

      /** FileOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents a FileOptions. */
    class FileOptions implements IFileOptions {
      /**
       * Constructs a new FileOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IFileOptions);

      /** FileOptions javaPackage. */
      public javaPackage: string;

      /** FileOptions javaOuterClassname. */
      public javaOuterClassname: string;

      /** FileOptions javaMultipleFiles. */
      public javaMultipleFiles: boolean;

      /** FileOptions javaGenerateEqualsAndHash. */
      public javaGenerateEqualsAndHash: boolean;

      /** FileOptions javaStringCheckUtf8. */
      public javaStringCheckUtf8: boolean;

      /** FileOptions optimizeFor. */
      public optimizeFor: google.protobuf.FileOptions.OptimizeMode;

      /** FileOptions goPackage. */
      public goPackage: string;

      /** FileOptions ccGenericServices. */
      public ccGenericServices: boolean;

      /** FileOptions javaGenericServices. */
      public javaGenericServices: boolean;

      /** FileOptions pyGenericServices. */
      public pyGenericServices: boolean;

      /** FileOptions deprecated. */
      public deprecated: boolean;

      /** FileOptions ccEnableArenas. */
      public ccEnableArenas: boolean;

      /** FileOptions objcClassPrefix. */
      public objcClassPrefix: string;

      /** FileOptions csharpNamespace. */
      public csharpNamespace: string;

      /** FileOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new FileOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns FileOptions instance
       */
      public static create(
        properties?: google.protobuf.IFileOptions
      ): google.protobuf.FileOptions;

      /**
       * Encodes the specified FileOptions message. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
       * @param m FileOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IFileOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a FileOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns FileOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.FileOptions;

      /**
       * Creates a FileOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns FileOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.FileOptions;

      /**
       * Creates a plain object from a FileOptions message. Also converts values to other types if specified.
       * @param m FileOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.FileOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this FileOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace FileOptions {
      /** OptimizeMode enum. */
      enum OptimizeMode {
        SPEED = 1,
        CODE_SIZE = 2,
        LITE_RUNTIME = 3,
      }
    }

    /** Properties of a MessageOptions. */
    interface IMessageOptions {
      /** MessageOptions messageSetWireFormat */
      messageSetWireFormat?: boolean | null;

      /** MessageOptions noStandardDescriptorAccessor */
      noStandardDescriptorAccessor?: boolean | null;

      /** MessageOptions deprecated */
      deprecated?: boolean | null;

      /** MessageOptions mapEntry */
      mapEntry?: boolean | null;

      /** MessageOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents a MessageOptions. */
    class MessageOptions implements IMessageOptions {
      /**
       * Constructs a new MessageOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IMessageOptions);

      /** MessageOptions messageSetWireFormat. */
      public messageSetWireFormat: boolean;

      /** MessageOptions noStandardDescriptorAccessor. */
      public noStandardDescriptorAccessor: boolean;

      /** MessageOptions deprecated. */
      public deprecated: boolean;

      /** MessageOptions mapEntry. */
      public mapEntry: boolean;

      /** MessageOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new MessageOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MessageOptions instance
       */
      public static create(
        properties?: google.protobuf.IMessageOptions
      ): google.protobuf.MessageOptions;

      /**
       * Encodes the specified MessageOptions message. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
       * @param m MessageOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IMessageOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MessageOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MessageOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.MessageOptions;

      /**
       * Creates a MessageOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MessageOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.MessageOptions;

      /**
       * Creates a plain object from a MessageOptions message. Also converts values to other types if specified.
       * @param m MessageOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.MessageOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MessageOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a FieldOptions. */
    interface IFieldOptions {
      /** FieldOptions ctype */
      ctype?: google.protobuf.FieldOptions.CType | null;

      /** FieldOptions packed */
      packed?: boolean | null;

      /** FieldOptions jstype */
      jstype?: google.protobuf.FieldOptions.JSType | null;

      /** FieldOptions lazy */
      lazy?: boolean | null;

      /** FieldOptions deprecated */
      deprecated?: boolean | null;

      /** FieldOptions weak */
      weak?: boolean | null;

      /** FieldOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents a FieldOptions. */
    class FieldOptions implements IFieldOptions {
      /**
       * Constructs a new FieldOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IFieldOptions);

      /** FieldOptions ctype. */
      public ctype: google.protobuf.FieldOptions.CType;

      /** FieldOptions packed. */
      public packed: boolean;

      /** FieldOptions jstype. */
      public jstype: google.protobuf.FieldOptions.JSType;

      /** FieldOptions lazy. */
      public lazy: boolean;

      /** FieldOptions deprecated. */
      public deprecated: boolean;

      /** FieldOptions weak. */
      public weak: boolean;

      /** FieldOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new FieldOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns FieldOptions instance
       */
      public static create(
        properties?: google.protobuf.IFieldOptions
      ): google.protobuf.FieldOptions;

      /**
       * Encodes the specified FieldOptions message. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
       * @param m FieldOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IFieldOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a FieldOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns FieldOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.FieldOptions;

      /**
       * Creates a FieldOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns FieldOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.FieldOptions;

      /**
       * Creates a plain object from a FieldOptions message. Also converts values to other types if specified.
       * @param m FieldOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.FieldOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this FieldOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace FieldOptions {
      /** CType enum. */
      enum CType {
        STRING = 0,
        CORD = 1,
        STRING_PIECE = 2,
      }

      /** JSType enum. */
      enum JSType {
        JS_NORMAL = 0,
        JS_STRING = 1,
        JS_NUMBER = 2,
      }
    }

    /** Properties of an OneofOptions. */
    interface IOneofOptions {
      /** OneofOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents an OneofOptions. */
    class OneofOptions implements IOneofOptions {
      /**
       * Constructs a new OneofOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IOneofOptions);

      /** OneofOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new OneofOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns OneofOptions instance
       */
      public static create(
        properties?: google.protobuf.IOneofOptions
      ): google.protobuf.OneofOptions;

      /**
       * Encodes the specified OneofOptions message. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
       * @param m OneofOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IOneofOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an OneofOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns OneofOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.OneofOptions;

      /**
       * Creates an OneofOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns OneofOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.OneofOptions;

      /**
       * Creates a plain object from an OneofOptions message. Also converts values to other types if specified.
       * @param m OneofOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.OneofOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this OneofOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of an EnumOptions. */
    interface IEnumOptions {
      /** EnumOptions allowAlias */
      allowAlias?: boolean | null;

      /** EnumOptions deprecated */
      deprecated?: boolean | null;

      /** EnumOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents an EnumOptions. */
    class EnumOptions implements IEnumOptions {
      /**
       * Constructs a new EnumOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IEnumOptions);

      /** EnumOptions allowAlias. */
      public allowAlias: boolean;

      /** EnumOptions deprecated. */
      public deprecated: boolean;

      /** EnumOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new EnumOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns EnumOptions instance
       */
      public static create(
        properties?: google.protobuf.IEnumOptions
      ): google.protobuf.EnumOptions;

      /**
       * Encodes the specified EnumOptions message. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
       * @param m EnumOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IEnumOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an EnumOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns EnumOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.EnumOptions;

      /**
       * Creates an EnumOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns EnumOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.EnumOptions;

      /**
       * Creates a plain object from an EnumOptions message. Also converts values to other types if specified.
       * @param m EnumOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.EnumOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this EnumOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of an EnumValueOptions. */
    interface IEnumValueOptions {
      /** EnumValueOptions deprecated */
      deprecated?: boolean | null;

      /** EnumValueOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents an EnumValueOptions. */
    class EnumValueOptions implements IEnumValueOptions {
      /**
       * Constructs a new EnumValueOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IEnumValueOptions);

      /** EnumValueOptions deprecated. */
      public deprecated: boolean;

      /** EnumValueOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new EnumValueOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns EnumValueOptions instance
       */
      public static create(
        properties?: google.protobuf.IEnumValueOptions
      ): google.protobuf.EnumValueOptions;

      /**
       * Encodes the specified EnumValueOptions message. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
       * @param m EnumValueOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IEnumValueOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an EnumValueOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns EnumValueOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.EnumValueOptions;

      /**
       * Creates an EnumValueOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns EnumValueOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.EnumValueOptions;

      /**
       * Creates a plain object from an EnumValueOptions message. Also converts values to other types if specified.
       * @param m EnumValueOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.EnumValueOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this EnumValueOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a ServiceOptions. */
    interface IServiceOptions {
      /** ServiceOptions deprecated */
      deprecated?: boolean | null;

      /** ServiceOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;
    }

    /** Represents a ServiceOptions. */
    class ServiceOptions implements IServiceOptions {
      /**
       * Constructs a new ServiceOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IServiceOptions);

      /** ServiceOptions deprecated. */
      public deprecated: boolean;

      /** ServiceOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new ServiceOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ServiceOptions instance
       */
      public static create(
        properties?: google.protobuf.IServiceOptions
      ): google.protobuf.ServiceOptions;

      /**
       * Encodes the specified ServiceOptions message. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
       * @param m ServiceOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IServiceOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ServiceOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ServiceOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.ServiceOptions;

      /**
       * Creates a ServiceOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ServiceOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.ServiceOptions;

      /**
       * Creates a plain object from a ServiceOptions message. Also converts values to other types if specified.
       * @param m ServiceOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.ServiceOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ServiceOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a MethodOptions. */
    interface IMethodOptions {
      /** MethodOptions deprecated */
      deprecated?: boolean | null;

      /** MethodOptions uninterpretedOption */
      uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null;

      /** MethodOptions .google.api.http */
      ".google.api.http"?: google.api.IHttpRule | null;
    }

    /** Represents a MethodOptions. */
    class MethodOptions implements IMethodOptions {
      /**
       * Constructs a new MethodOptions.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IMethodOptions);

      /** MethodOptions deprecated. */
      public deprecated: boolean;

      /** MethodOptions uninterpretedOption. */
      public uninterpretedOption: google.protobuf.IUninterpretedOption[];

      /**
       * Creates a new MethodOptions instance using the specified properties.
       * @param [properties] Properties to set
       * @returns MethodOptions instance
       */
      public static create(
        properties?: google.protobuf.IMethodOptions
      ): google.protobuf.MethodOptions;

      /**
       * Encodes the specified MethodOptions message. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
       * @param m MethodOptions message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IMethodOptions,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a MethodOptions message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns MethodOptions
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.MethodOptions;

      /**
       * Creates a MethodOptions message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns MethodOptions
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.MethodOptions;

      /**
       * Creates a plain object from a MethodOptions message. Also converts values to other types if specified.
       * @param m MethodOptions
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.MethodOptions,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this MethodOptions to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of an UninterpretedOption. */
    interface IUninterpretedOption {
      /** UninterpretedOption name */
      name?: google.protobuf.UninterpretedOption.INamePart[] | null;

      /** UninterpretedOption identifierValue */
      identifierValue?: string | null;

      /** UninterpretedOption positiveIntValue */
      positiveIntValue?: Long | null;

      /** UninterpretedOption negativeIntValue */
      negativeIntValue?: Long | null;

      /** UninterpretedOption doubleValue */
      doubleValue?: number | null;

      /** UninterpretedOption stringValue */
      stringValue?: Uint8Array | null;

      /** UninterpretedOption aggregateValue */
      aggregateValue?: string | null;
    }

    /** Represents an UninterpretedOption. */
    class UninterpretedOption implements IUninterpretedOption {
      /**
       * Constructs a new UninterpretedOption.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IUninterpretedOption);

      /** UninterpretedOption name. */
      public name: google.protobuf.UninterpretedOption.INamePart[];

      /** UninterpretedOption identifierValue. */
      public identifierValue: string;

      /** UninterpretedOption positiveIntValue. */
      public positiveIntValue: Long;

      /** UninterpretedOption negativeIntValue. */
      public negativeIntValue: Long;

      /** UninterpretedOption doubleValue. */
      public doubleValue: number;

      /** UninterpretedOption stringValue. */
      public stringValue: Uint8Array;

      /** UninterpretedOption aggregateValue. */
      public aggregateValue: string;

      /**
       * Creates a new UninterpretedOption instance using the specified properties.
       * @param [properties] Properties to set
       * @returns UninterpretedOption instance
       */
      public static create(
        properties?: google.protobuf.IUninterpretedOption
      ): google.protobuf.UninterpretedOption;

      /**
       * Encodes the specified UninterpretedOption message. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
       * @param m UninterpretedOption message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IUninterpretedOption,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an UninterpretedOption message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns UninterpretedOption
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.UninterpretedOption;

      /**
       * Creates an UninterpretedOption message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns UninterpretedOption
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.UninterpretedOption;

      /**
       * Creates a plain object from an UninterpretedOption message. Also converts values to other types if specified.
       * @param m UninterpretedOption
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.UninterpretedOption,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this UninterpretedOption to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace UninterpretedOption {
      /** Properties of a NamePart. */
      interface INamePart {
        /** NamePart namePart */
        namePart: string;

        /** NamePart isExtension */
        isExtension: boolean;
      }

      /** Represents a NamePart. */
      class NamePart implements INamePart {
        /**
         * Constructs a new NamePart.
         * @param [p] Properties to set
         */
        constructor(p?: google.protobuf.UninterpretedOption.INamePart);

        /** NamePart namePart. */
        public namePart: string;

        /** NamePart isExtension. */
        public isExtension: boolean;

        /**
         * Creates a new NamePart instance using the specified properties.
         * @param [properties] Properties to set
         * @returns NamePart instance
         */
        public static create(
          properties?: google.protobuf.UninterpretedOption.INamePart
        ): google.protobuf.UninterpretedOption.NamePart;

        /**
         * Encodes the specified NamePart message. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
         * @param m NamePart message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: google.protobuf.UninterpretedOption.INamePart,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a NamePart message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns NamePart
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): google.protobuf.UninterpretedOption.NamePart;

        /**
         * Creates a NamePart message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns NamePart
         */
        public static fromObject(d: {
          [k: string]: any;
        }): google.protobuf.UninterpretedOption.NamePart;

        /**
         * Creates a plain object from a NamePart message. Also converts values to other types if specified.
         * @param m NamePart
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: google.protobuf.UninterpretedOption.NamePart,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this NamePart to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }

    /** Properties of a SourceCodeInfo. */
    interface ISourceCodeInfo {
      /** SourceCodeInfo location */
      location?: google.protobuf.SourceCodeInfo.ILocation[] | null;
    }

    /** Represents a SourceCodeInfo. */
    class SourceCodeInfo implements ISourceCodeInfo {
      /**
       * Constructs a new SourceCodeInfo.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.ISourceCodeInfo);

      /** SourceCodeInfo location. */
      public location: google.protobuf.SourceCodeInfo.ILocation[];

      /**
       * Creates a new SourceCodeInfo instance using the specified properties.
       * @param [properties] Properties to set
       * @returns SourceCodeInfo instance
       */
      public static create(
        properties?: google.protobuf.ISourceCodeInfo
      ): google.protobuf.SourceCodeInfo;

      /**
       * Encodes the specified SourceCodeInfo message. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
       * @param m SourceCodeInfo message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.ISourceCodeInfo,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a SourceCodeInfo message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns SourceCodeInfo
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.SourceCodeInfo;

      /**
       * Creates a SourceCodeInfo message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns SourceCodeInfo
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.SourceCodeInfo;

      /**
       * Creates a plain object from a SourceCodeInfo message. Also converts values to other types if specified.
       * @param m SourceCodeInfo
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.SourceCodeInfo,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this SourceCodeInfo to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace SourceCodeInfo {
      /** Properties of a Location. */
      interface ILocation {
        /** Location path */
        path?: number[] | null;

        /** Location span */
        span?: number[] | null;

        /** Location leadingComments */
        leadingComments?: string | null;

        /** Location trailingComments */
        trailingComments?: string | null;

        /** Location leadingDetachedComments */
        leadingDetachedComments?: string[] | null;
      }

      /** Represents a Location. */
      class Location implements ILocation {
        /**
         * Constructs a new Location.
         * @param [p] Properties to set
         */
        constructor(p?: google.protobuf.SourceCodeInfo.ILocation);

        /** Location path. */
        public path: number[];

        /** Location span. */
        public span: number[];

        /** Location leadingComments. */
        public leadingComments: string;

        /** Location trailingComments. */
        public trailingComments: string;

        /** Location leadingDetachedComments. */
        public leadingDetachedComments: string[];

        /**
         * Creates a new Location instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Location instance
         */
        public static create(
          properties?: google.protobuf.SourceCodeInfo.ILocation
        ): google.protobuf.SourceCodeInfo.Location;

        /**
         * Encodes the specified Location message. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
         * @param m Location message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: google.protobuf.SourceCodeInfo.ILocation,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a Location message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Location
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): google.protobuf.SourceCodeInfo.Location;

        /**
         * Creates a Location message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Location
         */
        public static fromObject(d: {
          [k: string]: any;
        }): google.protobuf.SourceCodeInfo.Location;

        /**
         * Creates a plain object from a Location message. Also converts values to other types if specified.
         * @param m Location
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: google.protobuf.SourceCodeInfo.Location,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Location to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }

    /** Properties of a GeneratedCodeInfo. */
    interface IGeneratedCodeInfo {
      /** GeneratedCodeInfo annotation */
      annotation?: google.protobuf.GeneratedCodeInfo.IAnnotation[] | null;
    }

    /** Represents a GeneratedCodeInfo. */
    class GeneratedCodeInfo implements IGeneratedCodeInfo {
      /**
       * Constructs a new GeneratedCodeInfo.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IGeneratedCodeInfo);

      /** GeneratedCodeInfo annotation. */
      public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];

      /**
       * Creates a new GeneratedCodeInfo instance using the specified properties.
       * @param [properties] Properties to set
       * @returns GeneratedCodeInfo instance
       */
      public static create(
        properties?: google.protobuf.IGeneratedCodeInfo
      ): google.protobuf.GeneratedCodeInfo;

      /**
       * Encodes the specified GeneratedCodeInfo message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
       * @param m GeneratedCodeInfo message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IGeneratedCodeInfo,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a GeneratedCodeInfo message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns GeneratedCodeInfo
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.GeneratedCodeInfo;

      /**
       * Creates a GeneratedCodeInfo message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns GeneratedCodeInfo
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.GeneratedCodeInfo;

      /**
       * Creates a plain object from a GeneratedCodeInfo message. Also converts values to other types if specified.
       * @param m GeneratedCodeInfo
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.GeneratedCodeInfo,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this GeneratedCodeInfo to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    namespace GeneratedCodeInfo {
      /** Properties of an Annotation. */
      interface IAnnotation {
        /** Annotation path */
        path?: number[] | null;

        /** Annotation sourceFile */
        sourceFile?: string | null;

        /** Annotation begin */
        begin?: number | null;

        /** Annotation end */
        end?: number | null;
      }

      /** Represents an Annotation. */
      class Annotation implements IAnnotation {
        /**
         * Constructs a new Annotation.
         * @param [p] Properties to set
         */
        constructor(p?: google.protobuf.GeneratedCodeInfo.IAnnotation);

        /** Annotation path. */
        public path: number[];

        /** Annotation sourceFile. */
        public sourceFile: string;

        /** Annotation begin. */
        public begin: number;

        /** Annotation end. */
        public end: number;

        /**
         * Creates a new Annotation instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Annotation instance
         */
        public static create(
          properties?: google.protobuf.GeneratedCodeInfo.IAnnotation
        ): google.protobuf.GeneratedCodeInfo.Annotation;

        /**
         * Encodes the specified Annotation message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
         * @param m Annotation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: google.protobuf.GeneratedCodeInfo.IAnnotation,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes an Annotation message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Annotation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): google.protobuf.GeneratedCodeInfo.Annotation;

        /**
         * Creates an Annotation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Annotation
         */
        public static fromObject(d: {
          [k: string]: any;
        }): google.protobuf.GeneratedCodeInfo.Annotation;

        /**
         * Creates a plain object from an Annotation message. Also converts values to other types if specified.
         * @param m Annotation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: google.protobuf.GeneratedCodeInfo.Annotation,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this Annotation to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }

    /** Properties of a Duration. */
    interface IDuration {
      /** Duration seconds */
      seconds?: Long | null;

      /** Duration nanos */
      nanos?: number | null;
    }

    /** Represents a Duration. */
    class Duration implements IDuration {
      /**
       * Constructs a new Duration.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.IDuration);

      /** Duration seconds. */
      public seconds: Long;

      /** Duration nanos. */
      public nanos: number;

      /**
       * Creates a new Duration instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Duration instance
       */
      public static create(
        properties?: google.protobuf.IDuration
      ): google.protobuf.Duration;

      /**
       * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
       * @param m Duration message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.IDuration,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Duration message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Duration
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.Duration;

      /**
       * Creates a Duration message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Duration
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.Duration;

      /**
       * Creates a plain object from a Duration message. Also converts values to other types if specified.
       * @param m Duration
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Duration,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Duration to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Timestamp. */
    interface ITimestamp {
      /** Timestamp seconds */
      seconds?: Long | null;

      /** Timestamp nanos */
      nanos?: number | null;
    }

    /** Represents a Timestamp. */
    class Timestamp implements ITimestamp {
      /**
       * Constructs a new Timestamp.
       * @param [p] Properties to set
       */
      constructor(p?: google.protobuf.ITimestamp);

      /** Timestamp seconds. */
      public seconds: Long;

      /** Timestamp nanos. */
      public nanos: number;

      /**
       * Creates a new Timestamp instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Timestamp instance
       */
      public static create(
        properties?: google.protobuf.ITimestamp
      ): google.protobuf.Timestamp;

      /**
       * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
       * @param m Timestamp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.protobuf.ITimestamp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Timestamp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Timestamp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.protobuf.Timestamp;

      /**
       * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Timestamp
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.protobuf.Timestamp;

      /**
       * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
       * @param m Timestamp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Timestamp,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Timestamp to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Namespace api. */
  namespace api {
    /** Properties of a Http. */
    interface IHttp {
      /** Http rules */
      rules?: google.api.IHttpRule[] | null;
    }

    /** Represents a Http. */
    class Http implements IHttp {
      /**
       * Constructs a new Http.
       * @param [p] Properties to set
       */
      constructor(p?: google.api.IHttp);

      /** Http rules. */
      public rules: google.api.IHttpRule[];

      /**
       * Creates a new Http instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Http instance
       */
      public static create(properties?: google.api.IHttp): google.api.Http;

      /**
       * Encodes the specified Http message. Does not implicitly {@link google.api.Http.verify|verify} messages.
       * @param m Http message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.api.IHttp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Http message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Http
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.api.Http;

      /**
       * Creates a Http message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Http
       */
      public static fromObject(d: { [k: string]: any }): google.api.Http;

      /**
       * Creates a plain object from a Http message. Also converts values to other types if specified.
       * @param m Http
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.api.Http,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Http to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a HttpRule. */
    interface IHttpRule {
      /** HttpRule get */
      get?: string | null;

      /** HttpRule put */
      put?: string | null;

      /** HttpRule post */
      post?: string | null;

      /** HttpRule delete */
      delete?: string | null;

      /** HttpRule patch */
      patch?: string | null;

      /** HttpRule custom */
      custom?: google.api.ICustomHttpPattern | null;

      /** HttpRule selector */
      selector?: string | null;

      /** HttpRule body */
      body?: string | null;

      /** HttpRule additionalBindings */
      additionalBindings?: google.api.IHttpRule[] | null;
    }

    /** Represents a HttpRule. */
    class HttpRule implements IHttpRule {
      /**
       * Constructs a new HttpRule.
       * @param [p] Properties to set
       */
      constructor(p?: google.api.IHttpRule);

      /** HttpRule get. */
      public get: string;

      /** HttpRule put. */
      public put: string;

      /** HttpRule post. */
      public post: string;

      /** HttpRule delete. */
      public delete: string;

      /** HttpRule patch. */
      public patch: string;

      /** HttpRule custom. */
      public custom?: google.api.ICustomHttpPattern | null;

      /** HttpRule selector. */
      public selector: string;

      /** HttpRule body. */
      public body: string;

      /** HttpRule additionalBindings. */
      public additionalBindings: google.api.IHttpRule[];

      /** HttpRule pattern. */
      public pattern?: "get" | "put" | "post" | "delete" | "patch" | "custom";

      /**
       * Creates a new HttpRule instance using the specified properties.
       * @param [properties] Properties to set
       * @returns HttpRule instance
       */
      public static create(
        properties?: google.api.IHttpRule
      ): google.api.HttpRule;

      /**
       * Encodes the specified HttpRule message. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
       * @param m HttpRule message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.api.IHttpRule,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a HttpRule message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns HttpRule
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.api.HttpRule;

      /**
       * Creates a HttpRule message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns HttpRule
       */
      public static fromObject(d: { [k: string]: any }): google.api.HttpRule;

      /**
       * Creates a plain object from a HttpRule message. Also converts values to other types if specified.
       * @param m HttpRule
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.api.HttpRule,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this HttpRule to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a CustomHttpPattern. */
    interface ICustomHttpPattern {
      /** CustomHttpPattern kind */
      kind?: string | null;

      /** CustomHttpPattern path */
      path?: string | null;
    }

    /** Represents a CustomHttpPattern. */
    class CustomHttpPattern implements ICustomHttpPattern {
      /**
       * Constructs a new CustomHttpPattern.
       * @param [p] Properties to set
       */
      constructor(p?: google.api.ICustomHttpPattern);

      /** CustomHttpPattern kind. */
      public kind: string;

      /** CustomHttpPattern path. */
      public path: string;

      /**
       * Creates a new CustomHttpPattern instance using the specified properties.
       * @param [properties] Properties to set
       * @returns CustomHttpPattern instance
       */
      public static create(
        properties?: google.api.ICustomHttpPattern
      ): google.api.CustomHttpPattern;

      /**
       * Encodes the specified CustomHttpPattern message. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
       * @param m CustomHttpPattern message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: google.api.ICustomHttpPattern,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a CustomHttpPattern message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns CustomHttpPattern
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): google.api.CustomHttpPattern;

      /**
       * Creates a CustomHttpPattern message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns CustomHttpPattern
       */
      public static fromObject(d: {
        [k: string]: any;
      }): google.api.CustomHttpPattern;

      /**
       * Creates a plain object from a CustomHttpPattern message. Also converts values to other types if specified.
       * @param m CustomHttpPattern
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.api.CustomHttpPattern,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this CustomHttpPattern to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }
}

/** Namespace ibc. */
export namespace ibc {
  /** Namespace core. */
  namespace core {
    /** Namespace channel. */
    namespace channel {
      /** Namespace v1. */
      namespace v1 {
        /** Properties of a Channel. */
        interface IChannel {
          /** Channel state */
          state?: ibc.core.channel.v1.State | null;

          /** Channel ordering */
          ordering?: ibc.core.channel.v1.Order | null;

          /** Channel counterparty */
          counterparty?: ibc.core.channel.v1.ICounterparty | null;

          /** Channel connectionHops */
          connectionHops?: string[] | null;

          /** Channel version */
          version?: string | null;
        }

        /** Represents a Channel. */
        class Channel implements IChannel {
          /**
           * Constructs a new Channel.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IChannel);

          /** Channel state. */
          public state: ibc.core.channel.v1.State;

          /** Channel ordering. */
          public ordering: ibc.core.channel.v1.Order;

          /** Channel counterparty. */
          public counterparty?: ibc.core.channel.v1.ICounterparty | null;

          /** Channel connectionHops. */
          public connectionHops: string[];

          /** Channel version. */
          public version: string;

          /**
           * Creates a new Channel instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Channel instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IChannel
          ): ibc.core.channel.v1.Channel;

          /**
           * Encodes the specified Channel message. Does not implicitly {@link ibc.core.channel.v1.Channel.verify|verify} messages.
           * @param m Channel message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IChannel,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Channel message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Channel
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.Channel;

          /**
           * Creates a Channel message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Channel
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.Channel;

          /**
           * Creates a plain object from a Channel message. Also converts values to other types if specified.
           * @param m Channel
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.Channel,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Channel to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of an IdentifiedChannel. */
        interface IIdentifiedChannel {
          /** IdentifiedChannel state */
          state?: ibc.core.channel.v1.State | null;

          /** IdentifiedChannel ordering */
          ordering?: ibc.core.channel.v1.Order | null;

          /** IdentifiedChannel counterparty */
          counterparty?: ibc.core.channel.v1.ICounterparty | null;

          /** IdentifiedChannel connectionHops */
          connectionHops?: string[] | null;

          /** IdentifiedChannel version */
          version?: string | null;

          /** IdentifiedChannel portId */
          portId?: string | null;

          /** IdentifiedChannel channelId */
          channelId?: string | null;
        }

        /** Represents an IdentifiedChannel. */
        class IdentifiedChannel implements IIdentifiedChannel {
          /**
           * Constructs a new IdentifiedChannel.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IIdentifiedChannel);

          /** IdentifiedChannel state. */
          public state: ibc.core.channel.v1.State;

          /** IdentifiedChannel ordering. */
          public ordering: ibc.core.channel.v1.Order;

          /** IdentifiedChannel counterparty. */
          public counterparty?: ibc.core.channel.v1.ICounterparty | null;

          /** IdentifiedChannel connectionHops. */
          public connectionHops: string[];

          /** IdentifiedChannel version. */
          public version: string;

          /** IdentifiedChannel portId. */
          public portId: string;

          /** IdentifiedChannel channelId. */
          public channelId: string;

          /**
           * Creates a new IdentifiedChannel instance using the specified properties.
           * @param [properties] Properties to set
           * @returns IdentifiedChannel instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IIdentifiedChannel
          ): ibc.core.channel.v1.IdentifiedChannel;

          /**
           * Encodes the specified IdentifiedChannel message. Does not implicitly {@link ibc.core.channel.v1.IdentifiedChannel.verify|verify} messages.
           * @param m IdentifiedChannel message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IIdentifiedChannel,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes an IdentifiedChannel message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns IdentifiedChannel
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.IdentifiedChannel;

          /**
           * Creates an IdentifiedChannel message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns IdentifiedChannel
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.IdentifiedChannel;

          /**
           * Creates a plain object from an IdentifiedChannel message. Also converts values to other types if specified.
           * @param m IdentifiedChannel
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.IdentifiedChannel,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this IdentifiedChannel to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** State enum. */
        enum State {
          STATE_UNINITIALIZED_UNSPECIFIED = 0,
          STATE_INIT = 1,
          STATE_TRYOPEN = 2,
          STATE_OPEN = 3,
          STATE_CLOSED = 4,
        }

        /** Order enum. */
        enum Order {
          ORDER_NONE_UNSPECIFIED = 0,
          ORDER_UNORDERED = 1,
          ORDER_ORDERED = 2,
        }

        /** Properties of a Counterparty. */
        interface ICounterparty {
          /** Counterparty portId */
          portId?: string | null;

          /** Counterparty channelId */
          channelId?: string | null;
        }

        /** Represents a Counterparty. */
        class Counterparty implements ICounterparty {
          /**
           * Constructs a new Counterparty.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.ICounterparty);

          /** Counterparty portId. */
          public portId: string;

          /** Counterparty channelId. */
          public channelId: string;

          /**
           * Creates a new Counterparty instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Counterparty instance
           */
          public static create(
            properties?: ibc.core.channel.v1.ICounterparty
          ): ibc.core.channel.v1.Counterparty;

          /**
           * Encodes the specified Counterparty message. Does not implicitly {@link ibc.core.channel.v1.Counterparty.verify|verify} messages.
           * @param m Counterparty message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.ICounterparty,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Counterparty message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Counterparty
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.Counterparty;

          /**
           * Creates a Counterparty message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Counterparty
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.Counterparty;

          /**
           * Creates a plain object from a Counterparty message. Also converts values to other types if specified.
           * @param m Counterparty
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.Counterparty,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Counterparty to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a Packet. */
        interface IPacket {
          /** Packet sequence */
          sequence?: Long | null;

          /** Packet sourcePort */
          sourcePort?: string | null;

          /** Packet sourceChannel */
          sourceChannel?: string | null;

          /** Packet destinationPort */
          destinationPort?: string | null;

          /** Packet destinationChannel */
          destinationChannel?: string | null;

          /** Packet data */
          data?: Uint8Array | null;

          /** Packet timeoutHeight */
          timeoutHeight?: ibc.core.client.v1.IHeight | null;

          /** Packet timeoutTimestamp */
          timeoutTimestamp?: Long | null;
        }

        /** Represents a Packet. */
        class Packet implements IPacket {
          /**
           * Constructs a new Packet.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IPacket);

          /** Packet sequence. */
          public sequence: Long;

          /** Packet sourcePort. */
          public sourcePort: string;

          /** Packet sourceChannel. */
          public sourceChannel: string;

          /** Packet destinationPort. */
          public destinationPort: string;

          /** Packet destinationChannel. */
          public destinationChannel: string;

          /** Packet data. */
          public data: Uint8Array;

          /** Packet timeoutHeight. */
          public timeoutHeight?: ibc.core.client.v1.IHeight | null;

          /** Packet timeoutTimestamp. */
          public timeoutTimestamp: Long;

          /**
           * Creates a new Packet instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Packet instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IPacket
          ): ibc.core.channel.v1.Packet;

          /**
           * Encodes the specified Packet message. Does not implicitly {@link ibc.core.channel.v1.Packet.verify|verify} messages.
           * @param m Packet message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IPacket,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Packet message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Packet
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.Packet;

          /**
           * Creates a Packet message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Packet
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.Packet;

          /**
           * Creates a plain object from a Packet message. Also converts values to other types if specified.
           * @param m Packet
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.Packet,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Packet to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a PacketState. */
        interface IPacketState {
          /** PacketState portId */
          portId?: string | null;

          /** PacketState channelId */
          channelId?: string | null;

          /** PacketState sequence */
          sequence?: Long | null;

          /** PacketState data */
          data?: Uint8Array | null;
        }

        /** Represents a PacketState. */
        class PacketState implements IPacketState {
          /**
           * Constructs a new PacketState.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IPacketState);

          /** PacketState portId. */
          public portId: string;

          /** PacketState channelId. */
          public channelId: string;

          /** PacketState sequence. */
          public sequence: Long;

          /** PacketState data. */
          public data: Uint8Array;

          /**
           * Creates a new PacketState instance using the specified properties.
           * @param [properties] Properties to set
           * @returns PacketState instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IPacketState
          ): ibc.core.channel.v1.PacketState;

          /**
           * Encodes the specified PacketState message. Does not implicitly {@link ibc.core.channel.v1.PacketState.verify|verify} messages.
           * @param m PacketState message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IPacketState,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a PacketState message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns PacketState
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.PacketState;

          /**
           * Creates a PacketState message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns PacketState
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.PacketState;

          /**
           * Creates a plain object from a PacketState message. Also converts values to other types if specified.
           * @param m PacketState
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.PacketState,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this PacketState to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of an Acknowledgement. */
        interface IAcknowledgement {
          /** Acknowledgement result */
          result?: Uint8Array | null;

          /** Acknowledgement error */
          error?: string | null;
        }

        /** Represents an Acknowledgement. */
        class Acknowledgement implements IAcknowledgement {
          /**
           * Constructs a new Acknowledgement.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IAcknowledgement);

          /** Acknowledgement result. */
          public result: Uint8Array;

          /** Acknowledgement error. */
          public error: string;

          /** Acknowledgement response. */
          public response?: "result" | "error";

          /**
           * Creates a new Acknowledgement instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Acknowledgement instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IAcknowledgement
          ): ibc.core.channel.v1.Acknowledgement;

          /**
           * Encodes the specified Acknowledgement message. Does not implicitly {@link ibc.core.channel.v1.Acknowledgement.verify|verify} messages.
           * @param m Acknowledgement message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IAcknowledgement,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes an Acknowledgement message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Acknowledgement
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.Acknowledgement;

          /**
           * Creates an Acknowledgement message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Acknowledgement
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.Acknowledgement;

          /**
           * Creates a plain object from an Acknowledgement message. Also converts values to other types if specified.
           * @param m Acknowledgement
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.Acknowledgement,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Acknowledgement to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Represents a Query */
        class Query extends $protobuf.rpc.Service {
          /**
           * Constructs a new Query service.
           * @param rpcImpl RPC implementation
           * @param [requestDelimited=false] Whether requests are length-delimited
           * @param [responseDelimited=false] Whether responses are length-delimited
           */
          constructor(
            rpcImpl: $protobuf.RPCImpl,
            requestDelimited?: boolean,
            responseDelimited?: boolean
          );

          /**
           * Creates new Query service using the specified rpc implementation.
           * @param rpcImpl RPC implementation
           * @param [requestDelimited=false] Whether requests are length-delimited
           * @param [responseDelimited=false] Whether responses are length-delimited
           * @returns RPC service. Useful where requests and/or responses are streamed.
           */
          public static create(
            rpcImpl: $protobuf.RPCImpl,
            requestDelimited?: boolean,
            responseDelimited?: boolean
          ): Query;

          /**
           * Calls Channel.
           * @param request QueryChannelRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryChannelResponse
           */
          public channel(
            request: ibc.core.channel.v1.IQueryChannelRequest,
            callback: ibc.core.channel.v1.Query.ChannelCallback
          ): void;

          /**
           * Calls Channel.
           * @param request QueryChannelRequest message or plain object
           * @returns Promise
           */
          public channel(
            request: ibc.core.channel.v1.IQueryChannelRequest
          ): Promise<ibc.core.channel.v1.QueryChannelResponse>;

          /**
           * Calls Channels.
           * @param request QueryChannelsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryChannelsResponse
           */
          public channels(
            request: ibc.core.channel.v1.IQueryChannelsRequest,
            callback: ibc.core.channel.v1.Query.ChannelsCallback
          ): void;

          /**
           * Calls Channels.
           * @param request QueryChannelsRequest message or plain object
           * @returns Promise
           */
          public channels(
            request: ibc.core.channel.v1.IQueryChannelsRequest
          ): Promise<ibc.core.channel.v1.QueryChannelsResponse>;

          /**
           * Calls ConnectionChannels.
           * @param request QueryConnectionChannelsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryConnectionChannelsResponse
           */
          public connectionChannels(
            request: ibc.core.channel.v1.IQueryConnectionChannelsRequest,
            callback: ibc.core.channel.v1.Query.ConnectionChannelsCallback
          ): void;

          /**
           * Calls ConnectionChannels.
           * @param request QueryConnectionChannelsRequest message or plain object
           * @returns Promise
           */
          public connectionChannels(
            request: ibc.core.channel.v1.IQueryConnectionChannelsRequest
          ): Promise<ibc.core.channel.v1.QueryConnectionChannelsResponse>;

          /**
           * Calls ChannelClientState.
           * @param request QueryChannelClientStateRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryChannelClientStateResponse
           */
          public channelClientState(
            request: ibc.core.channel.v1.IQueryChannelClientStateRequest,
            callback: ibc.core.channel.v1.Query.ChannelClientStateCallback
          ): void;

          /**
           * Calls ChannelClientState.
           * @param request QueryChannelClientStateRequest message or plain object
           * @returns Promise
           */
          public channelClientState(
            request: ibc.core.channel.v1.IQueryChannelClientStateRequest
          ): Promise<ibc.core.channel.v1.QueryChannelClientStateResponse>;

          /**
           * Calls ChannelConsensusState.
           * @param request QueryChannelConsensusStateRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryChannelConsensusStateResponse
           */
          public channelConsensusState(
            request: ibc.core.channel.v1.IQueryChannelConsensusStateRequest,
            callback: ibc.core.channel.v1.Query.ChannelConsensusStateCallback
          ): void;

          /**
           * Calls ChannelConsensusState.
           * @param request QueryChannelConsensusStateRequest message or plain object
           * @returns Promise
           */
          public channelConsensusState(
            request: ibc.core.channel.v1.IQueryChannelConsensusStateRequest
          ): Promise<ibc.core.channel.v1.QueryChannelConsensusStateResponse>;

          /**
           * Calls PacketCommitment.
           * @param request QueryPacketCommitmentRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryPacketCommitmentResponse
           */
          public packetCommitment(
            request: ibc.core.channel.v1.IQueryPacketCommitmentRequest,
            callback: ibc.core.channel.v1.Query.PacketCommitmentCallback
          ): void;

          /**
           * Calls PacketCommitment.
           * @param request QueryPacketCommitmentRequest message or plain object
           * @returns Promise
           */
          public packetCommitment(
            request: ibc.core.channel.v1.IQueryPacketCommitmentRequest
          ): Promise<ibc.core.channel.v1.QueryPacketCommitmentResponse>;

          /**
           * Calls PacketCommitments.
           * @param request QueryPacketCommitmentsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryPacketCommitmentsResponse
           */
          public packetCommitments(
            request: ibc.core.channel.v1.IQueryPacketCommitmentsRequest,
            callback: ibc.core.channel.v1.Query.PacketCommitmentsCallback
          ): void;

          /**
           * Calls PacketCommitments.
           * @param request QueryPacketCommitmentsRequest message or plain object
           * @returns Promise
           */
          public packetCommitments(
            request: ibc.core.channel.v1.IQueryPacketCommitmentsRequest
          ): Promise<ibc.core.channel.v1.QueryPacketCommitmentsResponse>;

          /**
           * Calls PacketReceipt.
           * @param request QueryPacketReceiptRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryPacketReceiptResponse
           */
          public packetReceipt(
            request: ibc.core.channel.v1.IQueryPacketReceiptRequest,
            callback: ibc.core.channel.v1.Query.PacketReceiptCallback
          ): void;

          /**
           * Calls PacketReceipt.
           * @param request QueryPacketReceiptRequest message or plain object
           * @returns Promise
           */
          public packetReceipt(
            request: ibc.core.channel.v1.IQueryPacketReceiptRequest
          ): Promise<ibc.core.channel.v1.QueryPacketReceiptResponse>;

          /**
           * Calls PacketAcknowledgement.
           * @param request QueryPacketAcknowledgementRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryPacketAcknowledgementResponse
           */
          public packetAcknowledgement(
            request: ibc.core.channel.v1.IQueryPacketAcknowledgementRequest,
            callback: ibc.core.channel.v1.Query.PacketAcknowledgementCallback
          ): void;

          /**
           * Calls PacketAcknowledgement.
           * @param request QueryPacketAcknowledgementRequest message or plain object
           * @returns Promise
           */
          public packetAcknowledgement(
            request: ibc.core.channel.v1.IQueryPacketAcknowledgementRequest
          ): Promise<ibc.core.channel.v1.QueryPacketAcknowledgementResponse>;

          /**
           * Calls PacketAcknowledgements.
           * @param request QueryPacketAcknowledgementsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryPacketAcknowledgementsResponse
           */
          public packetAcknowledgements(
            request: ibc.core.channel.v1.IQueryPacketAcknowledgementsRequest,
            callback: ibc.core.channel.v1.Query.PacketAcknowledgementsCallback
          ): void;

          /**
           * Calls PacketAcknowledgements.
           * @param request QueryPacketAcknowledgementsRequest message or plain object
           * @returns Promise
           */
          public packetAcknowledgements(
            request: ibc.core.channel.v1.IQueryPacketAcknowledgementsRequest
          ): Promise<ibc.core.channel.v1.QueryPacketAcknowledgementsResponse>;

          /**
           * Calls UnreceivedPackets.
           * @param request QueryUnreceivedPacketsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryUnreceivedPacketsResponse
           */
          public unreceivedPackets(
            request: ibc.core.channel.v1.IQueryUnreceivedPacketsRequest,
            callback: ibc.core.channel.v1.Query.UnreceivedPacketsCallback
          ): void;

          /**
           * Calls UnreceivedPackets.
           * @param request QueryUnreceivedPacketsRequest message or plain object
           * @returns Promise
           */
          public unreceivedPackets(
            request: ibc.core.channel.v1.IQueryUnreceivedPacketsRequest
          ): Promise<ibc.core.channel.v1.QueryUnreceivedPacketsResponse>;

          /**
           * Calls UnreceivedAcks.
           * @param request QueryUnreceivedAcksRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryUnreceivedAcksResponse
           */
          public unreceivedAcks(
            request: ibc.core.channel.v1.IQueryUnreceivedAcksRequest,
            callback: ibc.core.channel.v1.Query.UnreceivedAcksCallback
          ): void;

          /**
           * Calls UnreceivedAcks.
           * @param request QueryUnreceivedAcksRequest message or plain object
           * @returns Promise
           */
          public unreceivedAcks(
            request: ibc.core.channel.v1.IQueryUnreceivedAcksRequest
          ): Promise<ibc.core.channel.v1.QueryUnreceivedAcksResponse>;

          /**
           * Calls NextSequenceReceive.
           * @param request QueryNextSequenceReceiveRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryNextSequenceReceiveResponse
           */
          public nextSequenceReceive(
            request: ibc.core.channel.v1.IQueryNextSequenceReceiveRequest,
            callback: ibc.core.channel.v1.Query.NextSequenceReceiveCallback
          ): void;

          /**
           * Calls NextSequenceReceive.
           * @param request QueryNextSequenceReceiveRequest message or plain object
           * @returns Promise
           */
          public nextSequenceReceive(
            request: ibc.core.channel.v1.IQueryNextSequenceReceiveRequest
          ): Promise<ibc.core.channel.v1.QueryNextSequenceReceiveResponse>;
        }

        namespace Query {
          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#channel}.
           * @param error Error, if any
           * @param [response] QueryChannelResponse
           */
          type ChannelCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryChannelResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#channels}.
           * @param error Error, if any
           * @param [response] QueryChannelsResponse
           */
          type ChannelsCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryChannelsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#connectionChannels}.
           * @param error Error, if any
           * @param [response] QueryConnectionChannelsResponse
           */
          type ConnectionChannelsCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryConnectionChannelsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#channelClientState}.
           * @param error Error, if any
           * @param [response] QueryChannelClientStateResponse
           */
          type ChannelClientStateCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryChannelClientStateResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#channelConsensusState}.
           * @param error Error, if any
           * @param [response] QueryChannelConsensusStateResponse
           */
          type ChannelConsensusStateCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryChannelConsensusStateResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#packetCommitment}.
           * @param error Error, if any
           * @param [response] QueryPacketCommitmentResponse
           */
          type PacketCommitmentCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryPacketCommitmentResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#packetCommitments}.
           * @param error Error, if any
           * @param [response] QueryPacketCommitmentsResponse
           */
          type PacketCommitmentsCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryPacketCommitmentsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#packetReceipt}.
           * @param error Error, if any
           * @param [response] QueryPacketReceiptResponse
           */
          type PacketReceiptCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryPacketReceiptResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#packetAcknowledgement}.
           * @param error Error, if any
           * @param [response] QueryPacketAcknowledgementResponse
           */
          type PacketAcknowledgementCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryPacketAcknowledgementResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#packetAcknowledgements}.
           * @param error Error, if any
           * @param [response] QueryPacketAcknowledgementsResponse
           */
          type PacketAcknowledgementsCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryPacketAcknowledgementsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#unreceivedPackets}.
           * @param error Error, if any
           * @param [response] QueryUnreceivedPacketsResponse
           */
          type UnreceivedPacketsCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryUnreceivedPacketsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#unreceivedAcks}.
           * @param error Error, if any
           * @param [response] QueryUnreceivedAcksResponse
           */
          type UnreceivedAcksCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryUnreceivedAcksResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.channel.v1.Query#nextSequenceReceive}.
           * @param error Error, if any
           * @param [response] QueryNextSequenceReceiveResponse
           */
          type NextSequenceReceiveCallback = (
            error: Error | null,
            response?: ibc.core.channel.v1.QueryNextSequenceReceiveResponse
          ) => void;
        }

        /** Properties of a QueryChannelRequest. */
        interface IQueryChannelRequest {
          /** QueryChannelRequest portId */
          portId?: string | null;

          /** QueryChannelRequest channelId */
          channelId?: string | null;
        }

        /** Represents a QueryChannelRequest. */
        class QueryChannelRequest implements IQueryChannelRequest {
          /**
           * Constructs a new QueryChannelRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryChannelRequest);

          /** QueryChannelRequest portId. */
          public portId: string;

          /** QueryChannelRequest channelId. */
          public channelId: string;

          /**
           * Creates a new QueryChannelRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelRequest
          ): ibc.core.channel.v1.QueryChannelRequest;

          /**
           * Encodes the specified QueryChannelRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelRequest.verify|verify} messages.
           * @param m QueryChannelRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelRequest;

          /**
           * Creates a QueryChannelRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelRequest;

          /**
           * Creates a plain object from a QueryChannelRequest message. Also converts values to other types if specified.
           * @param m QueryChannelRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelResponse. */
        interface IQueryChannelResponse {
          /** QueryChannelResponse channel */
          channel?: ibc.core.channel.v1.IChannel | null;

          /** QueryChannelResponse proof */
          proof?: Uint8Array | null;

          /** QueryChannelResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryChannelResponse. */
        class QueryChannelResponse implements IQueryChannelResponse {
          /**
           * Constructs a new QueryChannelResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryChannelResponse);

          /** QueryChannelResponse channel. */
          public channel?: ibc.core.channel.v1.IChannel | null;

          /** QueryChannelResponse proof. */
          public proof: Uint8Array;

          /** QueryChannelResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryChannelResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelResponse
          ): ibc.core.channel.v1.QueryChannelResponse;

          /**
           * Encodes the specified QueryChannelResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelResponse.verify|verify} messages.
           * @param m QueryChannelResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelResponse;

          /**
           * Creates a QueryChannelResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelResponse;

          /**
           * Creates a plain object from a QueryChannelResponse message. Also converts values to other types if specified.
           * @param m QueryChannelResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelsRequest. */
        interface IQueryChannelsRequest {
          /** QueryChannelsRequest pagination */
          pagination?: cosmos.base.query.v1beta1.IPageRequest | null;
        }

        /** Represents a QueryChannelsRequest. */
        class QueryChannelsRequest implements IQueryChannelsRequest {
          /**
           * Constructs a new QueryChannelsRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryChannelsRequest);

          /** QueryChannelsRequest pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageRequest | null;

          /**
           * Creates a new QueryChannelsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelsRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelsRequest
          ): ibc.core.channel.v1.QueryChannelsRequest;

          /**
           * Encodes the specified QueryChannelsRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelsRequest.verify|verify} messages.
           * @param m QueryChannelsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelsRequest;

          /**
           * Creates a QueryChannelsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelsRequest;

          /**
           * Creates a plain object from a QueryChannelsRequest message. Also converts values to other types if specified.
           * @param m QueryChannelsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelsResponse. */
        interface IQueryChannelsResponse {
          /** QueryChannelsResponse channels */
          channels?: ibc.core.channel.v1.IIdentifiedChannel[] | null;

          /** QueryChannelsResponse pagination */
          pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryChannelsResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryChannelsResponse. */
        class QueryChannelsResponse implements IQueryChannelsResponse {
          /**
           * Constructs a new QueryChannelsResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryChannelsResponse);

          /** QueryChannelsResponse channels. */
          public channels: ibc.core.channel.v1.IIdentifiedChannel[];

          /** QueryChannelsResponse pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryChannelsResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryChannelsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelsResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelsResponse
          ): ibc.core.channel.v1.QueryChannelsResponse;

          /**
           * Encodes the specified QueryChannelsResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelsResponse.verify|verify} messages.
           * @param m QueryChannelsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelsResponse;

          /**
           * Creates a QueryChannelsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelsResponse;

          /**
           * Creates a plain object from a QueryChannelsResponse message. Also converts values to other types if specified.
           * @param m QueryChannelsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionChannelsRequest. */
        interface IQueryConnectionChannelsRequest {
          /** QueryConnectionChannelsRequest connection */
          connection?: string | null;

          /** QueryConnectionChannelsRequest pagination */
          pagination?: cosmos.base.query.v1beta1.IPageRequest | null;
        }

        /** Represents a QueryConnectionChannelsRequest. */
        class QueryConnectionChannelsRequest
          implements IQueryConnectionChannelsRequest {
          /**
           * Constructs a new QueryConnectionChannelsRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryConnectionChannelsRequest);

          /** QueryConnectionChannelsRequest connection. */
          public connection: string;

          /** QueryConnectionChannelsRequest pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageRequest | null;

          /**
           * Creates a new QueryConnectionChannelsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionChannelsRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryConnectionChannelsRequest
          ): ibc.core.channel.v1.QueryConnectionChannelsRequest;

          /**
           * Encodes the specified QueryConnectionChannelsRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryConnectionChannelsRequest.verify|verify} messages.
           * @param m QueryConnectionChannelsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryConnectionChannelsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionChannelsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionChannelsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryConnectionChannelsRequest;

          /**
           * Creates a QueryConnectionChannelsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionChannelsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryConnectionChannelsRequest;

          /**
           * Creates a plain object from a QueryConnectionChannelsRequest message. Also converts values to other types if specified.
           * @param m QueryConnectionChannelsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryConnectionChannelsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionChannelsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionChannelsResponse. */
        interface IQueryConnectionChannelsResponse {
          /** QueryConnectionChannelsResponse channels */
          channels?: ibc.core.channel.v1.IIdentifiedChannel[] | null;

          /** QueryConnectionChannelsResponse pagination */
          pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryConnectionChannelsResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryConnectionChannelsResponse. */
        class QueryConnectionChannelsResponse
          implements IQueryConnectionChannelsResponse {
          /**
           * Constructs a new QueryConnectionChannelsResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryConnectionChannelsResponse);

          /** QueryConnectionChannelsResponse channels. */
          public channels: ibc.core.channel.v1.IIdentifiedChannel[];

          /** QueryConnectionChannelsResponse pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryConnectionChannelsResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryConnectionChannelsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionChannelsResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryConnectionChannelsResponse
          ): ibc.core.channel.v1.QueryConnectionChannelsResponse;

          /**
           * Encodes the specified QueryConnectionChannelsResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryConnectionChannelsResponse.verify|verify} messages.
           * @param m QueryConnectionChannelsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryConnectionChannelsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionChannelsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionChannelsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryConnectionChannelsResponse;

          /**
           * Creates a QueryConnectionChannelsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionChannelsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryConnectionChannelsResponse;

          /**
           * Creates a plain object from a QueryConnectionChannelsResponse message. Also converts values to other types if specified.
           * @param m QueryConnectionChannelsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryConnectionChannelsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionChannelsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelClientStateRequest. */
        interface IQueryChannelClientStateRequest {
          /** QueryChannelClientStateRequest portId */
          portId?: string | null;

          /** QueryChannelClientStateRequest channelId */
          channelId?: string | null;
        }

        /** Represents a QueryChannelClientStateRequest. */
        class QueryChannelClientStateRequest
          implements IQueryChannelClientStateRequest {
          /**
           * Constructs a new QueryChannelClientStateRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryChannelClientStateRequest);

          /** QueryChannelClientStateRequest portId. */
          public portId: string;

          /** QueryChannelClientStateRequest channelId. */
          public channelId: string;

          /**
           * Creates a new QueryChannelClientStateRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelClientStateRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelClientStateRequest
          ): ibc.core.channel.v1.QueryChannelClientStateRequest;

          /**
           * Encodes the specified QueryChannelClientStateRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelClientStateRequest.verify|verify} messages.
           * @param m QueryChannelClientStateRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelClientStateRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelClientStateRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelClientStateRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelClientStateRequest;

          /**
           * Creates a QueryChannelClientStateRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelClientStateRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelClientStateRequest;

          /**
           * Creates a plain object from a QueryChannelClientStateRequest message. Also converts values to other types if specified.
           * @param m QueryChannelClientStateRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelClientStateRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelClientStateRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelClientStateResponse. */
        interface IQueryChannelClientStateResponse {
          /** QueryChannelClientStateResponse identifiedClientState */
          identifiedClientState?: ibc.core.client.v1.IIdentifiedClientState | null;

          /** QueryChannelClientStateResponse proof */
          proof?: Uint8Array | null;

          /** QueryChannelClientStateResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryChannelClientStateResponse. */
        class QueryChannelClientStateResponse
          implements IQueryChannelClientStateResponse {
          /**
           * Constructs a new QueryChannelClientStateResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryChannelClientStateResponse);

          /** QueryChannelClientStateResponse identifiedClientState. */
          public identifiedClientState?: ibc.core.client.v1.IIdentifiedClientState | null;

          /** QueryChannelClientStateResponse proof. */
          public proof: Uint8Array;

          /** QueryChannelClientStateResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryChannelClientStateResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelClientStateResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelClientStateResponse
          ): ibc.core.channel.v1.QueryChannelClientStateResponse;

          /**
           * Encodes the specified QueryChannelClientStateResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelClientStateResponse.verify|verify} messages.
           * @param m QueryChannelClientStateResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelClientStateResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelClientStateResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelClientStateResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelClientStateResponse;

          /**
           * Creates a QueryChannelClientStateResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelClientStateResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelClientStateResponse;

          /**
           * Creates a plain object from a QueryChannelClientStateResponse message. Also converts values to other types if specified.
           * @param m QueryChannelClientStateResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelClientStateResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelClientStateResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelConsensusStateRequest. */
        interface IQueryChannelConsensusStateRequest {
          /** QueryChannelConsensusStateRequest portId */
          portId?: string | null;

          /** QueryChannelConsensusStateRequest channelId */
          channelId?: string | null;

          /** QueryChannelConsensusStateRequest versionNumber */
          versionNumber?: Long | null;

          /** QueryChannelConsensusStateRequest versionHeight */
          versionHeight?: Long | null;
        }

        /** Represents a QueryChannelConsensusStateRequest. */
        class QueryChannelConsensusStateRequest
          implements IQueryChannelConsensusStateRequest {
          /**
           * Constructs a new QueryChannelConsensusStateRequest.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryChannelConsensusStateRequest
          );

          /** QueryChannelConsensusStateRequest portId. */
          public portId: string;

          /** QueryChannelConsensusStateRequest channelId. */
          public channelId: string;

          /** QueryChannelConsensusStateRequest versionNumber. */
          public versionNumber: Long;

          /** QueryChannelConsensusStateRequest versionHeight. */
          public versionHeight: Long;

          /**
           * Creates a new QueryChannelConsensusStateRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelConsensusStateRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelConsensusStateRequest
          ): ibc.core.channel.v1.QueryChannelConsensusStateRequest;

          /**
           * Encodes the specified QueryChannelConsensusStateRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelConsensusStateRequest.verify|verify} messages.
           * @param m QueryChannelConsensusStateRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelConsensusStateRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelConsensusStateRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelConsensusStateRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelConsensusStateRequest;

          /**
           * Creates a QueryChannelConsensusStateRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelConsensusStateRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelConsensusStateRequest;

          /**
           * Creates a plain object from a QueryChannelConsensusStateRequest message. Also converts values to other types if specified.
           * @param m QueryChannelConsensusStateRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelConsensusStateRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelConsensusStateRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryChannelConsensusStateResponse. */
        interface IQueryChannelConsensusStateResponse {
          /** QueryChannelConsensusStateResponse consensusState */
          consensusState?: google.protobuf.IAny | null;

          /** QueryChannelConsensusStateResponse clientId */
          clientId?: string | null;

          /** QueryChannelConsensusStateResponse proof */
          proof?: Uint8Array | null;

          /** QueryChannelConsensusStateResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryChannelConsensusStateResponse. */
        class QueryChannelConsensusStateResponse
          implements IQueryChannelConsensusStateResponse {
          /**
           * Constructs a new QueryChannelConsensusStateResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryChannelConsensusStateResponse
          );

          /** QueryChannelConsensusStateResponse consensusState. */
          public consensusState?: google.protobuf.IAny | null;

          /** QueryChannelConsensusStateResponse clientId. */
          public clientId: string;

          /** QueryChannelConsensusStateResponse proof. */
          public proof: Uint8Array;

          /** QueryChannelConsensusStateResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryChannelConsensusStateResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryChannelConsensusStateResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryChannelConsensusStateResponse
          ): ibc.core.channel.v1.QueryChannelConsensusStateResponse;

          /**
           * Encodes the specified QueryChannelConsensusStateResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryChannelConsensusStateResponse.verify|verify} messages.
           * @param m QueryChannelConsensusStateResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryChannelConsensusStateResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryChannelConsensusStateResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryChannelConsensusStateResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryChannelConsensusStateResponse;

          /**
           * Creates a QueryChannelConsensusStateResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryChannelConsensusStateResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryChannelConsensusStateResponse;

          /**
           * Creates a plain object from a QueryChannelConsensusStateResponse message. Also converts values to other types if specified.
           * @param m QueryChannelConsensusStateResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryChannelConsensusStateResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryChannelConsensusStateResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketCommitmentRequest. */
        interface IQueryPacketCommitmentRequest {
          /** QueryPacketCommitmentRequest portId */
          portId?: string | null;

          /** QueryPacketCommitmentRequest channelId */
          channelId?: string | null;

          /** QueryPacketCommitmentRequest sequence */
          sequence?: Long | null;
        }

        /** Represents a QueryPacketCommitmentRequest. */
        class QueryPacketCommitmentRequest
          implements IQueryPacketCommitmentRequest {
          /**
           * Constructs a new QueryPacketCommitmentRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryPacketCommitmentRequest);

          /** QueryPacketCommitmentRequest portId. */
          public portId: string;

          /** QueryPacketCommitmentRequest channelId. */
          public channelId: string;

          /** QueryPacketCommitmentRequest sequence. */
          public sequence: Long;

          /**
           * Creates a new QueryPacketCommitmentRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketCommitmentRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketCommitmentRequest
          ): ibc.core.channel.v1.QueryPacketCommitmentRequest;

          /**
           * Encodes the specified QueryPacketCommitmentRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketCommitmentRequest.verify|verify} messages.
           * @param m QueryPacketCommitmentRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketCommitmentRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketCommitmentRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketCommitmentRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketCommitmentRequest;

          /**
           * Creates a QueryPacketCommitmentRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketCommitmentRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketCommitmentRequest;

          /**
           * Creates a plain object from a QueryPacketCommitmentRequest message. Also converts values to other types if specified.
           * @param m QueryPacketCommitmentRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketCommitmentRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketCommitmentRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketCommitmentResponse. */
        interface IQueryPacketCommitmentResponse {
          /** QueryPacketCommitmentResponse commitment */
          commitment?: Uint8Array | null;

          /** QueryPacketCommitmentResponse proof */
          proof?: Uint8Array | null;

          /** QueryPacketCommitmentResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryPacketCommitmentResponse. */
        class QueryPacketCommitmentResponse
          implements IQueryPacketCommitmentResponse {
          /**
           * Constructs a new QueryPacketCommitmentResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryPacketCommitmentResponse);

          /** QueryPacketCommitmentResponse commitment. */
          public commitment: Uint8Array;

          /** QueryPacketCommitmentResponse proof. */
          public proof: Uint8Array;

          /** QueryPacketCommitmentResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryPacketCommitmentResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketCommitmentResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketCommitmentResponse
          ): ibc.core.channel.v1.QueryPacketCommitmentResponse;

          /**
           * Encodes the specified QueryPacketCommitmentResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketCommitmentResponse.verify|verify} messages.
           * @param m QueryPacketCommitmentResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketCommitmentResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketCommitmentResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketCommitmentResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketCommitmentResponse;

          /**
           * Creates a QueryPacketCommitmentResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketCommitmentResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketCommitmentResponse;

          /**
           * Creates a plain object from a QueryPacketCommitmentResponse message. Also converts values to other types if specified.
           * @param m QueryPacketCommitmentResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketCommitmentResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketCommitmentResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketCommitmentsRequest. */
        interface IQueryPacketCommitmentsRequest {
          /** QueryPacketCommitmentsRequest portId */
          portId?: string | null;

          /** QueryPacketCommitmentsRequest channelId */
          channelId?: string | null;

          /** QueryPacketCommitmentsRequest pagination */
          pagination?: cosmos.base.query.v1beta1.IPageRequest | null;
        }

        /** Represents a QueryPacketCommitmentsRequest. */
        class QueryPacketCommitmentsRequest
          implements IQueryPacketCommitmentsRequest {
          /**
           * Constructs a new QueryPacketCommitmentsRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryPacketCommitmentsRequest);

          /** QueryPacketCommitmentsRequest portId. */
          public portId: string;

          /** QueryPacketCommitmentsRequest channelId. */
          public channelId: string;

          /** QueryPacketCommitmentsRequest pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageRequest | null;

          /**
           * Creates a new QueryPacketCommitmentsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketCommitmentsRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketCommitmentsRequest
          ): ibc.core.channel.v1.QueryPacketCommitmentsRequest;

          /**
           * Encodes the specified QueryPacketCommitmentsRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketCommitmentsRequest.verify|verify} messages.
           * @param m QueryPacketCommitmentsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketCommitmentsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketCommitmentsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketCommitmentsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketCommitmentsRequest;

          /**
           * Creates a QueryPacketCommitmentsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketCommitmentsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketCommitmentsRequest;

          /**
           * Creates a plain object from a QueryPacketCommitmentsRequest message. Also converts values to other types if specified.
           * @param m QueryPacketCommitmentsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketCommitmentsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketCommitmentsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketCommitmentsResponse. */
        interface IQueryPacketCommitmentsResponse {
          /** QueryPacketCommitmentsResponse commitments */
          commitments?: ibc.core.channel.v1.IPacketState[] | null;

          /** QueryPacketCommitmentsResponse pagination */
          pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryPacketCommitmentsResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryPacketCommitmentsResponse. */
        class QueryPacketCommitmentsResponse
          implements IQueryPacketCommitmentsResponse {
          /**
           * Constructs a new QueryPacketCommitmentsResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryPacketCommitmentsResponse);

          /** QueryPacketCommitmentsResponse commitments. */
          public commitments: ibc.core.channel.v1.IPacketState[];

          /** QueryPacketCommitmentsResponse pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryPacketCommitmentsResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryPacketCommitmentsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketCommitmentsResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketCommitmentsResponse
          ): ibc.core.channel.v1.QueryPacketCommitmentsResponse;

          /**
           * Encodes the specified QueryPacketCommitmentsResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketCommitmentsResponse.verify|verify} messages.
           * @param m QueryPacketCommitmentsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketCommitmentsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketCommitmentsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketCommitmentsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketCommitmentsResponse;

          /**
           * Creates a QueryPacketCommitmentsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketCommitmentsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketCommitmentsResponse;

          /**
           * Creates a plain object from a QueryPacketCommitmentsResponse message. Also converts values to other types if specified.
           * @param m QueryPacketCommitmentsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketCommitmentsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketCommitmentsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketReceiptRequest. */
        interface IQueryPacketReceiptRequest {
          /** QueryPacketReceiptRequest portId */
          portId?: string | null;

          /** QueryPacketReceiptRequest channelId */
          channelId?: string | null;

          /** QueryPacketReceiptRequest sequence */
          sequence?: Long | null;
        }

        /** Represents a QueryPacketReceiptRequest. */
        class QueryPacketReceiptRequest implements IQueryPacketReceiptRequest {
          /**
           * Constructs a new QueryPacketReceiptRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryPacketReceiptRequest);

          /** QueryPacketReceiptRequest portId. */
          public portId: string;

          /** QueryPacketReceiptRequest channelId. */
          public channelId: string;

          /** QueryPacketReceiptRequest sequence. */
          public sequence: Long;

          /**
           * Creates a new QueryPacketReceiptRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketReceiptRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketReceiptRequest
          ): ibc.core.channel.v1.QueryPacketReceiptRequest;

          /**
           * Encodes the specified QueryPacketReceiptRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketReceiptRequest.verify|verify} messages.
           * @param m QueryPacketReceiptRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketReceiptRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketReceiptRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketReceiptRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketReceiptRequest;

          /**
           * Creates a QueryPacketReceiptRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketReceiptRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketReceiptRequest;

          /**
           * Creates a plain object from a QueryPacketReceiptRequest message. Also converts values to other types if specified.
           * @param m QueryPacketReceiptRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketReceiptRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketReceiptRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketReceiptResponse. */
        interface IQueryPacketReceiptResponse {
          /** QueryPacketReceiptResponse received */
          received?: boolean | null;

          /** QueryPacketReceiptResponse proof */
          proof?: Uint8Array | null;

          /** QueryPacketReceiptResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryPacketReceiptResponse. */
        class QueryPacketReceiptResponse
          implements IQueryPacketReceiptResponse {
          /**
           * Constructs a new QueryPacketReceiptResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryPacketReceiptResponse);

          /** QueryPacketReceiptResponse received. */
          public received: boolean;

          /** QueryPacketReceiptResponse proof. */
          public proof: Uint8Array;

          /** QueryPacketReceiptResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryPacketReceiptResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketReceiptResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketReceiptResponse
          ): ibc.core.channel.v1.QueryPacketReceiptResponse;

          /**
           * Encodes the specified QueryPacketReceiptResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketReceiptResponse.verify|verify} messages.
           * @param m QueryPacketReceiptResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketReceiptResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketReceiptResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketReceiptResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketReceiptResponse;

          /**
           * Creates a QueryPacketReceiptResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketReceiptResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketReceiptResponse;

          /**
           * Creates a plain object from a QueryPacketReceiptResponse message. Also converts values to other types if specified.
           * @param m QueryPacketReceiptResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketReceiptResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketReceiptResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketAcknowledgementRequest. */
        interface IQueryPacketAcknowledgementRequest {
          /** QueryPacketAcknowledgementRequest portId */
          portId?: string | null;

          /** QueryPacketAcknowledgementRequest channelId */
          channelId?: string | null;

          /** QueryPacketAcknowledgementRequest sequence */
          sequence?: Long | null;
        }

        /** Represents a QueryPacketAcknowledgementRequest. */
        class QueryPacketAcknowledgementRequest
          implements IQueryPacketAcknowledgementRequest {
          /**
           * Constructs a new QueryPacketAcknowledgementRequest.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryPacketAcknowledgementRequest
          );

          /** QueryPacketAcknowledgementRequest portId. */
          public portId: string;

          /** QueryPacketAcknowledgementRequest channelId. */
          public channelId: string;

          /** QueryPacketAcknowledgementRequest sequence. */
          public sequence: Long;

          /**
           * Creates a new QueryPacketAcknowledgementRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketAcknowledgementRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketAcknowledgementRequest
          ): ibc.core.channel.v1.QueryPacketAcknowledgementRequest;

          /**
           * Encodes the specified QueryPacketAcknowledgementRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketAcknowledgementRequest.verify|verify} messages.
           * @param m QueryPacketAcknowledgementRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketAcknowledgementRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketAcknowledgementRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketAcknowledgementRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketAcknowledgementRequest;

          /**
           * Creates a QueryPacketAcknowledgementRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketAcknowledgementRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketAcknowledgementRequest;

          /**
           * Creates a plain object from a QueryPacketAcknowledgementRequest message. Also converts values to other types if specified.
           * @param m QueryPacketAcknowledgementRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketAcknowledgementRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketAcknowledgementRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketAcknowledgementResponse. */
        interface IQueryPacketAcknowledgementResponse {
          /** QueryPacketAcknowledgementResponse acknowledgement */
          acknowledgement?: Uint8Array | null;

          /** QueryPacketAcknowledgementResponse proof */
          proof?: Uint8Array | null;

          /** QueryPacketAcknowledgementResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryPacketAcknowledgementResponse. */
        class QueryPacketAcknowledgementResponse
          implements IQueryPacketAcknowledgementResponse {
          /**
           * Constructs a new QueryPacketAcknowledgementResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryPacketAcknowledgementResponse
          );

          /** QueryPacketAcknowledgementResponse acknowledgement. */
          public acknowledgement: Uint8Array;

          /** QueryPacketAcknowledgementResponse proof. */
          public proof: Uint8Array;

          /** QueryPacketAcknowledgementResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryPacketAcknowledgementResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketAcknowledgementResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketAcknowledgementResponse
          ): ibc.core.channel.v1.QueryPacketAcknowledgementResponse;

          /**
           * Encodes the specified QueryPacketAcknowledgementResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketAcknowledgementResponse.verify|verify} messages.
           * @param m QueryPacketAcknowledgementResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketAcknowledgementResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketAcknowledgementResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketAcknowledgementResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketAcknowledgementResponse;

          /**
           * Creates a QueryPacketAcknowledgementResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketAcknowledgementResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketAcknowledgementResponse;

          /**
           * Creates a plain object from a QueryPacketAcknowledgementResponse message. Also converts values to other types if specified.
           * @param m QueryPacketAcknowledgementResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketAcknowledgementResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketAcknowledgementResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketAcknowledgementsRequest. */
        interface IQueryPacketAcknowledgementsRequest {
          /** QueryPacketAcknowledgementsRequest portId */
          portId?: string | null;

          /** QueryPacketAcknowledgementsRequest channelId */
          channelId?: string | null;

          /** QueryPacketAcknowledgementsRequest pagination */
          pagination?: cosmos.base.query.v1beta1.IPageRequest | null;
        }

        /** Represents a QueryPacketAcknowledgementsRequest. */
        class QueryPacketAcknowledgementsRequest
          implements IQueryPacketAcknowledgementsRequest {
          /**
           * Constructs a new QueryPacketAcknowledgementsRequest.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryPacketAcknowledgementsRequest
          );

          /** QueryPacketAcknowledgementsRequest portId. */
          public portId: string;

          /** QueryPacketAcknowledgementsRequest channelId. */
          public channelId: string;

          /** QueryPacketAcknowledgementsRequest pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageRequest | null;

          /**
           * Creates a new QueryPacketAcknowledgementsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketAcknowledgementsRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketAcknowledgementsRequest
          ): ibc.core.channel.v1.QueryPacketAcknowledgementsRequest;

          /**
           * Encodes the specified QueryPacketAcknowledgementsRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketAcknowledgementsRequest.verify|verify} messages.
           * @param m QueryPacketAcknowledgementsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketAcknowledgementsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketAcknowledgementsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketAcknowledgementsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketAcknowledgementsRequest;

          /**
           * Creates a QueryPacketAcknowledgementsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketAcknowledgementsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketAcknowledgementsRequest;

          /**
           * Creates a plain object from a QueryPacketAcknowledgementsRequest message. Also converts values to other types if specified.
           * @param m QueryPacketAcknowledgementsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketAcknowledgementsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketAcknowledgementsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryPacketAcknowledgementsResponse. */
        interface IQueryPacketAcknowledgementsResponse {
          /** QueryPacketAcknowledgementsResponse acknowledgements */
          acknowledgements?: ibc.core.channel.v1.IPacketState[] | null;

          /** QueryPacketAcknowledgementsResponse pagination */
          pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryPacketAcknowledgementsResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryPacketAcknowledgementsResponse. */
        class QueryPacketAcknowledgementsResponse
          implements IQueryPacketAcknowledgementsResponse {
          /**
           * Constructs a new QueryPacketAcknowledgementsResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryPacketAcknowledgementsResponse
          );

          /** QueryPacketAcknowledgementsResponse acknowledgements. */
          public acknowledgements: ibc.core.channel.v1.IPacketState[];

          /** QueryPacketAcknowledgementsResponse pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryPacketAcknowledgementsResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryPacketAcknowledgementsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryPacketAcknowledgementsResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryPacketAcknowledgementsResponse
          ): ibc.core.channel.v1.QueryPacketAcknowledgementsResponse;

          /**
           * Encodes the specified QueryPacketAcknowledgementsResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryPacketAcknowledgementsResponse.verify|verify} messages.
           * @param m QueryPacketAcknowledgementsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryPacketAcknowledgementsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryPacketAcknowledgementsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryPacketAcknowledgementsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryPacketAcknowledgementsResponse;

          /**
           * Creates a QueryPacketAcknowledgementsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryPacketAcknowledgementsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryPacketAcknowledgementsResponse;

          /**
           * Creates a plain object from a QueryPacketAcknowledgementsResponse message. Also converts values to other types if specified.
           * @param m QueryPacketAcknowledgementsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryPacketAcknowledgementsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryPacketAcknowledgementsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryUnreceivedPacketsRequest. */
        interface IQueryUnreceivedPacketsRequest {
          /** QueryUnreceivedPacketsRequest portId */
          portId?: string | null;

          /** QueryUnreceivedPacketsRequest channelId */
          channelId?: string | null;

          /** QueryUnreceivedPacketsRequest packetCommitmentSequences */
          packetCommitmentSequences?: Long[] | null;
        }

        /** Represents a QueryUnreceivedPacketsRequest. */
        class QueryUnreceivedPacketsRequest
          implements IQueryUnreceivedPacketsRequest {
          /**
           * Constructs a new QueryUnreceivedPacketsRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryUnreceivedPacketsRequest);

          /** QueryUnreceivedPacketsRequest portId. */
          public portId: string;

          /** QueryUnreceivedPacketsRequest channelId. */
          public channelId: string;

          /** QueryUnreceivedPacketsRequest packetCommitmentSequences. */
          public packetCommitmentSequences: Long[];

          /**
           * Creates a new QueryUnreceivedPacketsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryUnreceivedPacketsRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryUnreceivedPacketsRequest
          ): ibc.core.channel.v1.QueryUnreceivedPacketsRequest;

          /**
           * Encodes the specified QueryUnreceivedPacketsRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryUnreceivedPacketsRequest.verify|verify} messages.
           * @param m QueryUnreceivedPacketsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryUnreceivedPacketsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryUnreceivedPacketsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryUnreceivedPacketsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryUnreceivedPacketsRequest;

          /**
           * Creates a QueryUnreceivedPacketsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryUnreceivedPacketsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryUnreceivedPacketsRequest;

          /**
           * Creates a plain object from a QueryUnreceivedPacketsRequest message. Also converts values to other types if specified.
           * @param m QueryUnreceivedPacketsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryUnreceivedPacketsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryUnreceivedPacketsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryUnreceivedPacketsResponse. */
        interface IQueryUnreceivedPacketsResponse {
          /** QueryUnreceivedPacketsResponse sequences */
          sequences?: Long[] | null;

          /** QueryUnreceivedPacketsResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryUnreceivedPacketsResponse. */
        class QueryUnreceivedPacketsResponse
          implements IQueryUnreceivedPacketsResponse {
          /**
           * Constructs a new QueryUnreceivedPacketsResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryUnreceivedPacketsResponse);

          /** QueryUnreceivedPacketsResponse sequences. */
          public sequences: Long[];

          /** QueryUnreceivedPacketsResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryUnreceivedPacketsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryUnreceivedPacketsResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryUnreceivedPacketsResponse
          ): ibc.core.channel.v1.QueryUnreceivedPacketsResponse;

          /**
           * Encodes the specified QueryUnreceivedPacketsResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryUnreceivedPacketsResponse.verify|verify} messages.
           * @param m QueryUnreceivedPacketsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryUnreceivedPacketsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryUnreceivedPacketsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryUnreceivedPacketsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryUnreceivedPacketsResponse;

          /**
           * Creates a QueryUnreceivedPacketsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryUnreceivedPacketsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryUnreceivedPacketsResponse;

          /**
           * Creates a plain object from a QueryUnreceivedPacketsResponse message. Also converts values to other types if specified.
           * @param m QueryUnreceivedPacketsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryUnreceivedPacketsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryUnreceivedPacketsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryUnreceivedAcksRequest. */
        interface IQueryUnreceivedAcksRequest {
          /** QueryUnreceivedAcksRequest portId */
          portId?: string | null;

          /** QueryUnreceivedAcksRequest channelId */
          channelId?: string | null;

          /** QueryUnreceivedAcksRequest packetAckSequences */
          packetAckSequences?: Long[] | null;
        }

        /** Represents a QueryUnreceivedAcksRequest. */
        class QueryUnreceivedAcksRequest
          implements IQueryUnreceivedAcksRequest {
          /**
           * Constructs a new QueryUnreceivedAcksRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryUnreceivedAcksRequest);

          /** QueryUnreceivedAcksRequest portId. */
          public portId: string;

          /** QueryUnreceivedAcksRequest channelId. */
          public channelId: string;

          /** QueryUnreceivedAcksRequest packetAckSequences. */
          public packetAckSequences: Long[];

          /**
           * Creates a new QueryUnreceivedAcksRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryUnreceivedAcksRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryUnreceivedAcksRequest
          ): ibc.core.channel.v1.QueryUnreceivedAcksRequest;

          /**
           * Encodes the specified QueryUnreceivedAcksRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryUnreceivedAcksRequest.verify|verify} messages.
           * @param m QueryUnreceivedAcksRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryUnreceivedAcksRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryUnreceivedAcksRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryUnreceivedAcksRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryUnreceivedAcksRequest;

          /**
           * Creates a QueryUnreceivedAcksRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryUnreceivedAcksRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryUnreceivedAcksRequest;

          /**
           * Creates a plain object from a QueryUnreceivedAcksRequest message. Also converts values to other types if specified.
           * @param m QueryUnreceivedAcksRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryUnreceivedAcksRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryUnreceivedAcksRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryUnreceivedAcksResponse. */
        interface IQueryUnreceivedAcksResponse {
          /** QueryUnreceivedAcksResponse sequences */
          sequences?: Long[] | null;

          /** QueryUnreceivedAcksResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryUnreceivedAcksResponse. */
        class QueryUnreceivedAcksResponse
          implements IQueryUnreceivedAcksResponse {
          /**
           * Constructs a new QueryUnreceivedAcksResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryUnreceivedAcksResponse);

          /** QueryUnreceivedAcksResponse sequences. */
          public sequences: Long[];

          /** QueryUnreceivedAcksResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryUnreceivedAcksResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryUnreceivedAcksResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryUnreceivedAcksResponse
          ): ibc.core.channel.v1.QueryUnreceivedAcksResponse;

          /**
           * Encodes the specified QueryUnreceivedAcksResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryUnreceivedAcksResponse.verify|verify} messages.
           * @param m QueryUnreceivedAcksResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryUnreceivedAcksResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryUnreceivedAcksResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryUnreceivedAcksResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryUnreceivedAcksResponse;

          /**
           * Creates a QueryUnreceivedAcksResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryUnreceivedAcksResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryUnreceivedAcksResponse;

          /**
           * Creates a plain object from a QueryUnreceivedAcksResponse message. Also converts values to other types if specified.
           * @param m QueryUnreceivedAcksResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryUnreceivedAcksResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryUnreceivedAcksResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryNextSequenceReceiveRequest. */
        interface IQueryNextSequenceReceiveRequest {
          /** QueryNextSequenceReceiveRequest portId */
          portId?: string | null;

          /** QueryNextSequenceReceiveRequest channelId */
          channelId?: string | null;
        }

        /** Represents a QueryNextSequenceReceiveRequest. */
        class QueryNextSequenceReceiveRequest
          implements IQueryNextSequenceReceiveRequest {
          /**
           * Constructs a new QueryNextSequenceReceiveRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.channel.v1.IQueryNextSequenceReceiveRequest);

          /** QueryNextSequenceReceiveRequest portId. */
          public portId: string;

          /** QueryNextSequenceReceiveRequest channelId. */
          public channelId: string;

          /**
           * Creates a new QueryNextSequenceReceiveRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryNextSequenceReceiveRequest instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryNextSequenceReceiveRequest
          ): ibc.core.channel.v1.QueryNextSequenceReceiveRequest;

          /**
           * Encodes the specified QueryNextSequenceReceiveRequest message. Does not implicitly {@link ibc.core.channel.v1.QueryNextSequenceReceiveRequest.verify|verify} messages.
           * @param m QueryNextSequenceReceiveRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryNextSequenceReceiveRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryNextSequenceReceiveRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryNextSequenceReceiveRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryNextSequenceReceiveRequest;

          /**
           * Creates a QueryNextSequenceReceiveRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryNextSequenceReceiveRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryNextSequenceReceiveRequest;

          /**
           * Creates a plain object from a QueryNextSequenceReceiveRequest message. Also converts values to other types if specified.
           * @param m QueryNextSequenceReceiveRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryNextSequenceReceiveRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryNextSequenceReceiveRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryNextSequenceReceiveResponse. */
        interface IQueryNextSequenceReceiveResponse {
          /** QueryNextSequenceReceiveResponse nextSequenceReceive */
          nextSequenceReceive?: Long | null;

          /** QueryNextSequenceReceiveResponse proof */
          proof?: Uint8Array | null;

          /** QueryNextSequenceReceiveResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryNextSequenceReceiveResponse. */
        class QueryNextSequenceReceiveResponse
          implements IQueryNextSequenceReceiveResponse {
          /**
           * Constructs a new QueryNextSequenceReceiveResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.channel.v1.IQueryNextSequenceReceiveResponse
          );

          /** QueryNextSequenceReceiveResponse nextSequenceReceive. */
          public nextSequenceReceive: Long;

          /** QueryNextSequenceReceiveResponse proof. */
          public proof: Uint8Array;

          /** QueryNextSequenceReceiveResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryNextSequenceReceiveResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryNextSequenceReceiveResponse instance
           */
          public static create(
            properties?: ibc.core.channel.v1.IQueryNextSequenceReceiveResponse
          ): ibc.core.channel.v1.QueryNextSequenceReceiveResponse;

          /**
           * Encodes the specified QueryNextSequenceReceiveResponse message. Does not implicitly {@link ibc.core.channel.v1.QueryNextSequenceReceiveResponse.verify|verify} messages.
           * @param m QueryNextSequenceReceiveResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.channel.v1.IQueryNextSequenceReceiveResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryNextSequenceReceiveResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryNextSequenceReceiveResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.channel.v1.QueryNextSequenceReceiveResponse;

          /**
           * Creates a QueryNextSequenceReceiveResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryNextSequenceReceiveResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.channel.v1.QueryNextSequenceReceiveResponse;

          /**
           * Creates a plain object from a QueryNextSequenceReceiveResponse message. Also converts values to other types if specified.
           * @param m QueryNextSequenceReceiveResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.channel.v1.QueryNextSequenceReceiveResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryNextSequenceReceiveResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }
    }

    /** Namespace client. */
    namespace client {
      /** Namespace v1. */
      namespace v1 {
        /** Represents a Msg */
        class Msg extends $protobuf.rpc.Service {
          /**
           * Constructs a new Msg service.
           * @param rpcImpl RPC implementation
           * @param [requestDelimited=false] Whether requests are length-delimited
           * @param [responseDelimited=false] Whether responses are length-delimited
           */
          constructor(
            rpcImpl: $protobuf.RPCImpl,
            requestDelimited?: boolean,
            responseDelimited?: boolean
          );

          /**
           * Creates new Msg service using the specified rpc implementation.
           * @param rpcImpl RPC implementation
           * @param [requestDelimited=false] Whether requests are length-delimited
           * @param [responseDelimited=false] Whether responses are length-delimited
           * @returns RPC service. Useful where requests and/or responses are streamed.
           */
          public static create(
            rpcImpl: $protobuf.RPCImpl,
            requestDelimited?: boolean,
            responseDelimited?: boolean
          ): Msg;

          /**
           * Calls CreateClient.
           * @param request MsgCreateClient message or plain object
           * @param callback Node-style callback called with the error, if any, and MsgCreateClientResponse
           */
          public createClient(
            request: ibc.core.client.v1.IMsgCreateClient,
            callback: ibc.core.client.v1.Msg.CreateClientCallback
          ): void;

          /**
           * Calls CreateClient.
           * @param request MsgCreateClient message or plain object
           * @returns Promise
           */
          public createClient(
            request: ibc.core.client.v1.IMsgCreateClient
          ): Promise<ibc.core.client.v1.MsgCreateClientResponse>;

          /**
           * Calls UpdateClient.
           * @param request MsgUpdateClient message or plain object
           * @param callback Node-style callback called with the error, if any, and MsgUpdateClientResponse
           */
          public updateClient(
            request: ibc.core.client.v1.IMsgUpdateClient,
            callback: ibc.core.client.v1.Msg.UpdateClientCallback
          ): void;

          /**
           * Calls UpdateClient.
           * @param request MsgUpdateClient message or plain object
           * @returns Promise
           */
          public updateClient(
            request: ibc.core.client.v1.IMsgUpdateClient
          ): Promise<ibc.core.client.v1.MsgUpdateClientResponse>;

          /**
           * Calls UpgradeClient.
           * @param request MsgUpgradeClient message or plain object
           * @param callback Node-style callback called with the error, if any, and MsgUpgradeClientResponse
           */
          public upgradeClient(
            request: ibc.core.client.v1.IMsgUpgradeClient,
            callback: ibc.core.client.v1.Msg.UpgradeClientCallback
          ): void;

          /**
           * Calls UpgradeClient.
           * @param request MsgUpgradeClient message or plain object
           * @returns Promise
           */
          public upgradeClient(
            request: ibc.core.client.v1.IMsgUpgradeClient
          ): Promise<ibc.core.client.v1.MsgUpgradeClientResponse>;

          /**
           * Calls SubmitMisbehaviour.
           * @param request MsgSubmitMisbehaviour message or plain object
           * @param callback Node-style callback called with the error, if any, and MsgSubmitMisbehaviourResponse
           */
          public submitMisbehaviour(
            request: ibc.core.client.v1.IMsgSubmitMisbehaviour,
            callback: ibc.core.client.v1.Msg.SubmitMisbehaviourCallback
          ): void;

          /**
           * Calls SubmitMisbehaviour.
           * @param request MsgSubmitMisbehaviour message or plain object
           * @returns Promise
           */
          public submitMisbehaviour(
            request: ibc.core.client.v1.IMsgSubmitMisbehaviour
          ): Promise<ibc.core.client.v1.MsgSubmitMisbehaviourResponse>;
        }

        namespace Msg {
          /**
           * Callback as used by {@link ibc.core.client.v1.Msg#createClient}.
           * @param error Error, if any
           * @param [response] MsgCreateClientResponse
           */
          type CreateClientCallback = (
            error: Error | null,
            response?: ibc.core.client.v1.MsgCreateClientResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.client.v1.Msg#updateClient}.
           * @param error Error, if any
           * @param [response] MsgUpdateClientResponse
           */
          type UpdateClientCallback = (
            error: Error | null,
            response?: ibc.core.client.v1.MsgUpdateClientResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.client.v1.Msg#upgradeClient}.
           * @param error Error, if any
           * @param [response] MsgUpgradeClientResponse
           */
          type UpgradeClientCallback = (
            error: Error | null,
            response?: ibc.core.client.v1.MsgUpgradeClientResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.client.v1.Msg#submitMisbehaviour}.
           * @param error Error, if any
           * @param [response] MsgSubmitMisbehaviourResponse
           */
          type SubmitMisbehaviourCallback = (
            error: Error | null,
            response?: ibc.core.client.v1.MsgSubmitMisbehaviourResponse
          ) => void;
        }

        /** Properties of a MsgCreateClient. */
        interface IMsgCreateClient {
          /** MsgCreateClient clientId */
          clientId?: string | null;

          /** MsgCreateClient clientState */
          clientState?: google.protobuf.IAny | null;

          /** MsgCreateClient consensusState */
          consensusState?: google.protobuf.IAny | null;

          /** MsgCreateClient signer */
          signer?: string | null;
        }

        /** Represents a MsgCreateClient. */
        class MsgCreateClient implements IMsgCreateClient {
          /**
           * Constructs a new MsgCreateClient.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgCreateClient);

          /** MsgCreateClient clientId. */
          public clientId: string;

          /** MsgCreateClient clientState. */
          public clientState?: google.protobuf.IAny | null;

          /** MsgCreateClient consensusState. */
          public consensusState?: google.protobuf.IAny | null;

          /** MsgCreateClient signer. */
          public signer: string;

          /**
           * Creates a new MsgCreateClient instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgCreateClient instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgCreateClient
          ): ibc.core.client.v1.MsgCreateClient;

          /**
           * Encodes the specified MsgCreateClient message. Does not implicitly {@link ibc.core.client.v1.MsgCreateClient.verify|verify} messages.
           * @param m MsgCreateClient message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgCreateClient,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgCreateClient message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgCreateClient
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgCreateClient;

          /**
           * Creates a MsgCreateClient message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgCreateClient
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgCreateClient;

          /**
           * Creates a plain object from a MsgCreateClient message. Also converts values to other types if specified.
           * @param m MsgCreateClient
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgCreateClient,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgCreateClient to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgCreateClientResponse. */
        interface IMsgCreateClientResponse {}

        /** Represents a MsgCreateClientResponse. */
        class MsgCreateClientResponse implements IMsgCreateClientResponse {
          /**
           * Constructs a new MsgCreateClientResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgCreateClientResponse);

          /**
           * Creates a new MsgCreateClientResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgCreateClientResponse instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgCreateClientResponse
          ): ibc.core.client.v1.MsgCreateClientResponse;

          /**
           * Encodes the specified MsgCreateClientResponse message. Does not implicitly {@link ibc.core.client.v1.MsgCreateClientResponse.verify|verify} messages.
           * @param m MsgCreateClientResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgCreateClientResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgCreateClientResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgCreateClientResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgCreateClientResponse;

          /**
           * Creates a MsgCreateClientResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgCreateClientResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgCreateClientResponse;

          /**
           * Creates a plain object from a MsgCreateClientResponse message. Also converts values to other types if specified.
           * @param m MsgCreateClientResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgCreateClientResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgCreateClientResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgUpdateClient. */
        interface IMsgUpdateClient {
          /** MsgUpdateClient clientId */
          clientId?: string | null;

          /** MsgUpdateClient header */
          header?: google.protobuf.IAny | null;

          /** MsgUpdateClient signer */
          signer?: string | null;
        }

        /** Represents a MsgUpdateClient. */
        class MsgUpdateClient implements IMsgUpdateClient {
          /**
           * Constructs a new MsgUpdateClient.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgUpdateClient);

          /** MsgUpdateClient clientId. */
          public clientId: string;

          /** MsgUpdateClient header. */
          public header?: google.protobuf.IAny | null;

          /** MsgUpdateClient signer. */
          public signer: string;

          /**
           * Creates a new MsgUpdateClient instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgUpdateClient instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgUpdateClient
          ): ibc.core.client.v1.MsgUpdateClient;

          /**
           * Encodes the specified MsgUpdateClient message. Does not implicitly {@link ibc.core.client.v1.MsgUpdateClient.verify|verify} messages.
           * @param m MsgUpdateClient message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgUpdateClient,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgUpdateClient message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgUpdateClient
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgUpdateClient;

          /**
           * Creates a MsgUpdateClient message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgUpdateClient
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgUpdateClient;

          /**
           * Creates a plain object from a MsgUpdateClient message. Also converts values to other types if specified.
           * @param m MsgUpdateClient
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgUpdateClient,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgUpdateClient to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgUpdateClientResponse. */
        interface IMsgUpdateClientResponse {}

        /** Represents a MsgUpdateClientResponse. */
        class MsgUpdateClientResponse implements IMsgUpdateClientResponse {
          /**
           * Constructs a new MsgUpdateClientResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgUpdateClientResponse);

          /**
           * Creates a new MsgUpdateClientResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgUpdateClientResponse instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgUpdateClientResponse
          ): ibc.core.client.v1.MsgUpdateClientResponse;

          /**
           * Encodes the specified MsgUpdateClientResponse message. Does not implicitly {@link ibc.core.client.v1.MsgUpdateClientResponse.verify|verify} messages.
           * @param m MsgUpdateClientResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgUpdateClientResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgUpdateClientResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgUpdateClientResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgUpdateClientResponse;

          /**
           * Creates a MsgUpdateClientResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgUpdateClientResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgUpdateClientResponse;

          /**
           * Creates a plain object from a MsgUpdateClientResponse message. Also converts values to other types if specified.
           * @param m MsgUpdateClientResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgUpdateClientResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgUpdateClientResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgUpgradeClient. */
        interface IMsgUpgradeClient {
          /** MsgUpgradeClient clientId */
          clientId?: string | null;

          /** MsgUpgradeClient clientState */
          clientState?: google.protobuf.IAny | null;

          /** MsgUpgradeClient upgradeHeight */
          upgradeHeight?: ibc.core.client.v1.IHeight | null;

          /** MsgUpgradeClient proofUpgrade */
          proofUpgrade?: Uint8Array | null;

          /** MsgUpgradeClient signer */
          signer?: string | null;
        }

        /** Represents a MsgUpgradeClient. */
        class MsgUpgradeClient implements IMsgUpgradeClient {
          /**
           * Constructs a new MsgUpgradeClient.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgUpgradeClient);

          /** MsgUpgradeClient clientId. */
          public clientId: string;

          /** MsgUpgradeClient clientState. */
          public clientState?: google.protobuf.IAny | null;

          /** MsgUpgradeClient upgradeHeight. */
          public upgradeHeight?: ibc.core.client.v1.IHeight | null;

          /** MsgUpgradeClient proofUpgrade. */
          public proofUpgrade: Uint8Array;

          /** MsgUpgradeClient signer. */
          public signer: string;

          /**
           * Creates a new MsgUpgradeClient instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgUpgradeClient instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgUpgradeClient
          ): ibc.core.client.v1.MsgUpgradeClient;

          /**
           * Encodes the specified MsgUpgradeClient message. Does not implicitly {@link ibc.core.client.v1.MsgUpgradeClient.verify|verify} messages.
           * @param m MsgUpgradeClient message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgUpgradeClient,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgUpgradeClient message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgUpgradeClient
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgUpgradeClient;

          /**
           * Creates a MsgUpgradeClient message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgUpgradeClient
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgUpgradeClient;

          /**
           * Creates a plain object from a MsgUpgradeClient message. Also converts values to other types if specified.
           * @param m MsgUpgradeClient
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgUpgradeClient,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgUpgradeClient to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgUpgradeClientResponse. */
        interface IMsgUpgradeClientResponse {}

        /** Represents a MsgUpgradeClientResponse. */
        class MsgUpgradeClientResponse implements IMsgUpgradeClientResponse {
          /**
           * Constructs a new MsgUpgradeClientResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgUpgradeClientResponse);

          /**
           * Creates a new MsgUpgradeClientResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgUpgradeClientResponse instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgUpgradeClientResponse
          ): ibc.core.client.v1.MsgUpgradeClientResponse;

          /**
           * Encodes the specified MsgUpgradeClientResponse message. Does not implicitly {@link ibc.core.client.v1.MsgUpgradeClientResponse.verify|verify} messages.
           * @param m MsgUpgradeClientResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgUpgradeClientResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgUpgradeClientResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgUpgradeClientResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgUpgradeClientResponse;

          /**
           * Creates a MsgUpgradeClientResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgUpgradeClientResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgUpgradeClientResponse;

          /**
           * Creates a plain object from a MsgUpgradeClientResponse message. Also converts values to other types if specified.
           * @param m MsgUpgradeClientResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgUpgradeClientResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgUpgradeClientResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgSubmitMisbehaviour. */
        interface IMsgSubmitMisbehaviour {
          /** MsgSubmitMisbehaviour clientId */
          clientId?: string | null;

          /** MsgSubmitMisbehaviour misbehaviour */
          misbehaviour?: google.protobuf.IAny | null;

          /** MsgSubmitMisbehaviour signer */
          signer?: string | null;
        }

        /** Represents a MsgSubmitMisbehaviour. */
        class MsgSubmitMisbehaviour implements IMsgSubmitMisbehaviour {
          /**
           * Constructs a new MsgSubmitMisbehaviour.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgSubmitMisbehaviour);

          /** MsgSubmitMisbehaviour clientId. */
          public clientId: string;

          /** MsgSubmitMisbehaviour misbehaviour. */
          public misbehaviour?: google.protobuf.IAny | null;

          /** MsgSubmitMisbehaviour signer. */
          public signer: string;

          /**
           * Creates a new MsgSubmitMisbehaviour instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgSubmitMisbehaviour instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgSubmitMisbehaviour
          ): ibc.core.client.v1.MsgSubmitMisbehaviour;

          /**
           * Encodes the specified MsgSubmitMisbehaviour message. Does not implicitly {@link ibc.core.client.v1.MsgSubmitMisbehaviour.verify|verify} messages.
           * @param m MsgSubmitMisbehaviour message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgSubmitMisbehaviour,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgSubmitMisbehaviour message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgSubmitMisbehaviour
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgSubmitMisbehaviour;

          /**
           * Creates a MsgSubmitMisbehaviour message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgSubmitMisbehaviour
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgSubmitMisbehaviour;

          /**
           * Creates a plain object from a MsgSubmitMisbehaviour message. Also converts values to other types if specified.
           * @param m MsgSubmitMisbehaviour
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgSubmitMisbehaviour,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgSubmitMisbehaviour to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgSubmitMisbehaviourResponse. */
        interface IMsgSubmitMisbehaviourResponse {}

        /** Represents a MsgSubmitMisbehaviourResponse. */
        class MsgSubmitMisbehaviourResponse
          implements IMsgSubmitMisbehaviourResponse {
          /**
           * Constructs a new MsgSubmitMisbehaviourResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IMsgSubmitMisbehaviourResponse);

          /**
           * Creates a new MsgSubmitMisbehaviourResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgSubmitMisbehaviourResponse instance
           */
          public static create(
            properties?: ibc.core.client.v1.IMsgSubmitMisbehaviourResponse
          ): ibc.core.client.v1.MsgSubmitMisbehaviourResponse;

          /**
           * Encodes the specified MsgSubmitMisbehaviourResponse message. Does not implicitly {@link ibc.core.client.v1.MsgSubmitMisbehaviourResponse.verify|verify} messages.
           * @param m MsgSubmitMisbehaviourResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IMsgSubmitMisbehaviourResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MsgSubmitMisbehaviourResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgSubmitMisbehaviourResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.MsgSubmitMisbehaviourResponse;

          /**
           * Creates a MsgSubmitMisbehaviourResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgSubmitMisbehaviourResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.MsgSubmitMisbehaviourResponse;

          /**
           * Creates a plain object from a MsgSubmitMisbehaviourResponse message. Also converts values to other types if specified.
           * @param m MsgSubmitMisbehaviourResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.MsgSubmitMisbehaviourResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MsgSubmitMisbehaviourResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of an IdentifiedClientState. */
        interface IIdentifiedClientState {
          /** IdentifiedClientState clientId */
          clientId?: string | null;

          /** IdentifiedClientState clientState */
          clientState?: google.protobuf.IAny | null;
        }

        /** Represents an IdentifiedClientState. */
        class IdentifiedClientState implements IIdentifiedClientState {
          /**
           * Constructs a new IdentifiedClientState.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IIdentifiedClientState);

          /** IdentifiedClientState clientId. */
          public clientId: string;

          /** IdentifiedClientState clientState. */
          public clientState?: google.protobuf.IAny | null;

          /**
           * Creates a new IdentifiedClientState instance using the specified properties.
           * @param [properties] Properties to set
           * @returns IdentifiedClientState instance
           */
          public static create(
            properties?: ibc.core.client.v1.IIdentifiedClientState
          ): ibc.core.client.v1.IdentifiedClientState;

          /**
           * Encodes the specified IdentifiedClientState message. Does not implicitly {@link ibc.core.client.v1.IdentifiedClientState.verify|verify} messages.
           * @param m IdentifiedClientState message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IIdentifiedClientState,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes an IdentifiedClientState message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns IdentifiedClientState
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.IdentifiedClientState;

          /**
           * Creates an IdentifiedClientState message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns IdentifiedClientState
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.IdentifiedClientState;

          /**
           * Creates a plain object from an IdentifiedClientState message. Also converts values to other types if specified.
           * @param m IdentifiedClientState
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.IdentifiedClientState,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this IdentifiedClientState to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConsensusStateWithHeight. */
        interface IConsensusStateWithHeight {
          /** ConsensusStateWithHeight height */
          height?: ibc.core.client.v1.IHeight | null;

          /** ConsensusStateWithHeight consensusState */
          consensusState?: google.protobuf.IAny | null;
        }

        /** Represents a ConsensusStateWithHeight. */
        class ConsensusStateWithHeight implements IConsensusStateWithHeight {
          /**
           * Constructs a new ConsensusStateWithHeight.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IConsensusStateWithHeight);

          /** ConsensusStateWithHeight height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /** ConsensusStateWithHeight consensusState. */
          public consensusState?: google.protobuf.IAny | null;

          /**
           * Creates a new ConsensusStateWithHeight instance using the specified properties.
           * @param [properties] Properties to set
           * @returns ConsensusStateWithHeight instance
           */
          public static create(
            properties?: ibc.core.client.v1.IConsensusStateWithHeight
          ): ibc.core.client.v1.ConsensusStateWithHeight;

          /**
           * Encodes the specified ConsensusStateWithHeight message. Does not implicitly {@link ibc.core.client.v1.ConsensusStateWithHeight.verify|verify} messages.
           * @param m ConsensusStateWithHeight message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IConsensusStateWithHeight,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a ConsensusStateWithHeight message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns ConsensusStateWithHeight
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.ConsensusStateWithHeight;

          /**
           * Creates a ConsensusStateWithHeight message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ConsensusStateWithHeight
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.ConsensusStateWithHeight;

          /**
           * Creates a plain object from a ConsensusStateWithHeight message. Also converts values to other types if specified.
           * @param m ConsensusStateWithHeight
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.ConsensusStateWithHeight,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this ConsensusStateWithHeight to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a ClientConsensusStates. */
        interface IClientConsensusStates {
          /** ClientConsensusStates clientId */
          clientId?: string | null;

          /** ClientConsensusStates consensusStates */
          consensusStates?:
            | ibc.core.client.v1.IConsensusStateWithHeight[]
            | null;
        }

        /** Represents a ClientConsensusStates. */
        class ClientConsensusStates implements IClientConsensusStates {
          /**
           * Constructs a new ClientConsensusStates.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IClientConsensusStates);

          /** ClientConsensusStates clientId. */
          public clientId: string;

          /** ClientConsensusStates consensusStates. */
          public consensusStates: ibc.core.client.v1.IConsensusStateWithHeight[];

          /**
           * Creates a new ClientConsensusStates instance using the specified properties.
           * @param [properties] Properties to set
           * @returns ClientConsensusStates instance
           */
          public static create(
            properties?: ibc.core.client.v1.IClientConsensusStates
          ): ibc.core.client.v1.ClientConsensusStates;

          /**
           * Encodes the specified ClientConsensusStates message. Does not implicitly {@link ibc.core.client.v1.ClientConsensusStates.verify|verify} messages.
           * @param m ClientConsensusStates message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IClientConsensusStates,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a ClientConsensusStates message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns ClientConsensusStates
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.ClientConsensusStates;

          /**
           * Creates a ClientConsensusStates message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ClientConsensusStates
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.ClientConsensusStates;

          /**
           * Creates a plain object from a ClientConsensusStates message. Also converts values to other types if specified.
           * @param m ClientConsensusStates
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.ClientConsensusStates,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this ClientConsensusStates to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a ClientUpdateProposal. */
        interface IClientUpdateProposal {
          /** ClientUpdateProposal title */
          title?: string | null;

          /** ClientUpdateProposal description */
          description?: string | null;

          /** ClientUpdateProposal clientId */
          clientId?: string | null;

          /** ClientUpdateProposal header */
          header?: google.protobuf.IAny | null;
        }

        /** Represents a ClientUpdateProposal. */
        class ClientUpdateProposal implements IClientUpdateProposal {
          /**
           * Constructs a new ClientUpdateProposal.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IClientUpdateProposal);

          /** ClientUpdateProposal title. */
          public title: string;

          /** ClientUpdateProposal description. */
          public description: string;

          /** ClientUpdateProposal clientId. */
          public clientId: string;

          /** ClientUpdateProposal header. */
          public header?: google.protobuf.IAny | null;

          /**
           * Creates a new ClientUpdateProposal instance using the specified properties.
           * @param [properties] Properties to set
           * @returns ClientUpdateProposal instance
           */
          public static create(
            properties?: ibc.core.client.v1.IClientUpdateProposal
          ): ibc.core.client.v1.ClientUpdateProposal;

          /**
           * Encodes the specified ClientUpdateProposal message. Does not implicitly {@link ibc.core.client.v1.ClientUpdateProposal.verify|verify} messages.
           * @param m ClientUpdateProposal message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IClientUpdateProposal,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a ClientUpdateProposal message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns ClientUpdateProposal
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.ClientUpdateProposal;

          /**
           * Creates a ClientUpdateProposal message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ClientUpdateProposal
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.ClientUpdateProposal;

          /**
           * Creates a plain object from a ClientUpdateProposal message. Also converts values to other types if specified.
           * @param m ClientUpdateProposal
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.ClientUpdateProposal,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this ClientUpdateProposal to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of an Height. */
        interface IHeight {
          /** Height versionNumber */
          versionNumber?: Long | null;

          /** Height versionHeight */
          versionHeight?: Long | null;
        }

        /** Represents an Height. */
        class Height implements IHeight {
          /**
           * Constructs a new Height.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IHeight);

          /** Height versionNumber. */
          public versionNumber: Long;

          /** Height versionHeight. */
          public versionHeight: Long;

          /**
           * Creates a new Height instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Height instance
           */
          public static create(
            properties?: ibc.core.client.v1.IHeight
          ): ibc.core.client.v1.Height;

          /**
           * Encodes the specified Height message. Does not implicitly {@link ibc.core.client.v1.Height.verify|verify} messages.
           * @param m Height message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IHeight,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes an Height message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Height
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.client.v1.Height;

          /**
           * Creates an Height message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Height
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.client.v1.Height;

          /**
           * Creates a plain object from an Height message. Also converts values to other types if specified.
           * @param m Height
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.Height,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Height to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }
    }

    /** Namespace commitment. */
    namespace commitment {
      /** Namespace v1. */
      namespace v1 {
        /** Properties of a MerkleRoot. */
        interface IMerkleRoot {
          /** MerkleRoot hash */
          hash?: Uint8Array | null;
        }

        /** Represents a MerkleRoot. */
        class MerkleRoot implements IMerkleRoot {
          /**
           * Constructs a new MerkleRoot.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.commitment.v1.IMerkleRoot);

          /** MerkleRoot hash. */
          public hash: Uint8Array;

          /**
           * Creates a new MerkleRoot instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MerkleRoot instance
           */
          public static create(
            properties?: ibc.core.commitment.v1.IMerkleRoot
          ): ibc.core.commitment.v1.MerkleRoot;

          /**
           * Encodes the specified MerkleRoot message. Does not implicitly {@link ibc.core.commitment.v1.MerkleRoot.verify|verify} messages.
           * @param m MerkleRoot message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.commitment.v1.IMerkleRoot,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MerkleRoot message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MerkleRoot
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.commitment.v1.MerkleRoot;

          /**
           * Creates a MerkleRoot message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MerkleRoot
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.commitment.v1.MerkleRoot;

          /**
           * Creates a plain object from a MerkleRoot message. Also converts values to other types if specified.
           * @param m MerkleRoot
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.commitment.v1.MerkleRoot,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MerkleRoot to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MerklePrefix. */
        interface IMerklePrefix {
          /** MerklePrefix keyPrefix */
          keyPrefix?: Uint8Array | null;
        }

        /** Represents a MerklePrefix. */
        class MerklePrefix implements IMerklePrefix {
          /**
           * Constructs a new MerklePrefix.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.commitment.v1.IMerklePrefix);

          /** MerklePrefix keyPrefix. */
          public keyPrefix: Uint8Array;

          /**
           * Creates a new MerklePrefix instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MerklePrefix instance
           */
          public static create(
            properties?: ibc.core.commitment.v1.IMerklePrefix
          ): ibc.core.commitment.v1.MerklePrefix;

          /**
           * Encodes the specified MerklePrefix message. Does not implicitly {@link ibc.core.commitment.v1.MerklePrefix.verify|verify} messages.
           * @param m MerklePrefix message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.commitment.v1.IMerklePrefix,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MerklePrefix message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MerklePrefix
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.commitment.v1.MerklePrefix;

          /**
           * Creates a MerklePrefix message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MerklePrefix
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.commitment.v1.MerklePrefix;

          /**
           * Creates a plain object from a MerklePrefix message. Also converts values to other types if specified.
           * @param m MerklePrefix
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.commitment.v1.MerklePrefix,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MerklePrefix to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MerklePath. */
        interface IMerklePath {
          /** MerklePath keyPath */
          keyPath?: ibc.core.commitment.v1.IKeyPath | null;
        }

        /** Represents a MerklePath. */
        class MerklePath implements IMerklePath {
          /**
           * Constructs a new MerklePath.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.commitment.v1.IMerklePath);

          /** MerklePath keyPath. */
          public keyPath?: ibc.core.commitment.v1.IKeyPath | null;

          /**
           * Creates a new MerklePath instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MerklePath instance
           */
          public static create(
            properties?: ibc.core.commitment.v1.IMerklePath
          ): ibc.core.commitment.v1.MerklePath;

          /**
           * Encodes the specified MerklePath message. Does not implicitly {@link ibc.core.commitment.v1.MerklePath.verify|verify} messages.
           * @param m MerklePath message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.commitment.v1.IMerklePath,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MerklePath message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MerklePath
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.commitment.v1.MerklePath;

          /**
           * Creates a MerklePath message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MerklePath
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.commitment.v1.MerklePath;

          /**
           * Creates a plain object from a MerklePath message. Also converts values to other types if specified.
           * @param m MerklePath
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.commitment.v1.MerklePath,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MerklePath to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MerkleProof. */
        interface IMerkleProof {
          /** MerkleProof proof */
          proof?: tendermint.crypto.IProofOps | null;
        }

        /** Represents a MerkleProof. */
        class MerkleProof implements IMerkleProof {
          /**
           * Constructs a new MerkleProof.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.commitment.v1.IMerkleProof);

          /** MerkleProof proof. */
          public proof?: tendermint.crypto.IProofOps | null;

          /**
           * Creates a new MerkleProof instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MerkleProof instance
           */
          public static create(
            properties?: ibc.core.commitment.v1.IMerkleProof
          ): ibc.core.commitment.v1.MerkleProof;

          /**
           * Encodes the specified MerkleProof message. Does not implicitly {@link ibc.core.commitment.v1.MerkleProof.verify|verify} messages.
           * @param m MerkleProof message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.commitment.v1.IMerkleProof,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a MerkleProof message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MerkleProof
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.commitment.v1.MerkleProof;

          /**
           * Creates a MerkleProof message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MerkleProof
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.commitment.v1.MerkleProof;

          /**
           * Creates a plain object from a MerkleProof message. Also converts values to other types if specified.
           * @param m MerkleProof
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.commitment.v1.MerkleProof,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this MerkleProof to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a KeyPath. */
        interface IKeyPath {
          /** KeyPath keys */
          keys?: ibc.core.commitment.v1.IKey[] | null;
        }

        /** Represents a KeyPath. */
        class KeyPath implements IKeyPath {
          /**
           * Constructs a new KeyPath.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.commitment.v1.IKeyPath);

          /** KeyPath keys. */
          public keys: ibc.core.commitment.v1.IKey[];

          /**
           * Creates a new KeyPath instance using the specified properties.
           * @param [properties] Properties to set
           * @returns KeyPath instance
           */
          public static create(
            properties?: ibc.core.commitment.v1.IKeyPath
          ): ibc.core.commitment.v1.KeyPath;

          /**
           * Encodes the specified KeyPath message. Does not implicitly {@link ibc.core.commitment.v1.KeyPath.verify|verify} messages.
           * @param m KeyPath message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.commitment.v1.IKeyPath,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a KeyPath message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns KeyPath
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.commitment.v1.KeyPath;

          /**
           * Creates a KeyPath message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns KeyPath
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.commitment.v1.KeyPath;

          /**
           * Creates a plain object from a KeyPath message. Also converts values to other types if specified.
           * @param m KeyPath
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.commitment.v1.KeyPath,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this KeyPath to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a Key. */
        interface IKey {
          /** Key name */
          name?: Uint8Array | null;

          /** Key enc */
          enc?: ibc.core.commitment.v1.KeyEncoding | null;
        }

        /** Represents a Key. */
        class Key implements IKey {
          /**
           * Constructs a new Key.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.commitment.v1.IKey);

          /** Key name. */
          public name: Uint8Array;

          /** Key enc. */
          public enc: ibc.core.commitment.v1.KeyEncoding;

          /**
           * Creates a new Key instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Key instance
           */
          public static create(
            properties?: ibc.core.commitment.v1.IKey
          ): ibc.core.commitment.v1.Key;

          /**
           * Encodes the specified Key message. Does not implicitly {@link ibc.core.commitment.v1.Key.verify|verify} messages.
           * @param m Key message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.commitment.v1.IKey,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Key message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Key
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.commitment.v1.Key;

          /**
           * Creates a Key message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Key
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.commitment.v1.Key;

          /**
           * Creates a plain object from a Key message. Also converts values to other types if specified.
           * @param m Key
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.commitment.v1.Key,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Key to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** KeyEncoding enum. */
        enum KeyEncoding {
          KEY_ENCODING_URL_UNSPECIFIED = 0,
          KEY_ENCODING_HEX = 1,
        }
      }
    }

    /** Namespace connection. */
    namespace connection {
      /** Namespace v1. */
      namespace v1 {
        /** Properties of a ConnectionEnd. */
        interface IConnectionEnd {
          /** ConnectionEnd clientId */
          clientId?: string | null;

          /** ConnectionEnd versions */
          versions?: ibc.core.connection.v1.IVersion[] | null;

          /** ConnectionEnd state */
          state?: ibc.core.connection.v1.State | null;

          /** ConnectionEnd counterparty */
          counterparty?: ibc.core.connection.v1.ICounterparty | null;
        }

        /** Represents a ConnectionEnd. */
        class ConnectionEnd implements IConnectionEnd {
          /**
           * Constructs a new ConnectionEnd.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IConnectionEnd);

          /** ConnectionEnd clientId. */
          public clientId: string;

          /** ConnectionEnd versions. */
          public versions: ibc.core.connection.v1.IVersion[];

          /** ConnectionEnd state. */
          public state: ibc.core.connection.v1.State;

          /** ConnectionEnd counterparty. */
          public counterparty?: ibc.core.connection.v1.ICounterparty | null;

          /**
           * Creates a new ConnectionEnd instance using the specified properties.
           * @param [properties] Properties to set
           * @returns ConnectionEnd instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IConnectionEnd
          ): ibc.core.connection.v1.ConnectionEnd;

          /**
           * Encodes the specified ConnectionEnd message. Does not implicitly {@link ibc.core.connection.v1.ConnectionEnd.verify|verify} messages.
           * @param m ConnectionEnd message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IConnectionEnd,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a ConnectionEnd message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns ConnectionEnd
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.ConnectionEnd;

          /**
           * Creates a ConnectionEnd message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ConnectionEnd
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.ConnectionEnd;

          /**
           * Creates a plain object from a ConnectionEnd message. Also converts values to other types if specified.
           * @param m ConnectionEnd
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.ConnectionEnd,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this ConnectionEnd to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of an IdentifiedConnection. */
        interface IIdentifiedConnection {
          /** IdentifiedConnection id */
          id?: string | null;

          /** IdentifiedConnection clientId */
          clientId?: string | null;

          /** IdentifiedConnection versions */
          versions?: ibc.core.connection.v1.IVersion[] | null;

          /** IdentifiedConnection state */
          state?: ibc.core.connection.v1.State | null;

          /** IdentifiedConnection counterparty */
          counterparty?: ibc.core.connection.v1.ICounterparty | null;
        }

        /** Represents an IdentifiedConnection. */
        class IdentifiedConnection implements IIdentifiedConnection {
          /**
           * Constructs a new IdentifiedConnection.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IIdentifiedConnection);

          /** IdentifiedConnection id. */
          public id: string;

          /** IdentifiedConnection clientId. */
          public clientId: string;

          /** IdentifiedConnection versions. */
          public versions: ibc.core.connection.v1.IVersion[];

          /** IdentifiedConnection state. */
          public state: ibc.core.connection.v1.State;

          /** IdentifiedConnection counterparty. */
          public counterparty?: ibc.core.connection.v1.ICounterparty | null;

          /**
           * Creates a new IdentifiedConnection instance using the specified properties.
           * @param [properties] Properties to set
           * @returns IdentifiedConnection instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IIdentifiedConnection
          ): ibc.core.connection.v1.IdentifiedConnection;

          /**
           * Encodes the specified IdentifiedConnection message. Does not implicitly {@link ibc.core.connection.v1.IdentifiedConnection.verify|verify} messages.
           * @param m IdentifiedConnection message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IIdentifiedConnection,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes an IdentifiedConnection message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns IdentifiedConnection
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.IdentifiedConnection;

          /**
           * Creates an IdentifiedConnection message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns IdentifiedConnection
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.IdentifiedConnection;

          /**
           * Creates a plain object from an IdentifiedConnection message. Also converts values to other types if specified.
           * @param m IdentifiedConnection
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.IdentifiedConnection,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this IdentifiedConnection to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** State enum. */
        enum State {
          STATE_UNINITIALIZED_UNSPECIFIED = 0,
          STATE_INIT = 1,
          STATE_TRYOPEN = 2,
          STATE_OPEN = 3,
        }

        /** Properties of a Counterparty. */
        interface ICounterparty {
          /** Counterparty clientId */
          clientId?: string | null;

          /** Counterparty connectionId */
          connectionId?: string | null;

          /** Counterparty prefix */
          prefix?: ibc.core.commitment.v1.IMerklePrefix | null;
        }

        /** Represents a Counterparty. */
        class Counterparty implements ICounterparty {
          /**
           * Constructs a new Counterparty.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.ICounterparty);

          /** Counterparty clientId. */
          public clientId: string;

          /** Counterparty connectionId. */
          public connectionId: string;

          /** Counterparty prefix. */
          public prefix?: ibc.core.commitment.v1.IMerklePrefix | null;

          /**
           * Creates a new Counterparty instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Counterparty instance
           */
          public static create(
            properties?: ibc.core.connection.v1.ICounterparty
          ): ibc.core.connection.v1.Counterparty;

          /**
           * Encodes the specified Counterparty message. Does not implicitly {@link ibc.core.connection.v1.Counterparty.verify|verify} messages.
           * @param m Counterparty message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.ICounterparty,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Counterparty message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Counterparty
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.Counterparty;

          /**
           * Creates a Counterparty message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Counterparty
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.Counterparty;

          /**
           * Creates a plain object from a Counterparty message. Also converts values to other types if specified.
           * @param m Counterparty
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.Counterparty,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Counterparty to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a ClientPaths. */
        interface IClientPaths {
          /** ClientPaths paths */
          paths?: string[] | null;
        }

        /** Represents a ClientPaths. */
        class ClientPaths implements IClientPaths {
          /**
           * Constructs a new ClientPaths.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IClientPaths);

          /** ClientPaths paths. */
          public paths: string[];

          /**
           * Creates a new ClientPaths instance using the specified properties.
           * @param [properties] Properties to set
           * @returns ClientPaths instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IClientPaths
          ): ibc.core.connection.v1.ClientPaths;

          /**
           * Encodes the specified ClientPaths message. Does not implicitly {@link ibc.core.connection.v1.ClientPaths.verify|verify} messages.
           * @param m ClientPaths message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IClientPaths,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a ClientPaths message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns ClientPaths
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.ClientPaths;

          /**
           * Creates a ClientPaths message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ClientPaths
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.ClientPaths;

          /**
           * Creates a plain object from a ClientPaths message. Also converts values to other types if specified.
           * @param m ClientPaths
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.ClientPaths,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this ClientPaths to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConnectionPaths. */
        interface IConnectionPaths {
          /** ConnectionPaths clientId */
          clientId?: string | null;

          /** ConnectionPaths paths */
          paths?: string[] | null;
        }

        /** Represents a ConnectionPaths. */
        class ConnectionPaths implements IConnectionPaths {
          /**
           * Constructs a new ConnectionPaths.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IConnectionPaths);

          /** ConnectionPaths clientId. */
          public clientId: string;

          /** ConnectionPaths paths. */
          public paths: string[];

          /**
           * Creates a new ConnectionPaths instance using the specified properties.
           * @param [properties] Properties to set
           * @returns ConnectionPaths instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IConnectionPaths
          ): ibc.core.connection.v1.ConnectionPaths;

          /**
           * Encodes the specified ConnectionPaths message. Does not implicitly {@link ibc.core.connection.v1.ConnectionPaths.verify|verify} messages.
           * @param m ConnectionPaths message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IConnectionPaths,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a ConnectionPaths message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns ConnectionPaths
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.ConnectionPaths;

          /**
           * Creates a ConnectionPaths message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ConnectionPaths
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.ConnectionPaths;

          /**
           * Creates a plain object from a ConnectionPaths message. Also converts values to other types if specified.
           * @param m ConnectionPaths
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.ConnectionPaths,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this ConnectionPaths to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a Version. */
        interface IVersion {
          /** Version identifier */
          identifier?: string | null;

          /** Version features */
          features?: string[] | null;
        }

        /** Represents a Version. */
        class Version implements IVersion {
          /**
           * Constructs a new Version.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IVersion);

          /** Version identifier. */
          public identifier: string;

          /** Version features. */
          public features: string[];

          /**
           * Creates a new Version instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Version instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IVersion
          ): ibc.core.connection.v1.Version;

          /**
           * Encodes the specified Version message. Does not implicitly {@link ibc.core.connection.v1.Version.verify|verify} messages.
           * @param m Version message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IVersion,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a Version message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Version
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.Version;

          /**
           * Creates a Version message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Version
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.Version;

          /**
           * Creates a plain object from a Version message. Also converts values to other types if specified.
           * @param m Version
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.Version,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this Version to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Represents a Query */
        class Query extends $protobuf.rpc.Service {
          /**
           * Constructs a new Query service.
           * @param rpcImpl RPC implementation
           * @param [requestDelimited=false] Whether requests are length-delimited
           * @param [responseDelimited=false] Whether responses are length-delimited
           */
          constructor(
            rpcImpl: $protobuf.RPCImpl,
            requestDelimited?: boolean,
            responseDelimited?: boolean
          );

          /**
           * Creates new Query service using the specified rpc implementation.
           * @param rpcImpl RPC implementation
           * @param [requestDelimited=false] Whether requests are length-delimited
           * @param [responseDelimited=false] Whether responses are length-delimited
           * @returns RPC service. Useful where requests and/or responses are streamed.
           */
          public static create(
            rpcImpl: $protobuf.RPCImpl,
            requestDelimited?: boolean,
            responseDelimited?: boolean
          ): Query;

          /**
           * Calls Connection.
           * @param request QueryConnectionRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryConnectionResponse
           */
          public connection(
            request: ibc.core.connection.v1.IQueryConnectionRequest,
            callback: ibc.core.connection.v1.Query.ConnectionCallback
          ): void;

          /**
           * Calls Connection.
           * @param request QueryConnectionRequest message or plain object
           * @returns Promise
           */
          public connection(
            request: ibc.core.connection.v1.IQueryConnectionRequest
          ): Promise<ibc.core.connection.v1.QueryConnectionResponse>;

          /**
           * Calls Connections.
           * @param request QueryConnectionsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryConnectionsResponse
           */
          public connections(
            request: ibc.core.connection.v1.IQueryConnectionsRequest,
            callback: ibc.core.connection.v1.Query.ConnectionsCallback
          ): void;

          /**
           * Calls Connections.
           * @param request QueryConnectionsRequest message or plain object
           * @returns Promise
           */
          public connections(
            request: ibc.core.connection.v1.IQueryConnectionsRequest
          ): Promise<ibc.core.connection.v1.QueryConnectionsResponse>;

          /**
           * Calls ClientConnections.
           * @param request QueryClientConnectionsRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryClientConnectionsResponse
           */
          public clientConnections(
            request: ibc.core.connection.v1.IQueryClientConnectionsRequest,
            callback: ibc.core.connection.v1.Query.ClientConnectionsCallback
          ): void;

          /**
           * Calls ClientConnections.
           * @param request QueryClientConnectionsRequest message or plain object
           * @returns Promise
           */
          public clientConnections(
            request: ibc.core.connection.v1.IQueryClientConnectionsRequest
          ): Promise<ibc.core.connection.v1.QueryClientConnectionsResponse>;

          /**
           * Calls ConnectionClientState.
           * @param request QueryConnectionClientStateRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryConnectionClientStateResponse
           */
          public connectionClientState(
            request: ibc.core.connection.v1.IQueryConnectionClientStateRequest,
            callback: ibc.core.connection.v1.Query.ConnectionClientStateCallback
          ): void;

          /**
           * Calls ConnectionClientState.
           * @param request QueryConnectionClientStateRequest message or plain object
           * @returns Promise
           */
          public connectionClientState(
            request: ibc.core.connection.v1.IQueryConnectionClientStateRequest
          ): Promise<ibc.core.connection.v1.QueryConnectionClientStateResponse>;

          /**
           * Calls ConnectionConsensusState.
           * @param request QueryConnectionConsensusStateRequest message or plain object
           * @param callback Node-style callback called with the error, if any, and QueryConnectionConsensusStateResponse
           */
          public connectionConsensusState(
            request: ibc.core.connection.v1.IQueryConnectionConsensusStateRequest,
            callback: ibc.core.connection.v1.Query.ConnectionConsensusStateCallback
          ): void;

          /**
           * Calls ConnectionConsensusState.
           * @param request QueryConnectionConsensusStateRequest message or plain object
           * @returns Promise
           */
          public connectionConsensusState(
            request: ibc.core.connection.v1.IQueryConnectionConsensusStateRequest
          ): Promise<ibc.core.connection.v1.QueryConnectionConsensusStateResponse>;
        }

        namespace Query {
          /**
           * Callback as used by {@link ibc.core.connection.v1.Query#connection}.
           * @param error Error, if any
           * @param [response] QueryConnectionResponse
           */
          type ConnectionCallback = (
            error: Error | null,
            response?: ibc.core.connection.v1.QueryConnectionResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.connection.v1.Query#connections}.
           * @param error Error, if any
           * @param [response] QueryConnectionsResponse
           */
          type ConnectionsCallback = (
            error: Error | null,
            response?: ibc.core.connection.v1.QueryConnectionsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.connection.v1.Query#clientConnections}.
           * @param error Error, if any
           * @param [response] QueryClientConnectionsResponse
           */
          type ClientConnectionsCallback = (
            error: Error | null,
            response?: ibc.core.connection.v1.QueryClientConnectionsResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.connection.v1.Query#connectionClientState}.
           * @param error Error, if any
           * @param [response] QueryConnectionClientStateResponse
           */
          type ConnectionClientStateCallback = (
            error: Error | null,
            response?: ibc.core.connection.v1.QueryConnectionClientStateResponse
          ) => void;

          /**
           * Callback as used by {@link ibc.core.connection.v1.Query#connectionConsensusState}.
           * @param error Error, if any
           * @param [response] QueryConnectionConsensusStateResponse
           */
          type ConnectionConsensusStateCallback = (
            error: Error | null,
            response?: ibc.core.connection.v1.QueryConnectionConsensusStateResponse
          ) => void;
        }

        /** Properties of a QueryConnectionRequest. */
        interface IQueryConnectionRequest {
          /** QueryConnectionRequest connectionId */
          connectionId?: string | null;
        }

        /** Represents a QueryConnectionRequest. */
        class QueryConnectionRequest implements IQueryConnectionRequest {
          /**
           * Constructs a new QueryConnectionRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IQueryConnectionRequest);

          /** QueryConnectionRequest connectionId. */
          public connectionId: string;

          /**
           * Creates a new QueryConnectionRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionRequest instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionRequest
          ): ibc.core.connection.v1.QueryConnectionRequest;

          /**
           * Encodes the specified QueryConnectionRequest message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionRequest.verify|verify} messages.
           * @param m QueryConnectionRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionRequest;

          /**
           * Creates a QueryConnectionRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionRequest;

          /**
           * Creates a plain object from a QueryConnectionRequest message. Also converts values to other types if specified.
           * @param m QueryConnectionRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionResponse. */
        interface IQueryConnectionResponse {
          /** QueryConnectionResponse connection */
          connection?: ibc.core.connection.v1.IConnectionEnd | null;

          /** QueryConnectionResponse proof */
          proof?: Uint8Array | null;

          /** QueryConnectionResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryConnectionResponse. */
        class QueryConnectionResponse implements IQueryConnectionResponse {
          /**
           * Constructs a new QueryConnectionResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IQueryConnectionResponse);

          /** QueryConnectionResponse connection. */
          public connection?: ibc.core.connection.v1.IConnectionEnd | null;

          /** QueryConnectionResponse proof. */
          public proof: Uint8Array;

          /** QueryConnectionResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryConnectionResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionResponse instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionResponse
          ): ibc.core.connection.v1.QueryConnectionResponse;

          /**
           * Encodes the specified QueryConnectionResponse message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionResponse.verify|verify} messages.
           * @param m QueryConnectionResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionResponse;

          /**
           * Creates a QueryConnectionResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionResponse;

          /**
           * Creates a plain object from a QueryConnectionResponse message. Also converts values to other types if specified.
           * @param m QueryConnectionResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionsRequest. */
        interface IQueryConnectionsRequest {
          /** QueryConnectionsRequest pagination */
          pagination?: cosmos.base.query.v1beta1.IPageRequest | null;
        }

        /** Represents a QueryConnectionsRequest. */
        class QueryConnectionsRequest implements IQueryConnectionsRequest {
          /**
           * Constructs a new QueryConnectionsRequest.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IQueryConnectionsRequest);

          /** QueryConnectionsRequest pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageRequest | null;

          /**
           * Creates a new QueryConnectionsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionsRequest instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionsRequest
          ): ibc.core.connection.v1.QueryConnectionsRequest;

          /**
           * Encodes the specified QueryConnectionsRequest message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionsRequest.verify|verify} messages.
           * @param m QueryConnectionsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionsRequest;

          /**
           * Creates a QueryConnectionsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionsRequest;

          /**
           * Creates a plain object from a QueryConnectionsRequest message. Also converts values to other types if specified.
           * @param m QueryConnectionsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionsResponse. */
        interface IQueryConnectionsResponse {
          /** QueryConnectionsResponse connections */
          connections?: ibc.core.connection.v1.IIdentifiedConnection[] | null;

          /** QueryConnectionsResponse pagination */
          pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryConnectionsResponse height */
          height?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryConnectionsResponse. */
        class QueryConnectionsResponse implements IQueryConnectionsResponse {
          /**
           * Constructs a new QueryConnectionsResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.connection.v1.IQueryConnectionsResponse);

          /** QueryConnectionsResponse connections. */
          public connections: ibc.core.connection.v1.IIdentifiedConnection[];

          /** QueryConnectionsResponse pagination. */
          public pagination?: cosmos.base.query.v1beta1.IPageResponse | null;

          /** QueryConnectionsResponse height. */
          public height?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryConnectionsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionsResponse instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionsResponse
          ): ibc.core.connection.v1.QueryConnectionsResponse;

          /**
           * Encodes the specified QueryConnectionsResponse message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionsResponse.verify|verify} messages.
           * @param m QueryConnectionsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionsResponse;

          /**
           * Creates a QueryConnectionsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionsResponse;

          /**
           * Creates a plain object from a QueryConnectionsResponse message. Also converts values to other types if specified.
           * @param m QueryConnectionsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryClientConnectionsRequest. */
        interface IQueryClientConnectionsRequest {
          /** QueryClientConnectionsRequest clientId */
          clientId?: string | null;
        }

        /** Represents a QueryClientConnectionsRequest. */
        class QueryClientConnectionsRequest
          implements IQueryClientConnectionsRequest {
          /**
           * Constructs a new QueryClientConnectionsRequest.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.connection.v1.IQueryClientConnectionsRequest
          );

          /** QueryClientConnectionsRequest clientId. */
          public clientId: string;

          /**
           * Creates a new QueryClientConnectionsRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryClientConnectionsRequest instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryClientConnectionsRequest
          ): ibc.core.connection.v1.QueryClientConnectionsRequest;

          /**
           * Encodes the specified QueryClientConnectionsRequest message. Does not implicitly {@link ibc.core.connection.v1.QueryClientConnectionsRequest.verify|verify} messages.
           * @param m QueryClientConnectionsRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryClientConnectionsRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryClientConnectionsRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryClientConnectionsRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryClientConnectionsRequest;

          /**
           * Creates a QueryClientConnectionsRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryClientConnectionsRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryClientConnectionsRequest;

          /**
           * Creates a plain object from a QueryClientConnectionsRequest message. Also converts values to other types if specified.
           * @param m QueryClientConnectionsRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryClientConnectionsRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryClientConnectionsRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryClientConnectionsResponse. */
        interface IQueryClientConnectionsResponse {
          /** QueryClientConnectionsResponse connectionPaths */
          connectionPaths?: string[] | null;

          /** QueryClientConnectionsResponse proof */
          proof?: Uint8Array | null;

          /** QueryClientConnectionsResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryClientConnectionsResponse. */
        class QueryClientConnectionsResponse
          implements IQueryClientConnectionsResponse {
          /**
           * Constructs a new QueryClientConnectionsResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.connection.v1.IQueryClientConnectionsResponse
          );

          /** QueryClientConnectionsResponse connectionPaths. */
          public connectionPaths: string[];

          /** QueryClientConnectionsResponse proof. */
          public proof: Uint8Array;

          /** QueryClientConnectionsResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryClientConnectionsResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryClientConnectionsResponse instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryClientConnectionsResponse
          ): ibc.core.connection.v1.QueryClientConnectionsResponse;

          /**
           * Encodes the specified QueryClientConnectionsResponse message. Does not implicitly {@link ibc.core.connection.v1.QueryClientConnectionsResponse.verify|verify} messages.
           * @param m QueryClientConnectionsResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryClientConnectionsResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryClientConnectionsResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryClientConnectionsResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryClientConnectionsResponse;

          /**
           * Creates a QueryClientConnectionsResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryClientConnectionsResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryClientConnectionsResponse;

          /**
           * Creates a plain object from a QueryClientConnectionsResponse message. Also converts values to other types if specified.
           * @param m QueryClientConnectionsResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryClientConnectionsResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryClientConnectionsResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionClientStateRequest. */
        interface IQueryConnectionClientStateRequest {
          /** QueryConnectionClientStateRequest connectionId */
          connectionId?: string | null;
        }

        /** Represents a QueryConnectionClientStateRequest. */
        class QueryConnectionClientStateRequest
          implements IQueryConnectionClientStateRequest {
          /**
           * Constructs a new QueryConnectionClientStateRequest.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.connection.v1.IQueryConnectionClientStateRequest
          );

          /** QueryConnectionClientStateRequest connectionId. */
          public connectionId: string;

          /**
           * Creates a new QueryConnectionClientStateRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionClientStateRequest instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionClientStateRequest
          ): ibc.core.connection.v1.QueryConnectionClientStateRequest;

          /**
           * Encodes the specified QueryConnectionClientStateRequest message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionClientStateRequest.verify|verify} messages.
           * @param m QueryConnectionClientStateRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionClientStateRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionClientStateRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionClientStateRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionClientStateRequest;

          /**
           * Creates a QueryConnectionClientStateRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionClientStateRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionClientStateRequest;

          /**
           * Creates a plain object from a QueryConnectionClientStateRequest message. Also converts values to other types if specified.
           * @param m QueryConnectionClientStateRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionClientStateRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionClientStateRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionClientStateResponse. */
        interface IQueryConnectionClientStateResponse {
          /** QueryConnectionClientStateResponse identifiedClientState */
          identifiedClientState?: ibc.core.client.v1.IIdentifiedClientState | null;

          /** QueryConnectionClientStateResponse proof */
          proof?: Uint8Array | null;

          /** QueryConnectionClientStateResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryConnectionClientStateResponse. */
        class QueryConnectionClientStateResponse
          implements IQueryConnectionClientStateResponse {
          /**
           * Constructs a new QueryConnectionClientStateResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.connection.v1.IQueryConnectionClientStateResponse
          );

          /** QueryConnectionClientStateResponse identifiedClientState. */
          public identifiedClientState?: ibc.core.client.v1.IIdentifiedClientState | null;

          /** QueryConnectionClientStateResponse proof. */
          public proof: Uint8Array;

          /** QueryConnectionClientStateResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryConnectionClientStateResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionClientStateResponse instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionClientStateResponse
          ): ibc.core.connection.v1.QueryConnectionClientStateResponse;

          /**
           * Encodes the specified QueryConnectionClientStateResponse message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionClientStateResponse.verify|verify} messages.
           * @param m QueryConnectionClientStateResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionClientStateResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionClientStateResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionClientStateResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionClientStateResponse;

          /**
           * Creates a QueryConnectionClientStateResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionClientStateResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionClientStateResponse;

          /**
           * Creates a plain object from a QueryConnectionClientStateResponse message. Also converts values to other types if specified.
           * @param m QueryConnectionClientStateResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionClientStateResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionClientStateResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionConsensusStateRequest. */
        interface IQueryConnectionConsensusStateRequest {
          /** QueryConnectionConsensusStateRequest connectionId */
          connectionId?: string | null;

          /** QueryConnectionConsensusStateRequest versionNumber */
          versionNumber?: Long | null;

          /** QueryConnectionConsensusStateRequest versionHeight */
          versionHeight?: Long | null;
        }

        /** Represents a QueryConnectionConsensusStateRequest. */
        class QueryConnectionConsensusStateRequest
          implements IQueryConnectionConsensusStateRequest {
          /**
           * Constructs a new QueryConnectionConsensusStateRequest.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.connection.v1.IQueryConnectionConsensusStateRequest
          );

          /** QueryConnectionConsensusStateRequest connectionId. */
          public connectionId: string;

          /** QueryConnectionConsensusStateRequest versionNumber. */
          public versionNumber: Long;

          /** QueryConnectionConsensusStateRequest versionHeight. */
          public versionHeight: Long;

          /**
           * Creates a new QueryConnectionConsensusStateRequest instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionConsensusStateRequest instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionConsensusStateRequest
          ): ibc.core.connection.v1.QueryConnectionConsensusStateRequest;

          /**
           * Encodes the specified QueryConnectionConsensusStateRequest message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionConsensusStateRequest.verify|verify} messages.
           * @param m QueryConnectionConsensusStateRequest message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionConsensusStateRequest,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionConsensusStateRequest message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionConsensusStateRequest
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionConsensusStateRequest;

          /**
           * Creates a QueryConnectionConsensusStateRequest message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionConsensusStateRequest
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionConsensusStateRequest;

          /**
           * Creates a plain object from a QueryConnectionConsensusStateRequest message. Also converts values to other types if specified.
           * @param m QueryConnectionConsensusStateRequest
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionConsensusStateRequest,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionConsensusStateRequest to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a QueryConnectionConsensusStateResponse. */
        interface IQueryConnectionConsensusStateResponse {
          /** QueryConnectionConsensusStateResponse consensusState */
          consensusState?: google.protobuf.IAny | null;

          /** QueryConnectionConsensusStateResponse clientId */
          clientId?: string | null;

          /** QueryConnectionConsensusStateResponse proof */
          proof?: Uint8Array | null;

          /** QueryConnectionConsensusStateResponse proofHeight */
          proofHeight?: ibc.core.client.v1.IHeight | null;
        }

        /** Represents a QueryConnectionConsensusStateResponse. */
        class QueryConnectionConsensusStateResponse
          implements IQueryConnectionConsensusStateResponse {
          /**
           * Constructs a new QueryConnectionConsensusStateResponse.
           * @param [p] Properties to set
           */
          constructor(
            p?: ibc.core.connection.v1.IQueryConnectionConsensusStateResponse
          );

          /** QueryConnectionConsensusStateResponse consensusState. */
          public consensusState?: google.protobuf.IAny | null;

          /** QueryConnectionConsensusStateResponse clientId. */
          public clientId: string;

          /** QueryConnectionConsensusStateResponse proof. */
          public proof: Uint8Array;

          /** QueryConnectionConsensusStateResponse proofHeight. */
          public proofHeight?: ibc.core.client.v1.IHeight | null;

          /**
           * Creates a new QueryConnectionConsensusStateResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns QueryConnectionConsensusStateResponse instance
           */
          public static create(
            properties?: ibc.core.connection.v1.IQueryConnectionConsensusStateResponse
          ): ibc.core.connection.v1.QueryConnectionConsensusStateResponse;

          /**
           * Encodes the specified QueryConnectionConsensusStateResponse message. Does not implicitly {@link ibc.core.connection.v1.QueryConnectionConsensusStateResponse.verify|verify} messages.
           * @param m QueryConnectionConsensusStateResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.connection.v1.IQueryConnectionConsensusStateResponse,
            w?: $protobuf.Writer
          ): $protobuf.Writer;

          /**
           * Decodes a QueryConnectionConsensusStateResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns QueryConnectionConsensusStateResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number
          ): ibc.core.connection.v1.QueryConnectionConsensusStateResponse;

          /**
           * Creates a QueryConnectionConsensusStateResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns QueryConnectionConsensusStateResponse
           */
          public static fromObject(d: {
            [k: string]: any;
          }): ibc.core.connection.v1.QueryConnectionConsensusStateResponse;

          /**
           * Creates a plain object from a QueryConnectionConsensusStateResponse message. Also converts values to other types if specified.
           * @param m QueryConnectionConsensusStateResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.connection.v1.QueryConnectionConsensusStateResponse,
            o?: $protobuf.IConversionOptions
          ): { [k: string]: any };

          /**
           * Converts this QueryConnectionConsensusStateResponse to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }
    }
  }
}

/** Namespace tendermint. */
export namespace tendermint {
  /** Namespace crypto. */
  namespace crypto {
    /** Properties of a PublicKey. */
    interface IPublicKey {
      /** PublicKey ed25519 */
      ed25519?: Uint8Array | null;

      /** PublicKey secp256k1 */
      secp256k1?: Uint8Array | null;
    }

    /** Represents a PublicKey. */
    class PublicKey implements IPublicKey {
      /**
       * Constructs a new PublicKey.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.crypto.IPublicKey);

      /** PublicKey ed25519. */
      public ed25519: Uint8Array;

      /** PublicKey secp256k1. */
      public secp256k1: Uint8Array;

      /** PublicKey sum. */
      public sum?: "ed25519" | "secp256k1";

      /**
       * Creates a new PublicKey instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PublicKey instance
       */
      public static create(
        properties?: tendermint.crypto.IPublicKey
      ): tendermint.crypto.PublicKey;

      /**
       * Encodes the specified PublicKey message. Does not implicitly {@link tendermint.crypto.PublicKey.verify|verify} messages.
       * @param m PublicKey message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.crypto.IPublicKey,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PublicKey message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns PublicKey
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.crypto.PublicKey;

      /**
       * Creates a PublicKey message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns PublicKey
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.crypto.PublicKey;

      /**
       * Creates a plain object from a PublicKey message. Also converts values to other types if specified.
       * @param m PublicKey
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.PublicKey,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PublicKey to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Proof. */
    interface IProof {
      /** Proof total */
      total?: Long | null;

      /** Proof index */
      index?: Long | null;

      /** Proof leafHash */
      leafHash?: Uint8Array | null;

      /** Proof aunts */
      aunts?: Uint8Array[] | null;
    }

    /** Represents a Proof. */
    class Proof implements IProof {
      /**
       * Constructs a new Proof.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.crypto.IProof);

      /** Proof total. */
      public total: Long;

      /** Proof index. */
      public index: Long;

      /** Proof leafHash. */
      public leafHash: Uint8Array;

      /** Proof aunts. */
      public aunts: Uint8Array[];

      /**
       * Creates a new Proof instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Proof instance
       */
      public static create(
        properties?: tendermint.crypto.IProof
      ): tendermint.crypto.Proof;

      /**
       * Encodes the specified Proof message. Does not implicitly {@link tendermint.crypto.Proof.verify|verify} messages.
       * @param m Proof message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.crypto.IProof,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Proof message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Proof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.crypto.Proof;

      /**
       * Creates a Proof message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Proof
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.crypto.Proof;

      /**
       * Creates a plain object from a Proof message. Also converts values to other types if specified.
       * @param m Proof
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.Proof,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Proof to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a ValueOp. */
    interface IValueOp {
      /** ValueOp key */
      key?: Uint8Array | null;

      /** ValueOp proof */
      proof?: tendermint.crypto.IProof | null;
    }

    /** Represents a ValueOp. */
    class ValueOp implements IValueOp {
      /**
       * Constructs a new ValueOp.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.crypto.IValueOp);

      /** ValueOp key. */
      public key: Uint8Array;

      /** ValueOp proof. */
      public proof?: tendermint.crypto.IProof | null;

      /**
       * Creates a new ValueOp instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ValueOp instance
       */
      public static create(
        properties?: tendermint.crypto.IValueOp
      ): tendermint.crypto.ValueOp;

      /**
       * Encodes the specified ValueOp message. Does not implicitly {@link tendermint.crypto.ValueOp.verify|verify} messages.
       * @param m ValueOp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.crypto.IValueOp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ValueOp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ValueOp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.crypto.ValueOp;

      /**
       * Creates a ValueOp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ValueOp
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.crypto.ValueOp;

      /**
       * Creates a plain object from a ValueOp message. Also converts values to other types if specified.
       * @param m ValueOp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.ValueOp,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ValueOp to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a DominoOp. */
    interface IDominoOp {
      /** DominoOp key */
      key?: string | null;

      /** DominoOp input */
      input?: string | null;

      /** DominoOp output */
      output?: string | null;
    }

    /** Represents a DominoOp. */
    class DominoOp implements IDominoOp {
      /**
       * Constructs a new DominoOp.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.crypto.IDominoOp);

      /** DominoOp key. */
      public key: string;

      /** DominoOp input. */
      public input: string;

      /** DominoOp output. */
      public output: string;

      /**
       * Creates a new DominoOp instance using the specified properties.
       * @param [properties] Properties to set
       * @returns DominoOp instance
       */
      public static create(
        properties?: tendermint.crypto.IDominoOp
      ): tendermint.crypto.DominoOp;

      /**
       * Encodes the specified DominoOp message. Does not implicitly {@link tendermint.crypto.DominoOp.verify|verify} messages.
       * @param m DominoOp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.crypto.IDominoOp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a DominoOp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns DominoOp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.crypto.DominoOp;

      /**
       * Creates a DominoOp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns DominoOp
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.crypto.DominoOp;

      /**
       * Creates a plain object from a DominoOp message. Also converts values to other types if specified.
       * @param m DominoOp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.DominoOp,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this DominoOp to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a ProofOp. */
    interface IProofOp {
      /** ProofOp type */
      type?: string | null;

      /** ProofOp key */
      key?: Uint8Array | null;

      /** ProofOp data */
      data?: Uint8Array | null;
    }

    /** Represents a ProofOp. */
    class ProofOp implements IProofOp {
      /**
       * Constructs a new ProofOp.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.crypto.IProofOp);

      /** ProofOp type. */
      public type: string;

      /** ProofOp key. */
      public key: Uint8Array;

      /** ProofOp data. */
      public data: Uint8Array;

      /**
       * Creates a new ProofOp instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ProofOp instance
       */
      public static create(
        properties?: tendermint.crypto.IProofOp
      ): tendermint.crypto.ProofOp;

      /**
       * Encodes the specified ProofOp message. Does not implicitly {@link tendermint.crypto.ProofOp.verify|verify} messages.
       * @param m ProofOp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.crypto.IProofOp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ProofOp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ProofOp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.crypto.ProofOp;

      /**
       * Creates a ProofOp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ProofOp
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.crypto.ProofOp;

      /**
       * Creates a plain object from a ProofOp message. Also converts values to other types if specified.
       * @param m ProofOp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.ProofOp,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ProofOp to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a ProofOps. */
    interface IProofOps {
      /** ProofOps ops */
      ops?: tendermint.crypto.IProofOp[] | null;
    }

    /** Represents a ProofOps. */
    class ProofOps implements IProofOps {
      /**
       * Constructs a new ProofOps.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.crypto.IProofOps);

      /** ProofOps ops. */
      public ops: tendermint.crypto.IProofOp[];

      /**
       * Creates a new ProofOps instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ProofOps instance
       */
      public static create(
        properties?: tendermint.crypto.IProofOps
      ): tendermint.crypto.ProofOps;

      /**
       * Encodes the specified ProofOps message. Does not implicitly {@link tendermint.crypto.ProofOps.verify|verify} messages.
       * @param m ProofOps message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.crypto.IProofOps,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ProofOps message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ProofOps
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.crypto.ProofOps;

      /**
       * Creates a ProofOps message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ProofOps
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.crypto.ProofOps;

      /**
       * Creates a plain object from a ProofOps message. Also converts values to other types if specified.
       * @param m ProofOps
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.ProofOps,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ProofOps to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Namespace libs. */
  namespace libs {
    /** Namespace bits. */
    namespace bits {
      /** Properties of a BitArray. */
      interface IBitArray {
        /** BitArray bits */
        bits?: Long | null;

        /** BitArray elems */
        elems?: Long[] | null;
      }

      /** Represents a BitArray. */
      class BitArray implements IBitArray {
        /**
         * Constructs a new BitArray.
         * @param [p] Properties to set
         */
        constructor(p?: tendermint.libs.bits.IBitArray);

        /** BitArray bits. */
        public bits: Long;

        /** BitArray elems. */
        public elems: Long[];

        /**
         * Creates a new BitArray instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BitArray instance
         */
        public static create(
          properties?: tendermint.libs.bits.IBitArray
        ): tendermint.libs.bits.BitArray;

        /**
         * Encodes the specified BitArray message. Does not implicitly {@link tendermint.libs.bits.BitArray.verify|verify} messages.
         * @param m BitArray message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: tendermint.libs.bits.IBitArray,
          w?: $protobuf.Writer
        ): $protobuf.Writer;

        /**
         * Decodes a BitArray message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns BitArray
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(
          r: $protobuf.Reader | Uint8Array,
          l?: number
        ): tendermint.libs.bits.BitArray;

        /**
         * Creates a BitArray message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns BitArray
         */
        public static fromObject(d: {
          [k: string]: any;
        }): tendermint.libs.bits.BitArray;

        /**
         * Creates a plain object from a BitArray message. Also converts values to other types if specified.
         * @param m BitArray
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: tendermint.libs.bits.BitArray,
          o?: $protobuf.IConversionOptions
        ): { [k: string]: any };

        /**
         * Converts this BitArray to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace types. */
  namespace types {
    /** BlockIDFlag enum. */
    enum BlockIDFlag {
      BLOCK_ID_FLAG_UNKNOWN = 0,
      BLOCK_ID_FLAG_ABSENT = 1,
      BLOCK_ID_FLAG_COMMIT = 2,
      BLOCK_ID_FLAG_NIL = 3,
    }

    /** SignedMsgType enum. */
    enum SignedMsgType {
      SIGNED_MSG_TYPE_UNKNOWN = 0,
      SIGNED_MSG_TYPE_PREVOTE = 1,
      SIGNED_MSG_TYPE_PRECOMMIT = 2,
      SIGNED_MSG_TYPE_PROPOSAL = 32,
    }

    /** Properties of a PartSetHeader. */
    interface IPartSetHeader {
      /** PartSetHeader total */
      total?: number | null;

      /** PartSetHeader hash */
      hash?: Uint8Array | null;
    }

    /** Represents a PartSetHeader. */
    class PartSetHeader implements IPartSetHeader {
      /**
       * Constructs a new PartSetHeader.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IPartSetHeader);

      /** PartSetHeader total. */
      public total: number;

      /** PartSetHeader hash. */
      public hash: Uint8Array;

      /**
       * Creates a new PartSetHeader instance using the specified properties.
       * @param [properties] Properties to set
       * @returns PartSetHeader instance
       */
      public static create(
        properties?: tendermint.types.IPartSetHeader
      ): tendermint.types.PartSetHeader;

      /**
       * Encodes the specified PartSetHeader message. Does not implicitly {@link tendermint.types.PartSetHeader.verify|verify} messages.
       * @param m PartSetHeader message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IPartSetHeader,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a PartSetHeader message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns PartSetHeader
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.PartSetHeader;

      /**
       * Creates a PartSetHeader message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns PartSetHeader
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.PartSetHeader;

      /**
       * Creates a plain object from a PartSetHeader message. Also converts values to other types if specified.
       * @param m PartSetHeader
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.PartSetHeader,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this PartSetHeader to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Part. */
    interface IPart {
      /** Part index */
      index?: number | null;

      /** Part bytes */
      bytes?: Uint8Array | null;

      /** Part proof */
      proof?: tendermint.crypto.IProof | null;
    }

    /** Represents a Part. */
    class Part implements IPart {
      /**
       * Constructs a new Part.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IPart);

      /** Part index. */
      public index: number;

      /** Part bytes. */
      public bytes: Uint8Array;

      /** Part proof. */
      public proof?: tendermint.crypto.IProof | null;

      /**
       * Creates a new Part instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Part instance
       */
      public static create(
        properties?: tendermint.types.IPart
      ): tendermint.types.Part;

      /**
       * Encodes the specified Part message. Does not implicitly {@link tendermint.types.Part.verify|verify} messages.
       * @param m Part message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IPart,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Part message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Part
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Part;

      /**
       * Creates a Part message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Part
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Part;

      /**
       * Creates a plain object from a Part message. Also converts values to other types if specified.
       * @param m Part
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Part,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Part to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a BlockID. */
    interface IBlockID {
      /** BlockID hash */
      hash?: Uint8Array | null;

      /** BlockID partSetHeader */
      partSetHeader?: tendermint.types.IPartSetHeader | null;
    }

    /** Represents a BlockID. */
    class BlockID implements IBlockID {
      /**
       * Constructs a new BlockID.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IBlockID);

      /** BlockID hash. */
      public hash: Uint8Array;

      /** BlockID partSetHeader. */
      public partSetHeader?: tendermint.types.IPartSetHeader | null;

      /**
       * Creates a new BlockID instance using the specified properties.
       * @param [properties] Properties to set
       * @returns BlockID instance
       */
      public static create(
        properties?: tendermint.types.IBlockID
      ): tendermint.types.BlockID;

      /**
       * Encodes the specified BlockID message. Does not implicitly {@link tendermint.types.BlockID.verify|verify} messages.
       * @param m BlockID message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IBlockID,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a BlockID message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns BlockID
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.BlockID;

      /**
       * Creates a BlockID message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns BlockID
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.BlockID;

      /**
       * Creates a plain object from a BlockID message. Also converts values to other types if specified.
       * @param m BlockID
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.BlockID,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this BlockID to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Header. */
    interface IHeader {
      /** Header version */
      version?: tendermint.version.IConsensus | null;

      /** Header chainId */
      chainId?: string | null;

      /** Header height */
      height?: Long | null;

      /** Header time */
      time?: google.protobuf.ITimestamp | null;

      /** Header lastBlockId */
      lastBlockId?: tendermint.types.IBlockID | null;

      /** Header lastCommitHash */
      lastCommitHash?: Uint8Array | null;

      /** Header dataHash */
      dataHash?: Uint8Array | null;

      /** Header validatorsHash */
      validatorsHash?: Uint8Array | null;

      /** Header nextValidatorsHash */
      nextValidatorsHash?: Uint8Array | null;

      /** Header consensusHash */
      consensusHash?: Uint8Array | null;

      /** Header appHash */
      appHash?: Uint8Array | null;

      /** Header lastResultsHash */
      lastResultsHash?: Uint8Array | null;

      /** Header evidenceHash */
      evidenceHash?: Uint8Array | null;

      /** Header proposerAddress */
      proposerAddress?: Uint8Array | null;
    }

    /** Represents a Header. */
    class Header implements IHeader {
      /**
       * Constructs a new Header.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IHeader);

      /** Header version. */
      public version?: tendermint.version.IConsensus | null;

      /** Header chainId. */
      public chainId: string;

      /** Header height. */
      public height: Long;

      /** Header time. */
      public time?: google.protobuf.ITimestamp | null;

      /** Header lastBlockId. */
      public lastBlockId?: tendermint.types.IBlockID | null;

      /** Header lastCommitHash. */
      public lastCommitHash: Uint8Array;

      /** Header dataHash. */
      public dataHash: Uint8Array;

      /** Header validatorsHash. */
      public validatorsHash: Uint8Array;

      /** Header nextValidatorsHash. */
      public nextValidatorsHash: Uint8Array;

      /** Header consensusHash. */
      public consensusHash: Uint8Array;

      /** Header appHash. */
      public appHash: Uint8Array;

      /** Header lastResultsHash. */
      public lastResultsHash: Uint8Array;

      /** Header evidenceHash. */
      public evidenceHash: Uint8Array;

      /** Header proposerAddress. */
      public proposerAddress: Uint8Array;

      /**
       * Creates a new Header instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Header instance
       */
      public static create(
        properties?: tendermint.types.IHeader
      ): tendermint.types.Header;

      /**
       * Encodes the specified Header message. Does not implicitly {@link tendermint.types.Header.verify|verify} messages.
       * @param m Header message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IHeader,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Header message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Header
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Header;

      /**
       * Creates a Header message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Header
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.Header;

      /**
       * Creates a plain object from a Header message. Also converts values to other types if specified.
       * @param m Header
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Header,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Header to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Data. */
    interface IData {
      /** Data txs */
      txs?: Uint8Array[] | null;
    }

    /** Represents a Data. */
    class Data implements IData {
      /**
       * Constructs a new Data.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IData);

      /** Data txs. */
      public txs: Uint8Array[];

      /**
       * Creates a new Data instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Data instance
       */
      public static create(
        properties?: tendermint.types.IData
      ): tendermint.types.Data;

      /**
       * Encodes the specified Data message. Does not implicitly {@link tendermint.types.Data.verify|verify} messages.
       * @param m Data message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IData,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Data message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Data
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Data;

      /**
       * Creates a Data message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Data
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Data;

      /**
       * Creates a plain object from a Data message. Also converts values to other types if specified.
       * @param m Data
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Data,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Data to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Vote. */
    interface IVote {
      /** Vote type */
      type?: tendermint.types.SignedMsgType | null;

      /** Vote height */
      height?: Long | null;

      /** Vote round */
      round?: number | null;

      /** Vote blockId */
      blockId?: tendermint.types.IBlockID | null;

      /** Vote timestamp */
      timestamp?: google.protobuf.ITimestamp | null;

      /** Vote validatorAddress */
      validatorAddress?: Uint8Array | null;

      /** Vote validatorIndex */
      validatorIndex?: number | null;

      /** Vote signature */
      signature?: Uint8Array | null;
    }

    /** Represents a Vote. */
    class Vote implements IVote {
      /**
       * Constructs a new Vote.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IVote);

      /** Vote type. */
      public type: tendermint.types.SignedMsgType;

      /** Vote height. */
      public height: Long;

      /** Vote round. */
      public round: number;

      /** Vote blockId. */
      public blockId?: tendermint.types.IBlockID | null;

      /** Vote timestamp. */
      public timestamp?: google.protobuf.ITimestamp | null;

      /** Vote validatorAddress. */
      public validatorAddress: Uint8Array;

      /** Vote validatorIndex. */
      public validatorIndex: number;

      /** Vote signature. */
      public signature: Uint8Array;

      /**
       * Creates a new Vote instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Vote instance
       */
      public static create(
        properties?: tendermint.types.IVote
      ): tendermint.types.Vote;

      /**
       * Encodes the specified Vote message. Does not implicitly {@link tendermint.types.Vote.verify|verify} messages.
       * @param m Vote message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IVote,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Vote message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Vote
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Vote;

      /**
       * Creates a Vote message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Vote
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Vote;

      /**
       * Creates a plain object from a Vote message. Also converts values to other types if specified.
       * @param m Vote
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Vote,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Vote to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Commit. */
    interface ICommit {
      /** Commit height */
      height?: Long | null;

      /** Commit round */
      round?: number | null;

      /** Commit blockId */
      blockId?: tendermint.types.IBlockID | null;

      /** Commit signatures */
      signatures?: tendermint.types.ICommitSig[] | null;
    }

    /** Represents a Commit. */
    class Commit implements ICommit {
      /**
       * Constructs a new Commit.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.ICommit);

      /** Commit height. */
      public height: Long;

      /** Commit round. */
      public round: number;

      /** Commit blockId. */
      public blockId?: tendermint.types.IBlockID | null;

      /** Commit signatures. */
      public signatures: tendermint.types.ICommitSig[];

      /**
       * Creates a new Commit instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Commit instance
       */
      public static create(
        properties?: tendermint.types.ICommit
      ): tendermint.types.Commit;

      /**
       * Encodes the specified Commit message. Does not implicitly {@link tendermint.types.Commit.verify|verify} messages.
       * @param m Commit message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.ICommit,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Commit message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Commit
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Commit;

      /**
       * Creates a Commit message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Commit
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.Commit;

      /**
       * Creates a plain object from a Commit message. Also converts values to other types if specified.
       * @param m Commit
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Commit,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Commit to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a CommitSig. */
    interface ICommitSig {
      /** CommitSig blockIdFlag */
      blockIdFlag?: tendermint.types.BlockIDFlag | null;

      /** CommitSig validatorAddress */
      validatorAddress?: Uint8Array | null;

      /** CommitSig timestamp */
      timestamp?: google.protobuf.ITimestamp | null;

      /** CommitSig signature */
      signature?: Uint8Array | null;
    }

    /** Represents a CommitSig. */
    class CommitSig implements ICommitSig {
      /**
       * Constructs a new CommitSig.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.ICommitSig);

      /** CommitSig blockIdFlag. */
      public blockIdFlag: tendermint.types.BlockIDFlag;

      /** CommitSig validatorAddress. */
      public validatorAddress: Uint8Array;

      /** CommitSig timestamp. */
      public timestamp?: google.protobuf.ITimestamp | null;

      /** CommitSig signature. */
      public signature: Uint8Array;

      /**
       * Creates a new CommitSig instance using the specified properties.
       * @param [properties] Properties to set
       * @returns CommitSig instance
       */
      public static create(
        properties?: tendermint.types.ICommitSig
      ): tendermint.types.CommitSig;

      /**
       * Encodes the specified CommitSig message. Does not implicitly {@link tendermint.types.CommitSig.verify|verify} messages.
       * @param m CommitSig message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.ICommitSig,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a CommitSig message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns CommitSig
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.CommitSig;

      /**
       * Creates a CommitSig message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns CommitSig
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.CommitSig;

      /**
       * Creates a plain object from a CommitSig message. Also converts values to other types if specified.
       * @param m CommitSig
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.CommitSig,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this CommitSig to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Proposal. */
    interface IProposal {
      /** Proposal type */
      type?: tendermint.types.SignedMsgType | null;

      /** Proposal height */
      height?: Long | null;

      /** Proposal round */
      round?: number | null;

      /** Proposal polRound */
      polRound?: number | null;

      /** Proposal blockId */
      blockId?: tendermint.types.IBlockID | null;

      /** Proposal timestamp */
      timestamp?: google.protobuf.ITimestamp | null;

      /** Proposal signature */
      signature?: Uint8Array | null;
    }

    /** Represents a Proposal. */
    class Proposal implements IProposal {
      /**
       * Constructs a new Proposal.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IProposal);

      /** Proposal type. */
      public type: tendermint.types.SignedMsgType;

      /** Proposal height. */
      public height: Long;

      /** Proposal round. */
      public round: number;

      /** Proposal polRound. */
      public polRound: number;

      /** Proposal blockId. */
      public blockId?: tendermint.types.IBlockID | null;

      /** Proposal timestamp. */
      public timestamp?: google.protobuf.ITimestamp | null;

      /** Proposal signature. */
      public signature: Uint8Array;

      /**
       * Creates a new Proposal instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Proposal instance
       */
      public static create(
        properties?: tendermint.types.IProposal
      ): tendermint.types.Proposal;

      /**
       * Encodes the specified Proposal message. Does not implicitly {@link tendermint.types.Proposal.verify|verify} messages.
       * @param m Proposal message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IProposal,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Proposal message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Proposal
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Proposal;

      /**
       * Creates a Proposal message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Proposal
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.Proposal;

      /**
       * Creates a plain object from a Proposal message. Also converts values to other types if specified.
       * @param m Proposal
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Proposal,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Proposal to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a SignedHeader. */
    interface ISignedHeader {
      /** SignedHeader header */
      header?: tendermint.types.IHeader | null;

      /** SignedHeader commit */
      commit?: tendermint.types.ICommit | null;
    }

    /** Represents a SignedHeader. */
    class SignedHeader implements ISignedHeader {
      /**
       * Constructs a new SignedHeader.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.ISignedHeader);

      /** SignedHeader header. */
      public header?: tendermint.types.IHeader | null;

      /** SignedHeader commit. */
      public commit?: tendermint.types.ICommit | null;

      /**
       * Creates a new SignedHeader instance using the specified properties.
       * @param [properties] Properties to set
       * @returns SignedHeader instance
       */
      public static create(
        properties?: tendermint.types.ISignedHeader
      ): tendermint.types.SignedHeader;

      /**
       * Encodes the specified SignedHeader message. Does not implicitly {@link tendermint.types.SignedHeader.verify|verify} messages.
       * @param m SignedHeader message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.ISignedHeader,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a SignedHeader message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns SignedHeader
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.SignedHeader;

      /**
       * Creates a SignedHeader message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns SignedHeader
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.SignedHeader;

      /**
       * Creates a plain object from a SignedHeader message. Also converts values to other types if specified.
       * @param m SignedHeader
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.SignedHeader,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this SignedHeader to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a LightBlock. */
    interface ILightBlock {
      /** LightBlock signedHeader */
      signedHeader?: tendermint.types.ISignedHeader | null;

      /** LightBlock validatorSet */
      validatorSet?: tendermint.types.IValidatorSet | null;
    }

    /** Represents a LightBlock. */
    class LightBlock implements ILightBlock {
      /**
       * Constructs a new LightBlock.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.ILightBlock);

      /** LightBlock signedHeader. */
      public signedHeader?: tendermint.types.ISignedHeader | null;

      /** LightBlock validatorSet. */
      public validatorSet?: tendermint.types.IValidatorSet | null;

      /**
       * Creates a new LightBlock instance using the specified properties.
       * @param [properties] Properties to set
       * @returns LightBlock instance
       */
      public static create(
        properties?: tendermint.types.ILightBlock
      ): tendermint.types.LightBlock;

      /**
       * Encodes the specified LightBlock message. Does not implicitly {@link tendermint.types.LightBlock.verify|verify} messages.
       * @param m LightBlock message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.ILightBlock,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a LightBlock message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns LightBlock
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.LightBlock;

      /**
       * Creates a LightBlock message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns LightBlock
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.LightBlock;

      /**
       * Creates a plain object from a LightBlock message. Also converts values to other types if specified.
       * @param m LightBlock
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.LightBlock,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this LightBlock to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a BlockMeta. */
    interface IBlockMeta {
      /** BlockMeta blockId */
      blockId?: tendermint.types.IBlockID | null;

      /** BlockMeta blockSize */
      blockSize?: Long | null;

      /** BlockMeta header */
      header?: tendermint.types.IHeader | null;

      /** BlockMeta numTxs */
      numTxs?: Long | null;
    }

    /** Represents a BlockMeta. */
    class BlockMeta implements IBlockMeta {
      /**
       * Constructs a new BlockMeta.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IBlockMeta);

      /** BlockMeta blockId. */
      public blockId?: tendermint.types.IBlockID | null;

      /** BlockMeta blockSize. */
      public blockSize: Long;

      /** BlockMeta header. */
      public header?: tendermint.types.IHeader | null;

      /** BlockMeta numTxs. */
      public numTxs: Long;

      /**
       * Creates a new BlockMeta instance using the specified properties.
       * @param [properties] Properties to set
       * @returns BlockMeta instance
       */
      public static create(
        properties?: tendermint.types.IBlockMeta
      ): tendermint.types.BlockMeta;

      /**
       * Encodes the specified BlockMeta message. Does not implicitly {@link tendermint.types.BlockMeta.verify|verify} messages.
       * @param m BlockMeta message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IBlockMeta,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a BlockMeta message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns BlockMeta
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.BlockMeta;

      /**
       * Creates a BlockMeta message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns BlockMeta
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.BlockMeta;

      /**
       * Creates a plain object from a BlockMeta message. Also converts values to other types if specified.
       * @param m BlockMeta
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.BlockMeta,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this BlockMeta to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a TxProof. */
    interface ITxProof {
      /** TxProof rootHash */
      rootHash?: Uint8Array | null;

      /** TxProof data */
      data?: Uint8Array | null;

      /** TxProof proof */
      proof?: tendermint.crypto.IProof | null;
    }

    /** Represents a TxProof. */
    class TxProof implements ITxProof {
      /**
       * Constructs a new TxProof.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.ITxProof);

      /** TxProof rootHash. */
      public rootHash: Uint8Array;

      /** TxProof data. */
      public data: Uint8Array;

      /** TxProof proof. */
      public proof?: tendermint.crypto.IProof | null;

      /**
       * Creates a new TxProof instance using the specified properties.
       * @param [properties] Properties to set
       * @returns TxProof instance
       */
      public static create(
        properties?: tendermint.types.ITxProof
      ): tendermint.types.TxProof;

      /**
       * Encodes the specified TxProof message. Does not implicitly {@link tendermint.types.TxProof.verify|verify} messages.
       * @param m TxProof message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.ITxProof,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a TxProof message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns TxProof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.TxProof;

      /**
       * Creates a TxProof message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns TxProof
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.TxProof;

      /**
       * Creates a plain object from a TxProof message. Also converts values to other types if specified.
       * @param m TxProof
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.TxProof,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this TxProof to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a ValidatorSet. */
    interface IValidatorSet {
      /** ValidatorSet validators */
      validators?: tendermint.types.IValidator[] | null;

      /** ValidatorSet proposer */
      proposer?: tendermint.types.IValidator | null;

      /** ValidatorSet totalVotingPower */
      totalVotingPower?: Long | null;
    }

    /** Represents a ValidatorSet. */
    class ValidatorSet implements IValidatorSet {
      /**
       * Constructs a new ValidatorSet.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IValidatorSet);

      /** ValidatorSet validators. */
      public validators: tendermint.types.IValidator[];

      /** ValidatorSet proposer. */
      public proposer?: tendermint.types.IValidator | null;

      /** ValidatorSet totalVotingPower. */
      public totalVotingPower: Long;

      /**
       * Creates a new ValidatorSet instance using the specified properties.
       * @param [properties] Properties to set
       * @returns ValidatorSet instance
       */
      public static create(
        properties?: tendermint.types.IValidatorSet
      ): tendermint.types.ValidatorSet;

      /**
       * Encodes the specified ValidatorSet message. Does not implicitly {@link tendermint.types.ValidatorSet.verify|verify} messages.
       * @param m ValidatorSet message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IValidatorSet,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a ValidatorSet message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ValidatorSet
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.ValidatorSet;

      /**
       * Creates a ValidatorSet message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ValidatorSet
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.ValidatorSet;

      /**
       * Creates a plain object from a ValidatorSet message. Also converts values to other types if specified.
       * @param m ValidatorSet
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.ValidatorSet,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this ValidatorSet to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Validator. */
    interface IValidator {
      /** Validator address */
      address?: Uint8Array | null;

      /** Validator pubKey */
      pubKey?: tendermint.crypto.IPublicKey | null;

      /** Validator votingPower */
      votingPower?: Long | null;

      /** Validator proposerPriority */
      proposerPriority?: Long | null;
    }

    /** Represents a Validator. */
    class Validator implements IValidator {
      /**
       * Constructs a new Validator.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.IValidator);

      /** Validator address. */
      public address: Uint8Array;

      /** Validator pubKey. */
      public pubKey?: tendermint.crypto.IPublicKey | null;

      /** Validator votingPower. */
      public votingPower: Long;

      /** Validator proposerPriority. */
      public proposerPriority: Long;

      /**
       * Creates a new Validator instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Validator instance
       */
      public static create(
        properties?: tendermint.types.IValidator
      ): tendermint.types.Validator;

      /**
       * Encodes the specified Validator message. Does not implicitly {@link tendermint.types.Validator.verify|verify} messages.
       * @param m Validator message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.IValidator,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Validator message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Validator
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.Validator;

      /**
       * Creates a Validator message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Validator
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.Validator;

      /**
       * Creates a plain object from a Validator message. Also converts values to other types if specified.
       * @param m Validator
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Validator,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Validator to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a SimpleValidator. */
    interface ISimpleValidator {
      /** SimpleValidator pubKey */
      pubKey?: tendermint.crypto.IPublicKey | null;

      /** SimpleValidator votingPower */
      votingPower?: Long | null;
    }

    /** Represents a SimpleValidator. */
    class SimpleValidator implements ISimpleValidator {
      /**
       * Constructs a new SimpleValidator.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.types.ISimpleValidator);

      /** SimpleValidator pubKey. */
      public pubKey?: tendermint.crypto.IPublicKey | null;

      /** SimpleValidator votingPower. */
      public votingPower: Long;

      /**
       * Creates a new SimpleValidator instance using the specified properties.
       * @param [properties] Properties to set
       * @returns SimpleValidator instance
       */
      public static create(
        properties?: tendermint.types.ISimpleValidator
      ): tendermint.types.SimpleValidator;

      /**
       * Encodes the specified SimpleValidator message. Does not implicitly {@link tendermint.types.SimpleValidator.verify|verify} messages.
       * @param m SimpleValidator message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.types.ISimpleValidator,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a SimpleValidator message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns SimpleValidator
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.types.SimpleValidator;

      /**
       * Creates a SimpleValidator message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns SimpleValidator
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.types.SimpleValidator;

      /**
       * Creates a plain object from a SimpleValidator message. Also converts values to other types if specified.
       * @param m SimpleValidator
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.SimpleValidator,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this SimpleValidator to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Namespace version. */
  namespace version {
    /** Properties of an App. */
    interface IApp {
      /** App protocol */
      protocol?: Long | null;

      /** App software */
      software?: string | null;
    }

    /** Represents an App. */
    class App implements IApp {
      /**
       * Constructs a new App.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.version.IApp);

      /** App protocol. */
      public protocol: Long;

      /** App software. */
      public software: string;

      /**
       * Creates a new App instance using the specified properties.
       * @param [properties] Properties to set
       * @returns App instance
       */
      public static create(
        properties?: tendermint.version.IApp
      ): tendermint.version.App;

      /**
       * Encodes the specified App message. Does not implicitly {@link tendermint.version.App.verify|verify} messages.
       * @param m App message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.version.IApp,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes an App message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns App
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.version.App;

      /**
       * Creates an App message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns App
       */
      public static fromObject(d: { [k: string]: any }): tendermint.version.App;

      /**
       * Creates a plain object from an App message. Also converts values to other types if specified.
       * @param m App
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.version.App,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this App to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

    /** Properties of a Consensus. */
    interface IConsensus {
      /** Consensus block */
      block?: Long | null;

      /** Consensus app */
      app?: Long | null;
    }

    /** Represents a Consensus. */
    class Consensus implements IConsensus {
      /**
       * Constructs a new Consensus.
       * @param [p] Properties to set
       */
      constructor(p?: tendermint.version.IConsensus);

      /** Consensus block. */
      public block: Long;

      /** Consensus app. */
      public app: Long;

      /**
       * Creates a new Consensus instance using the specified properties.
       * @param [properties] Properties to set
       * @returns Consensus instance
       */
      public static create(
        properties?: tendermint.version.IConsensus
      ): tendermint.version.Consensus;

      /**
       * Encodes the specified Consensus message. Does not implicitly {@link tendermint.version.Consensus.verify|verify} messages.
       * @param m Consensus message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(
        m: tendermint.version.IConsensus,
        w?: $protobuf.Writer
      ): $protobuf.Writer;

      /**
       * Decodes a Consensus message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Consensus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(
        r: $protobuf.Reader | Uint8Array,
        l?: number
      ): tendermint.version.Consensus;

      /**
       * Creates a Consensus message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Consensus
       */
      public static fromObject(d: {
        [k: string]: any;
      }): tendermint.version.Consensus;

      /**
       * Creates a plain object from a Consensus message. Also converts values to other types if specified.
       * @param m Consensus
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.version.Consensus,
        o?: $protobuf.IConversionOptions
      ): { [k: string]: any };

      /**
       * Converts this Consensus to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }
}

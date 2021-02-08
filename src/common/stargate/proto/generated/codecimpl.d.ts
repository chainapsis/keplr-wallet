import * as $protobuf from "protobufjs";
/** Namespace cosmos. */
export namespace cosmos {
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
        public static create(properties?: cosmos.bank.v1beta1.IParams): cosmos.bank.v1beta1.Params;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmos.bank.v1beta1.Params.verify|verify} messages.
         * @param m Params message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IParams, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Params;

        /**
         * Creates a Params message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Params
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Params;

        /**
         * Creates a plain object from a Params message. Also converts values to other types if specified.
         * @param m Params
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Params,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.bank.v1beta1.ISendEnabled): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Encodes the specified SendEnabled message. Does not implicitly {@link cosmos.bank.v1beta1.SendEnabled.verify|verify} messages.
         * @param m SendEnabled message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.ISendEnabled, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SendEnabled message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SendEnabled
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Creates a SendEnabled message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SendEnabled
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.SendEnabled;

        /**
         * Creates a plain object from a SendEnabled message. Also converts values to other types if specified.
         * @param m SendEnabled
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.SendEnabled,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.bank.v1beta1.IInput): cosmos.bank.v1beta1.Input;

        /**
         * Encodes the specified Input message. Does not implicitly {@link cosmos.bank.v1beta1.Input.verify|verify} messages.
         * @param m Input message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IInput, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Input message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Input
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Input;

        /**
         * Creates an Input message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Input
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Input;

        /**
         * Creates a plain object from an Input message. Also converts values to other types if specified.
         * @param m Input
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Input,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.bank.v1beta1.IOutput): cosmos.bank.v1beta1.Output;

        /**
         * Encodes the specified Output message. Does not implicitly {@link cosmos.bank.v1beta1.Output.verify|verify} messages.
         * @param m Output message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IOutput, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Output message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Output
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Output;

        /**
         * Creates an Output message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Output
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Output;

        /**
         * Creates a plain object from an Output message. Also converts values to other types if specified.
         * @param m Output
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Output,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.bank.v1beta1.ISupply): cosmos.bank.v1beta1.Supply;

        /**
         * Encodes the specified Supply message. Does not implicitly {@link cosmos.bank.v1beta1.Supply.verify|verify} messages.
         * @param m Supply message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.ISupply, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Supply message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Supply
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Supply;

        /**
         * Creates a Supply message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Supply
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Supply;

        /**
         * Creates a plain object from a Supply message. Also converts values to other types if specified.
         * @param m Supply
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Supply,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.bank.v1beta1.IDenomUnit): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Encodes the specified DenomUnit message. Does not implicitly {@link cosmos.bank.v1beta1.DenomUnit.verify|verify} messages.
         * @param m DenomUnit message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IDenomUnit, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DenomUnit message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DenomUnit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Creates a DenomUnit message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DenomUnit
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.DenomUnit;

        /**
         * Creates a plain object from a DenomUnit message. Also converts values to other types if specified.
         * @param m DenomUnit
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.DenomUnit,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.bank.v1beta1.IMetadata): cosmos.bank.v1beta1.Metadata;

        /**
         * Encodes the specified Metadata message. Does not implicitly {@link cosmos.bank.v1beta1.Metadata.verify|verify} messages.
         * @param m Metadata message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IMetadata, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Metadata message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Metadata
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.Metadata;

        /**
         * Creates a Metadata message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Metadata
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.Metadata;

        /**
         * Creates a plain object from a Metadata message. Also converts values to other types if specified.
         * @param m Metadata
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.Metadata,
          o?: $protobuf.IConversionOptions,
        ): { [k: string]: any };

        /**
         * Converts this Metadata to JSON.
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
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

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
          responseDelimited?: boolean,
        ): Msg;

        /**
         * Calls Send.
         * @param request MsgSend message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgSendResponse
         */
        public send(
          request: cosmos.bank.v1beta1.IMsgSend,
          callback: cosmos.bank.v1beta1.Msg.SendCallback,
        ): void;

        /**
         * Calls Send.
         * @param request MsgSend message or plain object
         * @returns Promise
         */
        public send(request: cosmos.bank.v1beta1.IMsgSend): Promise<cosmos.bank.v1beta1.MsgSendResponse>;

        /**
         * Calls MultiSend.
         * @param request MsgMultiSend message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgMultiSendResponse
         */
        public multiSend(
          request: cosmos.bank.v1beta1.IMsgMultiSend,
          callback: cosmos.bank.v1beta1.Msg.MultiSendCallback,
        ): void;

        /**
         * Calls MultiSend.
         * @param request MsgMultiSend message or plain object
         * @returns Promise
         */
        public multiSend(
          request: cosmos.bank.v1beta1.IMsgMultiSend,
        ): Promise<cosmos.bank.v1beta1.MsgMultiSendResponse>;
      }

      namespace Msg {
        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Msg#send}.
         * @param error Error, if any
         * @param [response] MsgSendResponse
         */
        type SendCallback = (error: Error | null, response?: cosmos.bank.v1beta1.MsgSendResponse) => void;

        /**
         * Callback as used by {@link cosmos.bank.v1beta1.Msg#multiSend}.
         * @param error Error, if any
         * @param [response] MsgMultiSendResponse
         */
        type MultiSendCallback = (
          error: Error | null,
          response?: cosmos.bank.v1beta1.MsgMultiSendResponse,
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
        public static create(properties?: cosmos.bank.v1beta1.IMsgSend): cosmos.bank.v1beta1.MsgSend;

        /**
         * Encodes the specified MsgSend message. Does not implicitly {@link cosmos.bank.v1beta1.MsgSend.verify|verify} messages.
         * @param m MsgSend message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IMsgSend, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MsgSend message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.MsgSend;

        /**
         * Creates a MsgSend message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSend
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.MsgSend;

        /**
         * Creates a plain object from a MsgSend message. Also converts values to other types if specified.
         * @param m MsgSend
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgSend,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.bank.v1beta1.IMsgSendResponse,
        ): cosmos.bank.v1beta1.MsgSendResponse;

        /**
         * Encodes the specified MsgSendResponse message. Does not implicitly {@link cosmos.bank.v1beta1.MsgSendResponse.verify|verify} messages.
         * @param m MsgSendResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IMsgSendResponse, w?: $protobuf.Writer): $protobuf.Writer;

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
          l?: number,
        ): cosmos.bank.v1beta1.MsgSendResponse;

        /**
         * Creates a MsgSendResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgSendResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.MsgSendResponse;

        /**
         * Creates a plain object from a MsgSendResponse message. Also converts values to other types if specified.
         * @param m MsgSendResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgSendResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.bank.v1beta1.IMsgMultiSend,
        ): cosmos.bank.v1beta1.MsgMultiSend;

        /**
         * Encodes the specified MsgMultiSend message. Does not implicitly {@link cosmos.bank.v1beta1.MsgMultiSend.verify|verify} messages.
         * @param m MsgMultiSend message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.bank.v1beta1.IMsgMultiSend, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MsgMultiSend message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns MsgMultiSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.bank.v1beta1.MsgMultiSend;

        /**
         * Creates a MsgMultiSend message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgMultiSend
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.MsgMultiSend;

        /**
         * Creates a plain object from a MsgMultiSend message. Also converts values to other types if specified.
         * @param m MsgMultiSend
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgMultiSend,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.bank.v1beta1.IMsgMultiSendResponse,
        ): cosmos.bank.v1beta1.MsgMultiSendResponse;

        /**
         * Encodes the specified MsgMultiSendResponse message. Does not implicitly {@link cosmos.bank.v1beta1.MsgMultiSendResponse.verify|verify} messages.
         * @param m MsgMultiSendResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.bank.v1beta1.IMsgMultiSendResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.bank.v1beta1.MsgMultiSendResponse;

        /**
         * Creates a MsgMultiSendResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgMultiSendResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.bank.v1beta1.MsgMultiSendResponse;

        /**
         * Creates a plain object from a MsgMultiSendResponse message. Also converts values to other types if specified.
         * @param m MsgMultiSendResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.bank.v1beta1.MsgMultiSendResponse,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.base.v1beta1.ICoin): cosmos.base.v1beta1.Coin;

        /**
         * Encodes the specified Coin message. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
         * @param m Coin message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.base.v1beta1.ICoin, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.Coin;

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Coin
         */
        public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.Coin;

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @param m Coin
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.Coin,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.base.v1beta1.IDecCoin): cosmos.base.v1beta1.DecCoin;

        /**
         * Encodes the specified DecCoin message. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
         * @param m DecCoin message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.base.v1beta1.IDecCoin, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DecCoin message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DecCoin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.DecCoin;

        /**
         * Creates a DecCoin message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DecCoin
         */
        public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.DecCoin;

        /**
         * Creates a plain object from a DecCoin message. Also converts values to other types if specified.
         * @param m DecCoin
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.DecCoin,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.base.v1beta1.IIntProto): cosmos.base.v1beta1.IntProto;

        /**
         * Encodes the specified IntProto message. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
         * @param m IntProto message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.base.v1beta1.IIntProto, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an IntProto message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns IntProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.IntProto;

        /**
         * Creates an IntProto message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns IntProto
         */
        public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.IntProto;

        /**
         * Creates a plain object from an IntProto message. Also converts values to other types if specified.
         * @param m IntProto
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.IntProto,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.base.v1beta1.IDecProto): cosmos.base.v1beta1.DecProto;

        /**
         * Encodes the specified DecProto message. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
         * @param m DecProto message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.base.v1beta1.IDecProto, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DecProto message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DecProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.base.v1beta1.DecProto;

        /**
         * Creates a DecProto message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DecProto
         */
        public static fromObject(d: { [k: string]: any }): cosmos.base.v1beta1.DecProto;

        /**
         * Creates a plain object from a DecProto message. Also converts values to other types if specified.
         * @param m DecProto
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.base.v1beta1.DecProto,
          o?: $protobuf.IConversionOptions,
        ): { [k: string]: any };

        /**
         * Converts this DecProto to JSON.
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
          properties?: cosmos.staking.v1beta1.IHistoricalInfo,
        ): cosmos.staking.v1beta1.HistoricalInfo;

        /**
         * Encodes the specified HistoricalInfo message. Does not implicitly {@link cosmos.staking.v1beta1.HistoricalInfo.verify|verify} messages.
         * @param m HistoricalInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IHistoricalInfo,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.HistoricalInfo;

        /**
         * Creates a HistoricalInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns HistoricalInfo
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.HistoricalInfo;

        /**
         * Creates a plain object from a HistoricalInfo message. Also converts values to other types if specified.
         * @param m HistoricalInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.HistoricalInfo,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.ICommissionRates,
        ): cosmos.staking.v1beta1.CommissionRates;

        /**
         * Encodes the specified CommissionRates message. Does not implicitly {@link cosmos.staking.v1beta1.CommissionRates.verify|verify} messages.
         * @param m CommissionRates message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.ICommissionRates,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.CommissionRates;

        /**
         * Creates a CommissionRates message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns CommissionRates
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.CommissionRates;

        /**
         * Creates a plain object from a CommissionRates message. Also converts values to other types if specified.
         * @param m CommissionRates
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.CommissionRates,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.ICommission,
        ): cosmos.staking.v1beta1.Commission;

        /**
         * Encodes the specified Commission message. Does not implicitly {@link cosmos.staking.v1beta1.Commission.verify|verify} messages.
         * @param m Commission message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.ICommission, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Commission message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Commission
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.Commission;

        /**
         * Creates a Commission message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Commission
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Commission;

        /**
         * Creates a plain object from a Commission message. Also converts values to other types if specified.
         * @param m Commission
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Commission,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IDescription,
        ): cosmos.staking.v1beta1.Description;

        /**
         * Encodes the specified Description message. Does not implicitly {@link cosmos.staking.v1beta1.Description.verify|verify} messages.
         * @param m Description message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IDescription, w?: $protobuf.Writer): $protobuf.Writer;

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
          l?: number,
        ): cosmos.staking.v1beta1.Description;

        /**
         * Creates a Description message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Description
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Description;

        /**
         * Creates a plain object from a Description message. Also converts values to other types if specified.
         * @param m Description
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Description,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IValidator,
        ): cosmos.staking.v1beta1.Validator;

        /**
         * Encodes the specified Validator message. Does not implicitly {@link cosmos.staking.v1beta1.Validator.verify|verify} messages.
         * @param m Validator message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IValidator, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Validator message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Validator
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.Validator;

        /**
         * Creates a Validator message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Validator
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Validator;

        /**
         * Creates a plain object from a Validator message. Also converts values to other types if specified.
         * @param m Validator
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Validator,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IValAddresses,
        ): cosmos.staking.v1beta1.ValAddresses;

        /**
         * Encodes the specified ValAddresses message. Does not implicitly {@link cosmos.staking.v1beta1.ValAddresses.verify|verify} messages.
         * @param m ValAddresses message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IValAddresses, w?: $protobuf.Writer): $protobuf.Writer;

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
          l?: number,
        ): cosmos.staking.v1beta1.ValAddresses;

        /**
         * Creates a ValAddresses message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ValAddresses
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.ValAddresses;

        /**
         * Creates a plain object from a ValAddresses message. Also converts values to other types if specified.
         * @param m ValAddresses
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.ValAddresses,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.staking.v1beta1.IDVPair): cosmos.staking.v1beta1.DVPair;

        /**
         * Encodes the specified DVPair message. Does not implicitly {@link cosmos.staking.v1beta1.DVPair.verify|verify} messages.
         * @param m DVPair message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IDVPair, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DVPair message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVPair
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.DVPair;

        /**
         * Creates a DVPair message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVPair
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.DVPair;

        /**
         * Creates a plain object from a DVPair message. Also converts values to other types if specified.
         * @param m DVPair
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVPair,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.staking.v1beta1.IDVPairs): cosmos.staking.v1beta1.DVPairs;

        /**
         * Encodes the specified DVPairs message. Does not implicitly {@link cosmos.staking.v1beta1.DVPairs.verify|verify} messages.
         * @param m DVPairs message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IDVPairs, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DVPairs message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVPairs
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.DVPairs;

        /**
         * Creates a DVPairs message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVPairs
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.DVPairs;

        /**
         * Creates a plain object from a DVPairs message. Also converts values to other types if specified.
         * @param m DVPairs
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVPairs,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IDVVTriplet,
        ): cosmos.staking.v1beta1.DVVTriplet;

        /**
         * Encodes the specified DVVTriplet message. Does not implicitly {@link cosmos.staking.v1beta1.DVVTriplet.verify|verify} messages.
         * @param m DVVTriplet message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IDVVTriplet, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DVVTriplet message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns DVVTriplet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.DVVTriplet;

        /**
         * Creates a DVVTriplet message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVVTriplet
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.DVVTriplet;

        /**
         * Creates a plain object from a DVVTriplet message. Also converts values to other types if specified.
         * @param m DVVTriplet
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVVTriplet,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IDVVTriplets,
        ): cosmos.staking.v1beta1.DVVTriplets;

        /**
         * Encodes the specified DVVTriplets message. Does not implicitly {@link cosmos.staking.v1beta1.DVVTriplets.verify|verify} messages.
         * @param m DVVTriplets message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IDVVTriplets, w?: $protobuf.Writer): $protobuf.Writer;

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
          l?: number,
        ): cosmos.staking.v1beta1.DVVTriplets;

        /**
         * Creates a DVVTriplets message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DVVTriplets
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.DVVTriplets;

        /**
         * Creates a plain object from a DVVTriplets message. Also converts values to other types if specified.
         * @param m DVVTriplets
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DVVTriplets,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IDelegation,
        ): cosmos.staking.v1beta1.Delegation;

        /**
         * Encodes the specified Delegation message. Does not implicitly {@link cosmos.staking.v1beta1.Delegation.verify|verify} messages.
         * @param m Delegation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IDelegation, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Delegation message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Delegation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.Delegation;

        /**
         * Creates a Delegation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Delegation
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Delegation;

        /**
         * Creates a plain object from a Delegation message. Also converts values to other types if specified.
         * @param m Delegation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Delegation,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IUnbondingDelegation,
        ): cosmos.staking.v1beta1.UnbondingDelegation;

        /**
         * Encodes the specified UnbondingDelegation message. Does not implicitly {@link cosmos.staking.v1beta1.UnbondingDelegation.verify|verify} messages.
         * @param m UnbondingDelegation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IUnbondingDelegation,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.UnbondingDelegation;

        /**
         * Creates an UnbondingDelegation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns UnbondingDelegation
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.UnbondingDelegation;

        /**
         * Creates a plain object from an UnbondingDelegation message. Also converts values to other types if specified.
         * @param m UnbondingDelegation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.UnbondingDelegation,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IUnbondingDelegationEntry,
        ): cosmos.staking.v1beta1.UnbondingDelegationEntry;

        /**
         * Encodes the specified UnbondingDelegationEntry message. Does not implicitly {@link cosmos.staking.v1beta1.UnbondingDelegationEntry.verify|verify} messages.
         * @param m UnbondingDelegationEntry message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IUnbondingDelegationEntry,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.UnbondingDelegationEntry;

        /**
         * Creates an UnbondingDelegationEntry message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns UnbondingDelegationEntry
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.UnbondingDelegationEntry;

        /**
         * Creates a plain object from an UnbondingDelegationEntry message. Also converts values to other types if specified.
         * @param m UnbondingDelegationEntry
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.UnbondingDelegationEntry,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IRedelegationEntry,
        ): cosmos.staking.v1beta1.RedelegationEntry;

        /**
         * Encodes the specified RedelegationEntry message. Does not implicitly {@link cosmos.staking.v1beta1.RedelegationEntry.verify|verify} messages.
         * @param m RedelegationEntry message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegationEntry,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.RedelegationEntry;

        /**
         * Creates a RedelegationEntry message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns RedelegationEntry
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.RedelegationEntry;

        /**
         * Creates a plain object from a RedelegationEntry message. Also converts values to other types if specified.
         * @param m RedelegationEntry
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.RedelegationEntry,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IRedelegation,
        ): cosmos.staking.v1beta1.Redelegation;

        /**
         * Encodes the specified Redelegation message. Does not implicitly {@link cosmos.staking.v1beta1.Redelegation.verify|verify} messages.
         * @param m Redelegation message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IRedelegation, w?: $protobuf.Writer): $protobuf.Writer;

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
          l?: number,
        ): cosmos.staking.v1beta1.Redelegation;

        /**
         * Creates a Redelegation message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Redelegation
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Redelegation;

        /**
         * Creates a plain object from a Redelegation message. Also converts values to other types if specified.
         * @param m Redelegation
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Redelegation,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.staking.v1beta1.IParams): cosmos.staking.v1beta1.Params;

        /**
         * Encodes the specified Params message. Does not implicitly {@link cosmos.staking.v1beta1.Params.verify|verify} messages.
         * @param m Params message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IParams, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Params message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Params
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.Params;

        /**
         * Creates a Params message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Params
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Params;

        /**
         * Creates a plain object from a Params message. Also converts values to other types if specified.
         * @param m Params
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Params,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IDelegationResponse,
        ): cosmos.staking.v1beta1.DelegationResponse;

        /**
         * Encodes the specified DelegationResponse message. Does not implicitly {@link cosmos.staking.v1beta1.DelegationResponse.verify|verify} messages.
         * @param m DelegationResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IDelegationResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.DelegationResponse;

        /**
         * Creates a DelegationResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns DelegationResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.DelegationResponse;

        /**
         * Creates a plain object from a DelegationResponse message. Also converts values to other types if specified.
         * @param m DelegationResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.DelegationResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IRedelegationEntryResponse,
        ): cosmos.staking.v1beta1.RedelegationEntryResponse;

        /**
         * Encodes the specified RedelegationEntryResponse message. Does not implicitly {@link cosmos.staking.v1beta1.RedelegationEntryResponse.verify|verify} messages.
         * @param m RedelegationEntryResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegationEntryResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.RedelegationEntryResponse;

        /**
         * Creates a RedelegationEntryResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns RedelegationEntryResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.RedelegationEntryResponse;

        /**
         * Creates a plain object from a RedelegationEntryResponse message. Also converts values to other types if specified.
         * @param m RedelegationEntryResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.RedelegationEntryResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IRedelegationResponse,
        ): cosmos.staking.v1beta1.RedelegationResponse;

        /**
         * Encodes the specified RedelegationResponse message. Does not implicitly {@link cosmos.staking.v1beta1.RedelegationResponse.verify|verify} messages.
         * @param m RedelegationResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IRedelegationResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.RedelegationResponse;

        /**
         * Creates a RedelegationResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns RedelegationResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.RedelegationResponse;

        /**
         * Creates a plain object from a RedelegationResponse message. Also converts values to other types if specified.
         * @param m RedelegationResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.RedelegationResponse,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.staking.v1beta1.IPool): cosmos.staking.v1beta1.Pool;

        /**
         * Encodes the specified Pool message. Does not implicitly {@link cosmos.staking.v1beta1.Pool.verify|verify} messages.
         * @param m Pool message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IPool, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Pool message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Pool
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.staking.v1beta1.Pool;

        /**
         * Creates a Pool message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Pool
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.Pool;

        /**
         * Creates a plain object from a Pool message. Also converts values to other types if specified.
         * @param m Pool
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.Pool,
          o?: $protobuf.IConversionOptions,
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
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

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
          responseDelimited?: boolean,
        ): Msg;

        /**
         * Calls CreateValidator.
         * @param request MsgCreateValidator message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgCreateValidatorResponse
         */
        public createValidator(
          request: cosmos.staking.v1beta1.IMsgCreateValidator,
          callback: cosmos.staking.v1beta1.Msg.CreateValidatorCallback,
        ): void;

        /**
         * Calls CreateValidator.
         * @param request MsgCreateValidator message or plain object
         * @returns Promise
         */
        public createValidator(
          request: cosmos.staking.v1beta1.IMsgCreateValidator,
        ): Promise<cosmos.staking.v1beta1.MsgCreateValidatorResponse>;

        /**
         * Calls EditValidator.
         * @param request MsgEditValidator message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgEditValidatorResponse
         */
        public editValidator(
          request: cosmos.staking.v1beta1.IMsgEditValidator,
          callback: cosmos.staking.v1beta1.Msg.EditValidatorCallback,
        ): void;

        /**
         * Calls EditValidator.
         * @param request MsgEditValidator message or plain object
         * @returns Promise
         */
        public editValidator(
          request: cosmos.staking.v1beta1.IMsgEditValidator,
        ): Promise<cosmos.staking.v1beta1.MsgEditValidatorResponse>;

        /**
         * Calls Delegate.
         * @param request MsgDelegate message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgDelegateResponse
         */
        public delegate(
          request: cosmos.staking.v1beta1.IMsgDelegate,
          callback: cosmos.staking.v1beta1.Msg.DelegateCallback,
        ): void;

        /**
         * Calls Delegate.
         * @param request MsgDelegate message or plain object
         * @returns Promise
         */
        public delegate(
          request: cosmos.staking.v1beta1.IMsgDelegate,
        ): Promise<cosmos.staking.v1beta1.MsgDelegateResponse>;

        /**
         * Calls BeginRedelegate.
         * @param request MsgBeginRedelegate message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgBeginRedelegateResponse
         */
        public beginRedelegate(
          request: cosmos.staking.v1beta1.IMsgBeginRedelegate,
          callback: cosmos.staking.v1beta1.Msg.BeginRedelegateCallback,
        ): void;

        /**
         * Calls BeginRedelegate.
         * @param request MsgBeginRedelegate message or plain object
         * @returns Promise
         */
        public beginRedelegate(
          request: cosmos.staking.v1beta1.IMsgBeginRedelegate,
        ): Promise<cosmos.staking.v1beta1.MsgBeginRedelegateResponse>;

        /**
         * Calls Undelegate.
         * @param request MsgUndelegate message or plain object
         * @param callback Node-style callback called with the error, if any, and MsgUndelegateResponse
         */
        public undelegate(
          request: cosmos.staking.v1beta1.IMsgUndelegate,
          callback: cosmos.staking.v1beta1.Msg.UndelegateCallback,
        ): void;

        /**
         * Calls Undelegate.
         * @param request MsgUndelegate message or plain object
         * @returns Promise
         */
        public undelegate(
          request: cosmos.staking.v1beta1.IMsgUndelegate,
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
          response?: cosmos.staking.v1beta1.MsgCreateValidatorResponse,
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#editValidator}.
         * @param error Error, if any
         * @param [response] MsgEditValidatorResponse
         */
        type EditValidatorCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgEditValidatorResponse,
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#delegate}.
         * @param error Error, if any
         * @param [response] MsgDelegateResponse
         */
        type DelegateCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgDelegateResponse,
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#beginRedelegate}.
         * @param error Error, if any
         * @param [response] MsgBeginRedelegateResponse
         */
        type BeginRedelegateCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgBeginRedelegateResponse,
        ) => void;

        /**
         * Callback as used by {@link cosmos.staking.v1beta1.Msg#undelegate}.
         * @param error Error, if any
         * @param [response] MsgUndelegateResponse
         */
        type UndelegateCallback = (
          error: Error | null,
          response?: cosmos.staking.v1beta1.MsgUndelegateResponse,
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
          properties?: cosmos.staking.v1beta1.IMsgCreateValidator,
        ): cosmos.staking.v1beta1.MsgCreateValidator;

        /**
         * Encodes the specified MsgCreateValidator message. Does not implicitly {@link cosmos.staking.v1beta1.MsgCreateValidator.verify|verify} messages.
         * @param m MsgCreateValidator message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgCreateValidator,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgCreateValidator;

        /**
         * Creates a MsgCreateValidator message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgCreateValidator
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgCreateValidator;

        /**
         * Creates a plain object from a MsgCreateValidator message. Also converts values to other types if specified.
         * @param m MsgCreateValidator
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgCreateValidator,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgCreateValidatorResponse,
        ): cosmos.staking.v1beta1.MsgCreateValidatorResponse;

        /**
         * Encodes the specified MsgCreateValidatorResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgCreateValidatorResponse.verify|verify} messages.
         * @param m MsgCreateValidatorResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgCreateValidatorResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgCreateValidatorResponse;

        /**
         * Creates a MsgCreateValidatorResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgCreateValidatorResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgCreateValidatorResponse;

        /**
         * Creates a plain object from a MsgCreateValidatorResponse message. Also converts values to other types if specified.
         * @param m MsgCreateValidatorResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgCreateValidatorResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgEditValidator,
        ): cosmos.staking.v1beta1.MsgEditValidator;

        /**
         * Encodes the specified MsgEditValidator message. Does not implicitly {@link cosmos.staking.v1beta1.MsgEditValidator.verify|verify} messages.
         * @param m MsgEditValidator message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgEditValidator,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgEditValidator;

        /**
         * Creates a MsgEditValidator message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgEditValidator
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgEditValidator;

        /**
         * Creates a plain object from a MsgEditValidator message. Also converts values to other types if specified.
         * @param m MsgEditValidator
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgEditValidator,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgEditValidatorResponse,
        ): cosmos.staking.v1beta1.MsgEditValidatorResponse;

        /**
         * Encodes the specified MsgEditValidatorResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgEditValidatorResponse.verify|verify} messages.
         * @param m MsgEditValidatorResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgEditValidatorResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgEditValidatorResponse;

        /**
         * Creates a MsgEditValidatorResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgEditValidatorResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgEditValidatorResponse;

        /**
         * Creates a plain object from a MsgEditValidatorResponse message. Also converts values to other types if specified.
         * @param m MsgEditValidatorResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgEditValidatorResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgDelegate,
        ): cosmos.staking.v1beta1.MsgDelegate;

        /**
         * Encodes the specified MsgDelegate message. Does not implicitly {@link cosmos.staking.v1beta1.MsgDelegate.verify|verify} messages.
         * @param m MsgDelegate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.staking.v1beta1.IMsgDelegate, w?: $protobuf.Writer): $protobuf.Writer;

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
          l?: number,
        ): cosmos.staking.v1beta1.MsgDelegate;

        /**
         * Creates a MsgDelegate message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgDelegate
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgDelegate;

        /**
         * Creates a plain object from a MsgDelegate message. Also converts values to other types if specified.
         * @param m MsgDelegate
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgDelegate,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgDelegateResponse,
        ): cosmos.staking.v1beta1.MsgDelegateResponse;

        /**
         * Encodes the specified MsgDelegateResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgDelegateResponse.verify|verify} messages.
         * @param m MsgDelegateResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgDelegateResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgDelegateResponse;

        /**
         * Creates a MsgDelegateResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgDelegateResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgDelegateResponse;

        /**
         * Creates a plain object from a MsgDelegateResponse message. Also converts values to other types if specified.
         * @param m MsgDelegateResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgDelegateResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgBeginRedelegate,
        ): cosmos.staking.v1beta1.MsgBeginRedelegate;

        /**
         * Encodes the specified MsgBeginRedelegate message. Does not implicitly {@link cosmos.staking.v1beta1.MsgBeginRedelegate.verify|verify} messages.
         * @param m MsgBeginRedelegate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgBeginRedelegate,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgBeginRedelegate;

        /**
         * Creates a MsgBeginRedelegate message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgBeginRedelegate
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgBeginRedelegate;

        /**
         * Creates a plain object from a MsgBeginRedelegate message. Also converts values to other types if specified.
         * @param m MsgBeginRedelegate
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgBeginRedelegate,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgBeginRedelegateResponse,
        ): cosmos.staking.v1beta1.MsgBeginRedelegateResponse;

        /**
         * Encodes the specified MsgBeginRedelegateResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgBeginRedelegateResponse.verify|verify} messages.
         * @param m MsgBeginRedelegateResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgBeginRedelegateResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgBeginRedelegateResponse;

        /**
         * Creates a MsgBeginRedelegateResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgBeginRedelegateResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgBeginRedelegateResponse;

        /**
         * Creates a plain object from a MsgBeginRedelegateResponse message. Also converts values to other types if specified.
         * @param m MsgBeginRedelegateResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgBeginRedelegateResponse,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgUndelegate,
        ): cosmos.staking.v1beta1.MsgUndelegate;

        /**
         * Encodes the specified MsgUndelegate message. Does not implicitly {@link cosmos.staking.v1beta1.MsgUndelegate.verify|verify} messages.
         * @param m MsgUndelegate message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgUndelegate,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgUndelegate;

        /**
         * Creates a MsgUndelegate message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgUndelegate
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgUndelegate;

        /**
         * Creates a plain object from a MsgUndelegate message. Also converts values to other types if specified.
         * @param m MsgUndelegate
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgUndelegate,
          o?: $protobuf.IConversionOptions,
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
          properties?: cosmos.staking.v1beta1.IMsgUndelegateResponse,
        ): cosmos.staking.v1beta1.MsgUndelegateResponse;

        /**
         * Encodes the specified MsgUndelegateResponse message. Does not implicitly {@link cosmos.staking.v1beta1.MsgUndelegateResponse.verify|verify} messages.
         * @param m MsgUndelegateResponse message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(
          m: cosmos.staking.v1beta1.IMsgUndelegateResponse,
          w?: $protobuf.Writer,
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
          l?: number,
        ): cosmos.staking.v1beta1.MsgUndelegateResponse;

        /**
         * Creates a MsgUndelegateResponse message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns MsgUndelegateResponse
         */
        public static fromObject(d: { [k: string]: any }): cosmos.staking.v1beta1.MsgUndelegateResponse;

        /**
         * Creates a plain object from a MsgUndelegateResponse message. Also converts values to other types if specified.
         * @param m MsgUndelegateResponse
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.staking.v1beta1.MsgUndelegateResponse,
          o?: $protobuf.IConversionOptions,
        ): { [k: string]: any };

        /**
         * Converts this MsgUndelegateResponse to JSON.
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
            properties?: cosmos.crypto.multisig.v1beta1.IMultiSignature,
          ): cosmos.crypto.multisig.v1beta1.MultiSignature;

          /**
           * Encodes the specified MultiSignature message. Does not implicitly {@link cosmos.crypto.multisig.v1beta1.MultiSignature.verify|verify} messages.
           * @param m MultiSignature message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.crypto.multisig.v1beta1.IMultiSignature,
            w?: $protobuf.Writer,
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
            l?: number,
          ): cosmos.crypto.multisig.v1beta1.MultiSignature;

          /**
           * Creates a MultiSignature message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MultiSignature
           */
          public static fromObject(d: { [k: string]: any }): cosmos.crypto.multisig.v1beta1.MultiSignature;

          /**
           * Creates a plain object from a MultiSignature message. Also converts values to other types if specified.
           * @param m MultiSignature
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.crypto.multisig.v1beta1.MultiSignature,
            o?: $protobuf.IConversionOptions,
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
            properties?: cosmos.crypto.multisig.v1beta1.ICompactBitArray,
          ): cosmos.crypto.multisig.v1beta1.CompactBitArray;

          /**
           * Encodes the specified CompactBitArray message. Does not implicitly {@link cosmos.crypto.multisig.v1beta1.CompactBitArray.verify|verify} messages.
           * @param m CompactBitArray message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.crypto.multisig.v1beta1.ICompactBitArray,
            w?: $protobuf.Writer,
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
            l?: number,
          ): cosmos.crypto.multisig.v1beta1.CompactBitArray;

          /**
           * Creates a CompactBitArray message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns CompactBitArray
           */
          public static fromObject(d: { [k: string]: any }): cosmos.crypto.multisig.v1beta1.CompactBitArray;

          /**
           * Creates a plain object from a CompactBitArray message. Also converts values to other types if specified.
           * @param m CompactBitArray
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.crypto.multisig.v1beta1.CompactBitArray,
            o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.crypto.secp256k1.IPubKey): cosmos.crypto.secp256k1.PubKey;

        /**
         * Encodes the specified PubKey message. Does not implicitly {@link cosmos.crypto.secp256k1.PubKey.verify|verify} messages.
         * @param m PubKey message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.crypto.secp256k1.IPubKey, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PubKey message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns PubKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.crypto.secp256k1.PubKey;

        /**
         * Creates a PubKey message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns PubKey
         */
        public static fromObject(d: { [k: string]: any }): cosmos.crypto.secp256k1.PubKey;

        /**
         * Creates a plain object from a PubKey message. Also converts values to other types if specified.
         * @param m PubKey
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.crypto.secp256k1.PubKey,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.crypto.secp256k1.IPrivKey): cosmos.crypto.secp256k1.PrivKey;

        /**
         * Encodes the specified PrivKey message. Does not implicitly {@link cosmos.crypto.secp256k1.PrivKey.verify|verify} messages.
         * @param m PrivKey message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.crypto.secp256k1.IPrivKey, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PrivKey message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns PrivKey
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.crypto.secp256k1.PrivKey;

        /**
         * Creates a PrivKey message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns PrivKey
         */
        public static fromObject(d: { [k: string]: any }): cosmos.crypto.secp256k1.PrivKey;

        /**
         * Creates a plain object from a PrivKey message. Also converts values to other types if specified.
         * @param m PrivKey
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.crypto.secp256k1.PrivKey,
          o?: $protobuf.IConversionOptions,
        ): { [k: string]: any };

        /**
         * Converts this PrivKey to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }
  }

  /** Namespace tx. */
  namespace tx {
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
        public static create(properties?: cosmos.tx.v1beta1.ITx): cosmos.tx.v1beta1.Tx;

        /**
         * Encodes the specified Tx message. Does not implicitly {@link cosmos.tx.v1beta1.Tx.verify|verify} messages.
         * @param m Tx message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.ITx, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Tx message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Tx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.Tx;

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
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.ITxRaw): cosmos.tx.v1beta1.TxRaw;

        /**
         * Encodes the specified TxRaw message. Does not implicitly {@link cosmos.tx.v1beta1.TxRaw.verify|verify} messages.
         * @param m TxRaw message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.ITxRaw, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TxRaw message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TxRaw
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.TxRaw;

        /**
         * Creates a TxRaw message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns TxRaw
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.TxRaw;

        /**
         * Creates a plain object from a TxRaw message. Also converts values to other types if specified.
         * @param m TxRaw
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.TxRaw,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.ISignDoc): cosmos.tx.v1beta1.SignDoc;

        /**
         * Encodes the specified SignDoc message. Does not implicitly {@link cosmos.tx.v1beta1.SignDoc.verify|verify} messages.
         * @param m SignDoc message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.ISignDoc, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignDoc message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignDoc
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.SignDoc;

        /**
         * Creates a SignDoc message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SignDoc
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.SignDoc;

        /**
         * Creates a plain object from a SignDoc message. Also converts values to other types if specified.
         * @param m SignDoc
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.SignDoc,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.ITxBody): cosmos.tx.v1beta1.TxBody;

        /**
         * Encodes the specified TxBody message. Does not implicitly {@link cosmos.tx.v1beta1.TxBody.verify|verify} messages.
         * @param m TxBody message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.ITxBody, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TxBody message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns TxBody
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.TxBody;

        /**
         * Creates a TxBody message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns TxBody
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.TxBody;

        /**
         * Creates a plain object from a TxBody message. Also converts values to other types if specified.
         * @param m TxBody
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.TxBody,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.IAuthInfo): cosmos.tx.v1beta1.AuthInfo;

        /**
         * Encodes the specified AuthInfo message. Does not implicitly {@link cosmos.tx.v1beta1.AuthInfo.verify|verify} messages.
         * @param m AuthInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.IAuthInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AuthInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns AuthInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.AuthInfo;

        /**
         * Creates an AuthInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns AuthInfo
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.AuthInfo;

        /**
         * Creates a plain object from an AuthInfo message. Also converts values to other types if specified.
         * @param m AuthInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.AuthInfo,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.ISignerInfo): cosmos.tx.v1beta1.SignerInfo;

        /**
         * Encodes the specified SignerInfo message. Does not implicitly {@link cosmos.tx.v1beta1.SignerInfo.verify|verify} messages.
         * @param m SignerInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.ISignerInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignerInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns SignerInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.SignerInfo;

        /**
         * Creates a SignerInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns SignerInfo
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.SignerInfo;

        /**
         * Creates a plain object from a SignerInfo message. Also converts values to other types if specified.
         * @param m SignerInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.SignerInfo,
          o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.IModeInfo): cosmos.tx.v1beta1.ModeInfo;

        /**
         * Encodes the specified ModeInfo message. Does not implicitly {@link cosmos.tx.v1beta1.ModeInfo.verify|verify} messages.
         * @param m ModeInfo message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.IModeInfo, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ModeInfo message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns ModeInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.ModeInfo;

        /**
         * Creates a ModeInfo message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns ModeInfo
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.ModeInfo;

        /**
         * Creates a plain object from a ModeInfo message. Also converts values to other types if specified.
         * @param m ModeInfo
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.ModeInfo,
          o?: $protobuf.IConversionOptions,
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
            properties?: cosmos.tx.v1beta1.ModeInfo.ISingle,
          ): cosmos.tx.v1beta1.ModeInfo.Single;

          /**
           * Encodes the specified Single message. Does not implicitly {@link cosmos.tx.v1beta1.ModeInfo.Single.verify|verify} messages.
           * @param m Single message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(m: cosmos.tx.v1beta1.ModeInfo.ISingle, w?: $protobuf.Writer): $protobuf.Writer;

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
            l?: number,
          ): cosmos.tx.v1beta1.ModeInfo.Single;

          /**
           * Creates a Single message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Single
           */
          public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.ModeInfo.Single;

          /**
           * Creates a plain object from a Single message. Also converts values to other types if specified.
           * @param m Single
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.v1beta1.ModeInfo.Single,
            o?: $protobuf.IConversionOptions,
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
            properties?: cosmos.tx.v1beta1.ModeInfo.IMulti,
          ): cosmos.tx.v1beta1.ModeInfo.Multi;

          /**
           * Encodes the specified Multi message. Does not implicitly {@link cosmos.tx.v1beta1.ModeInfo.Multi.verify|verify} messages.
           * @param m Multi message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(m: cosmos.tx.v1beta1.ModeInfo.IMulti, w?: $protobuf.Writer): $protobuf.Writer;

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
            l?: number,
          ): cosmos.tx.v1beta1.ModeInfo.Multi;

          /**
           * Creates a Multi message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Multi
           */
          public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.ModeInfo.Multi;

          /**
           * Creates a plain object from a Multi message. Also converts values to other types if specified.
           * @param m Multi
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.v1beta1.ModeInfo.Multi,
            o?: $protobuf.IConversionOptions,
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
        public static create(properties?: cosmos.tx.v1beta1.IFee): cosmos.tx.v1beta1.Fee;

        /**
         * Encodes the specified Fee message. Does not implicitly {@link cosmos.tx.v1beta1.Fee.verify|verify} messages.
         * @param m Fee message or plain object to encode
         * @param [w] Writer to encode to
         * @returns Writer
         */
        public static encode(m: cosmos.tx.v1beta1.IFee, w?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Fee message from the specified reader or buffer.
         * @param r Reader or buffer to decode from
         * @param [l] Message length if known beforehand
         * @returns Fee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(r: $protobuf.Reader | Uint8Array, l?: number): cosmos.tx.v1beta1.Fee;

        /**
         * Creates a Fee message from a plain object. Also converts values to their respective internal types.
         * @param d Plain object
         * @returns Fee
         */
        public static fromObject(d: { [k: string]: any }): cosmos.tx.v1beta1.Fee;

        /**
         * Creates a plain object from a Fee message. Also converts values to other types if specified.
         * @param m Fee
         * @param [o] Conversion options
         * @returns Plain object
         */
        public static toObject(
          m: cosmos.tx.v1beta1.Fee,
          o?: $protobuf.IConversionOptions,
        ): { [k: string]: any };

        /**
         * Converts this Fee to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
      }
    }

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
            properties?: cosmos.tx.signing.v1beta1.ISignatureDescriptors,
          ): cosmos.tx.signing.v1beta1.SignatureDescriptors;

          /**
           * Encodes the specified SignatureDescriptors message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptors.verify|verify} messages.
           * @param m SignatureDescriptors message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.tx.signing.v1beta1.ISignatureDescriptors,
            w?: $protobuf.Writer,
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
            l?: number,
          ): cosmos.tx.signing.v1beta1.SignatureDescriptors;

          /**
           * Creates a SignatureDescriptors message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns SignatureDescriptors
           */
          public static fromObject(d: { [k: string]: any }): cosmos.tx.signing.v1beta1.SignatureDescriptors;

          /**
           * Creates a plain object from a SignatureDescriptors message. Also converts values to other types if specified.
           * @param m SignatureDescriptors
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.signing.v1beta1.SignatureDescriptors,
            o?: $protobuf.IConversionOptions,
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
            properties?: cosmos.tx.signing.v1beta1.ISignatureDescriptor,
          ): cosmos.tx.signing.v1beta1.SignatureDescriptor;

          /**
           * Encodes the specified SignatureDescriptor message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.verify|verify} messages.
           * @param m SignatureDescriptor message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: cosmos.tx.signing.v1beta1.ISignatureDescriptor,
            w?: $protobuf.Writer,
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
            l?: number,
          ): cosmos.tx.signing.v1beta1.SignatureDescriptor;

          /**
           * Creates a SignatureDescriptor message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns SignatureDescriptor
           */
          public static fromObject(d: { [k: string]: any }): cosmos.tx.signing.v1beta1.SignatureDescriptor;

          /**
           * Creates a plain object from a SignatureDescriptor message. Also converts values to other types if specified.
           * @param m SignatureDescriptor
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: cosmos.tx.signing.v1beta1.SignatureDescriptor,
            o?: $protobuf.IConversionOptions,
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
            constructor(p?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData);

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
              properties?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData,
            ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data;

            /**
             * Encodes the specified Data message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.verify|verify} messages.
             * @param m Data message or plain object to encode
             * @param [w] Writer to encode to
             * @returns Writer
             */
            public static encode(
              m: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData,
              w?: $protobuf.Writer,
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
              l?: number,
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
              o?: $protobuf.IConversionOptions,
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
              constructor(p?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle);

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
                properties?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle,
              ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single;

              /**
               * Encodes the specified Single message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.verify|verify} messages.
               * @param m Single message or plain object to encode
               * @param [w] Writer to encode to
               * @returns Writer
               */
              public static encode(
                m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.ISingle,
                w?: $protobuf.Writer,
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
                l?: number,
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
                o?: $protobuf.IConversionOptions,
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
              signatures?: cosmos.tx.signing.v1beta1.SignatureDescriptor.IData[] | null;
            }

            /** Represents a Multi. */
            class Multi implements IMulti {
              /**
               * Constructs a new Multi.
               * @param [p] Properties to set
               */
              constructor(p?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti);

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
                properties?: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti,
              ): cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi;

              /**
               * Encodes the specified Multi message. Does not implicitly {@link cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.verify|verify} messages.
               * @param m Multi message or plain object to encode
               * @param [w] Writer to encode to
               * @returns Writer
               */
              public static encode(
                m: cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.IMulti,
                w?: $protobuf.Writer,
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
                l?: number,
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
                o?: $protobuf.IConversionOptions,
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
      public static create(properties?: google.protobuf.IAny): google.protobuf.Any;

      /**
       * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
       * @param m Any message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: google.protobuf.IAny, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes an Any message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Any
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): google.protobuf.Any;

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
      public static toObject(m: google.protobuf.Any, o?: $protobuf.IConversionOptions): { [k: string]: any };

      /**
       * Converts this Any to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
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
      public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

      /**
       * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
       * @param m Duration message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: google.protobuf.IDuration, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Duration message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Duration
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): google.protobuf.Duration;

      /**
       * Creates a Duration message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Duration
       */
      public static fromObject(d: { [k: string]: any }): google.protobuf.Duration;

      /**
       * Creates a plain object from a Duration message. Also converts values to other types if specified.
       * @param m Duration
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Duration,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

      /**
       * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
       * @param m Timestamp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: google.protobuf.ITimestamp, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Timestamp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Timestamp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): google.protobuf.Timestamp;

      /**
       * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Timestamp
       */
      public static fromObject(d: { [k: string]: any }): google.protobuf.Timestamp;

      /**
       * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
       * @param m Timestamp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: google.protobuf.Timestamp,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this Timestamp to JSON.
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
    /** Namespace client. */
    namespace client {
      /** Namespace v1. */
      namespace v1 {
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
            properties?: ibc.core.client.v1.IIdentifiedClientState,
          ): ibc.core.client.v1.IdentifiedClientState;

          /**
           * Encodes the specified IdentifiedClientState message. Does not implicitly {@link ibc.core.client.v1.IdentifiedClientState.verify|verify} messages.
           * @param m IdentifiedClientState message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IIdentifiedClientState,
            w?: $protobuf.Writer,
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
            l?: number,
          ): ibc.core.client.v1.IdentifiedClientState;

          /**
           * Creates an IdentifiedClientState message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns IdentifiedClientState
           */
          public static fromObject(d: { [k: string]: any }): ibc.core.client.v1.IdentifiedClientState;

          /**
           * Creates a plain object from an IdentifiedClientState message. Also converts values to other types if specified.
           * @param m IdentifiedClientState
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.IdentifiedClientState,
            o?: $protobuf.IConversionOptions,
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
            properties?: ibc.core.client.v1.IConsensusStateWithHeight,
          ): ibc.core.client.v1.ConsensusStateWithHeight;

          /**
           * Encodes the specified ConsensusStateWithHeight message. Does not implicitly {@link ibc.core.client.v1.ConsensusStateWithHeight.verify|verify} messages.
           * @param m ConsensusStateWithHeight message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IConsensusStateWithHeight,
            w?: $protobuf.Writer,
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
            l?: number,
          ): ibc.core.client.v1.ConsensusStateWithHeight;

          /**
           * Creates a ConsensusStateWithHeight message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ConsensusStateWithHeight
           */
          public static fromObject(d: { [k: string]: any }): ibc.core.client.v1.ConsensusStateWithHeight;

          /**
           * Creates a plain object from a ConsensusStateWithHeight message. Also converts values to other types if specified.
           * @param m ConsensusStateWithHeight
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.ConsensusStateWithHeight,
            o?: $protobuf.IConversionOptions,
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
          consensusStates?: ibc.core.client.v1.IConsensusStateWithHeight[] | null;
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
            properties?: ibc.core.client.v1.IClientConsensusStates,
          ): ibc.core.client.v1.ClientConsensusStates;

          /**
           * Encodes the specified ClientConsensusStates message. Does not implicitly {@link ibc.core.client.v1.ClientConsensusStates.verify|verify} messages.
           * @param m ClientConsensusStates message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IClientConsensusStates,
            w?: $protobuf.Writer,
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
            l?: number,
          ): ibc.core.client.v1.ClientConsensusStates;

          /**
           * Creates a ClientConsensusStates message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ClientConsensusStates
           */
          public static fromObject(d: { [k: string]: any }): ibc.core.client.v1.ClientConsensusStates;

          /**
           * Creates a plain object from a ClientConsensusStates message. Also converts values to other types if specified.
           * @param m ClientConsensusStates
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.ClientConsensusStates,
            o?: $protobuf.IConversionOptions,
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
            properties?: ibc.core.client.v1.IClientUpdateProposal,
          ): ibc.core.client.v1.ClientUpdateProposal;

          /**
           * Encodes the specified ClientUpdateProposal message. Does not implicitly {@link ibc.core.client.v1.ClientUpdateProposal.verify|verify} messages.
           * @param m ClientUpdateProposal message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.core.client.v1.IClientUpdateProposal,
            w?: $protobuf.Writer,
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
            l?: number,
          ): ibc.core.client.v1.ClientUpdateProposal;

          /**
           * Creates a ClientUpdateProposal message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns ClientUpdateProposal
           */
          public static fromObject(d: { [k: string]: any }): ibc.core.client.v1.ClientUpdateProposal;

          /**
           * Creates a plain object from a ClientUpdateProposal message. Also converts values to other types if specified.
           * @param m ClientUpdateProposal
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.ClientUpdateProposal,
            o?: $protobuf.IConversionOptions,
          ): { [k: string]: any };

          /**
           * Converts this ClientUpdateProposal to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of an Height. */
        interface IHeight {
          /** Height revisionNumber */
          revisionNumber?: Long | null;

          /** Height revisionHeight */
          revisionHeight?: Long | null;
        }

        /** Represents an Height. */
        class Height implements IHeight {
          /**
           * Constructs a new Height.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IHeight);

          /** Height revisionNumber. */
          public revisionNumber: Long;

          /** Height revisionHeight. */
          public revisionHeight: Long;

          /**
           * Creates a new Height instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Height instance
           */
          public static create(properties?: ibc.core.client.v1.IHeight): ibc.core.client.v1.Height;

          /**
           * Encodes the specified Height message. Does not implicitly {@link ibc.core.client.v1.Height.verify|verify} messages.
           * @param m Height message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(m: ibc.core.client.v1.IHeight, w?: $protobuf.Writer): $protobuf.Writer;

          /**
           * Decodes an Height message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Height
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(r: $protobuf.Reader | Uint8Array, l?: number): ibc.core.client.v1.Height;

          /**
           * Creates an Height message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Height
           */
          public static fromObject(d: { [k: string]: any }): ibc.core.client.v1.Height;

          /**
           * Creates a plain object from an Height message. Also converts values to other types if specified.
           * @param m Height
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.Height,
            o?: $protobuf.IConversionOptions,
          ): { [k: string]: any };

          /**
           * Converts this Height to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a Params. */
        interface IParams {
          /** Params allowedClients */
          allowedClients?: string[] | null;
        }

        /** Represents a Params. */
        class Params implements IParams {
          /**
           * Constructs a new Params.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.core.client.v1.IParams);

          /** Params allowedClients. */
          public allowedClients: string[];

          /**
           * Creates a new Params instance using the specified properties.
           * @param [properties] Properties to set
           * @returns Params instance
           */
          public static create(properties?: ibc.core.client.v1.IParams): ibc.core.client.v1.Params;

          /**
           * Encodes the specified Params message. Does not implicitly {@link ibc.core.client.v1.Params.verify|verify} messages.
           * @param m Params message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(m: ibc.core.client.v1.IParams, w?: $protobuf.Writer): $protobuf.Writer;

          /**
           * Decodes a Params message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns Params
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(r: $protobuf.Reader | Uint8Array, l?: number): ibc.core.client.v1.Params;

          /**
           * Creates a Params message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns Params
           */
          public static fromObject(d: { [k: string]: any }): ibc.core.client.v1.Params;

          /**
           * Creates a plain object from a Params message. Also converts values to other types if specified.
           * @param m Params
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.core.client.v1.Params,
            o?: $protobuf.IConversionOptions,
          ): { [k: string]: any };

          /**
           * Converts this Params to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }
      }
    }
  }

  /** Namespace applications. */
  namespace applications {
    /** Namespace transfer. */
    namespace transfer {
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
          constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

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
            responseDelimited?: boolean,
          ): Msg;

          /**
           * Calls Transfer.
           * @param request MsgTransfer message or plain object
           * @param callback Node-style callback called with the error, if any, and MsgTransferResponse
           */
          public transfer(
            request: ibc.applications.transfer.v1.IMsgTransfer,
            callback: ibc.applications.transfer.v1.Msg.TransferCallback,
          ): void;

          /**
           * Calls Transfer.
           * @param request MsgTransfer message or plain object
           * @returns Promise
           */
          public transfer(
            request: ibc.applications.transfer.v1.IMsgTransfer,
          ): Promise<ibc.applications.transfer.v1.MsgTransferResponse>;
        }

        namespace Msg {
          /**
           * Callback as used by {@link ibc.applications.transfer.v1.Msg#transfer}.
           * @param error Error, if any
           * @param [response] MsgTransferResponse
           */
          type TransferCallback = (
            error: Error | null,
            response?: ibc.applications.transfer.v1.MsgTransferResponse,
          ) => void;
        }

        /** Properties of a MsgTransfer. */
        interface IMsgTransfer {
          /** MsgTransfer sourcePort */
          sourcePort?: string | null;

          /** MsgTransfer sourceChannel */
          sourceChannel?: string | null;

          /** MsgTransfer token */
          token?: cosmos.base.v1beta1.ICoin | null;

          /** MsgTransfer sender */
          sender?: string | null;

          /** MsgTransfer receiver */
          receiver?: string | null;

          /** MsgTransfer timeoutHeight */
          timeoutHeight?: ibc.core.client.v1.IHeight | null;

          /** MsgTransfer timeoutTimestamp */
          timeoutTimestamp?: Long | null;
        }

        /** Represents a MsgTransfer. */
        class MsgTransfer implements IMsgTransfer {
          /**
           * Constructs a new MsgTransfer.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.applications.transfer.v1.IMsgTransfer);

          /** MsgTransfer sourcePort. */
          public sourcePort: string;

          /** MsgTransfer sourceChannel. */
          public sourceChannel: string;

          /** MsgTransfer token. */
          public token?: cosmos.base.v1beta1.ICoin | null;

          /** MsgTransfer sender. */
          public sender: string;

          /** MsgTransfer receiver. */
          public receiver: string;

          /** MsgTransfer timeoutHeight. */
          public timeoutHeight?: ibc.core.client.v1.IHeight | null;

          /** MsgTransfer timeoutTimestamp. */
          public timeoutTimestamp: Long;

          /**
           * Creates a new MsgTransfer instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgTransfer instance
           */
          public static create(
            properties?: ibc.applications.transfer.v1.IMsgTransfer,
          ): ibc.applications.transfer.v1.MsgTransfer;

          /**
           * Encodes the specified MsgTransfer message. Does not implicitly {@link ibc.applications.transfer.v1.MsgTransfer.verify|verify} messages.
           * @param m MsgTransfer message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.applications.transfer.v1.IMsgTransfer,
            w?: $protobuf.Writer,
          ): $protobuf.Writer;

          /**
           * Decodes a MsgTransfer message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgTransfer
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number,
          ): ibc.applications.transfer.v1.MsgTransfer;

          /**
           * Creates a MsgTransfer message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgTransfer
           */
          public static fromObject(d: { [k: string]: any }): ibc.applications.transfer.v1.MsgTransfer;

          /**
           * Creates a plain object from a MsgTransfer message. Also converts values to other types if specified.
           * @param m MsgTransfer
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.applications.transfer.v1.MsgTransfer,
            o?: $protobuf.IConversionOptions,
          ): { [k: string]: any };

          /**
           * Converts this MsgTransfer to JSON.
           * @returns JSON object
           */
          public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgTransferResponse. */
        interface IMsgTransferResponse {}

        /** Represents a MsgTransferResponse. */
        class MsgTransferResponse implements IMsgTransferResponse {
          /**
           * Constructs a new MsgTransferResponse.
           * @param [p] Properties to set
           */
          constructor(p?: ibc.applications.transfer.v1.IMsgTransferResponse);

          /**
           * Creates a new MsgTransferResponse instance using the specified properties.
           * @param [properties] Properties to set
           * @returns MsgTransferResponse instance
           */
          public static create(
            properties?: ibc.applications.transfer.v1.IMsgTransferResponse,
          ): ibc.applications.transfer.v1.MsgTransferResponse;

          /**
           * Encodes the specified MsgTransferResponse message. Does not implicitly {@link ibc.applications.transfer.v1.MsgTransferResponse.verify|verify} messages.
           * @param m MsgTransferResponse message or plain object to encode
           * @param [w] Writer to encode to
           * @returns Writer
           */
          public static encode(
            m: ibc.applications.transfer.v1.IMsgTransferResponse,
            w?: $protobuf.Writer,
          ): $protobuf.Writer;

          /**
           * Decodes a MsgTransferResponse message from the specified reader or buffer.
           * @param r Reader or buffer to decode from
           * @param [l] Message length if known beforehand
           * @returns MsgTransferResponse
           * @throws {Error} If the payload is not a reader or valid buffer
           * @throws {$protobuf.util.ProtocolError} If required fields are missing
           */
          public static decode(
            r: $protobuf.Reader | Uint8Array,
            l?: number,
          ): ibc.applications.transfer.v1.MsgTransferResponse;

          /**
           * Creates a MsgTransferResponse message from a plain object. Also converts values to their respective internal types.
           * @param d Plain object
           * @returns MsgTransferResponse
           */
          public static fromObject(d: { [k: string]: any }): ibc.applications.transfer.v1.MsgTransferResponse;

          /**
           * Creates a plain object from a MsgTransferResponse message. Also converts values to other types if specified.
           * @param m MsgTransferResponse
           * @param [o] Conversion options
           * @returns Plain object
           */
          public static toObject(
            m: ibc.applications.transfer.v1.MsgTransferResponse,
            o?: $protobuf.IConversionOptions,
          ): { [k: string]: any };

          /**
           * Converts this MsgTransferResponse to JSON.
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
      public static create(properties?: tendermint.crypto.IPublicKey): tendermint.crypto.PublicKey;

      /**
       * Encodes the specified PublicKey message. Does not implicitly {@link tendermint.crypto.PublicKey.verify|verify} messages.
       * @param m PublicKey message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.crypto.IPublicKey, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a PublicKey message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns PublicKey
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.crypto.PublicKey;

      /**
       * Creates a PublicKey message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns PublicKey
       */
      public static fromObject(d: { [k: string]: any }): tendermint.crypto.PublicKey;

      /**
       * Creates a plain object from a PublicKey message. Also converts values to other types if specified.
       * @param m PublicKey
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.PublicKey,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.crypto.IProof): tendermint.crypto.Proof;

      /**
       * Encodes the specified Proof message. Does not implicitly {@link tendermint.crypto.Proof.verify|verify} messages.
       * @param m Proof message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.crypto.IProof, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Proof message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Proof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.crypto.Proof;

      /**
       * Creates a Proof message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Proof
       */
      public static fromObject(d: { [k: string]: any }): tendermint.crypto.Proof;

      /**
       * Creates a plain object from a Proof message. Also converts values to other types if specified.
       * @param m Proof
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.Proof,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.crypto.IValueOp): tendermint.crypto.ValueOp;

      /**
       * Encodes the specified ValueOp message. Does not implicitly {@link tendermint.crypto.ValueOp.verify|verify} messages.
       * @param m ValueOp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.crypto.IValueOp, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a ValueOp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ValueOp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.crypto.ValueOp;

      /**
       * Creates a ValueOp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ValueOp
       */
      public static fromObject(d: { [k: string]: any }): tendermint.crypto.ValueOp;

      /**
       * Creates a plain object from a ValueOp message. Also converts values to other types if specified.
       * @param m ValueOp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.ValueOp,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.crypto.IDominoOp): tendermint.crypto.DominoOp;

      /**
       * Encodes the specified DominoOp message. Does not implicitly {@link tendermint.crypto.DominoOp.verify|verify} messages.
       * @param m DominoOp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.crypto.IDominoOp, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a DominoOp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns DominoOp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.crypto.DominoOp;

      /**
       * Creates a DominoOp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns DominoOp
       */
      public static fromObject(d: { [k: string]: any }): tendermint.crypto.DominoOp;

      /**
       * Creates a plain object from a DominoOp message. Also converts values to other types if specified.
       * @param m DominoOp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.DominoOp,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.crypto.IProofOp): tendermint.crypto.ProofOp;

      /**
       * Encodes the specified ProofOp message. Does not implicitly {@link tendermint.crypto.ProofOp.verify|verify} messages.
       * @param m ProofOp message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.crypto.IProofOp, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a ProofOp message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ProofOp
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.crypto.ProofOp;

      /**
       * Creates a ProofOp message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ProofOp
       */
      public static fromObject(d: { [k: string]: any }): tendermint.crypto.ProofOp;

      /**
       * Creates a plain object from a ProofOp message. Also converts values to other types if specified.
       * @param m ProofOp
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.ProofOp,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.crypto.IProofOps): tendermint.crypto.ProofOps;

      /**
       * Encodes the specified ProofOps message. Does not implicitly {@link tendermint.crypto.ProofOps.verify|verify} messages.
       * @param m ProofOps message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.crypto.IProofOps, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a ProofOps message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ProofOps
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.crypto.ProofOps;

      /**
       * Creates a ProofOps message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ProofOps
       */
      public static fromObject(d: { [k: string]: any }): tendermint.crypto.ProofOps;

      /**
       * Creates a plain object from a ProofOps message. Also converts values to other types if specified.
       * @param m ProofOps
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.crypto.ProofOps,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this ProofOps to JSON.
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
      public static create(properties?: tendermint.version.IApp): tendermint.version.App;

      /**
       * Encodes the specified App message. Does not implicitly {@link tendermint.version.App.verify|verify} messages.
       * @param m App message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.version.IApp, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes an App message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns App
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.version.App;

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
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.version.IConsensus): tendermint.version.Consensus;

      /**
       * Encodes the specified Consensus message. Does not implicitly {@link tendermint.version.Consensus.verify|verify} messages.
       * @param m Consensus message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.version.IConsensus, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Consensus message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Consensus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.version.Consensus;

      /**
       * Creates a Consensus message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Consensus
       */
      public static fromObject(d: { [k: string]: any }): tendermint.version.Consensus;

      /**
       * Creates a plain object from a Consensus message. Also converts values to other types if specified.
       * @param m Consensus
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.version.Consensus,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this Consensus to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }

  /** Namespace types. */
  namespace types {
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
      public static create(properties?: tendermint.types.IValidatorSet): tendermint.types.ValidatorSet;

      /**
       * Encodes the specified ValidatorSet message. Does not implicitly {@link tendermint.types.ValidatorSet.verify|verify} messages.
       * @param m ValidatorSet message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IValidatorSet, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a ValidatorSet message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns ValidatorSet
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.ValidatorSet;

      /**
       * Creates a ValidatorSet message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns ValidatorSet
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.ValidatorSet;

      /**
       * Creates a plain object from a ValidatorSet message. Also converts values to other types if specified.
       * @param m ValidatorSet
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.ValidatorSet,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IValidator): tendermint.types.Validator;

      /**
       * Encodes the specified Validator message. Does not implicitly {@link tendermint.types.Validator.verify|verify} messages.
       * @param m Validator message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IValidator, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Validator message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Validator
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Validator;

      /**
       * Creates a Validator message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Validator
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Validator;

      /**
       * Creates a plain object from a Validator message. Also converts values to other types if specified.
       * @param m Validator
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Validator,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.ISimpleValidator): tendermint.types.SimpleValidator;

      /**
       * Encodes the specified SimpleValidator message. Does not implicitly {@link tendermint.types.SimpleValidator.verify|verify} messages.
       * @param m SimpleValidator message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.ISimpleValidator, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a SimpleValidator message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns SimpleValidator
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.SimpleValidator;

      /**
       * Creates a SimpleValidator message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns SimpleValidator
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.SimpleValidator;

      /**
       * Creates a plain object from a SimpleValidator message. Also converts values to other types if specified.
       * @param m SimpleValidator
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.SimpleValidator,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this SimpleValidator to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }

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
      public static create(properties?: tendermint.types.IPartSetHeader): tendermint.types.PartSetHeader;

      /**
       * Encodes the specified PartSetHeader message. Does not implicitly {@link tendermint.types.PartSetHeader.verify|verify} messages.
       * @param m PartSetHeader message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IPartSetHeader, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a PartSetHeader message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns PartSetHeader
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.PartSetHeader;

      /**
       * Creates a PartSetHeader message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns PartSetHeader
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.PartSetHeader;

      /**
       * Creates a plain object from a PartSetHeader message. Also converts values to other types if specified.
       * @param m PartSetHeader
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.PartSetHeader,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IPart): tendermint.types.Part;

      /**
       * Encodes the specified Part message. Does not implicitly {@link tendermint.types.Part.verify|verify} messages.
       * @param m Part message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IPart, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Part message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Part
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Part;

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
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IBlockID): tendermint.types.BlockID;

      /**
       * Encodes the specified BlockID message. Does not implicitly {@link tendermint.types.BlockID.verify|verify} messages.
       * @param m BlockID message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IBlockID, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a BlockID message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns BlockID
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.BlockID;

      /**
       * Creates a BlockID message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns BlockID
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.BlockID;

      /**
       * Creates a plain object from a BlockID message. Also converts values to other types if specified.
       * @param m BlockID
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.BlockID,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IHeader): tendermint.types.Header;

      /**
       * Encodes the specified Header message. Does not implicitly {@link tendermint.types.Header.verify|verify} messages.
       * @param m Header message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IHeader, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Header message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Header
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Header;

      /**
       * Creates a Header message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Header
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Header;

      /**
       * Creates a plain object from a Header message. Also converts values to other types if specified.
       * @param m Header
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Header,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IData): tendermint.types.Data;

      /**
       * Encodes the specified Data message. Does not implicitly {@link tendermint.types.Data.verify|verify} messages.
       * @param m Data message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IData, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Data message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Data
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Data;

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
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IVote): tendermint.types.Vote;

      /**
       * Encodes the specified Vote message. Does not implicitly {@link tendermint.types.Vote.verify|verify} messages.
       * @param m Vote message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IVote, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Vote message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Vote
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Vote;

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
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.ICommit): tendermint.types.Commit;

      /**
       * Encodes the specified Commit message. Does not implicitly {@link tendermint.types.Commit.verify|verify} messages.
       * @param m Commit message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.ICommit, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Commit message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Commit
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Commit;

      /**
       * Creates a Commit message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Commit
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Commit;

      /**
       * Creates a plain object from a Commit message. Also converts values to other types if specified.
       * @param m Commit
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Commit,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.ICommitSig): tendermint.types.CommitSig;

      /**
       * Encodes the specified CommitSig message. Does not implicitly {@link tendermint.types.CommitSig.verify|verify} messages.
       * @param m CommitSig message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.ICommitSig, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a CommitSig message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns CommitSig
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.CommitSig;

      /**
       * Creates a CommitSig message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns CommitSig
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.CommitSig;

      /**
       * Creates a plain object from a CommitSig message. Also converts values to other types if specified.
       * @param m CommitSig
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.CommitSig,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IProposal): tendermint.types.Proposal;

      /**
       * Encodes the specified Proposal message. Does not implicitly {@link tendermint.types.Proposal.verify|verify} messages.
       * @param m Proposal message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IProposal, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a Proposal message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns Proposal
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.Proposal;

      /**
       * Creates a Proposal message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns Proposal
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.Proposal;

      /**
       * Creates a plain object from a Proposal message. Also converts values to other types if specified.
       * @param m Proposal
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.Proposal,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.ISignedHeader): tendermint.types.SignedHeader;

      /**
       * Encodes the specified SignedHeader message. Does not implicitly {@link tendermint.types.SignedHeader.verify|verify} messages.
       * @param m SignedHeader message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.ISignedHeader, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a SignedHeader message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns SignedHeader
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.SignedHeader;

      /**
       * Creates a SignedHeader message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns SignedHeader
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.SignedHeader;

      /**
       * Creates a plain object from a SignedHeader message. Also converts values to other types if specified.
       * @param m SignedHeader
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.SignedHeader,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.ILightBlock): tendermint.types.LightBlock;

      /**
       * Encodes the specified LightBlock message. Does not implicitly {@link tendermint.types.LightBlock.verify|verify} messages.
       * @param m LightBlock message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.ILightBlock, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a LightBlock message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns LightBlock
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.LightBlock;

      /**
       * Creates a LightBlock message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns LightBlock
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.LightBlock;

      /**
       * Creates a plain object from a LightBlock message. Also converts values to other types if specified.
       * @param m LightBlock
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.LightBlock,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.IBlockMeta): tendermint.types.BlockMeta;

      /**
       * Encodes the specified BlockMeta message. Does not implicitly {@link tendermint.types.BlockMeta.verify|verify} messages.
       * @param m BlockMeta message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.IBlockMeta, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a BlockMeta message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns BlockMeta
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.BlockMeta;

      /**
       * Creates a BlockMeta message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns BlockMeta
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.BlockMeta;

      /**
       * Creates a plain object from a BlockMeta message. Also converts values to other types if specified.
       * @param m BlockMeta
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.BlockMeta,
        o?: $protobuf.IConversionOptions,
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
      public static create(properties?: tendermint.types.ITxProof): tendermint.types.TxProof;

      /**
       * Encodes the specified TxProof message. Does not implicitly {@link tendermint.types.TxProof.verify|verify} messages.
       * @param m TxProof message or plain object to encode
       * @param [w] Writer to encode to
       * @returns Writer
       */
      public static encode(m: tendermint.types.ITxProof, w?: $protobuf.Writer): $protobuf.Writer;

      /**
       * Decodes a TxProof message from the specified reader or buffer.
       * @param r Reader or buffer to decode from
       * @param [l] Message length if known beforehand
       * @returns TxProof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      public static decode(r: $protobuf.Reader | Uint8Array, l?: number): tendermint.types.TxProof;

      /**
       * Creates a TxProof message from a plain object. Also converts values to their respective internal types.
       * @param d Plain object
       * @returns TxProof
       */
      public static fromObject(d: { [k: string]: any }): tendermint.types.TxProof;

      /**
       * Creates a plain object from a TxProof message. Also converts values to other types if specified.
       * @param m TxProof
       * @param [o] Conversion options
       * @returns Plain object
       */
      public static toObject(
        m: tendermint.types.TxProof,
        o?: $protobuf.IConversionOptions,
      ): { [k: string]: any };

      /**
       * Converts this TxProof to JSON.
       * @returns JSON object
       */
      public toJSON(): { [k: string]: any };
    }
  }
}

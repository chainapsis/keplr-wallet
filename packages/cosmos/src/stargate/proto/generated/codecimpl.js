"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tendermint = exports.ibc = exports.google = exports.cosmos = void 0;
var $protobuf = require("protobufjs/minimal");
const $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;
const $root = {};
exports.cosmos = $root.cosmos = (() => {
  const cosmos = {};
  cosmos.auth = (function () {
    const auth = {};
    auth.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.BaseAccount = (function () {
        function BaseAccount(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        BaseAccount.prototype.address = "";
        BaseAccount.prototype.pubKey = null;
        BaseAccount.prototype.accountNumber = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        BaseAccount.prototype.sequence = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        BaseAccount.create = function create(properties) {
          return new BaseAccount(properties);
        };
        BaseAccount.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.pubKey != null && Object.hasOwnProperty.call(m, "pubKey"))
            $root.google.protobuf.Any.encode(
              m.pubKey,
              w.uint32(18).fork()
            ).ldelim();
          if (
            m.accountNumber != null &&
            Object.hasOwnProperty.call(m, "accountNumber")
          )
            w.uint32(24).uint64(m.accountNumber);
          if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
            w.uint32(32).uint64(m.sequence);
          return w;
        };
        BaseAccount.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.BaseAccount();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.pubKey = $root.google.protobuf.Any.decode(r, r.uint32());
                break;
              case 3:
                m.accountNumber = r.uint64();
                break;
              case 4:
                m.sequence = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        BaseAccount.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.BaseAccount) return d;
          var m = new $root.cosmos.auth.v1beta1.BaseAccount();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.pubKey != null) {
            if (typeof d.pubKey !== "object")
              throw TypeError(
                ".cosmos.auth.v1beta1.BaseAccount.pubKey: object expected"
              );
            m.pubKey = $root.google.protobuf.Any.fromObject(d.pubKey);
          }
          if (d.accountNumber != null) {
            if ($util.Long)
              (m.accountNumber = $util.Long.fromValue(
                d.accountNumber
              )).unsigned = true;
            else if (typeof d.accountNumber === "string")
              m.accountNumber = parseInt(d.accountNumber, 10);
            else if (typeof d.accountNumber === "number")
              m.accountNumber = d.accountNumber;
            else if (typeof d.accountNumber === "object")
              m.accountNumber = new $util.LongBits(
                d.accountNumber.low >>> 0,
                d.accountNumber.high >>> 0
              ).toNumber(true);
          }
          if (d.sequence != null) {
            if ($util.Long)
              (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
            else if (typeof d.sequence === "string")
              m.sequence = parseInt(d.sequence, 10);
            else if (typeof d.sequence === "number") m.sequence = d.sequence;
            else if (typeof d.sequence === "object")
              m.sequence = new $util.LongBits(
                d.sequence.low >>> 0,
                d.sequence.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        BaseAccount.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.address = "";
            d.pubKey = null;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.accountNumber =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.accountNumber = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.sequence =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.sequence = o.longs === String ? "0" : 0;
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.pubKey != null && m.hasOwnProperty("pubKey")) {
            d.pubKey = $root.google.protobuf.Any.toObject(m.pubKey, o);
          }
          if (m.accountNumber != null && m.hasOwnProperty("accountNumber")) {
            if (typeof m.accountNumber === "number")
              d.accountNumber =
                o.longs === String ? String(m.accountNumber) : m.accountNumber;
            else
              d.accountNumber =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.accountNumber)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.accountNumber.low >>> 0,
                      m.accountNumber.high >>> 0
                    ).toNumber(true)
                  : m.accountNumber;
          }
          if (m.sequence != null && m.hasOwnProperty("sequence")) {
            if (typeof m.sequence === "number")
              d.sequence = o.longs === String ? String(m.sequence) : m.sequence;
            else
              d.sequence =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.sequence)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.sequence.low >>> 0,
                      m.sequence.high >>> 0
                    ).toNumber(true)
                  : m.sequence;
          }
          return d;
        };
        BaseAccount.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return BaseAccount;
      })();
      v1beta1.ModuleAccount = (function () {
        function ModuleAccount(p) {
          this.permissions = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        ModuleAccount.prototype.baseAccount = null;
        ModuleAccount.prototype.name = "";
        ModuleAccount.prototype.permissions = $util.emptyArray;
        ModuleAccount.create = function create(properties) {
          return new ModuleAccount(properties);
        };
        ModuleAccount.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.baseAccount != null &&
            Object.hasOwnProperty.call(m, "baseAccount")
          )
            $root.cosmos.auth.v1beta1.BaseAccount.encode(
              m.baseAccount,
              w.uint32(10).fork()
            ).ldelim();
          if (m.name != null && Object.hasOwnProperty.call(m, "name"))
            w.uint32(18).string(m.name);
          if (m.permissions != null && m.permissions.length) {
            for (var i = 0; i < m.permissions.length; ++i)
              w.uint32(26).string(m.permissions[i]);
          }
          return w;
        };
        ModuleAccount.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.ModuleAccount();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.baseAccount = $root.cosmos.auth.v1beta1.BaseAccount.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.name = r.string();
                break;
              case 3:
                if (!(m.permissions && m.permissions.length))
                  m.permissions = [];
                m.permissions.push(r.string());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        ModuleAccount.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.ModuleAccount) return d;
          var m = new $root.cosmos.auth.v1beta1.ModuleAccount();
          if (d.baseAccount != null) {
            if (typeof d.baseAccount !== "object")
              throw TypeError(
                ".cosmos.auth.v1beta1.ModuleAccount.baseAccount: object expected"
              );
            m.baseAccount = $root.cosmos.auth.v1beta1.BaseAccount.fromObject(
              d.baseAccount
            );
          }
          if (d.name != null) {
            m.name = String(d.name);
          }
          if (d.permissions) {
            if (!Array.isArray(d.permissions))
              throw TypeError(
                ".cosmos.auth.v1beta1.ModuleAccount.permissions: array expected"
              );
            m.permissions = [];
            for (var i = 0; i < d.permissions.length; ++i) {
              m.permissions[i] = String(d.permissions[i]);
            }
          }
          return m;
        };
        ModuleAccount.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.permissions = [];
          }
          if (o.defaults) {
            d.baseAccount = null;
            d.name = "";
          }
          if (m.baseAccount != null && m.hasOwnProperty("baseAccount")) {
            d.baseAccount = $root.cosmos.auth.v1beta1.BaseAccount.toObject(
              m.baseAccount,
              o
            );
          }
          if (m.name != null && m.hasOwnProperty("name")) {
            d.name = m.name;
          }
          if (m.permissions && m.permissions.length) {
            d.permissions = [];
            for (var j = 0; j < m.permissions.length; ++j) {
              d.permissions[j] = m.permissions[j];
            }
          }
          return d;
        };
        ModuleAccount.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return ModuleAccount;
      })();
      v1beta1.Params = (function () {
        function Params(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Params.prototype.maxMemoCharacters = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Params.prototype.txSigLimit = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Params.prototype.txSizeCostPerByte = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Params.prototype.sigVerifyCostEd25519 = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Params.prototype.sigVerifyCostSecp256k1 = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Params.create = function create(properties) {
          return new Params(properties);
        };
        Params.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.maxMemoCharacters != null &&
            Object.hasOwnProperty.call(m, "maxMemoCharacters")
          )
            w.uint32(8).uint64(m.maxMemoCharacters);
          if (
            m.txSigLimit != null &&
            Object.hasOwnProperty.call(m, "txSigLimit")
          )
            w.uint32(16).uint64(m.txSigLimit);
          if (
            m.txSizeCostPerByte != null &&
            Object.hasOwnProperty.call(m, "txSizeCostPerByte")
          )
            w.uint32(24).uint64(m.txSizeCostPerByte);
          if (
            m.sigVerifyCostEd25519 != null &&
            Object.hasOwnProperty.call(m, "sigVerifyCostEd25519")
          )
            w.uint32(32).uint64(m.sigVerifyCostEd25519);
          if (
            m.sigVerifyCostSecp256k1 != null &&
            Object.hasOwnProperty.call(m, "sigVerifyCostSecp256k1")
          )
            w.uint32(40).uint64(m.sigVerifyCostSecp256k1);
          return w;
        };
        Params.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.Params();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.maxMemoCharacters = r.uint64();
                break;
              case 2:
                m.txSigLimit = r.uint64();
                break;
              case 3:
                m.txSizeCostPerByte = r.uint64();
                break;
              case 4:
                m.sigVerifyCostEd25519 = r.uint64();
                break;
              case 5:
                m.sigVerifyCostSecp256k1 = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Params.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.Params) return d;
          var m = new $root.cosmos.auth.v1beta1.Params();
          if (d.maxMemoCharacters != null) {
            if ($util.Long)
              (m.maxMemoCharacters = $util.Long.fromValue(
                d.maxMemoCharacters
              )).unsigned = true;
            else if (typeof d.maxMemoCharacters === "string")
              m.maxMemoCharacters = parseInt(d.maxMemoCharacters, 10);
            else if (typeof d.maxMemoCharacters === "number")
              m.maxMemoCharacters = d.maxMemoCharacters;
            else if (typeof d.maxMemoCharacters === "object")
              m.maxMemoCharacters = new $util.LongBits(
                d.maxMemoCharacters.low >>> 0,
                d.maxMemoCharacters.high >>> 0
              ).toNumber(true);
          }
          if (d.txSigLimit != null) {
            if ($util.Long)
              (m.txSigLimit = $util.Long.fromValue(
                d.txSigLimit
              )).unsigned = true;
            else if (typeof d.txSigLimit === "string")
              m.txSigLimit = parseInt(d.txSigLimit, 10);
            else if (typeof d.txSigLimit === "number")
              m.txSigLimit = d.txSigLimit;
            else if (typeof d.txSigLimit === "object")
              m.txSigLimit = new $util.LongBits(
                d.txSigLimit.low >>> 0,
                d.txSigLimit.high >>> 0
              ).toNumber(true);
          }
          if (d.txSizeCostPerByte != null) {
            if ($util.Long)
              (m.txSizeCostPerByte = $util.Long.fromValue(
                d.txSizeCostPerByte
              )).unsigned = true;
            else if (typeof d.txSizeCostPerByte === "string")
              m.txSizeCostPerByte = parseInt(d.txSizeCostPerByte, 10);
            else if (typeof d.txSizeCostPerByte === "number")
              m.txSizeCostPerByte = d.txSizeCostPerByte;
            else if (typeof d.txSizeCostPerByte === "object")
              m.txSizeCostPerByte = new $util.LongBits(
                d.txSizeCostPerByte.low >>> 0,
                d.txSizeCostPerByte.high >>> 0
              ).toNumber(true);
          }
          if (d.sigVerifyCostEd25519 != null) {
            if ($util.Long)
              (m.sigVerifyCostEd25519 = $util.Long.fromValue(
                d.sigVerifyCostEd25519
              )).unsigned = true;
            else if (typeof d.sigVerifyCostEd25519 === "string")
              m.sigVerifyCostEd25519 = parseInt(d.sigVerifyCostEd25519, 10);
            else if (typeof d.sigVerifyCostEd25519 === "number")
              m.sigVerifyCostEd25519 = d.sigVerifyCostEd25519;
            else if (typeof d.sigVerifyCostEd25519 === "object")
              m.sigVerifyCostEd25519 = new $util.LongBits(
                d.sigVerifyCostEd25519.low >>> 0,
                d.sigVerifyCostEd25519.high >>> 0
              ).toNumber(true);
          }
          if (d.sigVerifyCostSecp256k1 != null) {
            if ($util.Long)
              (m.sigVerifyCostSecp256k1 = $util.Long.fromValue(
                d.sigVerifyCostSecp256k1
              )).unsigned = true;
            else if (typeof d.sigVerifyCostSecp256k1 === "string")
              m.sigVerifyCostSecp256k1 = parseInt(d.sigVerifyCostSecp256k1, 10);
            else if (typeof d.sigVerifyCostSecp256k1 === "number")
              m.sigVerifyCostSecp256k1 = d.sigVerifyCostSecp256k1;
            else if (typeof d.sigVerifyCostSecp256k1 === "object")
              m.sigVerifyCostSecp256k1 = new $util.LongBits(
                d.sigVerifyCostSecp256k1.low >>> 0,
                d.sigVerifyCostSecp256k1.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        Params.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.maxMemoCharacters =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.maxMemoCharacters = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.txSigLimit =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.txSigLimit = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.txSizeCostPerByte =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.txSizeCostPerByte = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.sigVerifyCostEd25519 =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.sigVerifyCostEd25519 = o.longs === String ? "0" : 0;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.sigVerifyCostSecp256k1 =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.sigVerifyCostSecp256k1 = o.longs === String ? "0" : 0;
          }
          if (
            m.maxMemoCharacters != null &&
            m.hasOwnProperty("maxMemoCharacters")
          ) {
            if (typeof m.maxMemoCharacters === "number")
              d.maxMemoCharacters =
                o.longs === String
                  ? String(m.maxMemoCharacters)
                  : m.maxMemoCharacters;
            else
              d.maxMemoCharacters =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.maxMemoCharacters)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.maxMemoCharacters.low >>> 0,
                      m.maxMemoCharacters.high >>> 0
                    ).toNumber(true)
                  : m.maxMemoCharacters;
          }
          if (m.txSigLimit != null && m.hasOwnProperty("txSigLimit")) {
            if (typeof m.txSigLimit === "number")
              d.txSigLimit =
                o.longs === String ? String(m.txSigLimit) : m.txSigLimit;
            else
              d.txSigLimit =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.txSigLimit)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.txSigLimit.low >>> 0,
                      m.txSigLimit.high >>> 0
                    ).toNumber(true)
                  : m.txSigLimit;
          }
          if (
            m.txSizeCostPerByte != null &&
            m.hasOwnProperty("txSizeCostPerByte")
          ) {
            if (typeof m.txSizeCostPerByte === "number")
              d.txSizeCostPerByte =
                o.longs === String
                  ? String(m.txSizeCostPerByte)
                  : m.txSizeCostPerByte;
            else
              d.txSizeCostPerByte =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.txSizeCostPerByte)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.txSizeCostPerByte.low >>> 0,
                      m.txSizeCostPerByte.high >>> 0
                    ).toNumber(true)
                  : m.txSizeCostPerByte;
          }
          if (
            m.sigVerifyCostEd25519 != null &&
            m.hasOwnProperty("sigVerifyCostEd25519")
          ) {
            if (typeof m.sigVerifyCostEd25519 === "number")
              d.sigVerifyCostEd25519 =
                o.longs === String
                  ? String(m.sigVerifyCostEd25519)
                  : m.sigVerifyCostEd25519;
            else
              d.sigVerifyCostEd25519 =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.sigVerifyCostEd25519)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.sigVerifyCostEd25519.low >>> 0,
                      m.sigVerifyCostEd25519.high >>> 0
                    ).toNumber(true)
                  : m.sigVerifyCostEd25519;
          }
          if (
            m.sigVerifyCostSecp256k1 != null &&
            m.hasOwnProperty("sigVerifyCostSecp256k1")
          ) {
            if (typeof m.sigVerifyCostSecp256k1 === "number")
              d.sigVerifyCostSecp256k1 =
                o.longs === String
                  ? String(m.sigVerifyCostSecp256k1)
                  : m.sigVerifyCostSecp256k1;
            else
              d.sigVerifyCostSecp256k1 =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.sigVerifyCostSecp256k1)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.sigVerifyCostSecp256k1.low >>> 0,
                      m.sigVerifyCostSecp256k1.high >>> 0
                    ).toNumber(true)
                  : m.sigVerifyCostSecp256k1;
          }
          return d;
        };
        Params.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Params;
      })();
      v1beta1.Query = (function () {
        function Query(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Query.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Query;
        Query.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Query.prototype.account = function account(request, callback) {
            return this.rpcCall(
              account,
              $root.cosmos.auth.v1beta1.QueryAccountRequest,
              $root.cosmos.auth.v1beta1.QueryAccountResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Account" }
        );
        Object.defineProperty(
          (Query.prototype.params = function params(request, callback) {
            return this.rpcCall(
              params,
              $root.cosmos.auth.v1beta1.QueryParamsRequest,
              $root.cosmos.auth.v1beta1.QueryParamsResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Params" }
        );
        return Query;
      })();
      v1beta1.QueryAccountRequest = (function () {
        function QueryAccountRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryAccountRequest.prototype.address = "";
        QueryAccountRequest.create = function create(properties) {
          return new QueryAccountRequest(properties);
        };
        QueryAccountRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          return w;
        };
        QueryAccountRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.QueryAccountRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryAccountRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.QueryAccountRequest)
            return d;
          var m = new $root.cosmos.auth.v1beta1.QueryAccountRequest();
          if (d.address != null) {
            m.address = String(d.address);
          }
          return m;
        };
        QueryAccountRequest.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.address = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          return d;
        };
        QueryAccountRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryAccountRequest;
      })();
      v1beta1.QueryAccountResponse = (function () {
        function QueryAccountResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryAccountResponse.prototype.account = null;
        QueryAccountResponse.create = function create(properties) {
          return new QueryAccountResponse(properties);
        };
        QueryAccountResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.account != null && Object.hasOwnProperty.call(m, "account"))
            $root.google.protobuf.Any.encode(
              m.account,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        QueryAccountResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.QueryAccountResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.account = $root.google.protobuf.Any.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryAccountResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.QueryAccountResponse)
            return d;
          var m = new $root.cosmos.auth.v1beta1.QueryAccountResponse();
          if (d.account != null) {
            if (typeof d.account !== "object")
              throw TypeError(
                ".cosmos.auth.v1beta1.QueryAccountResponse.account: object expected"
              );
            m.account = $root.google.protobuf.Any.fromObject(d.account);
          }
          return m;
        };
        QueryAccountResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.account = null;
          }
          if (m.account != null && m.hasOwnProperty("account")) {
            d.account = $root.google.protobuf.Any.toObject(m.account, o);
          }
          return d;
        };
        QueryAccountResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryAccountResponse;
      })();
      v1beta1.QueryParamsRequest = (function () {
        function QueryParamsRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryParamsRequest.create = function create(properties) {
          return new QueryParamsRequest(properties);
        };
        QueryParamsRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        QueryParamsRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.QueryParamsRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryParamsRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.QueryParamsRequest)
            return d;
          return new $root.cosmos.auth.v1beta1.QueryParamsRequest();
        };
        QueryParamsRequest.toObject = function toObject() {
          return {};
        };
        QueryParamsRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryParamsRequest;
      })();
      v1beta1.QueryParamsResponse = (function () {
        function QueryParamsResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryParamsResponse.prototype.params = null;
        QueryParamsResponse.create = function create(properties) {
          return new QueryParamsResponse(properties);
        };
        QueryParamsResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.params != null && Object.hasOwnProperty.call(m, "params"))
            $root.cosmos.auth.v1beta1.Params.encode(
              m.params,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        QueryParamsResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.auth.v1beta1.QueryParamsResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.params = $root.cosmos.auth.v1beta1.Params.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryParamsResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.auth.v1beta1.QueryParamsResponse)
            return d;
          var m = new $root.cosmos.auth.v1beta1.QueryParamsResponse();
          if (d.params != null) {
            if (typeof d.params !== "object")
              throw TypeError(
                ".cosmos.auth.v1beta1.QueryParamsResponse.params: object expected"
              );
            m.params = $root.cosmos.auth.v1beta1.Params.fromObject(d.params);
          }
          return m;
        };
        QueryParamsResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.params = null;
          }
          if (m.params != null && m.hasOwnProperty("params")) {
            d.params = $root.cosmos.auth.v1beta1.Params.toObject(m.params, o);
          }
          return d;
        };
        QueryParamsResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryParamsResponse;
      })();
      return v1beta1;
    })();
    return auth;
  })();
  cosmos.bank = (function () {
    const bank = {};
    bank.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Params = (function () {
        function Params(p) {
          this.sendEnabled = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Params.prototype.sendEnabled = $util.emptyArray;
        Params.prototype.defaultSendEnabled = false;
        Params.create = function create(properties) {
          return new Params(properties);
        };
        Params.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.sendEnabled != null && m.sendEnabled.length) {
            for (var i = 0; i < m.sendEnabled.length; ++i)
              $root.cosmos.bank.v1beta1.SendEnabled.encode(
                m.sendEnabled[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.defaultSendEnabled != null &&
            Object.hasOwnProperty.call(m, "defaultSendEnabled")
          )
            w.uint32(16).bool(m.defaultSendEnabled);
          return w;
        };
        Params.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Params();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.sendEnabled && m.sendEnabled.length))
                  m.sendEnabled = [];
                m.sendEnabled.push(
                  $root.cosmos.bank.v1beta1.SendEnabled.decode(r, r.uint32())
                );
                break;
              case 2:
                m.defaultSendEnabled = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Params.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Params) return d;
          var m = new $root.cosmos.bank.v1beta1.Params();
          if (d.sendEnabled) {
            if (!Array.isArray(d.sendEnabled))
              throw TypeError(
                ".cosmos.bank.v1beta1.Params.sendEnabled: array expected"
              );
            m.sendEnabled = [];
            for (var i = 0; i < d.sendEnabled.length; ++i) {
              if (typeof d.sendEnabled[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Params.sendEnabled: object expected"
                );
              m.sendEnabled[
                i
              ] = $root.cosmos.bank.v1beta1.SendEnabled.fromObject(
                d.sendEnabled[i]
              );
            }
          }
          if (d.defaultSendEnabled != null) {
            m.defaultSendEnabled = Boolean(d.defaultSendEnabled);
          }
          return m;
        };
        Params.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.sendEnabled = [];
          }
          if (o.defaults) {
            d.defaultSendEnabled = false;
          }
          if (m.sendEnabled && m.sendEnabled.length) {
            d.sendEnabled = [];
            for (var j = 0; j < m.sendEnabled.length; ++j) {
              d.sendEnabled[j] = $root.cosmos.bank.v1beta1.SendEnabled.toObject(
                m.sendEnabled[j],
                o
              );
            }
          }
          if (
            m.defaultSendEnabled != null &&
            m.hasOwnProperty("defaultSendEnabled")
          ) {
            d.defaultSendEnabled = m.defaultSendEnabled;
          }
          return d;
        };
        Params.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Params;
      })();
      v1beta1.SendEnabled = (function () {
        function SendEnabled(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SendEnabled.prototype.denom = "";
        SendEnabled.prototype.enabled = false;
        SendEnabled.create = function create(properties) {
          return new SendEnabled(properties);
        };
        SendEnabled.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.enabled != null && Object.hasOwnProperty.call(m, "enabled"))
            w.uint32(16).bool(m.enabled);
          return w;
        };
        SendEnabled.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.SendEnabled();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.enabled = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SendEnabled.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.SendEnabled) return d;
          var m = new $root.cosmos.bank.v1beta1.SendEnabled();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.enabled != null) {
            m.enabled = Boolean(d.enabled);
          }
          return m;
        };
        SendEnabled.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
            d.enabled = false;
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.enabled != null && m.hasOwnProperty("enabled")) {
            d.enabled = m.enabled;
          }
          return d;
        };
        SendEnabled.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SendEnabled;
      })();
      v1beta1.Input = (function () {
        function Input(p) {
          this.coins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Input.prototype.address = "";
        Input.prototype.coins = $util.emptyArray;
        Input.create = function create(properties) {
          return new Input(properties);
        };
        Input.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.coins[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        Input.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Input();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                if (!(m.coins && m.coins.length)) m.coins = [];
                m.coins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Input.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Input) return d;
          var m = new $root.cosmos.bank.v1beta1.Input();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.coins) {
            if (!Array.isArray(d.coins))
              throw TypeError(
                ".cosmos.bank.v1beta1.Input.coins: array expected"
              );
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Input.coins: object expected"
                );
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.coins[i]
              );
            }
          }
          return m;
        };
        Input.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.coins = [];
          }
          if (o.defaults) {
            d.address = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.coins && m.coins.length) {
            d.coins = [];
            for (var j = 0; j < m.coins.length; ++j) {
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.coins[j],
                o
              );
            }
          }
          return d;
        };
        Input.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Input;
      })();
      v1beta1.Output = (function () {
        function Output(p) {
          this.coins = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Output.prototype.address = "";
        Output.prototype.coins = $util.emptyArray;
        Output.create = function create(properties) {
          return new Output(properties);
        };
        Output.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.coins[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        Output.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Output();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                if (!(m.coins && m.coins.length)) m.coins = [];
                m.coins.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Output.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Output) return d;
          var m = new $root.cosmos.bank.v1beta1.Output();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.coins) {
            if (!Array.isArray(d.coins))
              throw TypeError(
                ".cosmos.bank.v1beta1.Output.coins: array expected"
              );
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Output.coins: object expected"
                );
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.coins[i]
              );
            }
          }
          return m;
        };
        Output.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.coins = [];
          }
          if (o.defaults) {
            d.address = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.coins && m.coins.length) {
            d.coins = [];
            for (var j = 0; j < m.coins.length; ++j) {
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.coins[j],
                o
              );
            }
          }
          return d;
        };
        Output.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Output;
      })();
      v1beta1.Supply = (function () {
        function Supply(p) {
          this.total = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Supply.prototype.total = $util.emptyArray;
        Supply.create = function create(properties) {
          return new Supply(properties);
        };
        Supply.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.total != null && m.total.length) {
            for (var i = 0; i < m.total.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.total[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        Supply.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Supply();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.total && m.total.length)) m.total = [];
                m.total.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Supply.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Supply) return d;
          var m = new $root.cosmos.bank.v1beta1.Supply();
          if (d.total) {
            if (!Array.isArray(d.total))
              throw TypeError(
                ".cosmos.bank.v1beta1.Supply.total: array expected"
              );
            m.total = [];
            for (var i = 0; i < d.total.length; ++i) {
              if (typeof d.total[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Supply.total: object expected"
                );
              m.total[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.total[i]
              );
            }
          }
          return m;
        };
        Supply.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.total = [];
          }
          if (m.total && m.total.length) {
            d.total = [];
            for (var j = 0; j < m.total.length; ++j) {
              d.total[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.total[j],
                o
              );
            }
          }
          return d;
        };
        Supply.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Supply;
      })();
      v1beta1.DenomUnit = (function () {
        function DenomUnit(p) {
          this.aliases = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DenomUnit.prototype.denom = "";
        DenomUnit.prototype.exponent = 0;
        DenomUnit.prototype.aliases = $util.emptyArray;
        DenomUnit.create = function create(properties) {
          return new DenomUnit(properties);
        };
        DenomUnit.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.exponent != null && Object.hasOwnProperty.call(m, "exponent"))
            w.uint32(16).uint32(m.exponent);
          if (m.aliases != null && m.aliases.length) {
            for (var i = 0; i < m.aliases.length; ++i)
              w.uint32(26).string(m.aliases[i]);
          }
          return w;
        };
        DenomUnit.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.DenomUnit();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.exponent = r.uint32();
                break;
              case 3:
                if (!(m.aliases && m.aliases.length)) m.aliases = [];
                m.aliases.push(r.string());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DenomUnit.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.DenomUnit) return d;
          var m = new $root.cosmos.bank.v1beta1.DenomUnit();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.exponent != null) {
            m.exponent = d.exponent >>> 0;
          }
          if (d.aliases) {
            if (!Array.isArray(d.aliases))
              throw TypeError(
                ".cosmos.bank.v1beta1.DenomUnit.aliases: array expected"
              );
            m.aliases = [];
            for (var i = 0; i < d.aliases.length; ++i) {
              m.aliases[i] = String(d.aliases[i]);
            }
          }
          return m;
        };
        DenomUnit.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.aliases = [];
          }
          if (o.defaults) {
            d.denom = "";
            d.exponent = 0;
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.exponent != null && m.hasOwnProperty("exponent")) {
            d.exponent = m.exponent;
          }
          if (m.aliases && m.aliases.length) {
            d.aliases = [];
            for (var j = 0; j < m.aliases.length; ++j) {
              d.aliases[j] = m.aliases[j];
            }
          }
          return d;
        };
        DenomUnit.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DenomUnit;
      })();
      v1beta1.Metadata = (function () {
        function Metadata(p) {
          this.denomUnits = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Metadata.prototype.description = "";
        Metadata.prototype.denomUnits = $util.emptyArray;
        Metadata.prototype.base = "";
        Metadata.prototype.display = "";
        Metadata.create = function create(properties) {
          return new Metadata(properties);
        };
        Metadata.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, "description")
          )
            w.uint32(10).string(m.description);
          if (m.denomUnits != null && m.denomUnits.length) {
            for (var i = 0; i < m.denomUnits.length; ++i)
              $root.cosmos.bank.v1beta1.DenomUnit.encode(
                m.denomUnits[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          if (m.base != null && Object.hasOwnProperty.call(m, "base"))
            w.uint32(26).string(m.base);
          if (m.display != null && Object.hasOwnProperty.call(m, "display"))
            w.uint32(34).string(m.display);
          return w;
        };
        Metadata.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.Metadata();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.description = r.string();
                break;
              case 2:
                if (!(m.denomUnits && m.denomUnits.length)) m.denomUnits = [];
                m.denomUnits.push(
                  $root.cosmos.bank.v1beta1.DenomUnit.decode(r, r.uint32())
                );
                break;
              case 3:
                m.base = r.string();
                break;
              case 4:
                m.display = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Metadata.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.Metadata) return d;
          var m = new $root.cosmos.bank.v1beta1.Metadata();
          if (d.description != null) {
            m.description = String(d.description);
          }
          if (d.denomUnits) {
            if (!Array.isArray(d.denomUnits))
              throw TypeError(
                ".cosmos.bank.v1beta1.Metadata.denomUnits: array expected"
              );
            m.denomUnits = [];
            for (var i = 0; i < d.denomUnits.length; ++i) {
              if (typeof d.denomUnits[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.Metadata.denomUnits: object expected"
                );
              m.denomUnits[i] = $root.cosmos.bank.v1beta1.DenomUnit.fromObject(
                d.denomUnits[i]
              );
            }
          }
          if (d.base != null) {
            m.base = String(d.base);
          }
          if (d.display != null) {
            m.display = String(d.display);
          }
          return m;
        };
        Metadata.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.denomUnits = [];
          }
          if (o.defaults) {
            d.description = "";
            d.base = "";
            d.display = "";
          }
          if (m.description != null && m.hasOwnProperty("description")) {
            d.description = m.description;
          }
          if (m.denomUnits && m.denomUnits.length) {
            d.denomUnits = [];
            for (var j = 0; j < m.denomUnits.length; ++j) {
              d.denomUnits[j] = $root.cosmos.bank.v1beta1.DenomUnit.toObject(
                m.denomUnits[j],
                o
              );
            }
          }
          if (m.base != null && m.hasOwnProperty("base")) {
            d.base = m.base;
          }
          if (m.display != null && m.hasOwnProperty("display")) {
            d.display = m.display;
          }
          return d;
        };
        Metadata.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Metadata;
      })();
      v1beta1.Query = (function () {
        function Query(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Query.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Query;
        Query.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Query.prototype.balance = function balance(request, callback) {
            return this.rpcCall(
              balance,
              $root.cosmos.bank.v1beta1.QueryBalanceRequest,
              $root.cosmos.bank.v1beta1.QueryBalanceResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Balance" }
        );
        Object.defineProperty(
          (Query.prototype.allBalances = function allBalances(
            request,
            callback
          ) {
            return this.rpcCall(
              allBalances,
              $root.cosmos.bank.v1beta1.QueryAllBalancesRequest,
              $root.cosmos.bank.v1beta1.QueryAllBalancesResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "AllBalances" }
        );
        Object.defineProperty(
          (Query.prototype.totalSupply = function totalSupply(
            request,
            callback
          ) {
            return this.rpcCall(
              totalSupply,
              $root.cosmos.bank.v1beta1.QueryTotalSupplyRequest,
              $root.cosmos.bank.v1beta1.QueryTotalSupplyResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "TotalSupply" }
        );
        Object.defineProperty(
          (Query.prototype.supplyOf = function supplyOf(request, callback) {
            return this.rpcCall(
              supplyOf,
              $root.cosmos.bank.v1beta1.QuerySupplyOfRequest,
              $root.cosmos.bank.v1beta1.QuerySupplyOfResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "SupplyOf" }
        );
        Object.defineProperty(
          (Query.prototype.params = function params(request, callback) {
            return this.rpcCall(
              params,
              $root.cosmos.bank.v1beta1.QueryParamsRequest,
              $root.cosmos.bank.v1beta1.QueryParamsResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Params" }
        );
        return Query;
      })();
      v1beta1.QueryBalanceRequest = (function () {
        function QueryBalanceRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryBalanceRequest.prototype.address = "";
        QueryBalanceRequest.prototype.denom = "";
        QueryBalanceRequest.create = function create(properties) {
          return new QueryBalanceRequest(properties);
        };
        QueryBalanceRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(18).string(m.denom);
          return w;
        };
        QueryBalanceRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryBalanceRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.denom = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryBalanceRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryBalanceRequest)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QueryBalanceRequest();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          return m;
        };
        QueryBalanceRequest.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.address = "";
            d.denom = "";
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          return d;
        };
        QueryBalanceRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryBalanceRequest;
      })();
      v1beta1.QueryBalanceResponse = (function () {
        function QueryBalanceResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryBalanceResponse.prototype.balance = null;
        QueryBalanceResponse.create = function create(properties) {
          return new QueryBalanceResponse(properties);
        };
        QueryBalanceResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.balance,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        QueryBalanceResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryBalanceResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.balance = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryBalanceResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryBalanceResponse)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QueryBalanceResponse();
          if (d.balance != null) {
            if (typeof d.balance !== "object")
              throw TypeError(
                ".cosmos.bank.v1beta1.QueryBalanceResponse.balance: object expected"
              );
            m.balance = $root.cosmos.base.v1beta1.Coin.fromObject(d.balance);
          }
          return m;
        };
        QueryBalanceResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.balance = null;
          }
          if (m.balance != null && m.hasOwnProperty("balance")) {
            d.balance = $root.cosmos.base.v1beta1.Coin.toObject(m.balance, o);
          }
          return d;
        };
        QueryBalanceResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryBalanceResponse;
      })();
      v1beta1.QueryAllBalancesRequest = (function () {
        function QueryAllBalancesRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryAllBalancesRequest.prototype.address = "";
        QueryAllBalancesRequest.prototype.pagination = null;
        QueryAllBalancesRequest.create = function create(properties) {
          return new QueryAllBalancesRequest(properties);
        };
        QueryAllBalancesRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.address != null && Object.hasOwnProperty.call(m, "address"))
            w.uint32(10).string(m.address);
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, "pagination")
          )
            $root.cosmos.base.query.v1beta1.PageRequest.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        QueryAllBalancesRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryAllBalancesRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.address = r.string();
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryAllBalancesRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryAllBalancesRequest)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QueryAllBalancesRequest();
          if (d.address != null) {
            m.address = String(d.address);
          }
          if (d.pagination != null) {
            if (typeof d.pagination !== "object")
              throw TypeError(
                ".cosmos.bank.v1beta1.QueryAllBalancesRequest.pagination: object expected"
              );
            m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.fromObject(
              d.pagination
            );
          }
          return m;
        };
        QueryAllBalancesRequest.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.address = "";
            d.pagination = null;
          }
          if (m.address != null && m.hasOwnProperty("address")) {
            d.address = m.address;
          }
          if (m.pagination != null && m.hasOwnProperty("pagination")) {
            d.pagination = $root.cosmos.base.query.v1beta1.PageRequest.toObject(
              m.pagination,
              o
            );
          }
          return d;
        };
        QueryAllBalancesRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryAllBalancesRequest;
      })();
      v1beta1.QueryAllBalancesResponse = (function () {
        function QueryAllBalancesResponse(p) {
          this.balances = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryAllBalancesResponse.prototype.balances = $util.emptyArray;
        QueryAllBalancesResponse.prototype.pagination = null;
        QueryAllBalancesResponse.create = function create(properties) {
          return new QueryAllBalancesResponse(properties);
        };
        QueryAllBalancesResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.balances != null && m.balances.length) {
            for (var i = 0; i < m.balances.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.balances[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (
            m.pagination != null &&
            Object.hasOwnProperty.call(m, "pagination")
          )
            $root.cosmos.base.query.v1beta1.PageResponse.encode(
              m.pagination,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        QueryAllBalancesResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryAllBalancesResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.balances && m.balances.length)) m.balances = [];
                m.balances.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              case 2:
                m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryAllBalancesResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryAllBalancesResponse)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QueryAllBalancesResponse();
          if (d.balances) {
            if (!Array.isArray(d.balances))
              throw TypeError(
                ".cosmos.bank.v1beta1.QueryAllBalancesResponse.balances: array expected"
              );
            m.balances = [];
            for (var i = 0; i < d.balances.length; ++i) {
              if (typeof d.balances[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.QueryAllBalancesResponse.balances: object expected"
                );
              m.balances[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.balances[i]
              );
            }
          }
          if (d.pagination != null) {
            if (typeof d.pagination !== "object")
              throw TypeError(
                ".cosmos.bank.v1beta1.QueryAllBalancesResponse.pagination: object expected"
              );
            m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.fromObject(
              d.pagination
            );
          }
          return m;
        };
        QueryAllBalancesResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.balances = [];
          }
          if (o.defaults) {
            d.pagination = null;
          }
          if (m.balances && m.balances.length) {
            d.balances = [];
            for (var j = 0; j < m.balances.length; ++j) {
              d.balances[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.balances[j],
                o
              );
            }
          }
          if (m.pagination != null && m.hasOwnProperty("pagination")) {
            d.pagination = $root.cosmos.base.query.v1beta1.PageResponse.toObject(
              m.pagination,
              o
            );
          }
          return d;
        };
        QueryAllBalancesResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryAllBalancesResponse;
      })();
      v1beta1.QueryTotalSupplyRequest = (function () {
        function QueryTotalSupplyRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryTotalSupplyRequest.create = function create(properties) {
          return new QueryTotalSupplyRequest(properties);
        };
        QueryTotalSupplyRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        QueryTotalSupplyRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryTotalSupplyRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryTotalSupplyRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryTotalSupplyRequest)
            return d;
          return new $root.cosmos.bank.v1beta1.QueryTotalSupplyRequest();
        };
        QueryTotalSupplyRequest.toObject = function toObject() {
          return {};
        };
        QueryTotalSupplyRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryTotalSupplyRequest;
      })();
      v1beta1.QueryTotalSupplyResponse = (function () {
        function QueryTotalSupplyResponse(p) {
          this.supply = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryTotalSupplyResponse.prototype.supply = $util.emptyArray;
        QueryTotalSupplyResponse.create = function create(properties) {
          return new QueryTotalSupplyResponse(properties);
        };
        QueryTotalSupplyResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.supply != null && m.supply.length) {
            for (var i = 0; i < m.supply.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.supply[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        QueryTotalSupplyResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryTotalSupplyResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.supply && m.supply.length)) m.supply = [];
                m.supply.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryTotalSupplyResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryTotalSupplyResponse)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QueryTotalSupplyResponse();
          if (d.supply) {
            if (!Array.isArray(d.supply))
              throw TypeError(
                ".cosmos.bank.v1beta1.QueryTotalSupplyResponse.supply: array expected"
              );
            m.supply = [];
            for (var i = 0; i < d.supply.length; ++i) {
              if (typeof d.supply[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.QueryTotalSupplyResponse.supply: object expected"
                );
              m.supply[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.supply[i]
              );
            }
          }
          return m;
        };
        QueryTotalSupplyResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.supply = [];
          }
          if (m.supply && m.supply.length) {
            d.supply = [];
            for (var j = 0; j < m.supply.length; ++j) {
              d.supply[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.supply[j],
                o
              );
            }
          }
          return d;
        };
        QueryTotalSupplyResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryTotalSupplyResponse;
      })();
      v1beta1.QuerySupplyOfRequest = (function () {
        function QuerySupplyOfRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QuerySupplyOfRequest.prototype.denom = "";
        QuerySupplyOfRequest.create = function create(properties) {
          return new QuerySupplyOfRequest(properties);
        };
        QuerySupplyOfRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          return w;
        };
        QuerySupplyOfRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QuerySupplyOfRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QuerySupplyOfRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QuerySupplyOfRequest)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QuerySupplyOfRequest();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          return m;
        };
        QuerySupplyOfRequest.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          return d;
        };
        QuerySupplyOfRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QuerySupplyOfRequest;
      })();
      v1beta1.QuerySupplyOfResponse = (function () {
        function QuerySupplyOfResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QuerySupplyOfResponse.prototype.amount = null;
        QuerySupplyOfResponse.create = function create(properties) {
          return new QuerySupplyOfResponse(properties);
        };
        QuerySupplyOfResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        QuerySupplyOfResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QuerySupplyOfResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QuerySupplyOfResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QuerySupplyOfResponse)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QuerySupplyOfResponse();
          if (d.amount != null) {
            if (typeof d.amount !== "object")
              throw TypeError(
                ".cosmos.bank.v1beta1.QuerySupplyOfResponse.amount: object expected"
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        QuerySupplyOfResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.amount = null;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        QuerySupplyOfResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QuerySupplyOfResponse;
      })();
      v1beta1.QueryParamsRequest = (function () {
        function QueryParamsRequest(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryParamsRequest.create = function create(properties) {
          return new QueryParamsRequest(properties);
        };
        QueryParamsRequest.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        QueryParamsRequest.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryParamsRequest();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryParamsRequest.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryParamsRequest)
            return d;
          return new $root.cosmos.bank.v1beta1.QueryParamsRequest();
        };
        QueryParamsRequest.toObject = function toObject() {
          return {};
        };
        QueryParamsRequest.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryParamsRequest;
      })();
      v1beta1.QueryParamsResponse = (function () {
        function QueryParamsResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        QueryParamsResponse.prototype.params = null;
        QueryParamsResponse.create = function create(properties) {
          return new QueryParamsResponse(properties);
        };
        QueryParamsResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.params != null && Object.hasOwnProperty.call(m, "params"))
            $root.cosmos.bank.v1beta1.Params.encode(
              m.params,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        QueryParamsResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.QueryParamsResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.params = $root.cosmos.bank.v1beta1.Params.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        QueryParamsResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.QueryParamsResponse)
            return d;
          var m = new $root.cosmos.bank.v1beta1.QueryParamsResponse();
          if (d.params != null) {
            if (typeof d.params !== "object")
              throw TypeError(
                ".cosmos.bank.v1beta1.QueryParamsResponse.params: object expected"
              );
            m.params = $root.cosmos.bank.v1beta1.Params.fromObject(d.params);
          }
          return m;
        };
        QueryParamsResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.params = null;
          }
          if (m.params != null && m.hasOwnProperty("params")) {
            d.params = $root.cosmos.bank.v1beta1.Params.toObject(m.params, o);
          }
          return d;
        };
        QueryParamsResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return QueryParamsResponse;
      })();
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.send = function send(request, callback) {
            return this.rpcCall(
              send,
              $root.cosmos.bank.v1beta1.MsgSend,
              $root.cosmos.bank.v1beta1.MsgSendResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Send" }
        );
        Object.defineProperty(
          (Msg.prototype.multiSend = function multiSend(request, callback) {
            return this.rpcCall(
              multiSend,
              $root.cosmos.bank.v1beta1.MsgMultiSend,
              $root.cosmos.bank.v1beta1.MsgMultiSendResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "MultiSend" }
        );
        return Msg;
      })();
      v1beta1.MsgSend = (function () {
        function MsgSend(p) {
          this.amount = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSend.prototype.fromAddress = "";
        MsgSend.prototype.toAddress = "";
        MsgSend.prototype.amount = $util.emptyArray;
        MsgSend.create = function create(properties) {
          return new MsgSend(properties);
        };
        MsgSend.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.fromAddress != null &&
            Object.hasOwnProperty.call(m, "fromAddress")
          )
            w.uint32(10).string(m.fromAddress);
          if (m.toAddress != null && Object.hasOwnProperty.call(m, "toAddress"))
            w.uint32(18).string(m.toAddress);
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.amount[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          return w;
        };
        MsgSend.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgSend();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.fromAddress = r.string();
                break;
              case 2:
                m.toAddress = r.string();
                break;
              case 3:
                if (!(m.amount && m.amount.length)) m.amount = [];
                m.amount.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSend.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgSend) return d;
          var m = new $root.cosmos.bank.v1beta1.MsgSend();
          if (d.fromAddress != null) {
            m.fromAddress = String(d.fromAddress);
          }
          if (d.toAddress != null) {
            m.toAddress = String(d.toAddress);
          }
          if (d.amount) {
            if (!Array.isArray(d.amount))
              throw TypeError(
                ".cosmos.bank.v1beta1.MsgSend.amount: array expected"
              );
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.MsgSend.amount: object expected"
                );
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.amount[i]
              );
            }
          }
          return m;
        };
        MsgSend.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.amount = [];
          }
          if (o.defaults) {
            d.fromAddress = "";
            d.toAddress = "";
          }
          if (m.fromAddress != null && m.hasOwnProperty("fromAddress")) {
            d.fromAddress = m.fromAddress;
          }
          if (m.toAddress != null && m.hasOwnProperty("toAddress")) {
            d.toAddress = m.toAddress;
          }
          if (m.amount && m.amount.length) {
            d.amount = [];
            for (var j = 0; j < m.amount.length; ++j) {
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.amount[j],
                o
              );
            }
          }
          return d;
        };
        MsgSend.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSend;
      })();
      v1beta1.MsgSendResponse = (function () {
        function MsgSendResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgSendResponse.create = function create(properties) {
          return new MsgSendResponse(properties);
        };
        MsgSendResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgSendResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgSendResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgSendResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgSendResponse) return d;
          return new $root.cosmos.bank.v1beta1.MsgSendResponse();
        };
        MsgSendResponse.toObject = function toObject() {
          return {};
        };
        MsgSendResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgSendResponse;
      })();
      v1beta1.MsgMultiSend = (function () {
        function MsgMultiSend(p) {
          this.inputs = [];
          this.outputs = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgMultiSend.prototype.inputs = $util.emptyArray;
        MsgMultiSend.prototype.outputs = $util.emptyArray;
        MsgMultiSend.create = function create(properties) {
          return new MsgMultiSend(properties);
        };
        MsgMultiSend.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.inputs != null && m.inputs.length) {
            for (var i = 0; i < m.inputs.length; ++i)
              $root.cosmos.bank.v1beta1.Input.encode(
                m.inputs[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.outputs != null && m.outputs.length) {
            for (var i = 0; i < m.outputs.length; ++i)
              $root.cosmos.bank.v1beta1.Output.encode(
                m.outputs[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        MsgMultiSend.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgMultiSend();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.inputs && m.inputs.length)) m.inputs = [];
                m.inputs.push(
                  $root.cosmos.bank.v1beta1.Input.decode(r, r.uint32())
                );
                break;
              case 2:
                if (!(m.outputs && m.outputs.length)) m.outputs = [];
                m.outputs.push(
                  $root.cosmos.bank.v1beta1.Output.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgMultiSend.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgMultiSend) return d;
          var m = new $root.cosmos.bank.v1beta1.MsgMultiSend();
          if (d.inputs) {
            if (!Array.isArray(d.inputs))
              throw TypeError(
                ".cosmos.bank.v1beta1.MsgMultiSend.inputs: array expected"
              );
            m.inputs = [];
            for (var i = 0; i < d.inputs.length; ++i) {
              if (typeof d.inputs[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.MsgMultiSend.inputs: object expected"
                );
              m.inputs[i] = $root.cosmos.bank.v1beta1.Input.fromObject(
                d.inputs[i]
              );
            }
          }
          if (d.outputs) {
            if (!Array.isArray(d.outputs))
              throw TypeError(
                ".cosmos.bank.v1beta1.MsgMultiSend.outputs: array expected"
              );
            m.outputs = [];
            for (var i = 0; i < d.outputs.length; ++i) {
              if (typeof d.outputs[i] !== "object")
                throw TypeError(
                  ".cosmos.bank.v1beta1.MsgMultiSend.outputs: object expected"
                );
              m.outputs[i] = $root.cosmos.bank.v1beta1.Output.fromObject(
                d.outputs[i]
              );
            }
          }
          return m;
        };
        MsgMultiSend.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.inputs = [];
            d.outputs = [];
          }
          if (m.inputs && m.inputs.length) {
            d.inputs = [];
            for (var j = 0; j < m.inputs.length; ++j) {
              d.inputs[j] = $root.cosmos.bank.v1beta1.Input.toObject(
                m.inputs[j],
                o
              );
            }
          }
          if (m.outputs && m.outputs.length) {
            d.outputs = [];
            for (var j = 0; j < m.outputs.length; ++j) {
              d.outputs[j] = $root.cosmos.bank.v1beta1.Output.toObject(
                m.outputs[j],
                o
              );
            }
          }
          return d;
        };
        MsgMultiSend.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgMultiSend;
      })();
      v1beta1.MsgMultiSendResponse = (function () {
        function MsgMultiSendResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgMultiSendResponse.create = function create(properties) {
          return new MsgMultiSendResponse(properties);
        };
        MsgMultiSendResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgMultiSendResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.bank.v1beta1.MsgMultiSendResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgMultiSendResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.bank.v1beta1.MsgMultiSendResponse)
            return d;
          return new $root.cosmos.bank.v1beta1.MsgMultiSendResponse();
        };
        MsgMultiSendResponse.toObject = function toObject() {
          return {};
        };
        MsgMultiSendResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgMultiSendResponse;
      })();
      return v1beta1;
    })();
    return bank;
  })();
  cosmos.base = (function () {
    const base = {};
    base.query = (function () {
      const query = {};
      query.v1beta1 = (function () {
        const v1beta1 = {};
        v1beta1.PageRequest = (function () {
          function PageRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          PageRequest.prototype.key = $util.newBuffer([]);
          PageRequest.prototype.offset = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          PageRequest.prototype.limit = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          PageRequest.prototype.countTotal = false;
          PageRequest.create = function create(properties) {
            return new PageRequest(properties);
          };
          PageRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.key != null && Object.hasOwnProperty.call(m, "key"))
              w.uint32(10).bytes(m.key);
            if (m.offset != null && Object.hasOwnProperty.call(m, "offset"))
              w.uint32(16).uint64(m.offset);
            if (m.limit != null && Object.hasOwnProperty.call(m, "limit"))
              w.uint32(24).uint64(m.limit);
            if (
              m.countTotal != null &&
              Object.hasOwnProperty.call(m, "countTotal")
            )
              w.uint32(32).bool(m.countTotal);
            return w;
          };
          PageRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.base.query.v1beta1.PageRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.key = r.bytes();
                  break;
                case 2:
                  m.offset = r.uint64();
                  break;
                case 3:
                  m.limit = r.uint64();
                  break;
                case 4:
                  m.countTotal = r.bool();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          PageRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.base.query.v1beta1.PageRequest)
              return d;
            var m = new $root.cosmos.base.query.v1beta1.PageRequest();
            if (d.key != null) {
              if (typeof d.key === "string")
                $util.base64.decode(
                  d.key,
                  (m.key = $util.newBuffer($util.base64.length(d.key))),
                  0
                );
              else if (d.key.length) m.key = d.key;
            }
            if (d.offset != null) {
              if ($util.Long)
                (m.offset = $util.Long.fromValue(d.offset)).unsigned = true;
              else if (typeof d.offset === "string")
                m.offset = parseInt(d.offset, 10);
              else if (typeof d.offset === "number") m.offset = d.offset;
              else if (typeof d.offset === "object")
                m.offset = new $util.LongBits(
                  d.offset.low >>> 0,
                  d.offset.high >>> 0
                ).toNumber(true);
            }
            if (d.limit != null) {
              if ($util.Long)
                (m.limit = $util.Long.fromValue(d.limit)).unsigned = true;
              else if (typeof d.limit === "string")
                m.limit = parseInt(d.limit, 10);
              else if (typeof d.limit === "number") m.limit = d.limit;
              else if (typeof d.limit === "object")
                m.limit = new $util.LongBits(
                  d.limit.low >>> 0,
                  d.limit.high >>> 0
                ).toNumber(true);
            }
            if (d.countTotal != null) {
              m.countTotal = Boolean(d.countTotal);
            }
            return m;
          };
          PageRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.key = "";
              else {
                d.key = [];
                if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
              }
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.offset =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.offset = o.longs === String ? "0" : 0;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.limit =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.limit = o.longs === String ? "0" : 0;
              d.countTotal = false;
            }
            if (m.key != null && m.hasOwnProperty("key")) {
              d.key =
                o.bytes === String
                  ? $util.base64.encode(m.key, 0, m.key.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.key)
                  : m.key;
            }
            if (m.offset != null && m.hasOwnProperty("offset")) {
              if (typeof m.offset === "number")
                d.offset = o.longs === String ? String(m.offset) : m.offset;
              else
                d.offset =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.offset)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.offset.low >>> 0,
                        m.offset.high >>> 0
                      ).toNumber(true)
                    : m.offset;
            }
            if (m.limit != null && m.hasOwnProperty("limit")) {
              if (typeof m.limit === "number")
                d.limit = o.longs === String ? String(m.limit) : m.limit;
              else
                d.limit =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.limit)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.limit.low >>> 0,
                        m.limit.high >>> 0
                      ).toNumber(true)
                    : m.limit;
            }
            if (m.countTotal != null && m.hasOwnProperty("countTotal")) {
              d.countTotal = m.countTotal;
            }
            return d;
          };
          PageRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return PageRequest;
        })();
        v1beta1.PageResponse = (function () {
          function PageResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          PageResponse.prototype.nextKey = $util.newBuffer([]);
          PageResponse.prototype.total = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          PageResponse.create = function create(properties) {
            return new PageResponse(properties);
          };
          PageResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.nextKey != null && Object.hasOwnProperty.call(m, "nextKey"))
              w.uint32(10).bytes(m.nextKey);
            if (m.total != null && Object.hasOwnProperty.call(m, "total"))
              w.uint32(16).uint64(m.total);
            return w;
          };
          PageResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.base.query.v1beta1.PageResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.nextKey = r.bytes();
                  break;
                case 2:
                  m.total = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          PageResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.base.query.v1beta1.PageResponse)
              return d;
            var m = new $root.cosmos.base.query.v1beta1.PageResponse();
            if (d.nextKey != null) {
              if (typeof d.nextKey === "string")
                $util.base64.decode(
                  d.nextKey,
                  (m.nextKey = $util.newBuffer($util.base64.length(d.nextKey))),
                  0
                );
              else if (d.nextKey.length) m.nextKey = d.nextKey;
            }
            if (d.total != null) {
              if ($util.Long)
                (m.total = $util.Long.fromValue(d.total)).unsigned = true;
              else if (typeof d.total === "string")
                m.total = parseInt(d.total, 10);
              else if (typeof d.total === "number") m.total = d.total;
              else if (typeof d.total === "object")
                m.total = new $util.LongBits(
                  d.total.low >>> 0,
                  d.total.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          PageResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.nextKey = "";
              else {
                d.nextKey = [];
                if (o.bytes !== Array) d.nextKey = $util.newBuffer(d.nextKey);
              }
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.total =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.total = o.longs === String ? "0" : 0;
            }
            if (m.nextKey != null && m.hasOwnProperty("nextKey")) {
              d.nextKey =
                o.bytes === String
                  ? $util.base64.encode(m.nextKey, 0, m.nextKey.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.nextKey)
                  : m.nextKey;
            }
            if (m.total != null && m.hasOwnProperty("total")) {
              if (typeof m.total === "number")
                d.total = o.longs === String ? String(m.total) : m.total;
              else
                d.total =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.total)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.total.low >>> 0,
                        m.total.high >>> 0
                      ).toNumber(true)
                    : m.total;
            }
            return d;
          };
          PageResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return PageResponse;
        })();
        return v1beta1;
      })();
      return query;
    })();
    base.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Coin = (function () {
        function Coin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Coin.prototype.denom = "";
        Coin.prototype.amount = "";
        Coin.create = function create(properties) {
          return new Coin(properties);
        };
        Coin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            w.uint32(18).string(m.amount);
          return w;
        };
        Coin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.Coin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.amount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Coin.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.Coin) return d;
          var m = new $root.cosmos.base.v1beta1.Coin();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.amount != null) {
            m.amount = String(d.amount);
          }
          return m;
        };
        Coin.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
            d.amount = "";
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = m.amount;
          }
          return d;
        };
        Coin.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Coin;
      })();
      v1beta1.DecCoin = (function () {
        function DecCoin(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DecCoin.prototype.denom = "";
        DecCoin.prototype.amount = "";
        DecCoin.create = function create(properties) {
          return new DecCoin(properties);
        };
        DecCoin.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
            w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            w.uint32(18).string(m.amount);
          return w;
        };
        DecCoin.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.DecCoin();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.denom = r.string();
                break;
              case 2:
                m.amount = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DecCoin.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.DecCoin) return d;
          var m = new $root.cosmos.base.v1beta1.DecCoin();
          if (d.denom != null) {
            m.denom = String(d.denom);
          }
          if (d.amount != null) {
            m.amount = String(d.amount);
          }
          return m;
        };
        DecCoin.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.denom = "";
            d.amount = "";
          }
          if (m.denom != null && m.hasOwnProperty("denom")) {
            d.denom = m.denom;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = m.amount;
          }
          return d;
        };
        DecCoin.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DecCoin;
      })();
      v1beta1.IntProto = (function () {
        function IntProto(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        IntProto.prototype.int = "";
        IntProto.create = function create(properties) {
          return new IntProto(properties);
        };
        IntProto.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.int != null && Object.hasOwnProperty.call(m, "int"))
            w.uint32(10).string(m.int);
          return w;
        };
        IntProto.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.IntProto();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.int = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        IntProto.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.IntProto) return d;
          var m = new $root.cosmos.base.v1beta1.IntProto();
          if (d.int != null) {
            m.int = String(d.int);
          }
          return m;
        };
        IntProto.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.int = "";
          }
          if (m.int != null && m.hasOwnProperty("int")) {
            d.int = m.int;
          }
          return d;
        };
        IntProto.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return IntProto;
      })();
      v1beta1.DecProto = (function () {
        function DecProto(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DecProto.prototype.dec = "";
        DecProto.create = function create(properties) {
          return new DecProto(properties);
        };
        DecProto.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.dec != null && Object.hasOwnProperty.call(m, "dec"))
            w.uint32(10).string(m.dec);
          return w;
        };
        DecProto.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.base.v1beta1.DecProto();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.dec = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DecProto.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.base.v1beta1.DecProto) return d;
          var m = new $root.cosmos.base.v1beta1.DecProto();
          if (d.dec != null) {
            m.dec = String(d.dec);
          }
          return m;
        };
        DecProto.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.dec = "";
          }
          if (m.dec != null && m.hasOwnProperty("dec")) {
            d.dec = m.dec;
          }
          return d;
        };
        DecProto.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DecProto;
      })();
      return v1beta1;
    })();
    return base;
  })();
  cosmos.crypto = (function () {
    const crypto = {};
    crypto.multisig = (function () {
      const multisig = {};
      multisig.v1beta1 = (function () {
        const v1beta1 = {};
        v1beta1.MultiSignature = (function () {
          function MultiSignature(p) {
            this.signatures = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MultiSignature.prototype.signatures = $util.emptyArray;
          MultiSignature.create = function create(properties) {
            return new MultiSignature(properties);
          };
          MultiSignature.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.signatures != null && m.signatures.length) {
              for (var i = 0; i < m.signatures.length; ++i)
                w.uint32(10).bytes(m.signatures[i]);
            }
            return w;
          };
          MultiSignature.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.signatures && m.signatures.length)) m.signatures = [];
                  m.signatures.push(r.bytes());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MultiSignature.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.crypto.multisig.v1beta1.MultiSignature
            )
              return d;
            var m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
            if (d.signatures) {
              if (!Array.isArray(d.signatures))
                throw TypeError(
                  ".cosmos.crypto.multisig.v1beta1.MultiSignature.signatures: array expected"
                );
              m.signatures = [];
              for (var i = 0; i < d.signatures.length; ++i) {
                if (typeof d.signatures[i] === "string")
                  $util.base64.decode(
                    d.signatures[i],
                    (m.signatures[i] = $util.newBuffer(
                      $util.base64.length(d.signatures[i])
                    )),
                    0
                  );
                else if (d.signatures[i].length)
                  m.signatures[i] = d.signatures[i];
              }
            }
            return m;
          };
          MultiSignature.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.signatures = [];
            }
            if (m.signatures && m.signatures.length) {
              d.signatures = [];
              for (var j = 0; j < m.signatures.length; ++j) {
                d.signatures[j] =
                  o.bytes === String
                    ? $util.base64.encode(
                        m.signatures[j],
                        0,
                        m.signatures[j].length
                      )
                    : o.bytes === Array
                    ? Array.prototype.slice.call(m.signatures[j])
                    : m.signatures[j];
              }
            }
            return d;
          };
          MultiSignature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MultiSignature;
        })();
        v1beta1.CompactBitArray = (function () {
          function CompactBitArray(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          CompactBitArray.prototype.extraBitsStored = 0;
          CompactBitArray.prototype.elems = $util.newBuffer([]);
          CompactBitArray.create = function create(properties) {
            return new CompactBitArray(properties);
          };
          CompactBitArray.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.extraBitsStored != null &&
              Object.hasOwnProperty.call(m, "extraBitsStored")
            )
              w.uint32(8).uint32(m.extraBitsStored);
            if (m.elems != null && Object.hasOwnProperty.call(m, "elems"))
              w.uint32(18).bytes(m.elems);
            return w;
          };
          CompactBitArray.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.extraBitsStored = r.uint32();
                  break;
                case 2:
                  m.elems = r.bytes();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          CompactBitArray.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.crypto.multisig.v1beta1.CompactBitArray
            )
              return d;
            var m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
            if (d.extraBitsStored != null) {
              m.extraBitsStored = d.extraBitsStored >>> 0;
            }
            if (d.elems != null) {
              if (typeof d.elems === "string")
                $util.base64.decode(
                  d.elems,
                  (m.elems = $util.newBuffer($util.base64.length(d.elems))),
                  0
                );
              else if (d.elems.length) m.elems = d.elems;
            }
            return m;
          };
          CompactBitArray.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.extraBitsStored = 0;
              if (o.bytes === String) d.elems = "";
              else {
                d.elems = [];
                if (o.bytes !== Array) d.elems = $util.newBuffer(d.elems);
              }
            }
            if (
              m.extraBitsStored != null &&
              m.hasOwnProperty("extraBitsStored")
            ) {
              d.extraBitsStored = m.extraBitsStored;
            }
            if (m.elems != null && m.hasOwnProperty("elems")) {
              d.elems =
                o.bytes === String
                  ? $util.base64.encode(m.elems, 0, m.elems.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.elems)
                  : m.elems;
            }
            return d;
          };
          CompactBitArray.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return CompactBitArray;
        })();
        return v1beta1;
      })();
      return multisig;
    })();
    crypto.secp256k1 = (function () {
      const secp256k1 = {};
      secp256k1.PubKey = (function () {
        function PubKey(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PubKey.prototype.key = $util.newBuffer([]);
        PubKey.create = function create(properties) {
          return new PubKey(properties);
        };
        PubKey.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.key != null && Object.hasOwnProperty.call(m, "key"))
            w.uint32(10).bytes(m.key);
          return w;
        };
        PubKey.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.crypto.secp256k1.PubKey();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.key = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PubKey.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.crypto.secp256k1.PubKey) return d;
          var m = new $root.cosmos.crypto.secp256k1.PubKey();
          if (d.key != null) {
            if (typeof d.key === "string")
              $util.base64.decode(
                d.key,
                (m.key = $util.newBuffer($util.base64.length(d.key))),
                0
              );
            else if (d.key.length) m.key = d.key;
          }
          return m;
        };
        PubKey.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.key = "";
            else {
              d.key = [];
              if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
            }
          }
          if (m.key != null && m.hasOwnProperty("key")) {
            d.key =
              o.bytes === String
                ? $util.base64.encode(m.key, 0, m.key.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.key)
                : m.key;
          }
          return d;
        };
        PubKey.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return PubKey;
      })();
      secp256k1.PrivKey = (function () {
        function PrivKey(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        PrivKey.prototype.key = $util.newBuffer([]);
        PrivKey.create = function create(properties) {
          return new PrivKey(properties);
        };
        PrivKey.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.key != null && Object.hasOwnProperty.call(m, "key"))
            w.uint32(10).bytes(m.key);
          return w;
        };
        PrivKey.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.crypto.secp256k1.PrivKey();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.key = r.bytes();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        PrivKey.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.crypto.secp256k1.PrivKey) return d;
          var m = new $root.cosmos.crypto.secp256k1.PrivKey();
          if (d.key != null) {
            if (typeof d.key === "string")
              $util.base64.decode(
                d.key,
                (m.key = $util.newBuffer($util.base64.length(d.key))),
                0
              );
            else if (d.key.length) m.key = d.key;
          }
          return m;
        };
        PrivKey.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.key = "";
            else {
              d.key = [];
              if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
            }
          }
          if (m.key != null && m.hasOwnProperty("key")) {
            d.key =
              o.bytes === String
                ? $util.base64.encode(m.key, 0, m.key.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.key)
                : m.key;
          }
          return d;
        };
        PrivKey.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return PrivKey;
      })();
      return secp256k1;
    })();
    return crypto;
  })();
  cosmos.staking = (function () {
    const staking = {};
    staking.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.HistoricalInfo = (function () {
        function HistoricalInfo(p) {
          this.valset = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        HistoricalInfo.prototype.header = null;
        HistoricalInfo.prototype.valset = $util.emptyArray;
        HistoricalInfo.create = function create(properties) {
          return new HistoricalInfo(properties);
        };
        HistoricalInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.header != null && Object.hasOwnProperty.call(m, "header"))
            $root.tendermint.types.Header.encode(
              m.header,
              w.uint32(10).fork()
            ).ldelim();
          if (m.valset != null && m.valset.length) {
            for (var i = 0; i < m.valset.length; ++i)
              $root.cosmos.staking.v1beta1.Validator.encode(
                m.valset[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        HistoricalInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.HistoricalInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.header = $root.tendermint.types.Header.decode(r, r.uint32());
                break;
              case 2:
                if (!(m.valset && m.valset.length)) m.valset = [];
                m.valset.push(
                  $root.cosmos.staking.v1beta1.Validator.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        HistoricalInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.HistoricalInfo)
            return d;
          var m = new $root.cosmos.staking.v1beta1.HistoricalInfo();
          if (d.header != null) {
            if (typeof d.header !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.HistoricalInfo.header: object expected"
              );
            m.header = $root.tendermint.types.Header.fromObject(d.header);
          }
          if (d.valset) {
            if (!Array.isArray(d.valset))
              throw TypeError(
                ".cosmos.staking.v1beta1.HistoricalInfo.valset: array expected"
              );
            m.valset = [];
            for (var i = 0; i < d.valset.length; ++i) {
              if (typeof d.valset[i] !== "object")
                throw TypeError(
                  ".cosmos.staking.v1beta1.HistoricalInfo.valset: object expected"
                );
              m.valset[i] = $root.cosmos.staking.v1beta1.Validator.fromObject(
                d.valset[i]
              );
            }
          }
          return m;
        };
        HistoricalInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.valset = [];
          }
          if (o.defaults) {
            d.header = null;
          }
          if (m.header != null && m.hasOwnProperty("header")) {
            d.header = $root.tendermint.types.Header.toObject(m.header, o);
          }
          if (m.valset && m.valset.length) {
            d.valset = [];
            for (var j = 0; j < m.valset.length; ++j) {
              d.valset[j] = $root.cosmos.staking.v1beta1.Validator.toObject(
                m.valset[j],
                o
              );
            }
          }
          return d;
        };
        HistoricalInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return HistoricalInfo;
      })();
      v1beta1.CommissionRates = (function () {
        function CommissionRates(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        CommissionRates.prototype.rate = "";
        CommissionRates.prototype.maxRate = "";
        CommissionRates.prototype.maxChangeRate = "";
        CommissionRates.create = function create(properties) {
          return new CommissionRates(properties);
        };
        CommissionRates.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.rate != null && Object.hasOwnProperty.call(m, "rate"))
            w.uint32(10).string(m.rate);
          if (m.maxRate != null && Object.hasOwnProperty.call(m, "maxRate"))
            w.uint32(18).string(m.maxRate);
          if (
            m.maxChangeRate != null &&
            Object.hasOwnProperty.call(m, "maxChangeRate")
          )
            w.uint32(26).string(m.maxChangeRate);
          return w;
        };
        CommissionRates.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.CommissionRates();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.rate = r.string();
                break;
              case 2:
                m.maxRate = r.string();
                break;
              case 3:
                m.maxChangeRate = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        CommissionRates.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.CommissionRates)
            return d;
          var m = new $root.cosmos.staking.v1beta1.CommissionRates();
          if (d.rate != null) {
            m.rate = String(d.rate);
          }
          if (d.maxRate != null) {
            m.maxRate = String(d.maxRate);
          }
          if (d.maxChangeRate != null) {
            m.maxChangeRate = String(d.maxChangeRate);
          }
          return m;
        };
        CommissionRates.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.rate = "";
            d.maxRate = "";
            d.maxChangeRate = "";
          }
          if (m.rate != null && m.hasOwnProperty("rate")) {
            d.rate = m.rate;
          }
          if (m.maxRate != null && m.hasOwnProperty("maxRate")) {
            d.maxRate = m.maxRate;
          }
          if (m.maxChangeRate != null && m.hasOwnProperty("maxChangeRate")) {
            d.maxChangeRate = m.maxChangeRate;
          }
          return d;
        };
        CommissionRates.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return CommissionRates;
      })();
      v1beta1.Commission = (function () {
        function Commission(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Commission.prototype.commissionRates = null;
        Commission.prototype.updateTime = null;
        Commission.create = function create(properties) {
          return new Commission(properties);
        };
        Commission.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.commissionRates != null &&
            Object.hasOwnProperty.call(m, "commissionRates")
          )
            $root.cosmos.staking.v1beta1.CommissionRates.encode(
              m.commissionRates,
              w.uint32(10).fork()
            ).ldelim();
          if (
            m.updateTime != null &&
            Object.hasOwnProperty.call(m, "updateTime")
          )
            $root.google.protobuf.Timestamp.encode(
              m.updateTime,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        Commission.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Commission();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.commissionRates = $root.cosmos.staking.v1beta1.CommissionRates.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.updateTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Commission.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Commission) return d;
          var m = new $root.cosmos.staking.v1beta1.Commission();
          if (d.commissionRates != null) {
            if (typeof d.commissionRates !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Commission.commissionRates: object expected"
              );
            m.commissionRates = $root.cosmos.staking.v1beta1.CommissionRates.fromObject(
              d.commissionRates
            );
          }
          if (d.updateTime != null) {
            if (typeof d.updateTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Commission.updateTime: object expected"
              );
            m.updateTime = $root.google.protobuf.Timestamp.fromObject(
              d.updateTime
            );
          }
          return m;
        };
        Commission.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.commissionRates = null;
            d.updateTime = null;
          }
          if (
            m.commissionRates != null &&
            m.hasOwnProperty("commissionRates")
          ) {
            d.commissionRates = $root.cosmos.staking.v1beta1.CommissionRates.toObject(
              m.commissionRates,
              o
            );
          }
          if (m.updateTime != null && m.hasOwnProperty("updateTime")) {
            d.updateTime = $root.google.protobuf.Timestamp.toObject(
              m.updateTime,
              o
            );
          }
          return d;
        };
        Commission.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Commission;
      })();
      v1beta1.Description = (function () {
        function Description(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Description.prototype.moniker = "";
        Description.prototype.identity = "";
        Description.prototype.website = "";
        Description.prototype.securityContact = "";
        Description.prototype.details = "";
        Description.create = function create(properties) {
          return new Description(properties);
        };
        Description.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.moniker != null && Object.hasOwnProperty.call(m, "moniker"))
            w.uint32(10).string(m.moniker);
          if (m.identity != null && Object.hasOwnProperty.call(m, "identity"))
            w.uint32(18).string(m.identity);
          if (m.website != null && Object.hasOwnProperty.call(m, "website"))
            w.uint32(26).string(m.website);
          if (
            m.securityContact != null &&
            Object.hasOwnProperty.call(m, "securityContact")
          )
            w.uint32(34).string(m.securityContact);
          if (m.details != null && Object.hasOwnProperty.call(m, "details"))
            w.uint32(42).string(m.details);
          return w;
        };
        Description.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Description();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.moniker = r.string();
                break;
              case 2:
                m.identity = r.string();
                break;
              case 3:
                m.website = r.string();
                break;
              case 4:
                m.securityContact = r.string();
                break;
              case 5:
                m.details = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Description.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Description) return d;
          var m = new $root.cosmos.staking.v1beta1.Description();
          if (d.moniker != null) {
            m.moniker = String(d.moniker);
          }
          if (d.identity != null) {
            m.identity = String(d.identity);
          }
          if (d.website != null) {
            m.website = String(d.website);
          }
          if (d.securityContact != null) {
            m.securityContact = String(d.securityContact);
          }
          if (d.details != null) {
            m.details = String(d.details);
          }
          return m;
        };
        Description.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.moniker = "";
            d.identity = "";
            d.website = "";
            d.securityContact = "";
            d.details = "";
          }
          if (m.moniker != null && m.hasOwnProperty("moniker")) {
            d.moniker = m.moniker;
          }
          if (m.identity != null && m.hasOwnProperty("identity")) {
            d.identity = m.identity;
          }
          if (m.website != null && m.hasOwnProperty("website")) {
            d.website = m.website;
          }
          if (
            m.securityContact != null &&
            m.hasOwnProperty("securityContact")
          ) {
            d.securityContact = m.securityContact;
          }
          if (m.details != null && m.hasOwnProperty("details")) {
            d.details = m.details;
          }
          return d;
        };
        Description.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Description;
      })();
      v1beta1.Validator = (function () {
        function Validator(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Validator.prototype.operatorAddress = "";
        Validator.prototype.consensusPubkey = null;
        Validator.prototype.jailed = false;
        Validator.prototype.status = 0;
        Validator.prototype.tokens = "";
        Validator.prototype.delegatorShares = "";
        Validator.prototype.description = null;
        Validator.prototype.unbondingHeight = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        Validator.prototype.unbondingTime = null;
        Validator.prototype.commission = null;
        Validator.prototype.minSelfDelegation = "";
        Validator.create = function create(properties) {
          return new Validator(properties);
        };
        Validator.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.operatorAddress != null &&
            Object.hasOwnProperty.call(m, "operatorAddress")
          )
            w.uint32(10).string(m.operatorAddress);
          if (
            m.consensusPubkey != null &&
            Object.hasOwnProperty.call(m, "consensusPubkey")
          )
            $root.google.protobuf.Any.encode(
              m.consensusPubkey,
              w.uint32(18).fork()
            ).ldelim();
          if (m.jailed != null && Object.hasOwnProperty.call(m, "jailed"))
            w.uint32(24).bool(m.jailed);
          if (m.status != null && Object.hasOwnProperty.call(m, "status"))
            w.uint32(32).int32(m.status);
          if (m.tokens != null && Object.hasOwnProperty.call(m, "tokens"))
            w.uint32(42).string(m.tokens);
          if (
            m.delegatorShares != null &&
            Object.hasOwnProperty.call(m, "delegatorShares")
          )
            w.uint32(50).string(m.delegatorShares);
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, "description")
          )
            $root.cosmos.staking.v1beta1.Description.encode(
              m.description,
              w.uint32(58).fork()
            ).ldelim();
          if (
            m.unbondingHeight != null &&
            Object.hasOwnProperty.call(m, "unbondingHeight")
          )
            w.uint32(64).int64(m.unbondingHeight);
          if (
            m.unbondingTime != null &&
            Object.hasOwnProperty.call(m, "unbondingTime")
          )
            $root.google.protobuf.Timestamp.encode(
              m.unbondingTime,
              w.uint32(74).fork()
            ).ldelim();
          if (
            m.commission != null &&
            Object.hasOwnProperty.call(m, "commission")
          )
            $root.cosmos.staking.v1beta1.Commission.encode(
              m.commission,
              w.uint32(82).fork()
            ).ldelim();
          if (
            m.minSelfDelegation != null &&
            Object.hasOwnProperty.call(m, "minSelfDelegation")
          )
            w.uint32(90).string(m.minSelfDelegation);
          return w;
        };
        Validator.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Validator();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.operatorAddress = r.string();
                break;
              case 2:
                m.consensusPubkey = $root.google.protobuf.Any.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.jailed = r.bool();
                break;
              case 4:
                m.status = r.int32();
                break;
              case 5:
                m.tokens = r.string();
                break;
              case 6:
                m.delegatorShares = r.string();
                break;
              case 7:
                m.description = $root.cosmos.staking.v1beta1.Description.decode(
                  r,
                  r.uint32()
                );
                break;
              case 8:
                m.unbondingHeight = r.int64();
                break;
              case 9:
                m.unbondingTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 10:
                m.commission = $root.cosmos.staking.v1beta1.Commission.decode(
                  r,
                  r.uint32()
                );
                break;
              case 11:
                m.minSelfDelegation = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Validator.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Validator) return d;
          var m = new $root.cosmos.staking.v1beta1.Validator();
          if (d.operatorAddress != null) {
            m.operatorAddress = String(d.operatorAddress);
          }
          if (d.consensusPubkey != null) {
            if (typeof d.consensusPubkey !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Validator.consensusPubkey: object expected"
              );
            m.consensusPubkey = $root.google.protobuf.Any.fromObject(
              d.consensusPubkey
            );
          }
          if (d.jailed != null) {
            m.jailed = Boolean(d.jailed);
          }
          switch (d.status) {
            case "BOND_STATUS_UNSPECIFIED":
            case 0:
              m.status = 0;
              break;
            case "BOND_STATUS_UNBONDED":
            case 1:
              m.status = 1;
              break;
            case "BOND_STATUS_UNBONDING":
            case 2:
              m.status = 2;
              break;
            case "BOND_STATUS_BONDED":
            case 3:
              m.status = 3;
              break;
          }
          if (d.tokens != null) {
            m.tokens = String(d.tokens);
          }
          if (d.delegatorShares != null) {
            m.delegatorShares = String(d.delegatorShares);
          }
          if (d.description != null) {
            if (typeof d.description !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Validator.description: object expected"
              );
            m.description = $root.cosmos.staking.v1beta1.Description.fromObject(
              d.description
            );
          }
          if (d.unbondingHeight != null) {
            if ($util.Long)
              (m.unbondingHeight = $util.Long.fromValue(
                d.unbondingHeight
              )).unsigned = false;
            else if (typeof d.unbondingHeight === "string")
              m.unbondingHeight = parseInt(d.unbondingHeight, 10);
            else if (typeof d.unbondingHeight === "number")
              m.unbondingHeight = d.unbondingHeight;
            else if (typeof d.unbondingHeight === "object")
              m.unbondingHeight = new $util.LongBits(
                d.unbondingHeight.low >>> 0,
                d.unbondingHeight.high >>> 0
              ).toNumber();
          }
          if (d.unbondingTime != null) {
            if (typeof d.unbondingTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Validator.unbondingTime: object expected"
              );
            m.unbondingTime = $root.google.protobuf.Timestamp.fromObject(
              d.unbondingTime
            );
          }
          if (d.commission != null) {
            if (typeof d.commission !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Validator.commission: object expected"
              );
            m.commission = $root.cosmos.staking.v1beta1.Commission.fromObject(
              d.commission
            );
          }
          if (d.minSelfDelegation != null) {
            m.minSelfDelegation = String(d.minSelfDelegation);
          }
          return m;
        };
        Validator.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.operatorAddress = "";
            d.consensusPubkey = null;
            d.jailed = false;
            d.status = o.enums === String ? "BOND_STATUS_UNSPECIFIED" : 0;
            d.tokens = "";
            d.delegatorShares = "";
            d.description = null;
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.unbondingHeight =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.unbondingHeight = o.longs === String ? "0" : 0;
            d.unbondingTime = null;
            d.commission = null;
            d.minSelfDelegation = "";
          }
          if (
            m.operatorAddress != null &&
            m.hasOwnProperty("operatorAddress")
          ) {
            d.operatorAddress = m.operatorAddress;
          }
          if (
            m.consensusPubkey != null &&
            m.hasOwnProperty("consensusPubkey")
          ) {
            d.consensusPubkey = $root.google.protobuf.Any.toObject(
              m.consensusPubkey,
              o
            );
          }
          if (m.jailed != null && m.hasOwnProperty("jailed")) {
            d.jailed = m.jailed;
          }
          if (m.status != null && m.hasOwnProperty("status")) {
            d.status =
              o.enums === String
                ? $root.cosmos.staking.v1beta1.BondStatus[m.status]
                : m.status;
          }
          if (m.tokens != null && m.hasOwnProperty("tokens")) {
            d.tokens = m.tokens;
          }
          if (
            m.delegatorShares != null &&
            m.hasOwnProperty("delegatorShares")
          ) {
            d.delegatorShares = m.delegatorShares;
          }
          if (m.description != null && m.hasOwnProperty("description")) {
            d.description = $root.cosmos.staking.v1beta1.Description.toObject(
              m.description,
              o
            );
          }
          if (
            m.unbondingHeight != null &&
            m.hasOwnProperty("unbondingHeight")
          ) {
            if (typeof m.unbondingHeight === "number")
              d.unbondingHeight =
                o.longs === String
                  ? String(m.unbondingHeight)
                  : m.unbondingHeight;
            else
              d.unbondingHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.unbondingHeight)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.unbondingHeight.low >>> 0,
                      m.unbondingHeight.high >>> 0
                    ).toNumber()
                  : m.unbondingHeight;
          }
          if (m.unbondingTime != null && m.hasOwnProperty("unbondingTime")) {
            d.unbondingTime = $root.google.protobuf.Timestamp.toObject(
              m.unbondingTime,
              o
            );
          }
          if (m.commission != null && m.hasOwnProperty("commission")) {
            d.commission = $root.cosmos.staking.v1beta1.Commission.toObject(
              m.commission,
              o
            );
          }
          if (
            m.minSelfDelegation != null &&
            m.hasOwnProperty("minSelfDelegation")
          ) {
            d.minSelfDelegation = m.minSelfDelegation;
          }
          return d;
        };
        Validator.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Validator;
      })();
      v1beta1.BondStatus = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = "BOND_STATUS_UNSPECIFIED")] = 0;
        values[(valuesById[1] = "BOND_STATUS_UNBONDED")] = 1;
        values[(valuesById[2] = "BOND_STATUS_UNBONDING")] = 2;
        values[(valuesById[3] = "BOND_STATUS_BONDED")] = 3;
        return values;
      })();
      v1beta1.ValAddresses = (function () {
        function ValAddresses(p) {
          this.addresses = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        ValAddresses.prototype.addresses = $util.emptyArray;
        ValAddresses.create = function create(properties) {
          return new ValAddresses(properties);
        };
        ValAddresses.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.addresses != null && m.addresses.length) {
            for (var i = 0; i < m.addresses.length; ++i)
              w.uint32(10).string(m.addresses[i]);
          }
          return w;
        };
        ValAddresses.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.ValAddresses();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.addresses && m.addresses.length)) m.addresses = [];
                m.addresses.push(r.string());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        ValAddresses.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.ValAddresses) return d;
          var m = new $root.cosmos.staking.v1beta1.ValAddresses();
          if (d.addresses) {
            if (!Array.isArray(d.addresses))
              throw TypeError(
                ".cosmos.staking.v1beta1.ValAddresses.addresses: array expected"
              );
            m.addresses = [];
            for (var i = 0; i < d.addresses.length; ++i) {
              m.addresses[i] = String(d.addresses[i]);
            }
          }
          return m;
        };
        ValAddresses.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.addresses = [];
          }
          if (m.addresses && m.addresses.length) {
            d.addresses = [];
            for (var j = 0; j < m.addresses.length; ++j) {
              d.addresses[j] = m.addresses[j];
            }
          }
          return d;
        };
        ValAddresses.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return ValAddresses;
      })();
      v1beta1.DVPair = (function () {
        function DVPair(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DVPair.prototype.delegatorAddress = "";
        DVPair.prototype.validatorAddress = "";
        DVPair.create = function create(properties) {
          return new DVPair(properties);
        };
        DVPair.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(18).string(m.validatorAddress);
          return w;
        };
        DVPair.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.DVPair();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DVPair.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.DVPair) return d;
          var m = new $root.cosmos.staking.v1beta1.DVPair();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          return m;
        };
        DVPair.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorAddress = "";
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          return d;
        };
        DVPair.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DVPair;
      })();
      v1beta1.DVPairs = (function () {
        function DVPairs(p) {
          this.pairs = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DVPairs.prototype.pairs = $util.emptyArray;
        DVPairs.create = function create(properties) {
          return new DVPairs(properties);
        };
        DVPairs.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.pairs != null && m.pairs.length) {
            for (var i = 0; i < m.pairs.length; ++i)
              $root.cosmos.staking.v1beta1.DVPair.encode(
                m.pairs[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        DVPairs.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.DVPairs();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.pairs && m.pairs.length)) m.pairs = [];
                m.pairs.push(
                  $root.cosmos.staking.v1beta1.DVPair.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DVPairs.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.DVPairs) return d;
          var m = new $root.cosmos.staking.v1beta1.DVPairs();
          if (d.pairs) {
            if (!Array.isArray(d.pairs))
              throw TypeError(
                ".cosmos.staking.v1beta1.DVPairs.pairs: array expected"
              );
            m.pairs = [];
            for (var i = 0; i < d.pairs.length; ++i) {
              if (typeof d.pairs[i] !== "object")
                throw TypeError(
                  ".cosmos.staking.v1beta1.DVPairs.pairs: object expected"
                );
              m.pairs[i] = $root.cosmos.staking.v1beta1.DVPair.fromObject(
                d.pairs[i]
              );
            }
          }
          return m;
        };
        DVPairs.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.pairs = [];
          }
          if (m.pairs && m.pairs.length) {
            d.pairs = [];
            for (var j = 0; j < m.pairs.length; ++j) {
              d.pairs[j] = $root.cosmos.staking.v1beta1.DVPair.toObject(
                m.pairs[j],
                o
              );
            }
          }
          return d;
        };
        DVPairs.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DVPairs;
      })();
      v1beta1.DVVTriplet = (function () {
        function DVVTriplet(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DVVTriplet.prototype.delegatorAddress = "";
        DVVTriplet.prototype.validatorSrcAddress = "";
        DVVTriplet.prototype.validatorDstAddress = "";
        DVVTriplet.create = function create(properties) {
          return new DVVTriplet(properties);
        };
        DVVTriplet.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorSrcAddress != null &&
            Object.hasOwnProperty.call(m, "validatorSrcAddress")
          )
            w.uint32(18).string(m.validatorSrcAddress);
          if (
            m.validatorDstAddress != null &&
            Object.hasOwnProperty.call(m, "validatorDstAddress")
          )
            w.uint32(26).string(m.validatorDstAddress);
          return w;
        };
        DVVTriplet.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.DVVTriplet();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorSrcAddress = r.string();
                break;
              case 3:
                m.validatorDstAddress = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DVVTriplet.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.DVVTriplet) return d;
          var m = new $root.cosmos.staking.v1beta1.DVVTriplet();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorSrcAddress != null) {
            m.validatorSrcAddress = String(d.validatorSrcAddress);
          }
          if (d.validatorDstAddress != null) {
            m.validatorDstAddress = String(d.validatorDstAddress);
          }
          return m;
        };
        DVVTriplet.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorSrcAddress = "";
            d.validatorDstAddress = "";
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorSrcAddress != null &&
            m.hasOwnProperty("validatorSrcAddress")
          ) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (
            m.validatorDstAddress != null &&
            m.hasOwnProperty("validatorDstAddress")
          ) {
            d.validatorDstAddress = m.validatorDstAddress;
          }
          return d;
        };
        DVVTriplet.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DVVTriplet;
      })();
      v1beta1.DVVTriplets = (function () {
        function DVVTriplets(p) {
          this.triplets = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DVVTriplets.prototype.triplets = $util.emptyArray;
        DVVTriplets.create = function create(properties) {
          return new DVVTriplets(properties);
        };
        DVVTriplets.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.triplets != null && m.triplets.length) {
            for (var i = 0; i < m.triplets.length; ++i)
              $root.cosmos.staking.v1beta1.DVVTriplet.encode(
                m.triplets[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          return w;
        };
        DVVTriplets.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.DVVTriplets();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.triplets && m.triplets.length)) m.triplets = [];
                m.triplets.push(
                  $root.cosmos.staking.v1beta1.DVVTriplet.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DVVTriplets.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.DVVTriplets) return d;
          var m = new $root.cosmos.staking.v1beta1.DVVTriplets();
          if (d.triplets) {
            if (!Array.isArray(d.triplets))
              throw TypeError(
                ".cosmos.staking.v1beta1.DVVTriplets.triplets: array expected"
              );
            m.triplets = [];
            for (var i = 0; i < d.triplets.length; ++i) {
              if (typeof d.triplets[i] !== "object")
                throw TypeError(
                  ".cosmos.staking.v1beta1.DVVTriplets.triplets: object expected"
                );
              m.triplets[
                i
              ] = $root.cosmos.staking.v1beta1.DVVTriplet.fromObject(
                d.triplets[i]
              );
            }
          }
          return m;
        };
        DVVTriplets.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.triplets = [];
          }
          if (m.triplets && m.triplets.length) {
            d.triplets = [];
            for (var j = 0; j < m.triplets.length; ++j) {
              d.triplets[j] = $root.cosmos.staking.v1beta1.DVVTriplet.toObject(
                m.triplets[j],
                o
              );
            }
          }
          return d;
        };
        DVVTriplets.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DVVTriplets;
      })();
      v1beta1.Delegation = (function () {
        function Delegation(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Delegation.prototype.delegatorAddress = "";
        Delegation.prototype.validatorAddress = "";
        Delegation.prototype.shares = "";
        Delegation.create = function create(properties) {
          return new Delegation(properties);
        };
        Delegation.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(18).string(m.validatorAddress);
          if (m.shares != null && Object.hasOwnProperty.call(m, "shares"))
            w.uint32(26).string(m.shares);
          return w;
        };
        Delegation.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Delegation();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                m.shares = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Delegation.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Delegation) return d;
          var m = new $root.cosmos.staking.v1beta1.Delegation();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.shares != null) {
            m.shares = String(d.shares);
          }
          return m;
        };
        Delegation.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorAddress = "";
            d.shares = "";
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.shares != null && m.hasOwnProperty("shares")) {
            d.shares = m.shares;
          }
          return d;
        };
        Delegation.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Delegation;
      })();
      v1beta1.UnbondingDelegation = (function () {
        function UnbondingDelegation(p) {
          this.entries = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        UnbondingDelegation.prototype.delegatorAddress = "";
        UnbondingDelegation.prototype.validatorAddress = "";
        UnbondingDelegation.prototype.entries = $util.emptyArray;
        UnbondingDelegation.create = function create(properties) {
          return new UnbondingDelegation(properties);
        };
        UnbondingDelegation.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(18).string(m.validatorAddress);
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.encode(
                m.entries[i],
                w.uint32(26).fork()
              ).ldelim();
          }
          return w;
        };
        UnbondingDelegation.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.UnbondingDelegation();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                if (!(m.entries && m.entries.length)) m.entries = [];
                m.entries.push(
                  $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        UnbondingDelegation.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.UnbondingDelegation)
            return d;
          var m = new $root.cosmos.staking.v1beta1.UnbondingDelegation();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.entries) {
            if (!Array.isArray(d.entries))
              throw TypeError(
                ".cosmos.staking.v1beta1.UnbondingDelegation.entries: array expected"
              );
            m.entries = [];
            for (var i = 0; i < d.entries.length; ++i) {
              if (typeof d.entries[i] !== "object")
                throw TypeError(
                  ".cosmos.staking.v1beta1.UnbondingDelegation.entries: object expected"
                );
              m.entries[
                i
              ] = $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.fromObject(
                d.entries[i]
              );
            }
          }
          return m;
        };
        UnbondingDelegation.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.entries = [];
          }
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorAddress = "";
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.entries && m.entries.length) {
            d.entries = [];
            for (var j = 0; j < m.entries.length; ++j) {
              d.entries[
                j
              ] = $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.toObject(
                m.entries[j],
                o
              );
            }
          }
          return d;
        };
        UnbondingDelegation.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return UnbondingDelegation;
      })();
      v1beta1.UnbondingDelegationEntry = (function () {
        function UnbondingDelegationEntry(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        UnbondingDelegationEntry.prototype.creationHeight = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        UnbondingDelegationEntry.prototype.completionTime = null;
        UnbondingDelegationEntry.prototype.initialBalance = "";
        UnbondingDelegationEntry.prototype.balance = "";
        UnbondingDelegationEntry.create = function create(properties) {
          return new UnbondingDelegationEntry(properties);
        };
        UnbondingDelegationEntry.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.creationHeight != null &&
            Object.hasOwnProperty.call(m, "creationHeight")
          )
            w.uint32(8).int64(m.creationHeight);
          if (
            m.completionTime != null &&
            Object.hasOwnProperty.call(m, "completionTime")
          )
            $root.google.protobuf.Timestamp.encode(
              m.completionTime,
              w.uint32(18).fork()
            ).ldelim();
          if (
            m.initialBalance != null &&
            Object.hasOwnProperty.call(m, "initialBalance")
          )
            w.uint32(26).string(m.initialBalance);
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance"))
            w.uint32(34).string(m.balance);
          return w;
        };
        UnbondingDelegationEntry.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.UnbondingDelegationEntry();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.creationHeight = r.int64();
                break;
              case 2:
                m.completionTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.initialBalance = r.string();
                break;
              case 4:
                m.balance = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        UnbondingDelegationEntry.fromObject = function fromObject(d) {
          if (
            d instanceof $root.cosmos.staking.v1beta1.UnbondingDelegationEntry
          )
            return d;
          var m = new $root.cosmos.staking.v1beta1.UnbondingDelegationEntry();
          if (d.creationHeight != null) {
            if ($util.Long)
              (m.creationHeight = $util.Long.fromValue(
                d.creationHeight
              )).unsigned = false;
            else if (typeof d.creationHeight === "string")
              m.creationHeight = parseInt(d.creationHeight, 10);
            else if (typeof d.creationHeight === "number")
              m.creationHeight = d.creationHeight;
            else if (typeof d.creationHeight === "object")
              m.creationHeight = new $util.LongBits(
                d.creationHeight.low >>> 0,
                d.creationHeight.high >>> 0
              ).toNumber();
          }
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.UnbondingDelegationEntry.completionTime: object expected"
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(
              d.completionTime
            );
          }
          if (d.initialBalance != null) {
            m.initialBalance = String(d.initialBalance);
          }
          if (d.balance != null) {
            m.balance = String(d.balance);
          }
          return m;
        };
        UnbondingDelegationEntry.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.creationHeight =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.creationHeight = o.longs === String ? "0" : 0;
            d.completionTime = null;
            d.initialBalance = "";
            d.balance = "";
          }
          if (m.creationHeight != null && m.hasOwnProperty("creationHeight")) {
            if (typeof m.creationHeight === "number")
              d.creationHeight =
                o.longs === String
                  ? String(m.creationHeight)
                  : m.creationHeight;
            else
              d.creationHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.creationHeight)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.creationHeight.low >>> 0,
                      m.creationHeight.high >>> 0
                    ).toNumber()
                  : m.creationHeight;
          }
          if (m.completionTime != null && m.hasOwnProperty("completionTime")) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(
              m.completionTime,
              o
            );
          }
          if (m.initialBalance != null && m.hasOwnProperty("initialBalance")) {
            d.initialBalance = m.initialBalance;
          }
          if (m.balance != null && m.hasOwnProperty("balance")) {
            d.balance = m.balance;
          }
          return d;
        };
        UnbondingDelegationEntry.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return UnbondingDelegationEntry;
      })();
      v1beta1.RedelegationEntry = (function () {
        function RedelegationEntry(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        RedelegationEntry.prototype.creationHeight = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        RedelegationEntry.prototype.completionTime = null;
        RedelegationEntry.prototype.initialBalance = "";
        RedelegationEntry.prototype.sharesDst = "";
        RedelegationEntry.create = function create(properties) {
          return new RedelegationEntry(properties);
        };
        RedelegationEntry.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.creationHeight != null &&
            Object.hasOwnProperty.call(m, "creationHeight")
          )
            w.uint32(8).int64(m.creationHeight);
          if (
            m.completionTime != null &&
            Object.hasOwnProperty.call(m, "completionTime")
          )
            $root.google.protobuf.Timestamp.encode(
              m.completionTime,
              w.uint32(18).fork()
            ).ldelim();
          if (
            m.initialBalance != null &&
            Object.hasOwnProperty.call(m, "initialBalance")
          )
            w.uint32(26).string(m.initialBalance);
          if (m.sharesDst != null && Object.hasOwnProperty.call(m, "sharesDst"))
            w.uint32(34).string(m.sharesDst);
          return w;
        };
        RedelegationEntry.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.RedelegationEntry();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.creationHeight = r.int64();
                break;
              case 2:
                m.completionTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.initialBalance = r.string();
                break;
              case 4:
                m.sharesDst = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        RedelegationEntry.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.RedelegationEntry)
            return d;
          var m = new $root.cosmos.staking.v1beta1.RedelegationEntry();
          if (d.creationHeight != null) {
            if ($util.Long)
              (m.creationHeight = $util.Long.fromValue(
                d.creationHeight
              )).unsigned = false;
            else if (typeof d.creationHeight === "string")
              m.creationHeight = parseInt(d.creationHeight, 10);
            else if (typeof d.creationHeight === "number")
              m.creationHeight = d.creationHeight;
            else if (typeof d.creationHeight === "object")
              m.creationHeight = new $util.LongBits(
                d.creationHeight.low >>> 0,
                d.creationHeight.high >>> 0
              ).toNumber();
          }
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.RedelegationEntry.completionTime: object expected"
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(
              d.completionTime
            );
          }
          if (d.initialBalance != null) {
            m.initialBalance = String(d.initialBalance);
          }
          if (d.sharesDst != null) {
            m.sharesDst = String(d.sharesDst);
          }
          return m;
        };
        RedelegationEntry.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.creationHeight =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.creationHeight = o.longs === String ? "0" : 0;
            d.completionTime = null;
            d.initialBalance = "";
            d.sharesDst = "";
          }
          if (m.creationHeight != null && m.hasOwnProperty("creationHeight")) {
            if (typeof m.creationHeight === "number")
              d.creationHeight =
                o.longs === String
                  ? String(m.creationHeight)
                  : m.creationHeight;
            else
              d.creationHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.creationHeight)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.creationHeight.low >>> 0,
                      m.creationHeight.high >>> 0
                    ).toNumber()
                  : m.creationHeight;
          }
          if (m.completionTime != null && m.hasOwnProperty("completionTime")) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(
              m.completionTime,
              o
            );
          }
          if (m.initialBalance != null && m.hasOwnProperty("initialBalance")) {
            d.initialBalance = m.initialBalance;
          }
          if (m.sharesDst != null && m.hasOwnProperty("sharesDst")) {
            d.sharesDst = m.sharesDst;
          }
          return d;
        };
        RedelegationEntry.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return RedelegationEntry;
      })();
      v1beta1.Redelegation = (function () {
        function Redelegation(p) {
          this.entries = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Redelegation.prototype.delegatorAddress = "";
        Redelegation.prototype.validatorSrcAddress = "";
        Redelegation.prototype.validatorDstAddress = "";
        Redelegation.prototype.entries = $util.emptyArray;
        Redelegation.create = function create(properties) {
          return new Redelegation(properties);
        };
        Redelegation.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorSrcAddress != null &&
            Object.hasOwnProperty.call(m, "validatorSrcAddress")
          )
            w.uint32(18).string(m.validatorSrcAddress);
          if (
            m.validatorDstAddress != null &&
            Object.hasOwnProperty.call(m, "validatorDstAddress")
          )
            w.uint32(26).string(m.validatorDstAddress);
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmos.staking.v1beta1.RedelegationEntry.encode(
                m.entries[i],
                w.uint32(34).fork()
              ).ldelim();
          }
          return w;
        };
        Redelegation.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Redelegation();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorSrcAddress = r.string();
                break;
              case 3:
                m.validatorDstAddress = r.string();
                break;
              case 4:
                if (!(m.entries && m.entries.length)) m.entries = [];
                m.entries.push(
                  $root.cosmos.staking.v1beta1.RedelegationEntry.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Redelegation.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Redelegation) return d;
          var m = new $root.cosmos.staking.v1beta1.Redelegation();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorSrcAddress != null) {
            m.validatorSrcAddress = String(d.validatorSrcAddress);
          }
          if (d.validatorDstAddress != null) {
            m.validatorDstAddress = String(d.validatorDstAddress);
          }
          if (d.entries) {
            if (!Array.isArray(d.entries))
              throw TypeError(
                ".cosmos.staking.v1beta1.Redelegation.entries: array expected"
              );
            m.entries = [];
            for (var i = 0; i < d.entries.length; ++i) {
              if (typeof d.entries[i] !== "object")
                throw TypeError(
                  ".cosmos.staking.v1beta1.Redelegation.entries: object expected"
                );
              m.entries[
                i
              ] = $root.cosmos.staking.v1beta1.RedelegationEntry.fromObject(
                d.entries[i]
              );
            }
          }
          return m;
        };
        Redelegation.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.entries = [];
          }
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorSrcAddress = "";
            d.validatorDstAddress = "";
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorSrcAddress != null &&
            m.hasOwnProperty("validatorSrcAddress")
          ) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (
            m.validatorDstAddress != null &&
            m.hasOwnProperty("validatorDstAddress")
          ) {
            d.validatorDstAddress = m.validatorDstAddress;
          }
          if (m.entries && m.entries.length) {
            d.entries = [];
            for (var j = 0; j < m.entries.length; ++j) {
              d.entries[
                j
              ] = $root.cosmos.staking.v1beta1.RedelegationEntry.toObject(
                m.entries[j],
                o
              );
            }
          }
          return d;
        };
        Redelegation.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Redelegation;
      })();
      v1beta1.Params = (function () {
        function Params(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Params.prototype.unbondingTime = null;
        Params.prototype.maxValidators = 0;
        Params.prototype.maxEntries = 0;
        Params.prototype.historicalEntries = 0;
        Params.prototype.bondDenom = "";
        Params.create = function create(properties) {
          return new Params(properties);
        };
        Params.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.unbondingTime != null &&
            Object.hasOwnProperty.call(m, "unbondingTime")
          )
            $root.google.protobuf.Duration.encode(
              m.unbondingTime,
              w.uint32(10).fork()
            ).ldelim();
          if (
            m.maxValidators != null &&
            Object.hasOwnProperty.call(m, "maxValidators")
          )
            w.uint32(16).uint32(m.maxValidators);
          if (
            m.maxEntries != null &&
            Object.hasOwnProperty.call(m, "maxEntries")
          )
            w.uint32(24).uint32(m.maxEntries);
          if (
            m.historicalEntries != null &&
            Object.hasOwnProperty.call(m, "historicalEntries")
          )
            w.uint32(32).uint32(m.historicalEntries);
          if (m.bondDenom != null && Object.hasOwnProperty.call(m, "bondDenom"))
            w.uint32(42).string(m.bondDenom);
          return w;
        };
        Params.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Params();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.unbondingTime = $root.google.protobuf.Duration.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.maxValidators = r.uint32();
                break;
              case 3:
                m.maxEntries = r.uint32();
                break;
              case 4:
                m.historicalEntries = r.uint32();
                break;
              case 5:
                m.bondDenom = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Params.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Params) return d;
          var m = new $root.cosmos.staking.v1beta1.Params();
          if (d.unbondingTime != null) {
            if (typeof d.unbondingTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.Params.unbondingTime: object expected"
              );
            m.unbondingTime = $root.google.protobuf.Duration.fromObject(
              d.unbondingTime
            );
          }
          if (d.maxValidators != null) {
            m.maxValidators = d.maxValidators >>> 0;
          }
          if (d.maxEntries != null) {
            m.maxEntries = d.maxEntries >>> 0;
          }
          if (d.historicalEntries != null) {
            m.historicalEntries = d.historicalEntries >>> 0;
          }
          if (d.bondDenom != null) {
            m.bondDenom = String(d.bondDenom);
          }
          return m;
        };
        Params.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.unbondingTime = null;
            d.maxValidators = 0;
            d.maxEntries = 0;
            d.historicalEntries = 0;
            d.bondDenom = "";
          }
          if (m.unbondingTime != null && m.hasOwnProperty("unbondingTime")) {
            d.unbondingTime = $root.google.protobuf.Duration.toObject(
              m.unbondingTime,
              o
            );
          }
          if (m.maxValidators != null && m.hasOwnProperty("maxValidators")) {
            d.maxValidators = m.maxValidators;
          }
          if (m.maxEntries != null && m.hasOwnProperty("maxEntries")) {
            d.maxEntries = m.maxEntries;
          }
          if (
            m.historicalEntries != null &&
            m.hasOwnProperty("historicalEntries")
          ) {
            d.historicalEntries = m.historicalEntries;
          }
          if (m.bondDenom != null && m.hasOwnProperty("bondDenom")) {
            d.bondDenom = m.bondDenom;
          }
          return d;
        };
        Params.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Params;
      })();
      v1beta1.DelegationResponse = (function () {
        function DelegationResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        DelegationResponse.prototype.delegation = null;
        DelegationResponse.prototype.balance = null;
        DelegationResponse.create = function create(properties) {
          return new DelegationResponse(properties);
        };
        DelegationResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegation != null &&
            Object.hasOwnProperty.call(m, "delegation")
          )
            $root.cosmos.staking.v1beta1.Delegation.encode(
              m.delegation,
              w.uint32(10).fork()
            ).ldelim();
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.balance,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        DelegationResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.DelegationResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegation = $root.cosmos.staking.v1beta1.Delegation.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.balance = $root.cosmos.base.v1beta1.Coin.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DelegationResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.DelegationResponse)
            return d;
          var m = new $root.cosmos.staking.v1beta1.DelegationResponse();
          if (d.delegation != null) {
            if (typeof d.delegation !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.DelegationResponse.delegation: object expected"
              );
            m.delegation = $root.cosmos.staking.v1beta1.Delegation.fromObject(
              d.delegation
            );
          }
          if (d.balance != null) {
            if (typeof d.balance !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.DelegationResponse.balance: object expected"
              );
            m.balance = $root.cosmos.base.v1beta1.Coin.fromObject(d.balance);
          }
          return m;
        };
        DelegationResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegation = null;
            d.balance = null;
          }
          if (m.delegation != null && m.hasOwnProperty("delegation")) {
            d.delegation = $root.cosmos.staking.v1beta1.Delegation.toObject(
              m.delegation,
              o
            );
          }
          if (m.balance != null && m.hasOwnProperty("balance")) {
            d.balance = $root.cosmos.base.v1beta1.Coin.toObject(m.balance, o);
          }
          return d;
        };
        DelegationResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return DelegationResponse;
      })();
      v1beta1.RedelegationEntryResponse = (function () {
        function RedelegationEntryResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        RedelegationEntryResponse.prototype.redelegationEntry = null;
        RedelegationEntryResponse.prototype.balance = "";
        RedelegationEntryResponse.create = function create(properties) {
          return new RedelegationEntryResponse(properties);
        };
        RedelegationEntryResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.redelegationEntry != null &&
            Object.hasOwnProperty.call(m, "redelegationEntry")
          )
            $root.cosmos.staking.v1beta1.RedelegationEntry.encode(
              m.redelegationEntry,
              w.uint32(10).fork()
            ).ldelim();
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance"))
            w.uint32(34).string(m.balance);
          return w;
        };
        RedelegationEntryResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.RedelegationEntryResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.redelegationEntry = $root.cosmos.staking.v1beta1.RedelegationEntry.decode(
                  r,
                  r.uint32()
                );
                break;
              case 4:
                m.balance = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        RedelegationEntryResponse.fromObject = function fromObject(d) {
          if (
            d instanceof $root.cosmos.staking.v1beta1.RedelegationEntryResponse
          )
            return d;
          var m = new $root.cosmos.staking.v1beta1.RedelegationEntryResponse();
          if (d.redelegationEntry != null) {
            if (typeof d.redelegationEntry !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.RedelegationEntryResponse.redelegationEntry: object expected"
              );
            m.redelegationEntry = $root.cosmos.staking.v1beta1.RedelegationEntry.fromObject(
              d.redelegationEntry
            );
          }
          if (d.balance != null) {
            m.balance = String(d.balance);
          }
          return m;
        };
        RedelegationEntryResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.redelegationEntry = null;
            d.balance = "";
          }
          if (
            m.redelegationEntry != null &&
            m.hasOwnProperty("redelegationEntry")
          ) {
            d.redelegationEntry = $root.cosmos.staking.v1beta1.RedelegationEntry.toObject(
              m.redelegationEntry,
              o
            );
          }
          if (m.balance != null && m.hasOwnProperty("balance")) {
            d.balance = m.balance;
          }
          return d;
        };
        RedelegationEntryResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return RedelegationEntryResponse;
      })();
      v1beta1.RedelegationResponse = (function () {
        function RedelegationResponse(p) {
          this.entries = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        RedelegationResponse.prototype.redelegation = null;
        RedelegationResponse.prototype.entries = $util.emptyArray;
        RedelegationResponse.create = function create(properties) {
          return new RedelegationResponse(properties);
        };
        RedelegationResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.redelegation != null &&
            Object.hasOwnProperty.call(m, "redelegation")
          )
            $root.cosmos.staking.v1beta1.Redelegation.encode(
              m.redelegation,
              w.uint32(10).fork()
            ).ldelim();
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmos.staking.v1beta1.RedelegationEntryResponse.encode(
                m.entries[i],
                w.uint32(18).fork()
              ).ldelim();
          }
          return w;
        };
        RedelegationResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.RedelegationResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.redelegation = $root.cosmos.staking.v1beta1.Redelegation.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                if (!(m.entries && m.entries.length)) m.entries = [];
                m.entries.push(
                  $root.cosmos.staking.v1beta1.RedelegationEntryResponse.decode(
                    r,
                    r.uint32()
                  )
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        RedelegationResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.RedelegationResponse)
            return d;
          var m = new $root.cosmos.staking.v1beta1.RedelegationResponse();
          if (d.redelegation != null) {
            if (typeof d.redelegation !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.RedelegationResponse.redelegation: object expected"
              );
            m.redelegation = $root.cosmos.staking.v1beta1.Redelegation.fromObject(
              d.redelegation
            );
          }
          if (d.entries) {
            if (!Array.isArray(d.entries))
              throw TypeError(
                ".cosmos.staking.v1beta1.RedelegationResponse.entries: array expected"
              );
            m.entries = [];
            for (var i = 0; i < d.entries.length; ++i) {
              if (typeof d.entries[i] !== "object")
                throw TypeError(
                  ".cosmos.staking.v1beta1.RedelegationResponse.entries: object expected"
                );
              m.entries[
                i
              ] = $root.cosmos.staking.v1beta1.RedelegationEntryResponse.fromObject(
                d.entries[i]
              );
            }
          }
          return m;
        };
        RedelegationResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.entries = [];
          }
          if (o.defaults) {
            d.redelegation = null;
          }
          if (m.redelegation != null && m.hasOwnProperty("redelegation")) {
            d.redelegation = $root.cosmos.staking.v1beta1.Redelegation.toObject(
              m.redelegation,
              o
            );
          }
          if (m.entries && m.entries.length) {
            d.entries = [];
            for (var j = 0; j < m.entries.length; ++j) {
              d.entries[
                j
              ] = $root.cosmos.staking.v1beta1.RedelegationEntryResponse.toObject(
                m.entries[j],
                o
              );
            }
          }
          return d;
        };
        RedelegationResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return RedelegationResponse;
      })();
      v1beta1.Pool = (function () {
        function Pool(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Pool.prototype.notBondedTokens = "";
        Pool.prototype.bondedTokens = "";
        Pool.create = function create(properties) {
          return new Pool(properties);
        };
        Pool.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.notBondedTokens != null &&
            Object.hasOwnProperty.call(m, "notBondedTokens")
          )
            w.uint32(10).string(m.notBondedTokens);
          if (
            m.bondedTokens != null &&
            Object.hasOwnProperty.call(m, "bondedTokens")
          )
            w.uint32(18).string(m.bondedTokens);
          return w;
        };
        Pool.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.Pool();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.notBondedTokens = r.string();
                break;
              case 2:
                m.bondedTokens = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Pool.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.Pool) return d;
          var m = new $root.cosmos.staking.v1beta1.Pool();
          if (d.notBondedTokens != null) {
            m.notBondedTokens = String(d.notBondedTokens);
          }
          if (d.bondedTokens != null) {
            m.bondedTokens = String(d.bondedTokens);
          }
          return m;
        };
        Pool.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.notBondedTokens = "";
            d.bondedTokens = "";
          }
          if (
            m.notBondedTokens != null &&
            m.hasOwnProperty("notBondedTokens")
          ) {
            d.notBondedTokens = m.notBondedTokens;
          }
          if (m.bondedTokens != null && m.hasOwnProperty("bondedTokens")) {
            d.bondedTokens = m.bondedTokens;
          }
          return d;
        };
        Pool.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Pool;
      })();
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(
            this,
            rpcImpl,
            requestDelimited,
            responseDelimited
          );
        }
        (Msg.prototype = Object.create(
          $protobuf.rpc.Service.prototype
        )).constructor = Msg;
        Msg.create = function create(
          rpcImpl,
          requestDelimited,
          responseDelimited
        ) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.createValidator = function createValidator(
            request,
            callback
          ) {
            return this.rpcCall(
              createValidator,
              $root.cosmos.staking.v1beta1.MsgCreateValidator,
              $root.cosmos.staking.v1beta1.MsgCreateValidatorResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "CreateValidator" }
        );
        Object.defineProperty(
          (Msg.prototype.editValidator = function editValidator(
            request,
            callback
          ) {
            return this.rpcCall(
              editValidator,
              $root.cosmos.staking.v1beta1.MsgEditValidator,
              $root.cosmos.staking.v1beta1.MsgEditValidatorResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "EditValidator" }
        );
        Object.defineProperty(
          (Msg.prototype.delegate = function delegate(request, callback) {
            return this.rpcCall(
              delegate,
              $root.cosmos.staking.v1beta1.MsgDelegate,
              $root.cosmos.staking.v1beta1.MsgDelegateResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Delegate" }
        );
        Object.defineProperty(
          (Msg.prototype.beginRedelegate = function beginRedelegate(
            request,
            callback
          ) {
            return this.rpcCall(
              beginRedelegate,
              $root.cosmos.staking.v1beta1.MsgBeginRedelegate,
              $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "BeginRedelegate" }
        );
        Object.defineProperty(
          (Msg.prototype.undelegate = function undelegate(request, callback) {
            return this.rpcCall(
              undelegate,
              $root.cosmos.staking.v1beta1.MsgUndelegate,
              $root.cosmos.staking.v1beta1.MsgUndelegateResponse,
              request,
              callback
            );
          }),
          "name",
          { value: "Undelegate" }
        );
        return Msg;
      })();
      v1beta1.MsgCreateValidator = (function () {
        function MsgCreateValidator(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreateValidator.prototype.description = null;
        MsgCreateValidator.prototype.commission = null;
        MsgCreateValidator.prototype.minSelfDelegation = "";
        MsgCreateValidator.prototype.delegatorAddress = "";
        MsgCreateValidator.prototype.validatorAddress = "";
        MsgCreateValidator.prototype.pubkey = null;
        MsgCreateValidator.prototype.value = null;
        MsgCreateValidator.create = function create(properties) {
          return new MsgCreateValidator(properties);
        };
        MsgCreateValidator.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, "description")
          )
            $root.cosmos.staking.v1beta1.Description.encode(
              m.description,
              w.uint32(10).fork()
            ).ldelim();
          if (
            m.commission != null &&
            Object.hasOwnProperty.call(m, "commission")
          )
            $root.cosmos.staking.v1beta1.CommissionRates.encode(
              m.commission,
              w.uint32(18).fork()
            ).ldelim();
          if (
            m.minSelfDelegation != null &&
            Object.hasOwnProperty.call(m, "minSelfDelegation")
          )
            w.uint32(26).string(m.minSelfDelegation);
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(34).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(42).string(m.validatorAddress);
          if (m.pubkey != null && Object.hasOwnProperty.call(m, "pubkey"))
            $root.google.protobuf.Any.encode(
              m.pubkey,
              w.uint32(50).fork()
            ).ldelim();
          if (m.value != null && Object.hasOwnProperty.call(m, "value"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.value,
              w.uint32(58).fork()
            ).ldelim();
          return w;
        };
        MsgCreateValidator.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgCreateValidator();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.description = $root.cosmos.staking.v1beta1.Description.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.commission = $root.cosmos.staking.v1beta1.CommissionRates.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.minSelfDelegation = r.string();
                break;
              case 4:
                m.delegatorAddress = r.string();
                break;
              case 5:
                m.validatorAddress = r.string();
                break;
              case 6:
                m.pubkey = $root.google.protobuf.Any.decode(r, r.uint32());
                break;
              case 7:
                m.value = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreateValidator.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgCreateValidator)
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgCreateValidator();
          if (d.description != null) {
            if (typeof d.description !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgCreateValidator.description: object expected"
              );
            m.description = $root.cosmos.staking.v1beta1.Description.fromObject(
              d.description
            );
          }
          if (d.commission != null) {
            if (typeof d.commission !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgCreateValidator.commission: object expected"
              );
            m.commission = $root.cosmos.staking.v1beta1.CommissionRates.fromObject(
              d.commission
            );
          }
          if (d.minSelfDelegation != null) {
            m.minSelfDelegation = String(d.minSelfDelegation);
          }
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.pubkey != null) {
            if (typeof d.pubkey !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgCreateValidator.pubkey: object expected"
              );
            m.pubkey = $root.google.protobuf.Any.fromObject(d.pubkey);
          }
          if (d.value != null) {
            if (typeof d.value !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgCreateValidator.value: object expected"
              );
            m.value = $root.cosmos.base.v1beta1.Coin.fromObject(d.value);
          }
          return m;
        };
        MsgCreateValidator.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.description = null;
            d.commission = null;
            d.minSelfDelegation = "";
            d.delegatorAddress = "";
            d.validatorAddress = "";
            d.pubkey = null;
            d.value = null;
          }
          if (m.description != null && m.hasOwnProperty("description")) {
            d.description = $root.cosmos.staking.v1beta1.Description.toObject(
              m.description,
              o
            );
          }
          if (m.commission != null && m.hasOwnProperty("commission")) {
            d.commission = $root.cosmos.staking.v1beta1.CommissionRates.toObject(
              m.commission,
              o
            );
          }
          if (
            m.minSelfDelegation != null &&
            m.hasOwnProperty("minSelfDelegation")
          ) {
            d.minSelfDelegation = m.minSelfDelegation;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.pubkey != null && m.hasOwnProperty("pubkey")) {
            d.pubkey = $root.google.protobuf.Any.toObject(m.pubkey, o);
          }
          if (m.value != null && m.hasOwnProperty("value")) {
            d.value = $root.cosmos.base.v1beta1.Coin.toObject(m.value, o);
          }
          return d;
        };
        MsgCreateValidator.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreateValidator;
      })();
      v1beta1.MsgCreateValidatorResponse = (function () {
        function MsgCreateValidatorResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgCreateValidatorResponse.create = function create(properties) {
          return new MsgCreateValidatorResponse(properties);
        };
        MsgCreateValidatorResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgCreateValidatorResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgCreateValidatorResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgCreateValidatorResponse.fromObject = function fromObject(d) {
          if (
            d instanceof $root.cosmos.staking.v1beta1.MsgCreateValidatorResponse
          )
            return d;
          return new $root.cosmos.staking.v1beta1.MsgCreateValidatorResponse();
        };
        MsgCreateValidatorResponse.toObject = function toObject() {
          return {};
        };
        MsgCreateValidatorResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgCreateValidatorResponse;
      })();
      v1beta1.MsgEditValidator = (function () {
        function MsgEditValidator(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgEditValidator.prototype.description = null;
        MsgEditValidator.prototype.validatorAddress = "";
        MsgEditValidator.prototype.commissionRate = "";
        MsgEditValidator.prototype.minSelfDelegation = "";
        MsgEditValidator.create = function create(properties) {
          return new MsgEditValidator(properties);
        };
        MsgEditValidator.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.description != null &&
            Object.hasOwnProperty.call(m, "description")
          )
            $root.cosmos.staking.v1beta1.Description.encode(
              m.description,
              w.uint32(10).fork()
            ).ldelim();
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(18).string(m.validatorAddress);
          if (
            m.commissionRate != null &&
            Object.hasOwnProperty.call(m, "commissionRate")
          )
            w.uint32(26).string(m.commissionRate);
          if (
            m.minSelfDelegation != null &&
            Object.hasOwnProperty.call(m, "minSelfDelegation")
          )
            w.uint32(34).string(m.minSelfDelegation);
          return w;
        };
        MsgEditValidator.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgEditValidator();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.description = $root.cosmos.staking.v1beta1.Description.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                m.commissionRate = r.string();
                break;
              case 4:
                m.minSelfDelegation = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgEditValidator.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgEditValidator)
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgEditValidator();
          if (d.description != null) {
            if (typeof d.description !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgEditValidator.description: object expected"
              );
            m.description = $root.cosmos.staking.v1beta1.Description.fromObject(
              d.description
            );
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.commissionRate != null) {
            m.commissionRate = String(d.commissionRate);
          }
          if (d.minSelfDelegation != null) {
            m.minSelfDelegation = String(d.minSelfDelegation);
          }
          return m;
        };
        MsgEditValidator.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.description = null;
            d.validatorAddress = "";
            d.commissionRate = "";
            d.minSelfDelegation = "";
          }
          if (m.description != null && m.hasOwnProperty("description")) {
            d.description = $root.cosmos.staking.v1beta1.Description.toObject(
              m.description,
              o
            );
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.commissionRate != null && m.hasOwnProperty("commissionRate")) {
            d.commissionRate = m.commissionRate;
          }
          if (
            m.minSelfDelegation != null &&
            m.hasOwnProperty("minSelfDelegation")
          ) {
            d.minSelfDelegation = m.minSelfDelegation;
          }
          return d;
        };
        MsgEditValidator.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgEditValidator;
      })();
      v1beta1.MsgEditValidatorResponse = (function () {
        function MsgEditValidatorResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgEditValidatorResponse.create = function create(properties) {
          return new MsgEditValidatorResponse(properties);
        };
        MsgEditValidatorResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgEditValidatorResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgEditValidatorResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgEditValidatorResponse.fromObject = function fromObject(d) {
          if (
            d instanceof $root.cosmos.staking.v1beta1.MsgEditValidatorResponse
          )
            return d;
          return new $root.cosmos.staking.v1beta1.MsgEditValidatorResponse();
        };
        MsgEditValidatorResponse.toObject = function toObject() {
          return {};
        };
        MsgEditValidatorResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgEditValidatorResponse;
      })();
      v1beta1.MsgDelegate = (function () {
        function MsgDelegate(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgDelegate.prototype.delegatorAddress = "";
        MsgDelegate.prototype.validatorAddress = "";
        MsgDelegate.prototype.amount = null;
        MsgDelegate.create = function create(properties) {
          return new MsgDelegate(properties);
        };
        MsgDelegate.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(18).string(m.validatorAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        MsgDelegate.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgDelegate();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgDelegate.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgDelegate) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgDelegate();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.amount != null) {
            if (typeof d.amount !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgDelegate.amount: object expected"
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        MsgDelegate.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorAddress = "";
            d.amount = null;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        MsgDelegate.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgDelegate;
      })();
      v1beta1.MsgDelegateResponse = (function () {
        function MsgDelegateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgDelegateResponse.create = function create(properties) {
          return new MsgDelegateResponse(properties);
        };
        MsgDelegateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          return w;
        };
        MsgDelegateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgDelegateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgDelegateResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgDelegateResponse)
            return d;
          return new $root.cosmos.staking.v1beta1.MsgDelegateResponse();
        };
        MsgDelegateResponse.toObject = function toObject() {
          return {};
        };
        MsgDelegateResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgDelegateResponse;
      })();
      v1beta1.MsgBeginRedelegate = (function () {
        function MsgBeginRedelegate(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgBeginRedelegate.prototype.delegatorAddress = "";
        MsgBeginRedelegate.prototype.validatorSrcAddress = "";
        MsgBeginRedelegate.prototype.validatorDstAddress = "";
        MsgBeginRedelegate.prototype.amount = null;
        MsgBeginRedelegate.create = function create(properties) {
          return new MsgBeginRedelegate(properties);
        };
        MsgBeginRedelegate.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorSrcAddress != null &&
            Object.hasOwnProperty.call(m, "validatorSrcAddress")
          )
            w.uint32(18).string(m.validatorSrcAddress);
          if (
            m.validatorDstAddress != null &&
            Object.hasOwnProperty.call(m, "validatorDstAddress")
          )
            w.uint32(26).string(m.validatorDstAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(34).fork()
            ).ldelim();
          return w;
        };
        MsgBeginRedelegate.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegate();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorSrcAddress = r.string();
                break;
              case 3:
                m.validatorDstAddress = r.string();
                break;
              case 4:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgBeginRedelegate.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegate)
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegate();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorSrcAddress != null) {
            m.validatorSrcAddress = String(d.validatorSrcAddress);
          }
          if (d.validatorDstAddress != null) {
            m.validatorDstAddress = String(d.validatorDstAddress);
          }
          if (d.amount != null) {
            if (typeof d.amount !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgBeginRedelegate.amount: object expected"
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        MsgBeginRedelegate.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorSrcAddress = "";
            d.validatorDstAddress = "";
            d.amount = null;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorSrcAddress != null &&
            m.hasOwnProperty("validatorSrcAddress")
          ) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (
            m.validatorDstAddress != null &&
            m.hasOwnProperty("validatorDstAddress")
          ) {
            d.validatorDstAddress = m.validatorDstAddress;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        MsgBeginRedelegate.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgBeginRedelegate;
      })();
      v1beta1.MsgBeginRedelegateResponse = (function () {
        function MsgBeginRedelegateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgBeginRedelegateResponse.prototype.completionTime = null;
        MsgBeginRedelegateResponse.create = function create(properties) {
          return new MsgBeginRedelegateResponse(properties);
        };
        MsgBeginRedelegateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.completionTime != null &&
            Object.hasOwnProperty.call(m, "completionTime")
          )
            $root.google.protobuf.Timestamp.encode(
              m.completionTime,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        MsgBeginRedelegateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.completionTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgBeginRedelegateResponse.fromObject = function fromObject(d) {
          if (
            d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse
          )
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgBeginRedelegateResponse.completionTime: object expected"
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(
              d.completionTime
            );
          }
          return m;
        };
        MsgBeginRedelegateResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.completionTime = null;
          }
          if (m.completionTime != null && m.hasOwnProperty("completionTime")) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(
              m.completionTime,
              o
            );
          }
          return d;
        };
        MsgBeginRedelegateResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgBeginRedelegateResponse;
      })();
      v1beta1.MsgUndelegate = (function () {
        function MsgUndelegate(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgUndelegate.prototype.delegatorAddress = "";
        MsgUndelegate.prototype.validatorAddress = "";
        MsgUndelegate.prototype.amount = null;
        MsgUndelegate.create = function create(properties) {
          return new MsgUndelegate(properties);
        };
        MsgUndelegate.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.delegatorAddress != null &&
            Object.hasOwnProperty.call(m, "delegatorAddress")
          )
            w.uint32(10).string(m.delegatorAddress);
          if (
            m.validatorAddress != null &&
            Object.hasOwnProperty.call(m, "validatorAddress")
          )
            w.uint32(18).string(m.validatorAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(
              m.amount,
              w.uint32(26).fork()
            ).ldelim();
          return w;
        };
        MsgUndelegate.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgUndelegate();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.delegatorAddress = r.string();
                break;
              case 2:
                m.validatorAddress = r.string();
                break;
              case 3:
                m.amount = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgUndelegate.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegate) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgUndelegate();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.amount != null) {
            if (typeof d.amount !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgUndelegate.amount: object expected"
              );
            m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
          }
          return m;
        };
        MsgUndelegate.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.delegatorAddress = "";
            d.validatorAddress = "";
            d.amount = null;
          }
          if (
            m.delegatorAddress != null &&
            m.hasOwnProperty("delegatorAddress")
          ) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (
            m.validatorAddress != null &&
            m.hasOwnProperty("validatorAddress")
          ) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.amount != null && m.hasOwnProperty("amount")) {
            d.amount = $root.cosmos.base.v1beta1.Coin.toObject(m.amount, o);
          }
          return d;
        };
        MsgUndelegate.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgUndelegate;
      })();
      v1beta1.MsgUndelegateResponse = (function () {
        function MsgUndelegateResponse(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        MsgUndelegateResponse.prototype.completionTime = null;
        MsgUndelegateResponse.create = function create(properties) {
          return new MsgUndelegateResponse(properties);
        };
        MsgUndelegateResponse.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (
            m.completionTime != null &&
            Object.hasOwnProperty.call(m, "completionTime")
          )
            $root.google.protobuf.Timestamp.encode(
              m.completionTime,
              w.uint32(10).fork()
            ).ldelim();
          return w;
        };
        MsgUndelegateResponse.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.completionTime = $root.google.protobuf.Timestamp.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgUndelegateResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegateResponse)
            return d;
          var m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgUndelegateResponse.completionTime: object expected"
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(
              d.completionTime
            );
          }
          return m;
        };
        MsgUndelegateResponse.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.completionTime = null;
          }
          if (m.completionTime != null && m.hasOwnProperty("completionTime")) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(
              m.completionTime,
              o
            );
          }
          return d;
        };
        MsgUndelegateResponse.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return MsgUndelegateResponse;
      })();
      return v1beta1;
    })();
    return staking;
  })();
  cosmos.tx = (function () {
    const tx = {};
    tx.signing = (function () {
      const signing = {};
      signing.v1beta1 = (function () {
        const v1beta1 = {};
        v1beta1.SignMode = (function () {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "SIGN_MODE_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "SIGN_MODE_DIRECT")] = 1;
          values[(valuesById[2] = "SIGN_MODE_TEXTUAL")] = 2;
          values[(valuesById[127] = "SIGN_MODE_LEGACY_AMINO_JSON")] = 127;
          return values;
        })();
        v1beta1.SignatureDescriptors = (function () {
          function SignatureDescriptors(p) {
            this.signatures = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          SignatureDescriptors.prototype.signatures = $util.emptyArray;
          SignatureDescriptors.create = function create(properties) {
            return new SignatureDescriptors(properties);
          };
          SignatureDescriptors.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.signatures != null && m.signatures.length) {
              for (var i = 0; i < m.signatures.length; ++i)
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.encode(
                  m.signatures[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            return w;
          };
          SignatureDescriptors.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.signatures && m.signatures.length)) m.signatures = [];
                  m.signatures.push(
                    $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.decode(
                      r,
                      r.uint32()
                    )
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          SignatureDescriptors.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptors
            )
              return d;
            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
            if (d.signatures) {
              if (!Array.isArray(d.signatures))
                throw TypeError(
                  ".cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: array expected"
                );
              m.signatures = [];
              for (var i = 0; i < d.signatures.length; ++i) {
                if (typeof d.signatures[i] !== "object")
                  throw TypeError(
                    ".cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: object expected"
                  );
                m.signatures[
                  i
                ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.fromObject(
                  d.signatures[i]
                );
              }
            }
            return m;
          };
          SignatureDescriptors.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.signatures = [];
            }
            if (m.signatures && m.signatures.length) {
              d.signatures = [];
              for (var j = 0; j < m.signatures.length; ++j) {
                d.signatures[
                  j
                ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.toObject(
                  m.signatures[j],
                  o
                );
              }
            }
            return d;
          };
          SignatureDescriptors.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return SignatureDescriptors;
        })();
        v1beta1.SignatureDescriptor = (function () {
          function SignatureDescriptor(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          SignatureDescriptor.prototype.publicKey = null;
          SignatureDescriptor.prototype.data = null;
          SignatureDescriptor.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          SignatureDescriptor.create = function create(properties) {
            return new SignatureDescriptor(properties);
          };
          SignatureDescriptor.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.publicKey != null &&
              Object.hasOwnProperty.call(m, "publicKey")
            )
              $root.google.protobuf.Any.encode(
                m.publicKey,
                w.uint32(10).fork()
              ).ldelim();
            if (m.data != null && Object.hasOwnProperty.call(m, "data"))
              $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(
                m.data,
                w.uint32(18).fork()
              ).ldelim();
            if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
              w.uint32(24).uint64(m.sequence);
            return w;
          };
          SignatureDescriptor.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.publicKey = $root.google.protobuf.Any.decode(r, r.uint32());
                  break;
                case 2:
                  m.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.sequence = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          SignatureDescriptor.fromObject = function fromObject(d) {
            if (
              d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor
            )
              return d;
            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor();
            if (d.publicKey != null) {
              if (typeof d.publicKey !== "object")
                throw TypeError(
                  ".cosmos.tx.signing.v1beta1.SignatureDescriptor.publicKey: object expected"
                );
              m.publicKey = $root.google.protobuf.Any.fromObject(d.publicKey);
            }
            if (d.data != null) {
              if (typeof d.data !== "object")
                throw TypeError(
                  ".cosmos.tx.signing.v1beta1.SignatureDescriptor.data: object expected"
                );
              m.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(
                d.data
              );
            }
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          SignatureDescriptor.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.publicKey = null;
              d.data = null;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? "0" : 0;
            }
            if (m.publicKey != null && m.hasOwnProperty("publicKey")) {
              d.publicKey = $root.google.protobuf.Any.toObject(m.publicKey, o);
            }
            if (m.data != null && m.hasOwnProperty("data")) {
              d.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(
                m.data,
                o
              );
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            return d;
          };
          SignatureDescriptor.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          SignatureDescriptor.Data = (function () {
            function Data(p) {
              if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                  if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
            }
            Data.prototype.single = null;
            Data.prototype.multi = null;
            let $oneOfFields;
            Object.defineProperty(Data.prototype, "sum", {
              get: $util.oneOfGetter(($oneOfFields = ["single", "multi"])),
              set: $util.oneOfSetter($oneOfFields),
            });
            Data.create = function create(properties) {
              return new Data(properties);
            };
            Data.encode = function encode(m, w) {
              if (!w) w = $Writer.create();
              if (m.single != null && Object.hasOwnProperty.call(m, "single"))
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.encode(
                  m.single,
                  w.uint32(10).fork()
                ).ldelim();
              if (m.multi != null && Object.hasOwnProperty.call(m, "multi"))
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.encode(
                  m.multi,
                  w.uint32(18).fork()
                ).ldelim();
              return w;
            };
            Data.decode = function decode(r, l) {
              if (!(r instanceof $Reader)) r = $Reader.create(r);
              var c = l === undefined ? r.len : r.pos + l,
                m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
              while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                  case 1:
                    m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.decode(
                      r,
                      r.uint32()
                    );
                    break;
                  case 2:
                    m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.decode(
                      r,
                      r.uint32()
                    );
                    break;
                  default:
                    r.skipType(t & 7);
                    break;
                }
              }
              return m;
            };
            Data.fromObject = function fromObject(d) {
              if (
                d instanceof
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data
              )
                return d;
              var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
              if (d.single != null) {
                if (typeof d.single !== "object")
                  throw TypeError(
                    ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.single: object expected"
                  );
                m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.fromObject(
                  d.single
                );
              }
              if (d.multi != null) {
                if (typeof d.multi !== "object")
                  throw TypeError(
                    ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.multi: object expected"
                  );
                m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.fromObject(
                  d.multi
                );
              }
              return m;
            };
            Data.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (m.single != null && m.hasOwnProperty("single")) {
                d.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.toObject(
                  m.single,
                  o
                );
                if (o.oneofs) d.sum = "single";
              }
              if (m.multi != null && m.hasOwnProperty("multi")) {
                d.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.toObject(
                  m.multi,
                  o
                );
                if (o.oneofs) d.sum = "multi";
              }
              return d;
            };
            Data.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(
                this,
                $protobuf.util.toJSONOptions
              );
            };
            Data.Single = (function () {
              function Single(p) {
                if (p)
                  for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
              }
              Single.prototype.mode = 0;
              Single.prototype.signature = $util.newBuffer([]);
              Single.create = function create(properties) {
                return new Single(properties);
              };
              Single.encode = function encode(m, w) {
                if (!w) w = $Writer.create();
                if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                  w.uint32(8).int32(m.mode);
                if (
                  m.signature != null &&
                  Object.hasOwnProperty.call(m, "signature")
                )
                  w.uint32(18).bytes(m.signature);
                return w;
              };
              Single.decode = function decode(r, l) {
                if (!(r instanceof $Reader)) r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l,
                  m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single();
                while (r.pos < c) {
                  var t = r.uint32();
                  switch (t >>> 3) {
                    case 1:
                      m.mode = r.int32();
                      break;
                    case 2:
                      m.signature = r.bytes();
                      break;
                    default:
                      r.skipType(t & 7);
                      break;
                  }
                }
                return m;
              };
              Single.fromObject = function fromObject(d) {
                if (
                  d instanceof
                  $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data
                    .Single
                )
                  return d;
                var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single();
                switch (d.mode) {
                  case "SIGN_MODE_UNSPECIFIED":
                  case 0:
                    m.mode = 0;
                    break;
                  case "SIGN_MODE_DIRECT":
                  case 1:
                    m.mode = 1;
                    break;
                  case "SIGN_MODE_TEXTUAL":
                  case 2:
                    m.mode = 2;
                    break;
                  case "SIGN_MODE_LEGACY_AMINO_JSON":
                  case 127:
                    m.mode = 127;
                    break;
                }
                if (d.signature != null) {
                  if (typeof d.signature === "string")
                    $util.base64.decode(
                      d.signature,
                      (m.signature = $util.newBuffer(
                        $util.base64.length(d.signature)
                      )),
                      0
                    );
                  else if (d.signature.length) m.signature = d.signature;
                }
                return m;
              };
              Single.toObject = function toObject(m, o) {
                if (!o) o = {};
                var d = {};
                if (o.defaults) {
                  d.mode = o.enums === String ? "SIGN_MODE_UNSPECIFIED" : 0;
                  if (o.bytes === String) d.signature = "";
                  else {
                    d.signature = [];
                    if (o.bytes !== Array)
                      d.signature = $util.newBuffer(d.signature);
                  }
                }
                if (m.mode != null && m.hasOwnProperty("mode")) {
                  d.mode =
                    o.enums === String
                      ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode]
                      : m.mode;
                }
                if (m.signature != null && m.hasOwnProperty("signature")) {
                  d.signature =
                    o.bytes === String
                      ? $util.base64.encode(m.signature, 0, m.signature.length)
                      : o.bytes === Array
                      ? Array.prototype.slice.call(m.signature)
                      : m.signature;
                }
                return d;
              };
              Single.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
              return Single;
            })();
            Data.Multi = (function () {
              function Multi(p) {
                this.signatures = [];
                if (p)
                  for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
              }
              Multi.prototype.bitarray = null;
              Multi.prototype.signatures = $util.emptyArray;
              Multi.create = function create(properties) {
                return new Multi(properties);
              };
              Multi.encode = function encode(m, w) {
                if (!w) w = $Writer.create();
                if (
                  m.bitarray != null &&
                  Object.hasOwnProperty.call(m, "bitarray")
                )
                  $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(
                    m.bitarray,
                    w.uint32(10).fork()
                  ).ldelim();
                if (m.signatures != null && m.signatures.length) {
                  for (var i = 0; i < m.signatures.length; ++i)
                    $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(
                      m.signatures[i],
                      w.uint32(18).fork()
                    ).ldelim();
                }
                return w;
              };
              Multi.decode = function decode(r, l) {
                if (!(r instanceof $Reader)) r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l,
                  m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                while (r.pos < c) {
                  var t = r.uint32();
                  switch (t >>> 3) {
                    case 1:
                      m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(
                        r,
                        r.uint32()
                      );
                      break;
                    case 2:
                      if (!(m.signatures && m.signatures.length))
                        m.signatures = [];
                      m.signatures.push(
                        $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(
                          r,
                          r.uint32()
                        )
                      );
                      break;
                    default:
                      r.skipType(t & 7);
                      break;
                  }
                }
                return m;
              };
              Multi.fromObject = function fromObject(d) {
                if (
                  d instanceof
                  $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi
                )
                  return d;
                var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                if (d.bitarray != null) {
                  if (typeof d.bitarray !== "object")
                    throw TypeError(
                      ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.bitarray: object expected"
                    );
                  m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(
                    d.bitarray
                  );
                }
                if (d.signatures) {
                  if (!Array.isArray(d.signatures))
                    throw TypeError(
                      ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: array expected"
                    );
                  m.signatures = [];
                  for (var i = 0; i < d.signatures.length; ++i) {
                    if (typeof d.signatures[i] !== "object")
                      throw TypeError(
                        ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: object expected"
                      );
                    m.signatures[
                      i
                    ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(
                      d.signatures[i]
                    );
                  }
                }
                return m;
              };
              Multi.toObject = function toObject(m, o) {
                if (!o) o = {};
                var d = {};
                if (o.arrays || o.defaults) {
                  d.signatures = [];
                }
                if (o.defaults) {
                  d.bitarray = null;
                }
                if (m.bitarray != null && m.hasOwnProperty("bitarray")) {
                  d.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.toObject(
                    m.bitarray,
                    o
                  );
                }
                if (m.signatures && m.signatures.length) {
                  d.signatures = [];
                  for (var j = 0; j < m.signatures.length; ++j) {
                    d.signatures[
                      j
                    ] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(
                      m.signatures[j],
                      o
                    );
                  }
                }
                return d;
              };
              Multi.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(
                  this,
                  $protobuf.util.toJSONOptions
                );
              };
              return Multi;
            })();
            return Data;
          })();
          return SignatureDescriptor;
        })();
        return v1beta1;
      })();
      return signing;
    })();
    tx.v1beta1 = (function () {
      const v1beta1 = {};
      v1beta1.Tx = (function () {
        function Tx(p) {
          this.signatures = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Tx.prototype.body = null;
        Tx.prototype.authInfo = null;
        Tx.prototype.signatures = $util.emptyArray;
        Tx.create = function create(properties) {
          return new Tx(properties);
        };
        Tx.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.body != null && Object.hasOwnProperty.call(m, "body"))
            $root.cosmos.tx.v1beta1.TxBody.encode(
              m.body,
              w.uint32(10).fork()
            ).ldelim();
          if (m.authInfo != null && Object.hasOwnProperty.call(m, "authInfo"))
            $root.cosmos.tx.v1beta1.AuthInfo.encode(
              m.authInfo,
              w.uint32(18).fork()
            ).ldelim();
          if (m.signatures != null && m.signatures.length) {
            for (var i = 0; i < m.signatures.length; ++i)
              w.uint32(26).bytes(m.signatures[i]);
          }
          return w;
        };
        Tx.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.Tx();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.body = $root.cosmos.tx.v1beta1.TxBody.decode(r, r.uint32());
                break;
              case 2:
                m.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                if (!(m.signatures && m.signatures.length)) m.signatures = [];
                m.signatures.push(r.bytes());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Tx.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.Tx) return d;
          var m = new $root.cosmos.tx.v1beta1.Tx();
          if (d.body != null) {
            if (typeof d.body !== "object")
              throw TypeError(".cosmos.tx.v1beta1.Tx.body: object expected");
            m.body = $root.cosmos.tx.v1beta1.TxBody.fromObject(d.body);
          }
          if (d.authInfo != null) {
            if (typeof d.authInfo !== "object")
              throw TypeError(
                ".cosmos.tx.v1beta1.Tx.authInfo: object expected"
              );
            m.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.fromObject(
              d.authInfo
            );
          }
          if (d.signatures) {
            if (!Array.isArray(d.signatures))
              throw TypeError(
                ".cosmos.tx.v1beta1.Tx.signatures: array expected"
              );
            m.signatures = [];
            for (var i = 0; i < d.signatures.length; ++i) {
              if (typeof d.signatures[i] === "string")
                $util.base64.decode(
                  d.signatures[i],
                  (m.signatures[i] = $util.newBuffer(
                    $util.base64.length(d.signatures[i])
                  )),
                  0
                );
              else if (d.signatures[i].length)
                m.signatures[i] = d.signatures[i];
            }
          }
          return m;
        };
        Tx.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.signatures = [];
          }
          if (o.defaults) {
            d.body = null;
            d.authInfo = null;
          }
          if (m.body != null && m.hasOwnProperty("body")) {
            d.body = $root.cosmos.tx.v1beta1.TxBody.toObject(m.body, o);
          }
          if (m.authInfo != null && m.hasOwnProperty("authInfo")) {
            d.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.toObject(
              m.authInfo,
              o
            );
          }
          if (m.signatures && m.signatures.length) {
            d.signatures = [];
            for (var j = 0; j < m.signatures.length; ++j) {
              d.signatures[j] =
                o.bytes === String
                  ? $util.base64.encode(
                      m.signatures[j],
                      0,
                      m.signatures[j].length
                    )
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.signatures[j])
                  : m.signatures[j];
            }
          }
          return d;
        };
        Tx.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Tx;
      })();
      v1beta1.TxRaw = (function () {
        function TxRaw(p) {
          this.signatures = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        TxRaw.prototype.bodyBytes = $util.newBuffer([]);
        TxRaw.prototype.authInfoBytes = $util.newBuffer([]);
        TxRaw.prototype.signatures = $util.emptyArray;
        TxRaw.create = function create(properties) {
          return new TxRaw(properties);
        };
        TxRaw.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.bodyBytes != null && Object.hasOwnProperty.call(m, "bodyBytes"))
            w.uint32(10).bytes(m.bodyBytes);
          if (
            m.authInfoBytes != null &&
            Object.hasOwnProperty.call(m, "authInfoBytes")
          )
            w.uint32(18).bytes(m.authInfoBytes);
          if (m.signatures != null && m.signatures.length) {
            for (var i = 0; i < m.signatures.length; ++i)
              w.uint32(26).bytes(m.signatures[i]);
          }
          return w;
        };
        TxRaw.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.TxRaw();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.bodyBytes = r.bytes();
                break;
              case 2:
                m.authInfoBytes = r.bytes();
                break;
              case 3:
                if (!(m.signatures && m.signatures.length)) m.signatures = [];
                m.signatures.push(r.bytes());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        TxRaw.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.TxRaw) return d;
          var m = new $root.cosmos.tx.v1beta1.TxRaw();
          if (d.bodyBytes != null) {
            if (typeof d.bodyBytes === "string")
              $util.base64.decode(
                d.bodyBytes,
                (m.bodyBytes = $util.newBuffer(
                  $util.base64.length(d.bodyBytes)
                )),
                0
              );
            else if (d.bodyBytes.length) m.bodyBytes = d.bodyBytes;
          }
          if (d.authInfoBytes != null) {
            if (typeof d.authInfoBytes === "string")
              $util.base64.decode(
                d.authInfoBytes,
                (m.authInfoBytes = $util.newBuffer(
                  $util.base64.length(d.authInfoBytes)
                )),
                0
              );
            else if (d.authInfoBytes.length) m.authInfoBytes = d.authInfoBytes;
          }
          if (d.signatures) {
            if (!Array.isArray(d.signatures))
              throw TypeError(
                ".cosmos.tx.v1beta1.TxRaw.signatures: array expected"
              );
            m.signatures = [];
            for (var i = 0; i < d.signatures.length; ++i) {
              if (typeof d.signatures[i] === "string")
                $util.base64.decode(
                  d.signatures[i],
                  (m.signatures[i] = $util.newBuffer(
                    $util.base64.length(d.signatures[i])
                  )),
                  0
                );
              else if (d.signatures[i].length)
                m.signatures[i] = d.signatures[i];
            }
          }
          return m;
        };
        TxRaw.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.signatures = [];
          }
          if (o.defaults) {
            if (o.bytes === String) d.bodyBytes = "";
            else {
              d.bodyBytes = [];
              if (o.bytes !== Array) d.bodyBytes = $util.newBuffer(d.bodyBytes);
            }
            if (o.bytes === String) d.authInfoBytes = "";
            else {
              d.authInfoBytes = [];
              if (o.bytes !== Array)
                d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
            }
          }
          if (m.bodyBytes != null && m.hasOwnProperty("bodyBytes")) {
            d.bodyBytes =
              o.bytes === String
                ? $util.base64.encode(m.bodyBytes, 0, m.bodyBytes.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.bodyBytes)
                : m.bodyBytes;
          }
          if (m.authInfoBytes != null && m.hasOwnProperty("authInfoBytes")) {
            d.authInfoBytes =
              o.bytes === String
                ? $util.base64.encode(
                    m.authInfoBytes,
                    0,
                    m.authInfoBytes.length
                  )
                : o.bytes === Array
                ? Array.prototype.slice.call(m.authInfoBytes)
                : m.authInfoBytes;
          }
          if (m.signatures && m.signatures.length) {
            d.signatures = [];
            for (var j = 0; j < m.signatures.length; ++j) {
              d.signatures[j] =
                o.bytes === String
                  ? $util.base64.encode(
                      m.signatures[j],
                      0,
                      m.signatures[j].length
                    )
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.signatures[j])
                  : m.signatures[j];
            }
          }
          return d;
        };
        TxRaw.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return TxRaw;
      })();
      v1beta1.SignDoc = (function () {
        function SignDoc(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SignDoc.prototype.bodyBytes = $util.newBuffer([]);
        SignDoc.prototype.authInfoBytes = $util.newBuffer([]);
        SignDoc.prototype.chainId = "";
        SignDoc.prototype.accountNumber = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        SignDoc.create = function create(properties) {
          return new SignDoc(properties);
        };
        SignDoc.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.bodyBytes != null && Object.hasOwnProperty.call(m, "bodyBytes"))
            w.uint32(10).bytes(m.bodyBytes);
          if (
            m.authInfoBytes != null &&
            Object.hasOwnProperty.call(m, "authInfoBytes")
          )
            w.uint32(18).bytes(m.authInfoBytes);
          if (m.chainId != null && Object.hasOwnProperty.call(m, "chainId"))
            w.uint32(26).string(m.chainId);
          if (
            m.accountNumber != null &&
            Object.hasOwnProperty.call(m, "accountNumber")
          )
            w.uint32(32).uint64(m.accountNumber);
          return w;
        };
        SignDoc.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.SignDoc();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.bodyBytes = r.bytes();
                break;
              case 2:
                m.authInfoBytes = r.bytes();
                break;
              case 3:
                m.chainId = r.string();
                break;
              case 4:
                m.accountNumber = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SignDoc.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.SignDoc) return d;
          var m = new $root.cosmos.tx.v1beta1.SignDoc();
          if (d.bodyBytes != null) {
            if (typeof d.bodyBytes === "string")
              $util.base64.decode(
                d.bodyBytes,
                (m.bodyBytes = $util.newBuffer(
                  $util.base64.length(d.bodyBytes)
                )),
                0
              );
            else if (d.bodyBytes.length) m.bodyBytes = d.bodyBytes;
          }
          if (d.authInfoBytes != null) {
            if (typeof d.authInfoBytes === "string")
              $util.base64.decode(
                d.authInfoBytes,
                (m.authInfoBytes = $util.newBuffer(
                  $util.base64.length(d.authInfoBytes)
                )),
                0
              );
            else if (d.authInfoBytes.length) m.authInfoBytes = d.authInfoBytes;
          }
          if (d.chainId != null) {
            m.chainId = String(d.chainId);
          }
          if (d.accountNumber != null) {
            if ($util.Long)
              (m.accountNumber = $util.Long.fromValue(
                d.accountNumber
              )).unsigned = true;
            else if (typeof d.accountNumber === "string")
              m.accountNumber = parseInt(d.accountNumber, 10);
            else if (typeof d.accountNumber === "number")
              m.accountNumber = d.accountNumber;
            else if (typeof d.accountNumber === "object")
              m.accountNumber = new $util.LongBits(
                d.accountNumber.low >>> 0,
                d.accountNumber.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        SignDoc.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            if (o.bytes === String) d.bodyBytes = "";
            else {
              d.bodyBytes = [];
              if (o.bytes !== Array) d.bodyBytes = $util.newBuffer(d.bodyBytes);
            }
            if (o.bytes === String) d.authInfoBytes = "";
            else {
              d.authInfoBytes = [];
              if (o.bytes !== Array)
                d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
            }
            d.chainId = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.accountNumber =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.accountNumber = o.longs === String ? "0" : 0;
          }
          if (m.bodyBytes != null && m.hasOwnProperty("bodyBytes")) {
            d.bodyBytes =
              o.bytes === String
                ? $util.base64.encode(m.bodyBytes, 0, m.bodyBytes.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.bodyBytes)
                : m.bodyBytes;
          }
          if (m.authInfoBytes != null && m.hasOwnProperty("authInfoBytes")) {
            d.authInfoBytes =
              o.bytes === String
                ? $util.base64.encode(
                    m.authInfoBytes,
                    0,
                    m.authInfoBytes.length
                  )
                : o.bytes === Array
                ? Array.prototype.slice.call(m.authInfoBytes)
                : m.authInfoBytes;
          }
          if (m.chainId != null && m.hasOwnProperty("chainId")) {
            d.chainId = m.chainId;
          }
          if (m.accountNumber != null && m.hasOwnProperty("accountNumber")) {
            if (typeof m.accountNumber === "number")
              d.accountNumber =
                o.longs === String ? String(m.accountNumber) : m.accountNumber;
            else
              d.accountNumber =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.accountNumber)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.accountNumber.low >>> 0,
                      m.accountNumber.high >>> 0
                    ).toNumber(true)
                  : m.accountNumber;
          }
          return d;
        };
        SignDoc.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SignDoc;
      })();
      v1beta1.TxBody = (function () {
        function TxBody(p) {
          this.messages = [];
          this.extensionOptions = [];
          this.nonCriticalExtensionOptions = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        TxBody.prototype.messages = $util.emptyArray;
        TxBody.prototype.memo = "";
        TxBody.prototype.timeoutHeight = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        TxBody.prototype.extensionOptions = $util.emptyArray;
        TxBody.prototype.nonCriticalExtensionOptions = $util.emptyArray;
        TxBody.create = function create(properties) {
          return new TxBody(properties);
        };
        TxBody.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.messages != null && m.messages.length) {
            for (var i = 0; i < m.messages.length; ++i)
              $root.google.protobuf.Any.encode(
                m.messages[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.memo != null && Object.hasOwnProperty.call(m, "memo"))
            w.uint32(18).string(m.memo);
          if (
            m.timeoutHeight != null &&
            Object.hasOwnProperty.call(m, "timeoutHeight")
          )
            w.uint32(24).uint64(m.timeoutHeight);
          if (m.extensionOptions != null && m.extensionOptions.length) {
            for (var i = 0; i < m.extensionOptions.length; ++i)
              $root.google.protobuf.Any.encode(
                m.extensionOptions[i],
                w.uint32(8186).fork()
              ).ldelim();
          }
          if (
            m.nonCriticalExtensionOptions != null &&
            m.nonCriticalExtensionOptions.length
          ) {
            for (var i = 0; i < m.nonCriticalExtensionOptions.length; ++i)
              $root.google.protobuf.Any.encode(
                m.nonCriticalExtensionOptions[i],
                w.uint32(16378).fork()
              ).ldelim();
          }
          return w;
        };
        TxBody.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.TxBody();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.messages && m.messages.length)) m.messages = [];
                m.messages.push(
                  $root.google.protobuf.Any.decode(r, r.uint32())
                );
                break;
              case 2:
                m.memo = r.string();
                break;
              case 3:
                m.timeoutHeight = r.uint64();
                break;
              case 1023:
                if (!(m.extensionOptions && m.extensionOptions.length))
                  m.extensionOptions = [];
                m.extensionOptions.push(
                  $root.google.protobuf.Any.decode(r, r.uint32())
                );
                break;
              case 2047:
                if (
                  !(
                    m.nonCriticalExtensionOptions &&
                    m.nonCriticalExtensionOptions.length
                  )
                )
                  m.nonCriticalExtensionOptions = [];
                m.nonCriticalExtensionOptions.push(
                  $root.google.protobuf.Any.decode(r, r.uint32())
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        TxBody.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.TxBody) return d;
          var m = new $root.cosmos.tx.v1beta1.TxBody();
          if (d.messages) {
            if (!Array.isArray(d.messages))
              throw TypeError(
                ".cosmos.tx.v1beta1.TxBody.messages: array expected"
              );
            m.messages = [];
            for (var i = 0; i < d.messages.length; ++i) {
              if (typeof d.messages[i] !== "object")
                throw TypeError(
                  ".cosmos.tx.v1beta1.TxBody.messages: object expected"
                );
              m.messages[i] = $root.google.protobuf.Any.fromObject(
                d.messages[i]
              );
            }
          }
          if (d.memo != null) {
            m.memo = String(d.memo);
          }
          if (d.timeoutHeight != null) {
            if ($util.Long)
              (m.timeoutHeight = $util.Long.fromValue(
                d.timeoutHeight
              )).unsigned = true;
            else if (typeof d.timeoutHeight === "string")
              m.timeoutHeight = parseInt(d.timeoutHeight, 10);
            else if (typeof d.timeoutHeight === "number")
              m.timeoutHeight = d.timeoutHeight;
            else if (typeof d.timeoutHeight === "object")
              m.timeoutHeight = new $util.LongBits(
                d.timeoutHeight.low >>> 0,
                d.timeoutHeight.high >>> 0
              ).toNumber(true);
          }
          if (d.extensionOptions) {
            if (!Array.isArray(d.extensionOptions))
              throw TypeError(
                ".cosmos.tx.v1beta1.TxBody.extensionOptions: array expected"
              );
            m.extensionOptions = [];
            for (var i = 0; i < d.extensionOptions.length; ++i) {
              if (typeof d.extensionOptions[i] !== "object")
                throw TypeError(
                  ".cosmos.tx.v1beta1.TxBody.extensionOptions: object expected"
                );
              m.extensionOptions[i] = $root.google.protobuf.Any.fromObject(
                d.extensionOptions[i]
              );
            }
          }
          if (d.nonCriticalExtensionOptions) {
            if (!Array.isArray(d.nonCriticalExtensionOptions))
              throw TypeError(
                ".cosmos.tx.v1beta1.TxBody.nonCriticalExtensionOptions: array expected"
              );
            m.nonCriticalExtensionOptions = [];
            for (var i = 0; i < d.nonCriticalExtensionOptions.length; ++i) {
              if (typeof d.nonCriticalExtensionOptions[i] !== "object")
                throw TypeError(
                  ".cosmos.tx.v1beta1.TxBody.nonCriticalExtensionOptions: object expected"
                );
              m.nonCriticalExtensionOptions[
                i
              ] = $root.google.protobuf.Any.fromObject(
                d.nonCriticalExtensionOptions[i]
              );
            }
          }
          return m;
        };
        TxBody.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.messages = [];
            d.extensionOptions = [];
            d.nonCriticalExtensionOptions = [];
          }
          if (o.defaults) {
            d.memo = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.timeoutHeight =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.timeoutHeight = o.longs === String ? "0" : 0;
          }
          if (m.messages && m.messages.length) {
            d.messages = [];
            for (var j = 0; j < m.messages.length; ++j) {
              d.messages[j] = $root.google.protobuf.Any.toObject(
                m.messages[j],
                o
              );
            }
          }
          if (m.memo != null && m.hasOwnProperty("memo")) {
            d.memo = m.memo;
          }
          if (m.timeoutHeight != null && m.hasOwnProperty("timeoutHeight")) {
            if (typeof m.timeoutHeight === "number")
              d.timeoutHeight =
                o.longs === String ? String(m.timeoutHeight) : m.timeoutHeight;
            else
              d.timeoutHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.timeoutHeight)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.timeoutHeight.low >>> 0,
                      m.timeoutHeight.high >>> 0
                    ).toNumber(true)
                  : m.timeoutHeight;
          }
          if (m.extensionOptions && m.extensionOptions.length) {
            d.extensionOptions = [];
            for (var j = 0; j < m.extensionOptions.length; ++j) {
              d.extensionOptions[j] = $root.google.protobuf.Any.toObject(
                m.extensionOptions[j],
                o
              );
            }
          }
          if (
            m.nonCriticalExtensionOptions &&
            m.nonCriticalExtensionOptions.length
          ) {
            d.nonCriticalExtensionOptions = [];
            for (var j = 0; j < m.nonCriticalExtensionOptions.length; ++j) {
              d.nonCriticalExtensionOptions[
                j
              ] = $root.google.protobuf.Any.toObject(
                m.nonCriticalExtensionOptions[j],
                o
              );
            }
          }
          return d;
        };
        TxBody.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return TxBody;
      })();
      v1beta1.AuthInfo = (function () {
        function AuthInfo(p) {
          this.signerInfos = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        AuthInfo.prototype.signerInfos = $util.emptyArray;
        AuthInfo.prototype.fee = null;
        AuthInfo.create = function create(properties) {
          return new AuthInfo(properties);
        };
        AuthInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.signerInfos != null && m.signerInfos.length) {
            for (var i = 0; i < m.signerInfos.length; ++i)
              $root.cosmos.tx.v1beta1.SignerInfo.encode(
                m.signerInfos[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.fee != null && Object.hasOwnProperty.call(m, "fee"))
            $root.cosmos.tx.v1beta1.Fee.encode(
              m.fee,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        AuthInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.AuthInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.signerInfos && m.signerInfos.length))
                  m.signerInfos = [];
                m.signerInfos.push(
                  $root.cosmos.tx.v1beta1.SignerInfo.decode(r, r.uint32())
                );
                break;
              case 2:
                m.fee = $root.cosmos.tx.v1beta1.Fee.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        AuthInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.AuthInfo) return d;
          var m = new $root.cosmos.tx.v1beta1.AuthInfo();
          if (d.signerInfos) {
            if (!Array.isArray(d.signerInfos))
              throw TypeError(
                ".cosmos.tx.v1beta1.AuthInfo.signerInfos: array expected"
              );
            m.signerInfos = [];
            for (var i = 0; i < d.signerInfos.length; ++i) {
              if (typeof d.signerInfos[i] !== "object")
                throw TypeError(
                  ".cosmos.tx.v1beta1.AuthInfo.signerInfos: object expected"
                );
              m.signerInfos[i] = $root.cosmos.tx.v1beta1.SignerInfo.fromObject(
                d.signerInfos[i]
              );
            }
          }
          if (d.fee != null) {
            if (typeof d.fee !== "object")
              throw TypeError(
                ".cosmos.tx.v1beta1.AuthInfo.fee: object expected"
              );
            m.fee = $root.cosmos.tx.v1beta1.Fee.fromObject(d.fee);
          }
          return m;
        };
        AuthInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.signerInfos = [];
          }
          if (o.defaults) {
            d.fee = null;
          }
          if (m.signerInfos && m.signerInfos.length) {
            d.signerInfos = [];
            for (var j = 0; j < m.signerInfos.length; ++j) {
              d.signerInfos[j] = $root.cosmos.tx.v1beta1.SignerInfo.toObject(
                m.signerInfos[j],
                o
              );
            }
          }
          if (m.fee != null && m.hasOwnProperty("fee")) {
            d.fee = $root.cosmos.tx.v1beta1.Fee.toObject(m.fee, o);
          }
          return d;
        };
        AuthInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return AuthInfo;
      })();
      v1beta1.SignerInfo = (function () {
        function SignerInfo(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        SignerInfo.prototype.publicKey = null;
        SignerInfo.prototype.modeInfo = null;
        SignerInfo.prototype.sequence = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        SignerInfo.create = function create(properties) {
          return new SignerInfo(properties);
        };
        SignerInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.publicKey != null && Object.hasOwnProperty.call(m, "publicKey"))
            $root.google.protobuf.Any.encode(
              m.publicKey,
              w.uint32(10).fork()
            ).ldelim();
          if (m.modeInfo != null && Object.hasOwnProperty.call(m, "modeInfo"))
            $root.cosmos.tx.v1beta1.ModeInfo.encode(
              m.modeInfo,
              w.uint32(18).fork()
            ).ldelim();
          if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
            w.uint32(24).uint64(m.sequence);
          return w;
        };
        SignerInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.SignerInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.publicKey = $root.google.protobuf.Any.decode(r, r.uint32());
                break;
              case 2:
                m.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.decode(
                  r,
                  r.uint32()
                );
                break;
              case 3:
                m.sequence = r.uint64();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        SignerInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.SignerInfo) return d;
          var m = new $root.cosmos.tx.v1beta1.SignerInfo();
          if (d.publicKey != null) {
            if (typeof d.publicKey !== "object")
              throw TypeError(
                ".cosmos.tx.v1beta1.SignerInfo.publicKey: object expected"
              );
            m.publicKey = $root.google.protobuf.Any.fromObject(d.publicKey);
          }
          if (d.modeInfo != null) {
            if (typeof d.modeInfo !== "object")
              throw TypeError(
                ".cosmos.tx.v1beta1.SignerInfo.modeInfo: object expected"
              );
            m.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.fromObject(
              d.modeInfo
            );
          }
          if (d.sequence != null) {
            if ($util.Long)
              (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
            else if (typeof d.sequence === "string")
              m.sequence = parseInt(d.sequence, 10);
            else if (typeof d.sequence === "number") m.sequence = d.sequence;
            else if (typeof d.sequence === "object")
              m.sequence = new $util.LongBits(
                d.sequence.low >>> 0,
                d.sequence.high >>> 0
              ).toNumber(true);
          }
          return m;
        };
        SignerInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.publicKey = null;
            d.modeInfo = null;
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.sequence =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.sequence = o.longs === String ? "0" : 0;
          }
          if (m.publicKey != null && m.hasOwnProperty("publicKey")) {
            d.publicKey = $root.google.protobuf.Any.toObject(m.publicKey, o);
          }
          if (m.modeInfo != null && m.hasOwnProperty("modeInfo")) {
            d.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.toObject(
              m.modeInfo,
              o
            );
          }
          if (m.sequence != null && m.hasOwnProperty("sequence")) {
            if (typeof m.sequence === "number")
              d.sequence = o.longs === String ? String(m.sequence) : m.sequence;
            else
              d.sequence =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.sequence)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.sequence.low >>> 0,
                      m.sequence.high >>> 0
                    ).toNumber(true)
                  : m.sequence;
          }
          return d;
        };
        SignerInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return SignerInfo;
      })();
      v1beta1.ModeInfo = (function () {
        function ModeInfo(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        ModeInfo.prototype.single = null;
        ModeInfo.prototype.multi = null;
        let $oneOfFields;
        Object.defineProperty(ModeInfo.prototype, "sum", {
          get: $util.oneOfGetter(($oneOfFields = ["single", "multi"])),
          set: $util.oneOfSetter($oneOfFields),
        });
        ModeInfo.create = function create(properties) {
          return new ModeInfo(properties);
        };
        ModeInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.single != null && Object.hasOwnProperty.call(m, "single"))
            $root.cosmos.tx.v1beta1.ModeInfo.Single.encode(
              m.single,
              w.uint32(10).fork()
            ).ldelim();
          if (m.multi != null && Object.hasOwnProperty.call(m, "multi"))
            $root.cosmos.tx.v1beta1.ModeInfo.Multi.encode(
              m.multi,
              w.uint32(18).fork()
            ).ldelim();
          return w;
        };
        ModeInfo.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.ModeInfo();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.decode(
                  r,
                  r.uint32()
                );
                break;
              case 2:
                m.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.decode(
                  r,
                  r.uint32()
                );
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        ModeInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo) return d;
          var m = new $root.cosmos.tx.v1beta1.ModeInfo();
          if (d.single != null) {
            if (typeof d.single !== "object")
              throw TypeError(
                ".cosmos.tx.v1beta1.ModeInfo.single: object expected"
              );
            m.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.fromObject(
              d.single
            );
          }
          if (d.multi != null) {
            if (typeof d.multi !== "object")
              throw TypeError(
                ".cosmos.tx.v1beta1.ModeInfo.multi: object expected"
              );
            m.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.fromObject(
              d.multi
            );
          }
          return m;
        };
        ModeInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (m.single != null && m.hasOwnProperty("single")) {
            d.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.toObject(
              m.single,
              o
            );
            if (o.oneofs) d.sum = "single";
          }
          if (m.multi != null && m.hasOwnProperty("multi")) {
            d.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.toObject(
              m.multi,
              o
            );
            if (o.oneofs) d.sum = "multi";
          }
          return d;
        };
        ModeInfo.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        ModeInfo.Single = (function () {
          function Single(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Single.prototype.mode = 0;
          Single.create = function create(properties) {
            return new Single(properties);
          };
          Single.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
              w.uint32(8).int32(m.mode);
            return w;
          };
          Single.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.v1beta1.ModeInfo.Single();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.mode = r.int32();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Single.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo.Single) return d;
            var m = new $root.cosmos.tx.v1beta1.ModeInfo.Single();
            switch (d.mode) {
              case "SIGN_MODE_UNSPECIFIED":
              case 0:
                m.mode = 0;
                break;
              case "SIGN_MODE_DIRECT":
              case 1:
                m.mode = 1;
                break;
              case "SIGN_MODE_TEXTUAL":
              case 2:
                m.mode = 2;
                break;
              case "SIGN_MODE_LEGACY_AMINO_JSON":
              case 127:
                m.mode = 127;
                break;
            }
            return m;
          };
          Single.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.mode = o.enums === String ? "SIGN_MODE_UNSPECIFIED" : 0;
            }
            if (m.mode != null && m.hasOwnProperty("mode")) {
              d.mode =
                o.enums === String
                  ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode]
                  : m.mode;
            }
            return d;
          };
          Single.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Single;
        })();
        ModeInfo.Multi = (function () {
          function Multi(p) {
            this.modeInfos = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Multi.prototype.bitarray = null;
          Multi.prototype.modeInfos = $util.emptyArray;
          Multi.create = function create(properties) {
            return new Multi(properties);
          };
          Multi.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.bitarray != null && Object.hasOwnProperty.call(m, "bitarray"))
              $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(
                m.bitarray,
                w.uint32(10).fork()
              ).ldelim();
            if (m.modeInfos != null && m.modeInfos.length) {
              for (var i = 0; i < m.modeInfos.length; ++i)
                $root.cosmos.tx.v1beta1.ModeInfo.encode(
                  m.modeInfos[i],
                  w.uint32(18).fork()
                ).ldelim();
            }
            return w;
          };
          Multi.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.cosmos.tx.v1beta1.ModeInfo.Multi();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  if (!(m.modeInfos && m.modeInfos.length)) m.modeInfos = [];
                  m.modeInfos.push(
                    $root.cosmos.tx.v1beta1.ModeInfo.decode(r, r.uint32())
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Multi.fromObject = function fromObject(d) {
            if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo.Multi) return d;
            var m = new $root.cosmos.tx.v1beta1.ModeInfo.Multi();
            if (d.bitarray != null) {
              if (typeof d.bitarray !== "object")
                throw TypeError(
                  ".cosmos.tx.v1beta1.ModeInfo.Multi.bitarray: object expected"
                );
              m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(
                d.bitarray
              );
            }
            if (d.modeInfos) {
              if (!Array.isArray(d.modeInfos))
                throw TypeError(
                  ".cosmos.tx.v1beta1.ModeInfo.Multi.modeInfos: array expected"
                );
              m.modeInfos = [];
              for (var i = 0; i < d.modeInfos.length; ++i) {
                if (typeof d.modeInfos[i] !== "object")
                  throw TypeError(
                    ".cosmos.tx.v1beta1.ModeInfo.Multi.modeInfos: object expected"
                  );
                m.modeInfos[i] = $root.cosmos.tx.v1beta1.ModeInfo.fromObject(
                  d.modeInfos[i]
                );
              }
            }
            return m;
          };
          Multi.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.modeInfos = [];
            }
            if (o.defaults) {
              d.bitarray = null;
            }
            if (m.bitarray != null && m.hasOwnProperty("bitarray")) {
              d.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.toObject(
                m.bitarray,
                o
              );
            }
            if (m.modeInfos && m.modeInfos.length) {
              d.modeInfos = [];
              for (var j = 0; j < m.modeInfos.length; ++j) {
                d.modeInfos[j] = $root.cosmos.tx.v1beta1.ModeInfo.toObject(
                  m.modeInfos[j],
                  o
                );
              }
            }
            return d;
          };
          Multi.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Multi;
        })();
        return ModeInfo;
      })();
      v1beta1.Fee = (function () {
        function Fee(p) {
          this.amount = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Fee.prototype.amount = $util.emptyArray;
        Fee.prototype.gasLimit = $util.Long
          ? $util.Long.fromBits(0, 0, true)
          : 0;
        Fee.prototype.payer = "";
        Fee.prototype.granter = "";
        Fee.create = function create(properties) {
          return new Fee(properties);
        };
        Fee.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(
                m.amount[i],
                w.uint32(10).fork()
              ).ldelim();
          }
          if (m.gasLimit != null && Object.hasOwnProperty.call(m, "gasLimit"))
            w.uint32(16).uint64(m.gasLimit);
          if (m.payer != null && Object.hasOwnProperty.call(m, "payer"))
            w.uint32(26).string(m.payer);
          if (m.granter != null && Object.hasOwnProperty.call(m, "granter"))
            w.uint32(34).string(m.granter);
          return w;
        };
        Fee.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.cosmos.tx.v1beta1.Fee();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.amount && m.amount.length)) m.amount = [];
                m.amount.push(
                  $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32())
                );
                break;
              case 2:
                m.gasLimit = r.uint64();
                break;
              case 3:
                m.payer = r.string();
                break;
              case 4:
                m.granter = r.string();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Fee.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.tx.v1beta1.Fee) return d;
          var m = new $root.cosmos.tx.v1beta1.Fee();
          if (d.amount) {
            if (!Array.isArray(d.amount))
              throw TypeError(".cosmos.tx.v1beta1.Fee.amount: array expected");
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== "object")
                throw TypeError(
                  ".cosmos.tx.v1beta1.Fee.amount: object expected"
                );
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(
                d.amount[i]
              );
            }
          }
          if (d.gasLimit != null) {
            if ($util.Long)
              (m.gasLimit = $util.Long.fromValue(d.gasLimit)).unsigned = true;
            else if (typeof d.gasLimit === "string")
              m.gasLimit = parseInt(d.gasLimit, 10);
            else if (typeof d.gasLimit === "number") m.gasLimit = d.gasLimit;
            else if (typeof d.gasLimit === "object")
              m.gasLimit = new $util.LongBits(
                d.gasLimit.low >>> 0,
                d.gasLimit.high >>> 0
              ).toNumber(true);
          }
          if (d.payer != null) {
            m.payer = String(d.payer);
          }
          if (d.granter != null) {
            m.granter = String(d.granter);
          }
          return m;
        };
        Fee.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.amount = [];
          }
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.gasLimit =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.gasLimit = o.longs === String ? "0" : 0;
            d.payer = "";
            d.granter = "";
          }
          if (m.amount && m.amount.length) {
            d.amount = [];
            for (var j = 0; j < m.amount.length; ++j) {
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(
                m.amount[j],
                o
              );
            }
          }
          if (m.gasLimit != null && m.hasOwnProperty("gasLimit")) {
            if (typeof m.gasLimit === "number")
              d.gasLimit = o.longs === String ? String(m.gasLimit) : m.gasLimit;
            else
              d.gasLimit =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.gasLimit)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.gasLimit.low >>> 0,
                      m.gasLimit.high >>> 0
                    ).toNumber(true)
                  : m.gasLimit;
          }
          if (m.payer != null && m.hasOwnProperty("payer")) {
            d.payer = m.payer;
          }
          if (m.granter != null && m.hasOwnProperty("granter")) {
            d.granter = m.granter;
          }
          return d;
        };
        Fee.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Fee;
      })();
      return v1beta1;
    })();
    return tx;
  })();
  return cosmos;
})();
exports.google = $root.google = (() => {
  const google = {};
  google.protobuf = (function () {
    const protobuf = {};
    protobuf.Any = (function () {
      function Any(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Any.prototype.type_url = "";
      Any.prototype.value = $util.newBuffer([]);
      Any.create = function create(properties) {
        return new Any(properties);
      };
      Any.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.type_url != null && Object.hasOwnProperty.call(m, "type_url"))
          w.uint32(10).string(m.type_url);
        if (m.value != null && Object.hasOwnProperty.call(m, "value"))
          w.uint32(18).bytes(m.value);
        return w;
      };
      Any.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Any();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.type_url = r.string();
              break;
            case 2:
              m.value = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Any.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Any) return d;
        var m = new $root.google.protobuf.Any();
        if (d.type_url != null) {
          m.type_url = String(d.type_url);
        }
        if (d.value != null) {
          if (typeof d.value === "string")
            $util.base64.decode(
              d.value,
              (m.value = $util.newBuffer($util.base64.length(d.value))),
              0
            );
          else if (d.value.length) m.value = d.value;
        }
        return m;
      };
      Any.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.type_url = "";
          if (o.bytes === String) d.value = "";
          else {
            d.value = [];
            if (o.bytes !== Array) d.value = $util.newBuffer(d.value);
          }
        }
        if (m.type_url != null && m.hasOwnProperty("type_url")) {
          d.type_url = m.type_url;
        }
        if (m.value != null && m.hasOwnProperty("value")) {
          d.value =
            o.bytes === String
              ? $util.base64.encode(m.value, 0, m.value.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.value)
              : m.value;
        }
        return d;
      };
      Any.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Any;
    })();
    protobuf.FileDescriptorSet = (function () {
      function FileDescriptorSet(p) {
        this.file = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      FileDescriptorSet.prototype.file = $util.emptyArray;
      FileDescriptorSet.create = function create(properties) {
        return new FileDescriptorSet(properties);
      };
      FileDescriptorSet.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.file != null && m.file.length) {
          for (var i = 0; i < m.file.length; ++i)
            $root.google.protobuf.FileDescriptorProto.encode(
              m.file[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        return w;
      };
      FileDescriptorSet.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.FileDescriptorSet();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.file && m.file.length)) m.file = [];
              m.file.push(
                $root.google.protobuf.FileDescriptorProto.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      FileDescriptorSet.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.FileDescriptorSet) return d;
        var m = new $root.google.protobuf.FileDescriptorSet();
        if (d.file) {
          if (!Array.isArray(d.file))
            throw TypeError(
              ".google.protobuf.FileDescriptorSet.file: array expected"
            );
          m.file = [];
          for (var i = 0; i < d.file.length; ++i) {
            if (typeof d.file[i] !== "object")
              throw TypeError(
                ".google.protobuf.FileDescriptorSet.file: object expected"
              );
            m.file[i] = $root.google.protobuf.FileDescriptorProto.fromObject(
              d.file[i]
            );
          }
        }
        return m;
      };
      FileDescriptorSet.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.file = [];
        }
        if (m.file && m.file.length) {
          d.file = [];
          for (var j = 0; j < m.file.length; ++j) {
            d.file[j] = $root.google.protobuf.FileDescriptorProto.toObject(
              m.file[j],
              o
            );
          }
        }
        return d;
      };
      FileDescriptorSet.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return FileDescriptorSet;
    })();
    protobuf.FileDescriptorProto = (function () {
      function FileDescriptorProto(p) {
        this.dependency = [];
        this.publicDependency = [];
        this.weakDependency = [];
        this.messageType = [];
        this.enumType = [];
        this.service = [];
        this.extension = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      FileDescriptorProto.prototype.name = "";
      FileDescriptorProto.prototype["package"] = "";
      FileDescriptorProto.prototype.dependency = $util.emptyArray;
      FileDescriptorProto.prototype.publicDependency = $util.emptyArray;
      FileDescriptorProto.prototype.weakDependency = $util.emptyArray;
      FileDescriptorProto.prototype.messageType = $util.emptyArray;
      FileDescriptorProto.prototype.enumType = $util.emptyArray;
      FileDescriptorProto.prototype.service = $util.emptyArray;
      FileDescriptorProto.prototype.extension = $util.emptyArray;
      FileDescriptorProto.prototype.options = null;
      FileDescriptorProto.prototype.sourceCodeInfo = null;
      FileDescriptorProto.prototype.syntax = "";
      FileDescriptorProto.create = function create(properties) {
        return new FileDescriptorProto(properties);
      };
      FileDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m["package"] != null && Object.hasOwnProperty.call(m, "package"))
          w.uint32(18).string(m["package"]);
        if (m.dependency != null && m.dependency.length) {
          for (var i = 0; i < m.dependency.length; ++i)
            w.uint32(26).string(m.dependency[i]);
        }
        if (m.messageType != null && m.messageType.length) {
          for (var i = 0; i < m.messageType.length; ++i)
            $root.google.protobuf.DescriptorProto.encode(
              m.messageType[i],
              w.uint32(34).fork()
            ).ldelim();
        }
        if (m.enumType != null && m.enumType.length) {
          for (var i = 0; i < m.enumType.length; ++i)
            $root.google.protobuf.EnumDescriptorProto.encode(
              m.enumType[i],
              w.uint32(42).fork()
            ).ldelim();
        }
        if (m.service != null && m.service.length) {
          for (var i = 0; i < m.service.length; ++i)
            $root.google.protobuf.ServiceDescriptorProto.encode(
              m.service[i],
              w.uint32(50).fork()
            ).ldelim();
        }
        if (m.extension != null && m.extension.length) {
          for (var i = 0; i < m.extension.length; ++i)
            $root.google.protobuf.FieldDescriptorProto.encode(
              m.extension[i],
              w.uint32(58).fork()
            ).ldelim();
        }
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.FileOptions.encode(
            m.options,
            w.uint32(66).fork()
          ).ldelim();
        if (
          m.sourceCodeInfo != null &&
          Object.hasOwnProperty.call(m, "sourceCodeInfo")
        )
          $root.google.protobuf.SourceCodeInfo.encode(
            m.sourceCodeInfo,
            w.uint32(74).fork()
          ).ldelim();
        if (m.publicDependency != null && m.publicDependency.length) {
          for (var i = 0; i < m.publicDependency.length; ++i)
            w.uint32(80).int32(m.publicDependency[i]);
        }
        if (m.weakDependency != null && m.weakDependency.length) {
          for (var i = 0; i < m.weakDependency.length; ++i)
            w.uint32(88).int32(m.weakDependency[i]);
        }
        if (m.syntax != null && Object.hasOwnProperty.call(m, "syntax"))
          w.uint32(98).string(m.syntax);
        return w;
      };
      FileDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.FileDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              m["package"] = r.string();
              break;
            case 3:
              if (!(m.dependency && m.dependency.length)) m.dependency = [];
              m.dependency.push(r.string());
              break;
            case 10:
              if (!(m.publicDependency && m.publicDependency.length))
                m.publicDependency = [];
              if ((t & 7) === 2) {
                var c2 = r.uint32() + r.pos;
                while (r.pos < c2) m.publicDependency.push(r.int32());
              } else m.publicDependency.push(r.int32());
              break;
            case 11:
              if (!(m.weakDependency && m.weakDependency.length))
                m.weakDependency = [];
              if ((t & 7) === 2) {
                var c2 = r.uint32() + r.pos;
                while (r.pos < c2) m.weakDependency.push(r.int32());
              } else m.weakDependency.push(r.int32());
              break;
            case 4:
              if (!(m.messageType && m.messageType.length)) m.messageType = [];
              m.messageType.push(
                $root.google.protobuf.DescriptorProto.decode(r, r.uint32())
              );
              break;
            case 5:
              if (!(m.enumType && m.enumType.length)) m.enumType = [];
              m.enumType.push(
                $root.google.protobuf.EnumDescriptorProto.decode(r, r.uint32())
              );
              break;
            case 6:
              if (!(m.service && m.service.length)) m.service = [];
              m.service.push(
                $root.google.protobuf.ServiceDescriptorProto.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            case 7:
              if (!(m.extension && m.extension.length)) m.extension = [];
              m.extension.push(
                $root.google.protobuf.FieldDescriptorProto.decode(r, r.uint32())
              );
              break;
            case 8:
              m.options = $root.google.protobuf.FileOptions.decode(
                r,
                r.uint32()
              );
              break;
            case 9:
              m.sourceCodeInfo = $root.google.protobuf.SourceCodeInfo.decode(
                r,
                r.uint32()
              );
              break;
            case 12:
              m.syntax = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      FileDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.FileDescriptorProto) return d;
        var m = new $root.google.protobuf.FileDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d["package"] != null) {
          m["package"] = String(d["package"]);
        }
        if (d.dependency) {
          if (!Array.isArray(d.dependency))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.dependency: array expected"
            );
          m.dependency = [];
          for (var i = 0; i < d.dependency.length; ++i) {
            m.dependency[i] = String(d.dependency[i]);
          }
        }
        if (d.publicDependency) {
          if (!Array.isArray(d.publicDependency))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.publicDependency: array expected"
            );
          m.publicDependency = [];
          for (var i = 0; i < d.publicDependency.length; ++i) {
            m.publicDependency[i] = d.publicDependency[i] | 0;
          }
        }
        if (d.weakDependency) {
          if (!Array.isArray(d.weakDependency))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.weakDependency: array expected"
            );
          m.weakDependency = [];
          for (var i = 0; i < d.weakDependency.length; ++i) {
            m.weakDependency[i] = d.weakDependency[i] | 0;
          }
        }
        if (d.messageType) {
          if (!Array.isArray(d.messageType))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.messageType: array expected"
            );
          m.messageType = [];
          for (var i = 0; i < d.messageType.length; ++i) {
            if (typeof d.messageType[i] !== "object")
              throw TypeError(
                ".google.protobuf.FileDescriptorProto.messageType: object expected"
              );
            m.messageType[i] = $root.google.protobuf.DescriptorProto.fromObject(
              d.messageType[i]
            );
          }
        }
        if (d.enumType) {
          if (!Array.isArray(d.enumType))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.enumType: array expected"
            );
          m.enumType = [];
          for (var i = 0; i < d.enumType.length; ++i) {
            if (typeof d.enumType[i] !== "object")
              throw TypeError(
                ".google.protobuf.FileDescriptorProto.enumType: object expected"
              );
            m.enumType[
              i
            ] = $root.google.protobuf.EnumDescriptorProto.fromObject(
              d.enumType[i]
            );
          }
        }
        if (d.service) {
          if (!Array.isArray(d.service))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.service: array expected"
            );
          m.service = [];
          for (var i = 0; i < d.service.length; ++i) {
            if (typeof d.service[i] !== "object")
              throw TypeError(
                ".google.protobuf.FileDescriptorProto.service: object expected"
              );
            m.service[
              i
            ] = $root.google.protobuf.ServiceDescriptorProto.fromObject(
              d.service[i]
            );
          }
        }
        if (d.extension) {
          if (!Array.isArray(d.extension))
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.extension: array expected"
            );
          m.extension = [];
          for (var i = 0; i < d.extension.length; ++i) {
            if (typeof d.extension[i] !== "object")
              throw TypeError(
                ".google.protobuf.FileDescriptorProto.extension: object expected"
              );
            m.extension[
              i
            ] = $root.google.protobuf.FieldDescriptorProto.fromObject(
              d.extension[i]
            );
          }
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.FileOptions.fromObject(d.options);
        }
        if (d.sourceCodeInfo != null) {
          if (typeof d.sourceCodeInfo !== "object")
            throw TypeError(
              ".google.protobuf.FileDescriptorProto.sourceCodeInfo: object expected"
            );
          m.sourceCodeInfo = $root.google.protobuf.SourceCodeInfo.fromObject(
            d.sourceCodeInfo
          );
        }
        if (d.syntax != null) {
          m.syntax = String(d.syntax);
        }
        return m;
      };
      FileDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.dependency = [];
          d.messageType = [];
          d.enumType = [];
          d.service = [];
          d.extension = [];
          d.publicDependency = [];
          d.weakDependency = [];
        }
        if (o.defaults) {
          d.name = "";
          d["package"] = "";
          d.options = null;
          d.sourceCodeInfo = null;
          d.syntax = "";
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m["package"] != null && m.hasOwnProperty("package")) {
          d["package"] = m["package"];
        }
        if (m.dependency && m.dependency.length) {
          d.dependency = [];
          for (var j = 0; j < m.dependency.length; ++j) {
            d.dependency[j] = m.dependency[j];
          }
        }
        if (m.messageType && m.messageType.length) {
          d.messageType = [];
          for (var j = 0; j < m.messageType.length; ++j) {
            d.messageType[j] = $root.google.protobuf.DescriptorProto.toObject(
              m.messageType[j],
              o
            );
          }
        }
        if (m.enumType && m.enumType.length) {
          d.enumType = [];
          for (var j = 0; j < m.enumType.length; ++j) {
            d.enumType[j] = $root.google.protobuf.EnumDescriptorProto.toObject(
              m.enumType[j],
              o
            );
          }
        }
        if (m.service && m.service.length) {
          d.service = [];
          for (var j = 0; j < m.service.length; ++j) {
            d.service[
              j
            ] = $root.google.protobuf.ServiceDescriptorProto.toObject(
              m.service[j],
              o
            );
          }
        }
        if (m.extension && m.extension.length) {
          d.extension = [];
          for (var j = 0; j < m.extension.length; ++j) {
            d.extension[
              j
            ] = $root.google.protobuf.FieldDescriptorProto.toObject(
              m.extension[j],
              o
            );
          }
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.FileOptions.toObject(m.options, o);
        }
        if (m.sourceCodeInfo != null && m.hasOwnProperty("sourceCodeInfo")) {
          d.sourceCodeInfo = $root.google.protobuf.SourceCodeInfo.toObject(
            m.sourceCodeInfo,
            o
          );
        }
        if (m.publicDependency && m.publicDependency.length) {
          d.publicDependency = [];
          for (var j = 0; j < m.publicDependency.length; ++j) {
            d.publicDependency[j] = m.publicDependency[j];
          }
        }
        if (m.weakDependency && m.weakDependency.length) {
          d.weakDependency = [];
          for (var j = 0; j < m.weakDependency.length; ++j) {
            d.weakDependency[j] = m.weakDependency[j];
          }
        }
        if (m.syntax != null && m.hasOwnProperty("syntax")) {
          d.syntax = m.syntax;
        }
        return d;
      };
      FileDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return FileDescriptorProto;
    })();
    protobuf.DescriptorProto = (function () {
      function DescriptorProto(p) {
        this.field = [];
        this.extension = [];
        this.nestedType = [];
        this.enumType = [];
        this.extensionRange = [];
        this.oneofDecl = [];
        this.reservedRange = [];
        this.reservedName = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      DescriptorProto.prototype.name = "";
      DescriptorProto.prototype.field = $util.emptyArray;
      DescriptorProto.prototype.extension = $util.emptyArray;
      DescriptorProto.prototype.nestedType = $util.emptyArray;
      DescriptorProto.prototype.enumType = $util.emptyArray;
      DescriptorProto.prototype.extensionRange = $util.emptyArray;
      DescriptorProto.prototype.oneofDecl = $util.emptyArray;
      DescriptorProto.prototype.options = null;
      DescriptorProto.prototype.reservedRange = $util.emptyArray;
      DescriptorProto.prototype.reservedName = $util.emptyArray;
      DescriptorProto.create = function create(properties) {
        return new DescriptorProto(properties);
      };
      DescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.field != null && m.field.length) {
          for (var i = 0; i < m.field.length; ++i)
            $root.google.protobuf.FieldDescriptorProto.encode(
              m.field[i],
              w.uint32(18).fork()
            ).ldelim();
        }
        if (m.nestedType != null && m.nestedType.length) {
          for (var i = 0; i < m.nestedType.length; ++i)
            $root.google.protobuf.DescriptorProto.encode(
              m.nestedType[i],
              w.uint32(26).fork()
            ).ldelim();
        }
        if (m.enumType != null && m.enumType.length) {
          for (var i = 0; i < m.enumType.length; ++i)
            $root.google.protobuf.EnumDescriptorProto.encode(
              m.enumType[i],
              w.uint32(34).fork()
            ).ldelim();
        }
        if (m.extensionRange != null && m.extensionRange.length) {
          for (var i = 0; i < m.extensionRange.length; ++i)
            $root.google.protobuf.DescriptorProto.ExtensionRange.encode(
              m.extensionRange[i],
              w.uint32(42).fork()
            ).ldelim();
        }
        if (m.extension != null && m.extension.length) {
          for (var i = 0; i < m.extension.length; ++i)
            $root.google.protobuf.FieldDescriptorProto.encode(
              m.extension[i],
              w.uint32(50).fork()
            ).ldelim();
        }
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.MessageOptions.encode(
            m.options,
            w.uint32(58).fork()
          ).ldelim();
        if (m.oneofDecl != null && m.oneofDecl.length) {
          for (var i = 0; i < m.oneofDecl.length; ++i)
            $root.google.protobuf.OneofDescriptorProto.encode(
              m.oneofDecl[i],
              w.uint32(66).fork()
            ).ldelim();
        }
        if (m.reservedRange != null && m.reservedRange.length) {
          for (var i = 0; i < m.reservedRange.length; ++i)
            $root.google.protobuf.DescriptorProto.ReservedRange.encode(
              m.reservedRange[i],
              w.uint32(74).fork()
            ).ldelim();
        }
        if (m.reservedName != null && m.reservedName.length) {
          for (var i = 0; i < m.reservedName.length; ++i)
            w.uint32(82).string(m.reservedName[i]);
        }
        return w;
      };
      DescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.DescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              if (!(m.field && m.field.length)) m.field = [];
              m.field.push(
                $root.google.protobuf.FieldDescriptorProto.decode(r, r.uint32())
              );
              break;
            case 6:
              if (!(m.extension && m.extension.length)) m.extension = [];
              m.extension.push(
                $root.google.protobuf.FieldDescriptorProto.decode(r, r.uint32())
              );
              break;
            case 3:
              if (!(m.nestedType && m.nestedType.length)) m.nestedType = [];
              m.nestedType.push(
                $root.google.protobuf.DescriptorProto.decode(r, r.uint32())
              );
              break;
            case 4:
              if (!(m.enumType && m.enumType.length)) m.enumType = [];
              m.enumType.push(
                $root.google.protobuf.EnumDescriptorProto.decode(r, r.uint32())
              );
              break;
            case 5:
              if (!(m.extensionRange && m.extensionRange.length))
                m.extensionRange = [];
              m.extensionRange.push(
                $root.google.protobuf.DescriptorProto.ExtensionRange.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            case 8:
              if (!(m.oneofDecl && m.oneofDecl.length)) m.oneofDecl = [];
              m.oneofDecl.push(
                $root.google.protobuf.OneofDescriptorProto.decode(r, r.uint32())
              );
              break;
            case 7:
              m.options = $root.google.protobuf.MessageOptions.decode(
                r,
                r.uint32()
              );
              break;
            case 9:
              if (!(m.reservedRange && m.reservedRange.length))
                m.reservedRange = [];
              m.reservedRange.push(
                $root.google.protobuf.DescriptorProto.ReservedRange.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            case 10:
              if (!(m.reservedName && m.reservedName.length))
                m.reservedName = [];
              m.reservedName.push(r.string());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      DescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.DescriptorProto) return d;
        var m = new $root.google.protobuf.DescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.field) {
          if (!Array.isArray(d.field))
            throw TypeError(
              ".google.protobuf.DescriptorProto.field: array expected"
            );
          m.field = [];
          for (var i = 0; i < d.field.length; ++i) {
            if (typeof d.field[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.field: object expected"
              );
            m.field[i] = $root.google.protobuf.FieldDescriptorProto.fromObject(
              d.field[i]
            );
          }
        }
        if (d.extension) {
          if (!Array.isArray(d.extension))
            throw TypeError(
              ".google.protobuf.DescriptorProto.extension: array expected"
            );
          m.extension = [];
          for (var i = 0; i < d.extension.length; ++i) {
            if (typeof d.extension[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.extension: object expected"
              );
            m.extension[
              i
            ] = $root.google.protobuf.FieldDescriptorProto.fromObject(
              d.extension[i]
            );
          }
        }
        if (d.nestedType) {
          if (!Array.isArray(d.nestedType))
            throw TypeError(
              ".google.protobuf.DescriptorProto.nestedType: array expected"
            );
          m.nestedType = [];
          for (var i = 0; i < d.nestedType.length; ++i) {
            if (typeof d.nestedType[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.nestedType: object expected"
              );
            m.nestedType[i] = $root.google.protobuf.DescriptorProto.fromObject(
              d.nestedType[i]
            );
          }
        }
        if (d.enumType) {
          if (!Array.isArray(d.enumType))
            throw TypeError(
              ".google.protobuf.DescriptorProto.enumType: array expected"
            );
          m.enumType = [];
          for (var i = 0; i < d.enumType.length; ++i) {
            if (typeof d.enumType[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.enumType: object expected"
              );
            m.enumType[
              i
            ] = $root.google.protobuf.EnumDescriptorProto.fromObject(
              d.enumType[i]
            );
          }
        }
        if (d.extensionRange) {
          if (!Array.isArray(d.extensionRange))
            throw TypeError(
              ".google.protobuf.DescriptorProto.extensionRange: array expected"
            );
          m.extensionRange = [];
          for (var i = 0; i < d.extensionRange.length; ++i) {
            if (typeof d.extensionRange[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.extensionRange: object expected"
              );
            m.extensionRange[
              i
            ] = $root.google.protobuf.DescriptorProto.ExtensionRange.fromObject(
              d.extensionRange[i]
            );
          }
        }
        if (d.oneofDecl) {
          if (!Array.isArray(d.oneofDecl))
            throw TypeError(
              ".google.protobuf.DescriptorProto.oneofDecl: array expected"
            );
          m.oneofDecl = [];
          for (var i = 0; i < d.oneofDecl.length; ++i) {
            if (typeof d.oneofDecl[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.oneofDecl: object expected"
              );
            m.oneofDecl[
              i
            ] = $root.google.protobuf.OneofDescriptorProto.fromObject(
              d.oneofDecl[i]
            );
          }
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.DescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.MessageOptions.fromObject(
            d.options
          );
        }
        if (d.reservedRange) {
          if (!Array.isArray(d.reservedRange))
            throw TypeError(
              ".google.protobuf.DescriptorProto.reservedRange: array expected"
            );
          m.reservedRange = [];
          for (var i = 0; i < d.reservedRange.length; ++i) {
            if (typeof d.reservedRange[i] !== "object")
              throw TypeError(
                ".google.protobuf.DescriptorProto.reservedRange: object expected"
              );
            m.reservedRange[
              i
            ] = $root.google.protobuf.DescriptorProto.ReservedRange.fromObject(
              d.reservedRange[i]
            );
          }
        }
        if (d.reservedName) {
          if (!Array.isArray(d.reservedName))
            throw TypeError(
              ".google.protobuf.DescriptorProto.reservedName: array expected"
            );
          m.reservedName = [];
          for (var i = 0; i < d.reservedName.length; ++i) {
            m.reservedName[i] = String(d.reservedName[i]);
          }
        }
        return m;
      };
      DescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.field = [];
          d.nestedType = [];
          d.enumType = [];
          d.extensionRange = [];
          d.extension = [];
          d.oneofDecl = [];
          d.reservedRange = [];
          d.reservedName = [];
        }
        if (o.defaults) {
          d.name = "";
          d.options = null;
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.field && m.field.length) {
          d.field = [];
          for (var j = 0; j < m.field.length; ++j) {
            d.field[j] = $root.google.protobuf.FieldDescriptorProto.toObject(
              m.field[j],
              o
            );
          }
        }
        if (m.nestedType && m.nestedType.length) {
          d.nestedType = [];
          for (var j = 0; j < m.nestedType.length; ++j) {
            d.nestedType[j] = $root.google.protobuf.DescriptorProto.toObject(
              m.nestedType[j],
              o
            );
          }
        }
        if (m.enumType && m.enumType.length) {
          d.enumType = [];
          for (var j = 0; j < m.enumType.length; ++j) {
            d.enumType[j] = $root.google.protobuf.EnumDescriptorProto.toObject(
              m.enumType[j],
              o
            );
          }
        }
        if (m.extensionRange && m.extensionRange.length) {
          d.extensionRange = [];
          for (var j = 0; j < m.extensionRange.length; ++j) {
            d.extensionRange[
              j
            ] = $root.google.protobuf.DescriptorProto.ExtensionRange.toObject(
              m.extensionRange[j],
              o
            );
          }
        }
        if (m.extension && m.extension.length) {
          d.extension = [];
          for (var j = 0; j < m.extension.length; ++j) {
            d.extension[
              j
            ] = $root.google.protobuf.FieldDescriptorProto.toObject(
              m.extension[j],
              o
            );
          }
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.MessageOptions.toObject(
            m.options,
            o
          );
        }
        if (m.oneofDecl && m.oneofDecl.length) {
          d.oneofDecl = [];
          for (var j = 0; j < m.oneofDecl.length; ++j) {
            d.oneofDecl[
              j
            ] = $root.google.protobuf.OneofDescriptorProto.toObject(
              m.oneofDecl[j],
              o
            );
          }
        }
        if (m.reservedRange && m.reservedRange.length) {
          d.reservedRange = [];
          for (var j = 0; j < m.reservedRange.length; ++j) {
            d.reservedRange[
              j
            ] = $root.google.protobuf.DescriptorProto.ReservedRange.toObject(
              m.reservedRange[j],
              o
            );
          }
        }
        if (m.reservedName && m.reservedName.length) {
          d.reservedName = [];
          for (var j = 0; j < m.reservedName.length; ++j) {
            d.reservedName[j] = m.reservedName[j];
          }
        }
        return d;
      };
      DescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      DescriptorProto.ExtensionRange = (function () {
        function ExtensionRange(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        ExtensionRange.prototype.start = 0;
        ExtensionRange.prototype.end = 0;
        ExtensionRange.create = function create(properties) {
          return new ExtensionRange(properties);
        };
        ExtensionRange.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.start != null && Object.hasOwnProperty.call(m, "start"))
            w.uint32(8).int32(m.start);
          if (m.end != null && Object.hasOwnProperty.call(m, "end"))
            w.uint32(16).int32(m.end);
          return w;
        };
        ExtensionRange.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.google.protobuf.DescriptorProto.ExtensionRange();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.start = r.int32();
                break;
              case 2:
                m.end = r.int32();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        ExtensionRange.fromObject = function fromObject(d) {
          if (d instanceof $root.google.protobuf.DescriptorProto.ExtensionRange)
            return d;
          var m = new $root.google.protobuf.DescriptorProto.ExtensionRange();
          if (d.start != null) {
            m.start = d.start | 0;
          }
          if (d.end != null) {
            m.end = d.end | 0;
          }
          return m;
        };
        ExtensionRange.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.start = 0;
            d.end = 0;
          }
          if (m.start != null && m.hasOwnProperty("start")) {
            d.start = m.start;
          }
          if (m.end != null && m.hasOwnProperty("end")) {
            d.end = m.end;
          }
          return d;
        };
        ExtensionRange.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return ExtensionRange;
      })();
      DescriptorProto.ReservedRange = (function () {
        function ReservedRange(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        ReservedRange.prototype.start = 0;
        ReservedRange.prototype.end = 0;
        ReservedRange.create = function create(properties) {
          return new ReservedRange(properties);
        };
        ReservedRange.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.start != null && Object.hasOwnProperty.call(m, "start"))
            w.uint32(8).int32(m.start);
          if (m.end != null && Object.hasOwnProperty.call(m, "end"))
            w.uint32(16).int32(m.end);
          return w;
        };
        ReservedRange.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.google.protobuf.DescriptorProto.ReservedRange();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.start = r.int32();
                break;
              case 2:
                m.end = r.int32();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        ReservedRange.fromObject = function fromObject(d) {
          if (d instanceof $root.google.protobuf.DescriptorProto.ReservedRange)
            return d;
          var m = new $root.google.protobuf.DescriptorProto.ReservedRange();
          if (d.start != null) {
            m.start = d.start | 0;
          }
          if (d.end != null) {
            m.end = d.end | 0;
          }
          return m;
        };
        ReservedRange.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.start = 0;
            d.end = 0;
          }
          if (m.start != null && m.hasOwnProperty("start")) {
            d.start = m.start;
          }
          if (m.end != null && m.hasOwnProperty("end")) {
            d.end = m.end;
          }
          return d;
        };
        ReservedRange.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return ReservedRange;
      })();
      return DescriptorProto;
    })();
    protobuf.FieldDescriptorProto = (function () {
      function FieldDescriptorProto(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      FieldDescriptorProto.prototype.name = "";
      FieldDescriptorProto.prototype.number = 0;
      FieldDescriptorProto.prototype.label = 1;
      FieldDescriptorProto.prototype.type = 1;
      FieldDescriptorProto.prototype.typeName = "";
      FieldDescriptorProto.prototype.extendee = "";
      FieldDescriptorProto.prototype.defaultValue = "";
      FieldDescriptorProto.prototype.oneofIndex = 0;
      FieldDescriptorProto.prototype.jsonName = "";
      FieldDescriptorProto.prototype.options = null;
      FieldDescriptorProto.create = function create(properties) {
        return new FieldDescriptorProto(properties);
      };
      FieldDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.extendee != null && Object.hasOwnProperty.call(m, "extendee"))
          w.uint32(18).string(m.extendee);
        if (m.number != null && Object.hasOwnProperty.call(m, "number"))
          w.uint32(24).int32(m.number);
        if (m.label != null && Object.hasOwnProperty.call(m, "label"))
          w.uint32(32).int32(m.label);
        if (m.type != null && Object.hasOwnProperty.call(m, "type"))
          w.uint32(40).int32(m.type);
        if (m.typeName != null && Object.hasOwnProperty.call(m, "typeName"))
          w.uint32(50).string(m.typeName);
        if (
          m.defaultValue != null &&
          Object.hasOwnProperty.call(m, "defaultValue")
        )
          w.uint32(58).string(m.defaultValue);
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.FieldOptions.encode(
            m.options,
            w.uint32(66).fork()
          ).ldelim();
        if (m.oneofIndex != null && Object.hasOwnProperty.call(m, "oneofIndex"))
          w.uint32(72).int32(m.oneofIndex);
        if (m.jsonName != null && Object.hasOwnProperty.call(m, "jsonName"))
          w.uint32(82).string(m.jsonName);
        return w;
      };
      FieldDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.FieldDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 3:
              m.number = r.int32();
              break;
            case 4:
              m.label = r.int32();
              break;
            case 5:
              m.type = r.int32();
              break;
            case 6:
              m.typeName = r.string();
              break;
            case 2:
              m.extendee = r.string();
              break;
            case 7:
              m.defaultValue = r.string();
              break;
            case 9:
              m.oneofIndex = r.int32();
              break;
            case 10:
              m.jsonName = r.string();
              break;
            case 8:
              m.options = $root.google.protobuf.FieldOptions.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      FieldDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.FieldDescriptorProto) return d;
        var m = new $root.google.protobuf.FieldDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.number != null) {
          m.number = d.number | 0;
        }
        switch (d.label) {
          case "LABEL_OPTIONAL":
          case 1:
            m.label = 1;
            break;
          case "LABEL_REQUIRED":
          case 2:
            m.label = 2;
            break;
          case "LABEL_REPEATED":
          case 3:
            m.label = 3;
            break;
        }
        switch (d.type) {
          case "TYPE_DOUBLE":
          case 1:
            m.type = 1;
            break;
          case "TYPE_FLOAT":
          case 2:
            m.type = 2;
            break;
          case "TYPE_INT64":
          case 3:
            m.type = 3;
            break;
          case "TYPE_UINT64":
          case 4:
            m.type = 4;
            break;
          case "TYPE_INT32":
          case 5:
            m.type = 5;
            break;
          case "TYPE_FIXED64":
          case 6:
            m.type = 6;
            break;
          case "TYPE_FIXED32":
          case 7:
            m.type = 7;
            break;
          case "TYPE_BOOL":
          case 8:
            m.type = 8;
            break;
          case "TYPE_STRING":
          case 9:
            m.type = 9;
            break;
          case "TYPE_GROUP":
          case 10:
            m.type = 10;
            break;
          case "TYPE_MESSAGE":
          case 11:
            m.type = 11;
            break;
          case "TYPE_BYTES":
          case 12:
            m.type = 12;
            break;
          case "TYPE_UINT32":
          case 13:
            m.type = 13;
            break;
          case "TYPE_ENUM":
          case 14:
            m.type = 14;
            break;
          case "TYPE_SFIXED32":
          case 15:
            m.type = 15;
            break;
          case "TYPE_SFIXED64":
          case 16:
            m.type = 16;
            break;
          case "TYPE_SINT32":
          case 17:
            m.type = 17;
            break;
          case "TYPE_SINT64":
          case 18:
            m.type = 18;
            break;
        }
        if (d.typeName != null) {
          m.typeName = String(d.typeName);
        }
        if (d.extendee != null) {
          m.extendee = String(d.extendee);
        }
        if (d.defaultValue != null) {
          m.defaultValue = String(d.defaultValue);
        }
        if (d.oneofIndex != null) {
          m.oneofIndex = d.oneofIndex | 0;
        }
        if (d.jsonName != null) {
          m.jsonName = String(d.jsonName);
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.FieldDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.FieldOptions.fromObject(d.options);
        }
        return m;
      };
      FieldDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.name = "";
          d.extendee = "";
          d.number = 0;
          d.label = o.enums === String ? "LABEL_OPTIONAL" : 1;
          d.type = o.enums === String ? "TYPE_DOUBLE" : 1;
          d.typeName = "";
          d.defaultValue = "";
          d.options = null;
          d.oneofIndex = 0;
          d.jsonName = "";
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.extendee != null && m.hasOwnProperty("extendee")) {
          d.extendee = m.extendee;
        }
        if (m.number != null && m.hasOwnProperty("number")) {
          d.number = m.number;
        }
        if (m.label != null && m.hasOwnProperty("label")) {
          d.label =
            o.enums === String
              ? $root.google.protobuf.FieldDescriptorProto.Label[m.label]
              : m.label;
        }
        if (m.type != null && m.hasOwnProperty("type")) {
          d.type =
            o.enums === String
              ? $root.google.protobuf.FieldDescriptorProto.Type[m.type]
              : m.type;
        }
        if (m.typeName != null && m.hasOwnProperty("typeName")) {
          d.typeName = m.typeName;
        }
        if (m.defaultValue != null && m.hasOwnProperty("defaultValue")) {
          d.defaultValue = m.defaultValue;
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.FieldOptions.toObject(m.options, o);
        }
        if (m.oneofIndex != null && m.hasOwnProperty("oneofIndex")) {
          d.oneofIndex = m.oneofIndex;
        }
        if (m.jsonName != null && m.hasOwnProperty("jsonName")) {
          d.jsonName = m.jsonName;
        }
        return d;
      };
      FieldDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      FieldDescriptorProto.Type = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[1] = "TYPE_DOUBLE")] = 1;
        values[(valuesById[2] = "TYPE_FLOAT")] = 2;
        values[(valuesById[3] = "TYPE_INT64")] = 3;
        values[(valuesById[4] = "TYPE_UINT64")] = 4;
        values[(valuesById[5] = "TYPE_INT32")] = 5;
        values[(valuesById[6] = "TYPE_FIXED64")] = 6;
        values[(valuesById[7] = "TYPE_FIXED32")] = 7;
        values[(valuesById[8] = "TYPE_BOOL")] = 8;
        values[(valuesById[9] = "TYPE_STRING")] = 9;
        values[(valuesById[10] = "TYPE_GROUP")] = 10;
        values[(valuesById[11] = "TYPE_MESSAGE")] = 11;
        values[(valuesById[12] = "TYPE_BYTES")] = 12;
        values[(valuesById[13] = "TYPE_UINT32")] = 13;
        values[(valuesById[14] = "TYPE_ENUM")] = 14;
        values[(valuesById[15] = "TYPE_SFIXED32")] = 15;
        values[(valuesById[16] = "TYPE_SFIXED64")] = 16;
        values[(valuesById[17] = "TYPE_SINT32")] = 17;
        values[(valuesById[18] = "TYPE_SINT64")] = 18;
        return values;
      })();
      FieldDescriptorProto.Label = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[1] = "LABEL_OPTIONAL")] = 1;
        values[(valuesById[2] = "LABEL_REQUIRED")] = 2;
        values[(valuesById[3] = "LABEL_REPEATED")] = 3;
        return values;
      })();
      return FieldDescriptorProto;
    })();
    protobuf.OneofDescriptorProto = (function () {
      function OneofDescriptorProto(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      OneofDescriptorProto.prototype.name = "";
      OneofDescriptorProto.prototype.options = null;
      OneofDescriptorProto.create = function create(properties) {
        return new OneofDescriptorProto(properties);
      };
      OneofDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.OneofOptions.encode(
            m.options,
            w.uint32(18).fork()
          ).ldelim();
        return w;
      };
      OneofDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.OneofDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              m.options = $root.google.protobuf.OneofOptions.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      OneofDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.OneofDescriptorProto) return d;
        var m = new $root.google.protobuf.OneofDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.OneofDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.OneofOptions.fromObject(d.options);
        }
        return m;
      };
      OneofDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.name = "";
          d.options = null;
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.OneofOptions.toObject(m.options, o);
        }
        return d;
      };
      OneofDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return OneofDescriptorProto;
    })();
    protobuf.EnumDescriptorProto = (function () {
      function EnumDescriptorProto(p) {
        this.value = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      EnumDescriptorProto.prototype.name = "";
      EnumDescriptorProto.prototype.value = $util.emptyArray;
      EnumDescriptorProto.prototype.options = null;
      EnumDescriptorProto.create = function create(properties) {
        return new EnumDescriptorProto(properties);
      };
      EnumDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.value != null && m.value.length) {
          for (var i = 0; i < m.value.length; ++i)
            $root.google.protobuf.EnumValueDescriptorProto.encode(
              m.value[i],
              w.uint32(18).fork()
            ).ldelim();
        }
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.EnumOptions.encode(
            m.options,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      EnumDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.EnumDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              if (!(m.value && m.value.length)) m.value = [];
              m.value.push(
                $root.google.protobuf.EnumValueDescriptorProto.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            case 3:
              m.options = $root.google.protobuf.EnumOptions.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      EnumDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.EnumDescriptorProto) return d;
        var m = new $root.google.protobuf.EnumDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.value) {
          if (!Array.isArray(d.value))
            throw TypeError(
              ".google.protobuf.EnumDescriptorProto.value: array expected"
            );
          m.value = [];
          for (var i = 0; i < d.value.length; ++i) {
            if (typeof d.value[i] !== "object")
              throw TypeError(
                ".google.protobuf.EnumDescriptorProto.value: object expected"
              );
            m.value[
              i
            ] = $root.google.protobuf.EnumValueDescriptorProto.fromObject(
              d.value[i]
            );
          }
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.EnumDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.EnumOptions.fromObject(d.options);
        }
        return m;
      };
      EnumDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.value = [];
        }
        if (o.defaults) {
          d.name = "";
          d.options = null;
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.value && m.value.length) {
          d.value = [];
          for (var j = 0; j < m.value.length; ++j) {
            d.value[
              j
            ] = $root.google.protobuf.EnumValueDescriptorProto.toObject(
              m.value[j],
              o
            );
          }
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.EnumOptions.toObject(m.options, o);
        }
        return d;
      };
      EnumDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return EnumDescriptorProto;
    })();
    protobuf.EnumValueDescriptorProto = (function () {
      function EnumValueDescriptorProto(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      EnumValueDescriptorProto.prototype.name = "";
      EnumValueDescriptorProto.prototype.number = 0;
      EnumValueDescriptorProto.prototype.options = null;
      EnumValueDescriptorProto.create = function create(properties) {
        return new EnumValueDescriptorProto(properties);
      };
      EnumValueDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.number != null && Object.hasOwnProperty.call(m, "number"))
          w.uint32(16).int32(m.number);
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.EnumValueOptions.encode(
            m.options,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      EnumValueDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.EnumValueDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              m.number = r.int32();
              break;
            case 3:
              m.options = $root.google.protobuf.EnumValueOptions.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      EnumValueDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.EnumValueDescriptorProto)
          return d;
        var m = new $root.google.protobuf.EnumValueDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.number != null) {
          m.number = d.number | 0;
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.EnumValueDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.EnumValueOptions.fromObject(
            d.options
          );
        }
        return m;
      };
      EnumValueDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.name = "";
          d.number = 0;
          d.options = null;
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.number != null && m.hasOwnProperty("number")) {
          d.number = m.number;
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.EnumValueOptions.toObject(
            m.options,
            o
          );
        }
        return d;
      };
      EnumValueDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return EnumValueDescriptorProto;
    })();
    protobuf.ServiceDescriptorProto = (function () {
      function ServiceDescriptorProto(p) {
        this.method = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ServiceDescriptorProto.prototype.name = "";
      ServiceDescriptorProto.prototype.method = $util.emptyArray;
      ServiceDescriptorProto.prototype.options = null;
      ServiceDescriptorProto.create = function create(properties) {
        return new ServiceDescriptorProto(properties);
      };
      ServiceDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.method != null && m.method.length) {
          for (var i = 0; i < m.method.length; ++i)
            $root.google.protobuf.MethodDescriptorProto.encode(
              m.method[i],
              w.uint32(18).fork()
            ).ldelim();
        }
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.ServiceOptions.encode(
            m.options,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      ServiceDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.ServiceDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              if (!(m.method && m.method.length)) m.method = [];
              m.method.push(
                $root.google.protobuf.MethodDescriptorProto.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            case 3:
              m.options = $root.google.protobuf.ServiceOptions.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      ServiceDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.ServiceDescriptorProto) return d;
        var m = new $root.google.protobuf.ServiceDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.method) {
          if (!Array.isArray(d.method))
            throw TypeError(
              ".google.protobuf.ServiceDescriptorProto.method: array expected"
            );
          m.method = [];
          for (var i = 0; i < d.method.length; ++i) {
            if (typeof d.method[i] !== "object")
              throw TypeError(
                ".google.protobuf.ServiceDescriptorProto.method: object expected"
              );
            m.method[
              i
            ] = $root.google.protobuf.MethodDescriptorProto.fromObject(
              d.method[i]
            );
          }
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.ServiceDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.ServiceOptions.fromObject(
            d.options
          );
        }
        return m;
      };
      ServiceDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.method = [];
        }
        if (o.defaults) {
          d.name = "";
          d.options = null;
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.method && m.method.length) {
          d.method = [];
          for (var j = 0; j < m.method.length; ++j) {
            d.method[j] = $root.google.protobuf.MethodDescriptorProto.toObject(
              m.method[j],
              o
            );
          }
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.ServiceOptions.toObject(
            m.options,
            o
          );
        }
        return d;
      };
      ServiceDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return ServiceDescriptorProto;
    })();
    protobuf.MethodDescriptorProto = (function () {
      function MethodDescriptorProto(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MethodDescriptorProto.prototype.name = "";
      MethodDescriptorProto.prototype.inputType = "";
      MethodDescriptorProto.prototype.outputType = "";
      MethodDescriptorProto.prototype.options = null;
      MethodDescriptorProto.prototype.clientStreaming = false;
      MethodDescriptorProto.prototype.serverStreaming = false;
      MethodDescriptorProto.create = function create(properties) {
        return new MethodDescriptorProto(properties);
      };
      MethodDescriptorProto.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && Object.hasOwnProperty.call(m, "name"))
          w.uint32(10).string(m.name);
        if (m.inputType != null && Object.hasOwnProperty.call(m, "inputType"))
          w.uint32(18).string(m.inputType);
        if (m.outputType != null && Object.hasOwnProperty.call(m, "outputType"))
          w.uint32(26).string(m.outputType);
        if (m.options != null && Object.hasOwnProperty.call(m, "options"))
          $root.google.protobuf.MethodOptions.encode(
            m.options,
            w.uint32(34).fork()
          ).ldelim();
        if (
          m.clientStreaming != null &&
          Object.hasOwnProperty.call(m, "clientStreaming")
        )
          w.uint32(40).bool(m.clientStreaming);
        if (
          m.serverStreaming != null &&
          Object.hasOwnProperty.call(m, "serverStreaming")
        )
          w.uint32(48).bool(m.serverStreaming);
        return w;
      };
      MethodDescriptorProto.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.MethodDescriptorProto();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.name = r.string();
              break;
            case 2:
              m.inputType = r.string();
              break;
            case 3:
              m.outputType = r.string();
              break;
            case 4:
              m.options = $root.google.protobuf.MethodOptions.decode(
                r,
                r.uint32()
              );
              break;
            case 5:
              m.clientStreaming = r.bool();
              break;
            case 6:
              m.serverStreaming = r.bool();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MethodDescriptorProto.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.MethodDescriptorProto) return d;
        var m = new $root.google.protobuf.MethodDescriptorProto();
        if (d.name != null) {
          m.name = String(d.name);
        }
        if (d.inputType != null) {
          m.inputType = String(d.inputType);
        }
        if (d.outputType != null) {
          m.outputType = String(d.outputType);
        }
        if (d.options != null) {
          if (typeof d.options !== "object")
            throw TypeError(
              ".google.protobuf.MethodDescriptorProto.options: object expected"
            );
          m.options = $root.google.protobuf.MethodOptions.fromObject(d.options);
        }
        if (d.clientStreaming != null) {
          m.clientStreaming = Boolean(d.clientStreaming);
        }
        if (d.serverStreaming != null) {
          m.serverStreaming = Boolean(d.serverStreaming);
        }
        return m;
      };
      MethodDescriptorProto.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.name = "";
          d.inputType = "";
          d.outputType = "";
          d.options = null;
          d.clientStreaming = false;
          d.serverStreaming = false;
        }
        if (m.name != null && m.hasOwnProperty("name")) {
          d.name = m.name;
        }
        if (m.inputType != null && m.hasOwnProperty("inputType")) {
          d.inputType = m.inputType;
        }
        if (m.outputType != null && m.hasOwnProperty("outputType")) {
          d.outputType = m.outputType;
        }
        if (m.options != null && m.hasOwnProperty("options")) {
          d.options = $root.google.protobuf.MethodOptions.toObject(
            m.options,
            o
          );
        }
        if (m.clientStreaming != null && m.hasOwnProperty("clientStreaming")) {
          d.clientStreaming = m.clientStreaming;
        }
        if (m.serverStreaming != null && m.hasOwnProperty("serverStreaming")) {
          d.serverStreaming = m.serverStreaming;
        }
        return d;
      };
      MethodDescriptorProto.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MethodDescriptorProto;
    })();
    protobuf.FileOptions = (function () {
      function FileOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      FileOptions.prototype.javaPackage = "";
      FileOptions.prototype.javaOuterClassname = "";
      FileOptions.prototype.javaMultipleFiles = false;
      FileOptions.prototype.javaGenerateEqualsAndHash = false;
      FileOptions.prototype.javaStringCheckUtf8 = false;
      FileOptions.prototype.optimizeFor = 1;
      FileOptions.prototype.goPackage = "";
      FileOptions.prototype.ccGenericServices = false;
      FileOptions.prototype.javaGenericServices = false;
      FileOptions.prototype.pyGenericServices = false;
      FileOptions.prototype.deprecated = false;
      FileOptions.prototype.ccEnableArenas = false;
      FileOptions.prototype.objcClassPrefix = "";
      FileOptions.prototype.csharpNamespace = "";
      FileOptions.prototype.uninterpretedOption = $util.emptyArray;
      FileOptions.create = function create(properties) {
        return new FileOptions(properties);
      };
      FileOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.javaPackage != null &&
          Object.hasOwnProperty.call(m, "javaPackage")
        )
          w.uint32(10).string(m.javaPackage);
        if (
          m.javaOuterClassname != null &&
          Object.hasOwnProperty.call(m, "javaOuterClassname")
        )
          w.uint32(66).string(m.javaOuterClassname);
        if (
          m.optimizeFor != null &&
          Object.hasOwnProperty.call(m, "optimizeFor")
        )
          w.uint32(72).int32(m.optimizeFor);
        if (
          m.javaMultipleFiles != null &&
          Object.hasOwnProperty.call(m, "javaMultipleFiles")
        )
          w.uint32(80).bool(m.javaMultipleFiles);
        if (m.goPackage != null && Object.hasOwnProperty.call(m, "goPackage"))
          w.uint32(90).string(m.goPackage);
        if (
          m.ccGenericServices != null &&
          Object.hasOwnProperty.call(m, "ccGenericServices")
        )
          w.uint32(128).bool(m.ccGenericServices);
        if (
          m.javaGenericServices != null &&
          Object.hasOwnProperty.call(m, "javaGenericServices")
        )
          w.uint32(136).bool(m.javaGenericServices);
        if (
          m.pyGenericServices != null &&
          Object.hasOwnProperty.call(m, "pyGenericServices")
        )
          w.uint32(144).bool(m.pyGenericServices);
        if (
          m.javaGenerateEqualsAndHash != null &&
          Object.hasOwnProperty.call(m, "javaGenerateEqualsAndHash")
        )
          w.uint32(160).bool(m.javaGenerateEqualsAndHash);
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(184).bool(m.deprecated);
        if (
          m.javaStringCheckUtf8 != null &&
          Object.hasOwnProperty.call(m, "javaStringCheckUtf8")
        )
          w.uint32(216).bool(m.javaStringCheckUtf8);
        if (
          m.ccEnableArenas != null &&
          Object.hasOwnProperty.call(m, "ccEnableArenas")
        )
          w.uint32(248).bool(m.ccEnableArenas);
        if (
          m.objcClassPrefix != null &&
          Object.hasOwnProperty.call(m, "objcClassPrefix")
        )
          w.uint32(290).string(m.objcClassPrefix);
        if (
          m.csharpNamespace != null &&
          Object.hasOwnProperty.call(m, "csharpNamespace")
        )
          w.uint32(298).string(m.csharpNamespace);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      FileOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.FileOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.javaPackage = r.string();
              break;
            case 8:
              m.javaOuterClassname = r.string();
              break;
            case 10:
              m.javaMultipleFiles = r.bool();
              break;
            case 20:
              m.javaGenerateEqualsAndHash = r.bool();
              break;
            case 27:
              m.javaStringCheckUtf8 = r.bool();
              break;
            case 9:
              m.optimizeFor = r.int32();
              break;
            case 11:
              m.goPackage = r.string();
              break;
            case 16:
              m.ccGenericServices = r.bool();
              break;
            case 17:
              m.javaGenericServices = r.bool();
              break;
            case 18:
              m.pyGenericServices = r.bool();
              break;
            case 23:
              m.deprecated = r.bool();
              break;
            case 31:
              m.ccEnableArenas = r.bool();
              break;
            case 36:
              m.objcClassPrefix = r.string();
              break;
            case 37:
              m.csharpNamespace = r.string();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      FileOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.FileOptions) return d;
        var m = new $root.google.protobuf.FileOptions();
        if (d.javaPackage != null) {
          m.javaPackage = String(d.javaPackage);
        }
        if (d.javaOuterClassname != null) {
          m.javaOuterClassname = String(d.javaOuterClassname);
        }
        if (d.javaMultipleFiles != null) {
          m.javaMultipleFiles = Boolean(d.javaMultipleFiles);
        }
        if (d.javaGenerateEqualsAndHash != null) {
          m.javaGenerateEqualsAndHash = Boolean(d.javaGenerateEqualsAndHash);
        }
        if (d.javaStringCheckUtf8 != null) {
          m.javaStringCheckUtf8 = Boolean(d.javaStringCheckUtf8);
        }
        switch (d.optimizeFor) {
          case "SPEED":
          case 1:
            m.optimizeFor = 1;
            break;
          case "CODE_SIZE":
          case 2:
            m.optimizeFor = 2;
            break;
          case "LITE_RUNTIME":
          case 3:
            m.optimizeFor = 3;
            break;
        }
        if (d.goPackage != null) {
          m.goPackage = String(d.goPackage);
        }
        if (d.ccGenericServices != null) {
          m.ccGenericServices = Boolean(d.ccGenericServices);
        }
        if (d.javaGenericServices != null) {
          m.javaGenericServices = Boolean(d.javaGenericServices);
        }
        if (d.pyGenericServices != null) {
          m.pyGenericServices = Boolean(d.pyGenericServices);
        }
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.ccEnableArenas != null) {
          m.ccEnableArenas = Boolean(d.ccEnableArenas);
        }
        if (d.objcClassPrefix != null) {
          m.objcClassPrefix = String(d.objcClassPrefix);
        }
        if (d.csharpNamespace != null) {
          m.csharpNamespace = String(d.csharpNamespace);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.FileOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.FileOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      FileOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.javaPackage = "";
          d.javaOuterClassname = "";
          d.optimizeFor = o.enums === String ? "SPEED" : 1;
          d.javaMultipleFiles = false;
          d.goPackage = "";
          d.ccGenericServices = false;
          d.javaGenericServices = false;
          d.pyGenericServices = false;
          d.javaGenerateEqualsAndHash = false;
          d.deprecated = false;
          d.javaStringCheckUtf8 = false;
          d.ccEnableArenas = false;
          d.objcClassPrefix = "";
          d.csharpNamespace = "";
        }
        if (m.javaPackage != null && m.hasOwnProperty("javaPackage")) {
          d.javaPackage = m.javaPackage;
        }
        if (
          m.javaOuterClassname != null &&
          m.hasOwnProperty("javaOuterClassname")
        ) {
          d.javaOuterClassname = m.javaOuterClassname;
        }
        if (m.optimizeFor != null && m.hasOwnProperty("optimizeFor")) {
          d.optimizeFor =
            o.enums === String
              ? $root.google.protobuf.FileOptions.OptimizeMode[m.optimizeFor]
              : m.optimizeFor;
        }
        if (
          m.javaMultipleFiles != null &&
          m.hasOwnProperty("javaMultipleFiles")
        ) {
          d.javaMultipleFiles = m.javaMultipleFiles;
        }
        if (m.goPackage != null && m.hasOwnProperty("goPackage")) {
          d.goPackage = m.goPackage;
        }
        if (
          m.ccGenericServices != null &&
          m.hasOwnProperty("ccGenericServices")
        ) {
          d.ccGenericServices = m.ccGenericServices;
        }
        if (
          m.javaGenericServices != null &&
          m.hasOwnProperty("javaGenericServices")
        ) {
          d.javaGenericServices = m.javaGenericServices;
        }
        if (
          m.pyGenericServices != null &&
          m.hasOwnProperty("pyGenericServices")
        ) {
          d.pyGenericServices = m.pyGenericServices;
        }
        if (
          m.javaGenerateEqualsAndHash != null &&
          m.hasOwnProperty("javaGenerateEqualsAndHash")
        ) {
          d.javaGenerateEqualsAndHash = m.javaGenerateEqualsAndHash;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (
          m.javaStringCheckUtf8 != null &&
          m.hasOwnProperty("javaStringCheckUtf8")
        ) {
          d.javaStringCheckUtf8 = m.javaStringCheckUtf8;
        }
        if (m.ccEnableArenas != null && m.hasOwnProperty("ccEnableArenas")) {
          d.ccEnableArenas = m.ccEnableArenas;
        }
        if (m.objcClassPrefix != null && m.hasOwnProperty("objcClassPrefix")) {
          d.objcClassPrefix = m.objcClassPrefix;
        }
        if (m.csharpNamespace != null && m.hasOwnProperty("csharpNamespace")) {
          d.csharpNamespace = m.csharpNamespace;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      FileOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      FileOptions.OptimizeMode = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[1] = "SPEED")] = 1;
        values[(valuesById[2] = "CODE_SIZE")] = 2;
        values[(valuesById[3] = "LITE_RUNTIME")] = 3;
        return values;
      })();
      return FileOptions;
    })();
    protobuf.MessageOptions = (function () {
      function MessageOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MessageOptions.prototype.messageSetWireFormat = false;
      MessageOptions.prototype.noStandardDescriptorAccessor = false;
      MessageOptions.prototype.deprecated = false;
      MessageOptions.prototype.mapEntry = false;
      MessageOptions.prototype.uninterpretedOption = $util.emptyArray;
      MessageOptions.create = function create(properties) {
        return new MessageOptions(properties);
      };
      MessageOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.messageSetWireFormat != null &&
          Object.hasOwnProperty.call(m, "messageSetWireFormat")
        )
          w.uint32(8).bool(m.messageSetWireFormat);
        if (
          m.noStandardDescriptorAccessor != null &&
          Object.hasOwnProperty.call(m, "noStandardDescriptorAccessor")
        )
          w.uint32(16).bool(m.noStandardDescriptorAccessor);
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(24).bool(m.deprecated);
        if (m.mapEntry != null && Object.hasOwnProperty.call(m, "mapEntry"))
          w.uint32(56).bool(m.mapEntry);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      MessageOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.MessageOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.messageSetWireFormat = r.bool();
              break;
            case 2:
              m.noStandardDescriptorAccessor = r.bool();
              break;
            case 3:
              m.deprecated = r.bool();
              break;
            case 7:
              m.mapEntry = r.bool();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MessageOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.MessageOptions) return d;
        var m = new $root.google.protobuf.MessageOptions();
        if (d.messageSetWireFormat != null) {
          m.messageSetWireFormat = Boolean(d.messageSetWireFormat);
        }
        if (d.noStandardDescriptorAccessor != null) {
          m.noStandardDescriptorAccessor = Boolean(
            d.noStandardDescriptorAccessor
          );
        }
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.mapEntry != null) {
          m.mapEntry = Boolean(d.mapEntry);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.MessageOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.MessageOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      MessageOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.messageSetWireFormat = false;
          d.noStandardDescriptorAccessor = false;
          d.deprecated = false;
          d.mapEntry = false;
        }
        if (
          m.messageSetWireFormat != null &&
          m.hasOwnProperty("messageSetWireFormat")
        ) {
          d.messageSetWireFormat = m.messageSetWireFormat;
        }
        if (
          m.noStandardDescriptorAccessor != null &&
          m.hasOwnProperty("noStandardDescriptorAccessor")
        ) {
          d.noStandardDescriptorAccessor = m.noStandardDescriptorAccessor;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (m.mapEntry != null && m.hasOwnProperty("mapEntry")) {
          d.mapEntry = m.mapEntry;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      MessageOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MessageOptions;
    })();
    protobuf.FieldOptions = (function () {
      function FieldOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      FieldOptions.prototype.ctype = 0;
      FieldOptions.prototype.packed = false;
      FieldOptions.prototype.jstype = 0;
      FieldOptions.prototype.lazy = false;
      FieldOptions.prototype.deprecated = false;
      FieldOptions.prototype.weak = false;
      FieldOptions.prototype.uninterpretedOption = $util.emptyArray;
      FieldOptions.create = function create(properties) {
        return new FieldOptions(properties);
      };
      FieldOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ctype != null && Object.hasOwnProperty.call(m, "ctype"))
          w.uint32(8).int32(m.ctype);
        if (m.packed != null && Object.hasOwnProperty.call(m, "packed"))
          w.uint32(16).bool(m.packed);
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(24).bool(m.deprecated);
        if (m.lazy != null && Object.hasOwnProperty.call(m, "lazy"))
          w.uint32(40).bool(m.lazy);
        if (m.jstype != null && Object.hasOwnProperty.call(m, "jstype"))
          w.uint32(48).int32(m.jstype);
        if (m.weak != null && Object.hasOwnProperty.call(m, "weak"))
          w.uint32(80).bool(m.weak);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      FieldOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.FieldOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.ctype = r.int32();
              break;
            case 2:
              m.packed = r.bool();
              break;
            case 6:
              m.jstype = r.int32();
              break;
            case 5:
              m.lazy = r.bool();
              break;
            case 3:
              m.deprecated = r.bool();
              break;
            case 10:
              m.weak = r.bool();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      FieldOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.FieldOptions) return d;
        var m = new $root.google.protobuf.FieldOptions();
        switch (d.ctype) {
          case "STRING":
          case 0:
            m.ctype = 0;
            break;
          case "CORD":
          case 1:
            m.ctype = 1;
            break;
          case "STRING_PIECE":
          case 2:
            m.ctype = 2;
            break;
        }
        if (d.packed != null) {
          m.packed = Boolean(d.packed);
        }
        switch (d.jstype) {
          case "JS_NORMAL":
          case 0:
            m.jstype = 0;
            break;
          case "JS_STRING":
          case 1:
            m.jstype = 1;
            break;
          case "JS_NUMBER":
          case 2:
            m.jstype = 2;
            break;
        }
        if (d.lazy != null) {
          m.lazy = Boolean(d.lazy);
        }
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.weak != null) {
          m.weak = Boolean(d.weak);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.FieldOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.FieldOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      FieldOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.ctype = o.enums === String ? "STRING" : 0;
          d.packed = false;
          d.deprecated = false;
          d.lazy = false;
          d.jstype = o.enums === String ? "JS_NORMAL" : 0;
          d.weak = false;
        }
        if (m.ctype != null && m.hasOwnProperty("ctype")) {
          d.ctype =
            o.enums === String
              ? $root.google.protobuf.FieldOptions.CType[m.ctype]
              : m.ctype;
        }
        if (m.packed != null && m.hasOwnProperty("packed")) {
          d.packed = m.packed;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (m.lazy != null && m.hasOwnProperty("lazy")) {
          d.lazy = m.lazy;
        }
        if (m.jstype != null && m.hasOwnProperty("jstype")) {
          d.jstype =
            o.enums === String
              ? $root.google.protobuf.FieldOptions.JSType[m.jstype]
              : m.jstype;
        }
        if (m.weak != null && m.hasOwnProperty("weak")) {
          d.weak = m.weak;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      FieldOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      FieldOptions.CType = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = "STRING")] = 0;
        values[(valuesById[1] = "CORD")] = 1;
        values[(valuesById[2] = "STRING_PIECE")] = 2;
        return values;
      })();
      FieldOptions.JSType = (function () {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = "JS_NORMAL")] = 0;
        values[(valuesById[1] = "JS_STRING")] = 1;
        values[(valuesById[2] = "JS_NUMBER")] = 2;
        return values;
      })();
      return FieldOptions;
    })();
    protobuf.OneofOptions = (function () {
      function OneofOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      OneofOptions.prototype.uninterpretedOption = $util.emptyArray;
      OneofOptions.create = function create(properties) {
        return new OneofOptions(properties);
      };
      OneofOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      OneofOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.OneofOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      OneofOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.OneofOptions) return d;
        var m = new $root.google.protobuf.OneofOptions();
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.OneofOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.OneofOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      OneofOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      OneofOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return OneofOptions;
    })();
    protobuf.EnumOptions = (function () {
      function EnumOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      EnumOptions.prototype.allowAlias = false;
      EnumOptions.prototype.deprecated = false;
      EnumOptions.prototype.uninterpretedOption = $util.emptyArray;
      EnumOptions.create = function create(properties) {
        return new EnumOptions(properties);
      };
      EnumOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.allowAlias != null && Object.hasOwnProperty.call(m, "allowAlias"))
          w.uint32(16).bool(m.allowAlias);
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(24).bool(m.deprecated);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      EnumOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.EnumOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 2:
              m.allowAlias = r.bool();
              break;
            case 3:
              m.deprecated = r.bool();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      EnumOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.EnumOptions) return d;
        var m = new $root.google.protobuf.EnumOptions();
        if (d.allowAlias != null) {
          m.allowAlias = Boolean(d.allowAlias);
        }
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.EnumOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.EnumOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      EnumOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.allowAlias = false;
          d.deprecated = false;
        }
        if (m.allowAlias != null && m.hasOwnProperty("allowAlias")) {
          d.allowAlias = m.allowAlias;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      EnumOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return EnumOptions;
    })();
    protobuf.EnumValueOptions = (function () {
      function EnumValueOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      EnumValueOptions.prototype.deprecated = false;
      EnumValueOptions.prototype.uninterpretedOption = $util.emptyArray;
      EnumValueOptions.create = function create(properties) {
        return new EnumValueOptions(properties);
      };
      EnumValueOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(8).bool(m.deprecated);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      EnumValueOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.EnumValueOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.deprecated = r.bool();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      EnumValueOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.EnumValueOptions) return d;
        var m = new $root.google.protobuf.EnumValueOptions();
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.EnumValueOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.EnumValueOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      EnumValueOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.deprecated = false;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      EnumValueOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return EnumValueOptions;
    })();
    protobuf.ServiceOptions = (function () {
      function ServiceOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ServiceOptions.prototype.deprecated = false;
      ServiceOptions.prototype.uninterpretedOption = $util.emptyArray;
      ServiceOptions.create = function create(properties) {
        return new ServiceOptions(properties);
      };
      ServiceOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(264).bool(m.deprecated);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        return w;
      };
      ServiceOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.ServiceOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 33:
              m.deprecated = r.bool();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      ServiceOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.ServiceOptions) return d;
        var m = new $root.google.protobuf.ServiceOptions();
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.ServiceOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.ServiceOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        return m;
      };
      ServiceOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.deprecated = false;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        return d;
      };
      ServiceOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return ServiceOptions;
    })();
    protobuf.MethodOptions = (function () {
      function MethodOptions(p) {
        this.uninterpretedOption = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      MethodOptions.prototype.deprecated = false;
      MethodOptions.prototype.uninterpretedOption = $util.emptyArray;
      MethodOptions.prototype[".google.api.http"] = null;
      MethodOptions.create = function create(properties) {
        return new MethodOptions(properties);
      };
      MethodOptions.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.deprecated != null && Object.hasOwnProperty.call(m, "deprecated"))
          w.uint32(264).bool(m.deprecated);
        if (m.uninterpretedOption != null && m.uninterpretedOption.length) {
          for (var i = 0; i < m.uninterpretedOption.length; ++i)
            $root.google.protobuf.UninterpretedOption.encode(
              m.uninterpretedOption[i],
              w.uint32(7994).fork()
            ).ldelim();
        }
        if (
          m[".google.api.http"] != null &&
          Object.hasOwnProperty.call(m, ".google.api.http")
        )
          $root.google.api.HttpRule.encode(
            m[".google.api.http"],
            w.uint32(578365826).fork()
          ).ldelim();
        return w;
      };
      MethodOptions.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.MethodOptions();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 33:
              m.deprecated = r.bool();
              break;
            case 999:
              if (!(m.uninterpretedOption && m.uninterpretedOption.length))
                m.uninterpretedOption = [];
              m.uninterpretedOption.push(
                $root.google.protobuf.UninterpretedOption.decode(r, r.uint32())
              );
              break;
            case 72295728:
              m[".google.api.http"] = $root.google.api.HttpRule.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      MethodOptions.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.MethodOptions) return d;
        var m = new $root.google.protobuf.MethodOptions();
        if (d.deprecated != null) {
          m.deprecated = Boolean(d.deprecated);
        }
        if (d.uninterpretedOption) {
          if (!Array.isArray(d.uninterpretedOption))
            throw TypeError(
              ".google.protobuf.MethodOptions.uninterpretedOption: array expected"
            );
          m.uninterpretedOption = [];
          for (var i = 0; i < d.uninterpretedOption.length; ++i) {
            if (typeof d.uninterpretedOption[i] !== "object")
              throw TypeError(
                ".google.protobuf.MethodOptions.uninterpretedOption: object expected"
              );
            m.uninterpretedOption[
              i
            ] = $root.google.protobuf.UninterpretedOption.fromObject(
              d.uninterpretedOption[i]
            );
          }
        }
        if (d[".google.api.http"] != null) {
          if (typeof d[".google.api.http"] !== "object")
            throw TypeError(
              ".google.protobuf.MethodOptions..google.api.http: object expected"
            );
          m[".google.api.http"] = $root.google.api.HttpRule.fromObject(
            d[".google.api.http"]
          );
        }
        return m;
      };
      MethodOptions.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.uninterpretedOption = [];
        }
        if (o.defaults) {
          d.deprecated = false;
          d[".google.api.http"] = null;
        }
        if (m.deprecated != null && m.hasOwnProperty("deprecated")) {
          d.deprecated = m.deprecated;
        }
        if (m.uninterpretedOption && m.uninterpretedOption.length) {
          d.uninterpretedOption = [];
          for (var j = 0; j < m.uninterpretedOption.length; ++j) {
            d.uninterpretedOption[
              j
            ] = $root.google.protobuf.UninterpretedOption.toObject(
              m.uninterpretedOption[j],
              o
            );
          }
        }
        if (
          m[".google.api.http"] != null &&
          m.hasOwnProperty(".google.api.http")
        ) {
          d[".google.api.http"] = $root.google.api.HttpRule.toObject(
            m[".google.api.http"],
            o
          );
        }
        return d;
      };
      MethodOptions.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return MethodOptions;
    })();
    protobuf.UninterpretedOption = (function () {
      function UninterpretedOption(p) {
        this.name = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      UninterpretedOption.prototype.name = $util.emptyArray;
      UninterpretedOption.prototype.identifierValue = "";
      UninterpretedOption.prototype.positiveIntValue = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      UninterpretedOption.prototype.negativeIntValue = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      UninterpretedOption.prototype.doubleValue = 0;
      UninterpretedOption.prototype.stringValue = $util.newBuffer([]);
      UninterpretedOption.prototype.aggregateValue = "";
      UninterpretedOption.create = function create(properties) {
        return new UninterpretedOption(properties);
      };
      UninterpretedOption.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.name != null && m.name.length) {
          for (var i = 0; i < m.name.length; ++i)
            $root.google.protobuf.UninterpretedOption.NamePart.encode(
              m.name[i],
              w.uint32(18).fork()
            ).ldelim();
        }
        if (
          m.identifierValue != null &&
          Object.hasOwnProperty.call(m, "identifierValue")
        )
          w.uint32(26).string(m.identifierValue);
        if (
          m.positiveIntValue != null &&
          Object.hasOwnProperty.call(m, "positiveIntValue")
        )
          w.uint32(32).uint64(m.positiveIntValue);
        if (
          m.negativeIntValue != null &&
          Object.hasOwnProperty.call(m, "negativeIntValue")
        )
          w.uint32(40).int64(m.negativeIntValue);
        if (
          m.doubleValue != null &&
          Object.hasOwnProperty.call(m, "doubleValue")
        )
          w.uint32(49).double(m.doubleValue);
        if (
          m.stringValue != null &&
          Object.hasOwnProperty.call(m, "stringValue")
        )
          w.uint32(58).bytes(m.stringValue);
        if (
          m.aggregateValue != null &&
          Object.hasOwnProperty.call(m, "aggregateValue")
        )
          w.uint32(66).string(m.aggregateValue);
        return w;
      };
      UninterpretedOption.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.UninterpretedOption();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 2:
              if (!(m.name && m.name.length)) m.name = [];
              m.name.push(
                $root.google.protobuf.UninterpretedOption.NamePart.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            case 3:
              m.identifierValue = r.string();
              break;
            case 4:
              m.positiveIntValue = r.uint64();
              break;
            case 5:
              m.negativeIntValue = r.int64();
              break;
            case 6:
              m.doubleValue = r.double();
              break;
            case 7:
              m.stringValue = r.bytes();
              break;
            case 8:
              m.aggregateValue = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      UninterpretedOption.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.UninterpretedOption) return d;
        var m = new $root.google.protobuf.UninterpretedOption();
        if (d.name) {
          if (!Array.isArray(d.name))
            throw TypeError(
              ".google.protobuf.UninterpretedOption.name: array expected"
            );
          m.name = [];
          for (var i = 0; i < d.name.length; ++i) {
            if (typeof d.name[i] !== "object")
              throw TypeError(
                ".google.protobuf.UninterpretedOption.name: object expected"
              );
            m.name[
              i
            ] = $root.google.protobuf.UninterpretedOption.NamePart.fromObject(
              d.name[i]
            );
          }
        }
        if (d.identifierValue != null) {
          m.identifierValue = String(d.identifierValue);
        }
        if (d.positiveIntValue != null) {
          if ($util.Long)
            (m.positiveIntValue = $util.Long.fromValue(
              d.positiveIntValue
            )).unsigned = true;
          else if (typeof d.positiveIntValue === "string")
            m.positiveIntValue = parseInt(d.positiveIntValue, 10);
          else if (typeof d.positiveIntValue === "number")
            m.positiveIntValue = d.positiveIntValue;
          else if (typeof d.positiveIntValue === "object")
            m.positiveIntValue = new $util.LongBits(
              d.positiveIntValue.low >>> 0,
              d.positiveIntValue.high >>> 0
            ).toNumber(true);
        }
        if (d.negativeIntValue != null) {
          if ($util.Long)
            (m.negativeIntValue = $util.Long.fromValue(
              d.negativeIntValue
            )).unsigned = false;
          else if (typeof d.negativeIntValue === "string")
            m.negativeIntValue = parseInt(d.negativeIntValue, 10);
          else if (typeof d.negativeIntValue === "number")
            m.negativeIntValue = d.negativeIntValue;
          else if (typeof d.negativeIntValue === "object")
            m.negativeIntValue = new $util.LongBits(
              d.negativeIntValue.low >>> 0,
              d.negativeIntValue.high >>> 0
            ).toNumber();
        }
        if (d.doubleValue != null) {
          m.doubleValue = Number(d.doubleValue);
        }
        if (d.stringValue != null) {
          if (typeof d.stringValue === "string")
            $util.base64.decode(
              d.stringValue,
              (m.stringValue = $util.newBuffer(
                $util.base64.length(d.stringValue)
              )),
              0
            );
          else if (d.stringValue.length) m.stringValue = d.stringValue;
        }
        if (d.aggregateValue != null) {
          m.aggregateValue = String(d.aggregateValue);
        }
        return m;
      };
      UninterpretedOption.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.name = [];
        }
        if (o.defaults) {
          d.identifierValue = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.positiveIntValue =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.positiveIntValue = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.negativeIntValue =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.negativeIntValue = o.longs === String ? "0" : 0;
          d.doubleValue = 0;
          if (o.bytes === String) d.stringValue = "";
          else {
            d.stringValue = [];
            if (o.bytes !== Array)
              d.stringValue = $util.newBuffer(d.stringValue);
          }
          d.aggregateValue = "";
        }
        if (m.name && m.name.length) {
          d.name = [];
          for (var j = 0; j < m.name.length; ++j) {
            d.name[
              j
            ] = $root.google.protobuf.UninterpretedOption.NamePart.toObject(
              m.name[j],
              o
            );
          }
        }
        if (m.identifierValue != null && m.hasOwnProperty("identifierValue")) {
          d.identifierValue = m.identifierValue;
        }
        if (
          m.positiveIntValue != null &&
          m.hasOwnProperty("positiveIntValue")
        ) {
          if (typeof m.positiveIntValue === "number")
            d.positiveIntValue =
              o.longs === String
                ? String(m.positiveIntValue)
                : m.positiveIntValue;
          else
            d.positiveIntValue =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.positiveIntValue)
                : o.longs === Number
                ? new $util.LongBits(
                    m.positiveIntValue.low >>> 0,
                    m.positiveIntValue.high >>> 0
                  ).toNumber(true)
                : m.positiveIntValue;
        }
        if (
          m.negativeIntValue != null &&
          m.hasOwnProperty("negativeIntValue")
        ) {
          if (typeof m.negativeIntValue === "number")
            d.negativeIntValue =
              o.longs === String
                ? String(m.negativeIntValue)
                : m.negativeIntValue;
          else
            d.negativeIntValue =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.negativeIntValue)
                : o.longs === Number
                ? new $util.LongBits(
                    m.negativeIntValue.low >>> 0,
                    m.negativeIntValue.high >>> 0
                  ).toNumber()
                : m.negativeIntValue;
        }
        if (m.doubleValue != null && m.hasOwnProperty("doubleValue")) {
          d.doubleValue =
            o.json && !isFinite(m.doubleValue)
              ? String(m.doubleValue)
              : m.doubleValue;
        }
        if (m.stringValue != null && m.hasOwnProperty("stringValue")) {
          d.stringValue =
            o.bytes === String
              ? $util.base64.encode(m.stringValue, 0, m.stringValue.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.stringValue)
              : m.stringValue;
        }
        if (m.aggregateValue != null && m.hasOwnProperty("aggregateValue")) {
          d.aggregateValue = m.aggregateValue;
        }
        return d;
      };
      UninterpretedOption.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      UninterpretedOption.NamePart = (function () {
        function NamePart(p) {
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        NamePart.prototype.namePart = "";
        NamePart.prototype.isExtension = false;
        NamePart.create = function create(properties) {
          return new NamePart(properties);
        };
        NamePart.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          w.uint32(10).string(m.namePart);
          w.uint32(16).bool(m.isExtension);
          return w;
        };
        NamePart.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.google.protobuf.UninterpretedOption.NamePart();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.namePart = r.string();
                break;
              case 2:
                m.isExtension = r.bool();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          if (!m.hasOwnProperty("namePart"))
            throw $util.ProtocolError("missing required 'namePart'", {
              instance: m,
            });
          if (!m.hasOwnProperty("isExtension"))
            throw $util.ProtocolError("missing required 'isExtension'", {
              instance: m,
            });
          return m;
        };
        NamePart.fromObject = function fromObject(d) {
          if (d instanceof $root.google.protobuf.UninterpretedOption.NamePart)
            return d;
          var m = new $root.google.protobuf.UninterpretedOption.NamePart();
          if (d.namePart != null) {
            m.namePart = String(d.namePart);
          }
          if (d.isExtension != null) {
            m.isExtension = Boolean(d.isExtension);
          }
          return m;
        };
        NamePart.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.defaults) {
            d.namePart = "";
            d.isExtension = false;
          }
          if (m.namePart != null && m.hasOwnProperty("namePart")) {
            d.namePart = m.namePart;
          }
          if (m.isExtension != null && m.hasOwnProperty("isExtension")) {
            d.isExtension = m.isExtension;
          }
          return d;
        };
        NamePart.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return NamePart;
      })();
      return UninterpretedOption;
    })();
    protobuf.SourceCodeInfo = (function () {
      function SourceCodeInfo(p) {
        this.location = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      SourceCodeInfo.prototype.location = $util.emptyArray;
      SourceCodeInfo.create = function create(properties) {
        return new SourceCodeInfo(properties);
      };
      SourceCodeInfo.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.location != null && m.location.length) {
          for (var i = 0; i < m.location.length; ++i)
            $root.google.protobuf.SourceCodeInfo.Location.encode(
              m.location[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        return w;
      };
      SourceCodeInfo.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.SourceCodeInfo();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.location && m.location.length)) m.location = [];
              m.location.push(
                $root.google.protobuf.SourceCodeInfo.Location.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      SourceCodeInfo.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.SourceCodeInfo) return d;
        var m = new $root.google.protobuf.SourceCodeInfo();
        if (d.location) {
          if (!Array.isArray(d.location))
            throw TypeError(
              ".google.protobuf.SourceCodeInfo.location: array expected"
            );
          m.location = [];
          for (var i = 0; i < d.location.length; ++i) {
            if (typeof d.location[i] !== "object")
              throw TypeError(
                ".google.protobuf.SourceCodeInfo.location: object expected"
              );
            m.location[
              i
            ] = $root.google.protobuf.SourceCodeInfo.Location.fromObject(
              d.location[i]
            );
          }
        }
        return m;
      };
      SourceCodeInfo.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.location = [];
        }
        if (m.location && m.location.length) {
          d.location = [];
          for (var j = 0; j < m.location.length; ++j) {
            d.location[
              j
            ] = $root.google.protobuf.SourceCodeInfo.Location.toObject(
              m.location[j],
              o
            );
          }
        }
        return d;
      };
      SourceCodeInfo.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      SourceCodeInfo.Location = (function () {
        function Location(p) {
          this.path = [];
          this.span = [];
          this.leadingDetachedComments = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Location.prototype.path = $util.emptyArray;
        Location.prototype.span = $util.emptyArray;
        Location.prototype.leadingComments = "";
        Location.prototype.trailingComments = "";
        Location.prototype.leadingDetachedComments = $util.emptyArray;
        Location.create = function create(properties) {
          return new Location(properties);
        };
        Location.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.path != null && m.path.length) {
            w.uint32(10).fork();
            for (var i = 0; i < m.path.length; ++i) w.int32(m.path[i]);
            w.ldelim();
          }
          if (m.span != null && m.span.length) {
            w.uint32(18).fork();
            for (var i = 0; i < m.span.length; ++i) w.int32(m.span[i]);
            w.ldelim();
          }
          if (
            m.leadingComments != null &&
            Object.hasOwnProperty.call(m, "leadingComments")
          )
            w.uint32(26).string(m.leadingComments);
          if (
            m.trailingComments != null &&
            Object.hasOwnProperty.call(m, "trailingComments")
          )
            w.uint32(34).string(m.trailingComments);
          if (
            m.leadingDetachedComments != null &&
            m.leadingDetachedComments.length
          ) {
            for (var i = 0; i < m.leadingDetachedComments.length; ++i)
              w.uint32(50).string(m.leadingDetachedComments[i]);
          }
          return w;
        };
        Location.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.google.protobuf.SourceCodeInfo.Location();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.path && m.path.length)) m.path = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.path.push(r.int32());
                } else m.path.push(r.int32());
                break;
              case 2:
                if (!(m.span && m.span.length)) m.span = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.span.push(r.int32());
                } else m.span.push(r.int32());
                break;
              case 3:
                m.leadingComments = r.string();
                break;
              case 4:
                m.trailingComments = r.string();
                break;
              case 6:
                if (
                  !(
                    m.leadingDetachedComments &&
                    m.leadingDetachedComments.length
                  )
                )
                  m.leadingDetachedComments = [];
                m.leadingDetachedComments.push(r.string());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Location.fromObject = function fromObject(d) {
          if (d instanceof $root.google.protobuf.SourceCodeInfo.Location)
            return d;
          var m = new $root.google.protobuf.SourceCodeInfo.Location();
          if (d.path) {
            if (!Array.isArray(d.path))
              throw TypeError(
                ".google.protobuf.SourceCodeInfo.Location.path: array expected"
              );
            m.path = [];
            for (var i = 0; i < d.path.length; ++i) {
              m.path[i] = d.path[i] | 0;
            }
          }
          if (d.span) {
            if (!Array.isArray(d.span))
              throw TypeError(
                ".google.protobuf.SourceCodeInfo.Location.span: array expected"
              );
            m.span = [];
            for (var i = 0; i < d.span.length; ++i) {
              m.span[i] = d.span[i] | 0;
            }
          }
          if (d.leadingComments != null) {
            m.leadingComments = String(d.leadingComments);
          }
          if (d.trailingComments != null) {
            m.trailingComments = String(d.trailingComments);
          }
          if (d.leadingDetachedComments) {
            if (!Array.isArray(d.leadingDetachedComments))
              throw TypeError(
                ".google.protobuf.SourceCodeInfo.Location.leadingDetachedComments: array expected"
              );
            m.leadingDetachedComments = [];
            for (var i = 0; i < d.leadingDetachedComments.length; ++i) {
              m.leadingDetachedComments[i] = String(
                d.leadingDetachedComments[i]
              );
            }
          }
          return m;
        };
        Location.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.path = [];
            d.span = [];
            d.leadingDetachedComments = [];
          }
          if (o.defaults) {
            d.leadingComments = "";
            d.trailingComments = "";
          }
          if (m.path && m.path.length) {
            d.path = [];
            for (var j = 0; j < m.path.length; ++j) {
              d.path[j] = m.path[j];
            }
          }
          if (m.span && m.span.length) {
            d.span = [];
            for (var j = 0; j < m.span.length; ++j) {
              d.span[j] = m.span[j];
            }
          }
          if (
            m.leadingComments != null &&
            m.hasOwnProperty("leadingComments")
          ) {
            d.leadingComments = m.leadingComments;
          }
          if (
            m.trailingComments != null &&
            m.hasOwnProperty("trailingComments")
          ) {
            d.trailingComments = m.trailingComments;
          }
          if (m.leadingDetachedComments && m.leadingDetachedComments.length) {
            d.leadingDetachedComments = [];
            for (var j = 0; j < m.leadingDetachedComments.length; ++j) {
              d.leadingDetachedComments[j] = m.leadingDetachedComments[j];
            }
          }
          return d;
        };
        Location.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Location;
      })();
      return SourceCodeInfo;
    })();
    protobuf.GeneratedCodeInfo = (function () {
      function GeneratedCodeInfo(p) {
        this.annotation = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      GeneratedCodeInfo.prototype.annotation = $util.emptyArray;
      GeneratedCodeInfo.create = function create(properties) {
        return new GeneratedCodeInfo(properties);
      };
      GeneratedCodeInfo.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.annotation != null && m.annotation.length) {
          for (var i = 0; i < m.annotation.length; ++i)
            $root.google.protobuf.GeneratedCodeInfo.Annotation.encode(
              m.annotation[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        return w;
      };
      GeneratedCodeInfo.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.GeneratedCodeInfo();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.annotation && m.annotation.length)) m.annotation = [];
              m.annotation.push(
                $root.google.protobuf.GeneratedCodeInfo.Annotation.decode(
                  r,
                  r.uint32()
                )
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      GeneratedCodeInfo.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.GeneratedCodeInfo) return d;
        var m = new $root.google.protobuf.GeneratedCodeInfo();
        if (d.annotation) {
          if (!Array.isArray(d.annotation))
            throw TypeError(
              ".google.protobuf.GeneratedCodeInfo.annotation: array expected"
            );
          m.annotation = [];
          for (var i = 0; i < d.annotation.length; ++i) {
            if (typeof d.annotation[i] !== "object")
              throw TypeError(
                ".google.protobuf.GeneratedCodeInfo.annotation: object expected"
              );
            m.annotation[
              i
            ] = $root.google.protobuf.GeneratedCodeInfo.Annotation.fromObject(
              d.annotation[i]
            );
          }
        }
        return m;
      };
      GeneratedCodeInfo.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.annotation = [];
        }
        if (m.annotation && m.annotation.length) {
          d.annotation = [];
          for (var j = 0; j < m.annotation.length; ++j) {
            d.annotation[
              j
            ] = $root.google.protobuf.GeneratedCodeInfo.Annotation.toObject(
              m.annotation[j],
              o
            );
          }
        }
        return d;
      };
      GeneratedCodeInfo.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      GeneratedCodeInfo.Annotation = (function () {
        function Annotation(p) {
          this.path = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        Annotation.prototype.path = $util.emptyArray;
        Annotation.prototype.sourceFile = "";
        Annotation.prototype.begin = 0;
        Annotation.prototype.end = 0;
        Annotation.create = function create(properties) {
          return new Annotation(properties);
        };
        Annotation.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.path != null && m.path.length) {
            w.uint32(10).fork();
            for (var i = 0; i < m.path.length; ++i) w.int32(m.path[i]);
            w.ldelim();
          }
          if (
            m.sourceFile != null &&
            Object.hasOwnProperty.call(m, "sourceFile")
          )
            w.uint32(18).string(m.sourceFile);
          if (m.begin != null && Object.hasOwnProperty.call(m, "begin"))
            w.uint32(24).int32(m.begin);
          if (m.end != null && Object.hasOwnProperty.call(m, "end"))
            w.uint32(32).int32(m.end);
          return w;
        };
        Annotation.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.google.protobuf.GeneratedCodeInfo.Annotation();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                if (!(m.path && m.path.length)) m.path = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.path.push(r.int32());
                } else m.path.push(r.int32());
                break;
              case 2:
                m.sourceFile = r.string();
                break;
              case 3:
                m.begin = r.int32();
                break;
              case 4:
                m.end = r.int32();
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        Annotation.fromObject = function fromObject(d) {
          if (d instanceof $root.google.protobuf.GeneratedCodeInfo.Annotation)
            return d;
          var m = new $root.google.protobuf.GeneratedCodeInfo.Annotation();
          if (d.path) {
            if (!Array.isArray(d.path))
              throw TypeError(
                ".google.protobuf.GeneratedCodeInfo.Annotation.path: array expected"
              );
            m.path = [];
            for (var i = 0; i < d.path.length; ++i) {
              m.path[i] = d.path[i] | 0;
            }
          }
          if (d.sourceFile != null) {
            m.sourceFile = String(d.sourceFile);
          }
          if (d.begin != null) {
            m.begin = d.begin | 0;
          }
          if (d.end != null) {
            m.end = d.end | 0;
          }
          return m;
        };
        Annotation.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.path = [];
          }
          if (o.defaults) {
            d.sourceFile = "";
            d.begin = 0;
            d.end = 0;
          }
          if (m.path && m.path.length) {
            d.path = [];
            for (var j = 0; j < m.path.length; ++j) {
              d.path[j] = m.path[j];
            }
          }
          if (m.sourceFile != null && m.hasOwnProperty("sourceFile")) {
            d.sourceFile = m.sourceFile;
          }
          if (m.begin != null && m.hasOwnProperty("begin")) {
            d.begin = m.begin;
          }
          if (m.end != null && m.hasOwnProperty("end")) {
            d.end = m.end;
          }
          return d;
        };
        Annotation.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return Annotation;
      })();
      return GeneratedCodeInfo;
    })();
    protobuf.Duration = (function () {
      function Duration(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Duration.prototype.seconds = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Duration.prototype.nanos = 0;
      Duration.create = function create(properties) {
        return new Duration(properties);
      };
      Duration.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
          w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos"))
          w.uint32(16).int32(m.nanos);
        return w;
      };
      Duration.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Duration();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.seconds = r.int64();
              break;
            case 2:
              m.nanos = r.int32();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Duration.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Duration) return d;
        var m = new $root.google.protobuf.Duration();
        if (d.seconds != null) {
          if ($util.Long)
            (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === "string")
            m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === "number") m.seconds = d.seconds;
          else if (typeof d.seconds === "object")
            m.seconds = new $util.LongBits(
              d.seconds.low >>> 0,
              d.seconds.high >>> 0
            ).toNumber();
        }
        if (d.nanos != null) {
          m.nanos = d.nanos | 0;
        }
        return m;
      };
      Duration.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.seconds =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.seconds = o.longs === String ? "0" : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty("seconds")) {
          if (typeof m.seconds === "number")
            d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(
                    m.seconds.low >>> 0,
                    m.seconds.high >>> 0
                  ).toNumber()
                : m.seconds;
        }
        if (m.nanos != null && m.hasOwnProperty("nanos")) {
          d.nanos = m.nanos;
        }
        return d;
      };
      Duration.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Duration;
    })();
    protobuf.Timestamp = (function () {
      function Timestamp(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Timestamp.prototype.seconds = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Timestamp.prototype.nanos = 0;
      Timestamp.create = function create(properties) {
        return new Timestamp(properties);
      };
      Timestamp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
          w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos"))
          w.uint32(16).int32(m.nanos);
        return w;
      };
      Timestamp.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.protobuf.Timestamp();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.seconds = r.int64();
              break;
            case 2:
              m.nanos = r.int32();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Timestamp.fromObject = function fromObject(d) {
        if (d instanceof $root.google.protobuf.Timestamp) return d;
        var m = new $root.google.protobuf.Timestamp();
        if (d.seconds != null) {
          if ($util.Long)
            (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === "string")
            m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === "number") m.seconds = d.seconds;
          else if (typeof d.seconds === "object")
            m.seconds = new $util.LongBits(
              d.seconds.low >>> 0,
              d.seconds.high >>> 0
            ).toNumber();
        }
        if (d.nanos != null) {
          m.nanos = d.nanos | 0;
        }
        return m;
      };
      Timestamp.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.seconds =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.seconds = o.longs === String ? "0" : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty("seconds")) {
          if (typeof m.seconds === "number")
            d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(
                    m.seconds.low >>> 0,
                    m.seconds.high >>> 0
                  ).toNumber()
                : m.seconds;
        }
        if (m.nanos != null && m.hasOwnProperty("nanos")) {
          d.nanos = m.nanos;
        }
        return d;
      };
      Timestamp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Timestamp;
    })();
    return protobuf;
  })();
  google.api = (function () {
    const api = {};
    api.Http = (function () {
      function Http(p) {
        this.rules = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Http.prototype.rules = $util.emptyArray;
      Http.create = function create(properties) {
        return new Http(properties);
      };
      Http.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.rules != null && m.rules.length) {
          for (var i = 0; i < m.rules.length; ++i)
            $root.google.api.HttpRule.encode(
              m.rules[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        return w;
      };
      Http.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.api.Http();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.rules && m.rules.length)) m.rules = [];
              m.rules.push($root.google.api.HttpRule.decode(r, r.uint32()));
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Http.fromObject = function fromObject(d) {
        if (d instanceof $root.google.api.Http) return d;
        var m = new $root.google.api.Http();
        if (d.rules) {
          if (!Array.isArray(d.rules))
            throw TypeError(".google.api.Http.rules: array expected");
          m.rules = [];
          for (var i = 0; i < d.rules.length; ++i) {
            if (typeof d.rules[i] !== "object")
              throw TypeError(".google.api.Http.rules: object expected");
            m.rules[i] = $root.google.api.HttpRule.fromObject(d.rules[i]);
          }
        }
        return m;
      };
      Http.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.rules = [];
        }
        if (m.rules && m.rules.length) {
          d.rules = [];
          for (var j = 0; j < m.rules.length; ++j) {
            d.rules[j] = $root.google.api.HttpRule.toObject(m.rules[j], o);
          }
        }
        return d;
      };
      Http.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Http;
    })();
    api.HttpRule = (function () {
      function HttpRule(p) {
        this.additionalBindings = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      HttpRule.prototype.get = "";
      HttpRule.prototype.put = "";
      HttpRule.prototype.post = "";
      HttpRule.prototype["delete"] = "";
      HttpRule.prototype.patch = "";
      HttpRule.prototype.custom = null;
      HttpRule.prototype.selector = "";
      HttpRule.prototype.body = "";
      HttpRule.prototype.additionalBindings = $util.emptyArray;
      let $oneOfFields;
      Object.defineProperty(HttpRule.prototype, "pattern", {
        get: $util.oneOfGetter(
          ($oneOfFields = ["get", "put", "post", "delete", "patch", "custom"])
        ),
        set: $util.oneOfSetter($oneOfFields),
      });
      HttpRule.create = function create(properties) {
        return new HttpRule(properties);
      };
      HttpRule.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.selector != null && Object.hasOwnProperty.call(m, "selector"))
          w.uint32(10).string(m.selector);
        if (m.get != null && Object.hasOwnProperty.call(m, "get"))
          w.uint32(18).string(m.get);
        if (m.put != null && Object.hasOwnProperty.call(m, "put"))
          w.uint32(26).string(m.put);
        if (m.post != null && Object.hasOwnProperty.call(m, "post"))
          w.uint32(34).string(m.post);
        if (m["delete"] != null && Object.hasOwnProperty.call(m, "delete"))
          w.uint32(42).string(m["delete"]);
        if (m.patch != null && Object.hasOwnProperty.call(m, "patch"))
          w.uint32(50).string(m.patch);
        if (m.body != null && Object.hasOwnProperty.call(m, "body"))
          w.uint32(58).string(m.body);
        if (m.custom != null && Object.hasOwnProperty.call(m, "custom"))
          $root.google.api.CustomHttpPattern.encode(
            m.custom,
            w.uint32(66).fork()
          ).ldelim();
        if (m.additionalBindings != null && m.additionalBindings.length) {
          for (var i = 0; i < m.additionalBindings.length; ++i)
            $root.google.api.HttpRule.encode(
              m.additionalBindings[i],
              w.uint32(90).fork()
            ).ldelim();
        }
        return w;
      };
      HttpRule.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.api.HttpRule();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 2:
              m.get = r.string();
              break;
            case 3:
              m.put = r.string();
              break;
            case 4:
              m.post = r.string();
              break;
            case 5:
              m["delete"] = r.string();
              break;
            case 6:
              m.patch = r.string();
              break;
            case 8:
              m.custom = $root.google.api.CustomHttpPattern.decode(
                r,
                r.uint32()
              );
              break;
            case 1:
              m.selector = r.string();
              break;
            case 7:
              m.body = r.string();
              break;
            case 11:
              if (!(m.additionalBindings && m.additionalBindings.length))
                m.additionalBindings = [];
              m.additionalBindings.push(
                $root.google.api.HttpRule.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      HttpRule.fromObject = function fromObject(d) {
        if (d instanceof $root.google.api.HttpRule) return d;
        var m = new $root.google.api.HttpRule();
        if (d.get != null) {
          m.get = String(d.get);
        }
        if (d.put != null) {
          m.put = String(d.put);
        }
        if (d.post != null) {
          m.post = String(d.post);
        }
        if (d["delete"] != null) {
          m["delete"] = String(d["delete"]);
        }
        if (d.patch != null) {
          m.patch = String(d.patch);
        }
        if (d.custom != null) {
          if (typeof d.custom !== "object")
            throw TypeError(".google.api.HttpRule.custom: object expected");
          m.custom = $root.google.api.CustomHttpPattern.fromObject(d.custom);
        }
        if (d.selector != null) {
          m.selector = String(d.selector);
        }
        if (d.body != null) {
          m.body = String(d.body);
        }
        if (d.additionalBindings) {
          if (!Array.isArray(d.additionalBindings))
            throw TypeError(
              ".google.api.HttpRule.additionalBindings: array expected"
            );
          m.additionalBindings = [];
          for (var i = 0; i < d.additionalBindings.length; ++i) {
            if (typeof d.additionalBindings[i] !== "object")
              throw TypeError(
                ".google.api.HttpRule.additionalBindings: object expected"
              );
            m.additionalBindings[i] = $root.google.api.HttpRule.fromObject(
              d.additionalBindings[i]
            );
          }
        }
        return m;
      };
      HttpRule.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.additionalBindings = [];
        }
        if (o.defaults) {
          d.selector = "";
          d.body = "";
        }
        if (m.selector != null && m.hasOwnProperty("selector")) {
          d.selector = m.selector;
        }
        if (m.get != null && m.hasOwnProperty("get")) {
          d.get = m.get;
          if (o.oneofs) d.pattern = "get";
        }
        if (m.put != null && m.hasOwnProperty("put")) {
          d.put = m.put;
          if (o.oneofs) d.pattern = "put";
        }
        if (m.post != null && m.hasOwnProperty("post")) {
          d.post = m.post;
          if (o.oneofs) d.pattern = "post";
        }
        if (m["delete"] != null && m.hasOwnProperty("delete")) {
          d["delete"] = m["delete"];
          if (o.oneofs) d.pattern = "delete";
        }
        if (m.patch != null && m.hasOwnProperty("patch")) {
          d.patch = m.patch;
          if (o.oneofs) d.pattern = "patch";
        }
        if (m.body != null && m.hasOwnProperty("body")) {
          d.body = m.body;
        }
        if (m.custom != null && m.hasOwnProperty("custom")) {
          d.custom = $root.google.api.CustomHttpPattern.toObject(m.custom, o);
          if (o.oneofs) d.pattern = "custom";
        }
        if (m.additionalBindings && m.additionalBindings.length) {
          d.additionalBindings = [];
          for (var j = 0; j < m.additionalBindings.length; ++j) {
            d.additionalBindings[j] = $root.google.api.HttpRule.toObject(
              m.additionalBindings[j],
              o
            );
          }
        }
        return d;
      };
      HttpRule.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return HttpRule;
    })();
    api.CustomHttpPattern = (function () {
      function CustomHttpPattern(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      CustomHttpPattern.prototype.kind = "";
      CustomHttpPattern.prototype.path = "";
      CustomHttpPattern.create = function create(properties) {
        return new CustomHttpPattern(properties);
      };
      CustomHttpPattern.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.kind != null && Object.hasOwnProperty.call(m, "kind"))
          w.uint32(10).string(m.kind);
        if (m.path != null && Object.hasOwnProperty.call(m, "path"))
          w.uint32(18).string(m.path);
        return w;
      };
      CustomHttpPattern.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.google.api.CustomHttpPattern();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.kind = r.string();
              break;
            case 2:
              m.path = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      CustomHttpPattern.fromObject = function fromObject(d) {
        if (d instanceof $root.google.api.CustomHttpPattern) return d;
        var m = new $root.google.api.CustomHttpPattern();
        if (d.kind != null) {
          m.kind = String(d.kind);
        }
        if (d.path != null) {
          m.path = String(d.path);
        }
        return m;
      };
      CustomHttpPattern.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.kind = "";
          d.path = "";
        }
        if (m.kind != null && m.hasOwnProperty("kind")) {
          d.kind = m.kind;
        }
        if (m.path != null && m.hasOwnProperty("path")) {
          d.path = m.path;
        }
        return d;
      };
      CustomHttpPattern.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return CustomHttpPattern;
    })();
    return api;
  })();
  return google;
})();
exports.ibc = $root.ibc = (() => {
  const ibc = {};
  ibc.core = (function () {
    const core = {};
    core.channel = (function () {
      const channel = {};
      channel.v1 = (function () {
        const v1 = {};
        v1.Channel = (function () {
          function Channel(p) {
            this.connectionHops = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Channel.prototype.state = 0;
          Channel.prototype.ordering = 0;
          Channel.prototype.counterparty = null;
          Channel.prototype.connectionHops = $util.emptyArray;
          Channel.prototype.version = "";
          Channel.create = function create(properties) {
            return new Channel(properties);
          };
          Channel.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.state != null && Object.hasOwnProperty.call(m, "state"))
              w.uint32(8).int32(m.state);
            if (m.ordering != null && Object.hasOwnProperty.call(m, "ordering"))
              w.uint32(16).int32(m.ordering);
            if (
              m.counterparty != null &&
              Object.hasOwnProperty.call(m, "counterparty")
            )
              $root.ibc.core.channel.v1.Counterparty.encode(
                m.counterparty,
                w.uint32(26).fork()
              ).ldelim();
            if (m.connectionHops != null && m.connectionHops.length) {
              for (var i = 0; i < m.connectionHops.length; ++i)
                w.uint32(34).string(m.connectionHops[i]);
            }
            if (m.version != null && Object.hasOwnProperty.call(m, "version"))
              w.uint32(42).string(m.version);
            return w;
          };
          Channel.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.Channel();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.state = r.int32();
                  break;
                case 2:
                  m.ordering = r.int32();
                  break;
                case 3:
                  m.counterparty = $root.ibc.core.channel.v1.Counterparty.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 4:
                  if (!(m.connectionHops && m.connectionHops.length))
                    m.connectionHops = [];
                  m.connectionHops.push(r.string());
                  break;
                case 5:
                  m.version = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Channel.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.Channel) return d;
            var m = new $root.ibc.core.channel.v1.Channel();
            switch (d.state) {
              case "STATE_UNINITIALIZED_UNSPECIFIED":
              case 0:
                m.state = 0;
                break;
              case "STATE_INIT":
              case 1:
                m.state = 1;
                break;
              case "STATE_TRYOPEN":
              case 2:
                m.state = 2;
                break;
              case "STATE_OPEN":
              case 3:
                m.state = 3;
                break;
              case "STATE_CLOSED":
              case 4:
                m.state = 4;
                break;
            }
            switch (d.ordering) {
              case "ORDER_NONE_UNSPECIFIED":
              case 0:
                m.ordering = 0;
                break;
              case "ORDER_UNORDERED":
              case 1:
                m.ordering = 1;
                break;
              case "ORDER_ORDERED":
              case 2:
                m.ordering = 2;
                break;
            }
            if (d.counterparty != null) {
              if (typeof d.counterparty !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.Channel.counterparty: object expected"
                );
              m.counterparty = $root.ibc.core.channel.v1.Counterparty.fromObject(
                d.counterparty
              );
            }
            if (d.connectionHops) {
              if (!Array.isArray(d.connectionHops))
                throw TypeError(
                  ".ibc.core.channel.v1.Channel.connectionHops: array expected"
                );
              m.connectionHops = [];
              for (var i = 0; i < d.connectionHops.length; ++i) {
                m.connectionHops[i] = String(d.connectionHops[i]);
              }
            }
            if (d.version != null) {
              m.version = String(d.version);
            }
            return m;
          };
          Channel.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.connectionHops = [];
            }
            if (o.defaults) {
              d.state =
                o.enums === String ? "STATE_UNINITIALIZED_UNSPECIFIED" : 0;
              d.ordering = o.enums === String ? "ORDER_NONE_UNSPECIFIED" : 0;
              d.counterparty = null;
              d.version = "";
            }
            if (m.state != null && m.hasOwnProperty("state")) {
              d.state =
                o.enums === String
                  ? $root.ibc.core.channel.v1.State[m.state]
                  : m.state;
            }
            if (m.ordering != null && m.hasOwnProperty("ordering")) {
              d.ordering =
                o.enums === String
                  ? $root.ibc.core.channel.v1.Order[m.ordering]
                  : m.ordering;
            }
            if (m.counterparty != null && m.hasOwnProperty("counterparty")) {
              d.counterparty = $root.ibc.core.channel.v1.Counterparty.toObject(
                m.counterparty,
                o
              );
            }
            if (m.connectionHops && m.connectionHops.length) {
              d.connectionHops = [];
              for (var j = 0; j < m.connectionHops.length; ++j) {
                d.connectionHops[j] = m.connectionHops[j];
              }
            }
            if (m.version != null && m.hasOwnProperty("version")) {
              d.version = m.version;
            }
            return d;
          };
          Channel.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Channel;
        })();
        v1.IdentifiedChannel = (function () {
          function IdentifiedChannel(p) {
            this.connectionHops = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          IdentifiedChannel.prototype.state = 0;
          IdentifiedChannel.prototype.ordering = 0;
          IdentifiedChannel.prototype.counterparty = null;
          IdentifiedChannel.prototype.connectionHops = $util.emptyArray;
          IdentifiedChannel.prototype.version = "";
          IdentifiedChannel.prototype.portId = "";
          IdentifiedChannel.prototype.channelId = "";
          IdentifiedChannel.create = function create(properties) {
            return new IdentifiedChannel(properties);
          };
          IdentifiedChannel.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.state != null && Object.hasOwnProperty.call(m, "state"))
              w.uint32(8).int32(m.state);
            if (m.ordering != null && Object.hasOwnProperty.call(m, "ordering"))
              w.uint32(16).int32(m.ordering);
            if (
              m.counterparty != null &&
              Object.hasOwnProperty.call(m, "counterparty")
            )
              $root.ibc.core.channel.v1.Counterparty.encode(
                m.counterparty,
                w.uint32(26).fork()
              ).ldelim();
            if (m.connectionHops != null && m.connectionHops.length) {
              for (var i = 0; i < m.connectionHops.length; ++i)
                w.uint32(34).string(m.connectionHops[i]);
            }
            if (m.version != null && Object.hasOwnProperty.call(m, "version"))
              w.uint32(42).string(m.version);
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(50).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(58).string(m.channelId);
            return w;
          };
          IdentifiedChannel.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.IdentifiedChannel();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.state = r.int32();
                  break;
                case 2:
                  m.ordering = r.int32();
                  break;
                case 3:
                  m.counterparty = $root.ibc.core.channel.v1.Counterparty.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 4:
                  if (!(m.connectionHops && m.connectionHops.length))
                    m.connectionHops = [];
                  m.connectionHops.push(r.string());
                  break;
                case 5:
                  m.version = r.string();
                  break;
                case 6:
                  m.portId = r.string();
                  break;
                case 7:
                  m.channelId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          IdentifiedChannel.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.IdentifiedChannel)
              return d;
            var m = new $root.ibc.core.channel.v1.IdentifiedChannel();
            switch (d.state) {
              case "STATE_UNINITIALIZED_UNSPECIFIED":
              case 0:
                m.state = 0;
                break;
              case "STATE_INIT":
              case 1:
                m.state = 1;
                break;
              case "STATE_TRYOPEN":
              case 2:
                m.state = 2;
                break;
              case "STATE_OPEN":
              case 3:
                m.state = 3;
                break;
              case "STATE_CLOSED":
              case 4:
                m.state = 4;
                break;
            }
            switch (d.ordering) {
              case "ORDER_NONE_UNSPECIFIED":
              case 0:
                m.ordering = 0;
                break;
              case "ORDER_UNORDERED":
              case 1:
                m.ordering = 1;
                break;
              case "ORDER_ORDERED":
              case 2:
                m.ordering = 2;
                break;
            }
            if (d.counterparty != null) {
              if (typeof d.counterparty !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.IdentifiedChannel.counterparty: object expected"
                );
              m.counterparty = $root.ibc.core.channel.v1.Counterparty.fromObject(
                d.counterparty
              );
            }
            if (d.connectionHops) {
              if (!Array.isArray(d.connectionHops))
                throw TypeError(
                  ".ibc.core.channel.v1.IdentifiedChannel.connectionHops: array expected"
                );
              m.connectionHops = [];
              for (var i = 0; i < d.connectionHops.length; ++i) {
                m.connectionHops[i] = String(d.connectionHops[i]);
              }
            }
            if (d.version != null) {
              m.version = String(d.version);
            }
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            return m;
          };
          IdentifiedChannel.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.connectionHops = [];
            }
            if (o.defaults) {
              d.state =
                o.enums === String ? "STATE_UNINITIALIZED_UNSPECIFIED" : 0;
              d.ordering = o.enums === String ? "ORDER_NONE_UNSPECIFIED" : 0;
              d.counterparty = null;
              d.version = "";
              d.portId = "";
              d.channelId = "";
            }
            if (m.state != null && m.hasOwnProperty("state")) {
              d.state =
                o.enums === String
                  ? $root.ibc.core.channel.v1.State[m.state]
                  : m.state;
            }
            if (m.ordering != null && m.hasOwnProperty("ordering")) {
              d.ordering =
                o.enums === String
                  ? $root.ibc.core.channel.v1.Order[m.ordering]
                  : m.ordering;
            }
            if (m.counterparty != null && m.hasOwnProperty("counterparty")) {
              d.counterparty = $root.ibc.core.channel.v1.Counterparty.toObject(
                m.counterparty,
                o
              );
            }
            if (m.connectionHops && m.connectionHops.length) {
              d.connectionHops = [];
              for (var j = 0; j < m.connectionHops.length; ++j) {
                d.connectionHops[j] = m.connectionHops[j];
              }
            }
            if (m.version != null && m.hasOwnProperty("version")) {
              d.version = m.version;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            return d;
          };
          IdentifiedChannel.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return IdentifiedChannel;
        })();
        v1.State = (function () {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "STATE_UNINITIALIZED_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "STATE_INIT")] = 1;
          values[(valuesById[2] = "STATE_TRYOPEN")] = 2;
          values[(valuesById[3] = "STATE_OPEN")] = 3;
          values[(valuesById[4] = "STATE_CLOSED")] = 4;
          return values;
        })();
        v1.Order = (function () {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "ORDER_NONE_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "ORDER_UNORDERED")] = 1;
          values[(valuesById[2] = "ORDER_ORDERED")] = 2;
          return values;
        })();
        v1.Counterparty = (function () {
          function Counterparty(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Counterparty.prototype.portId = "";
          Counterparty.prototype.channelId = "";
          Counterparty.create = function create(properties) {
            return new Counterparty(properties);
          };
          Counterparty.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            return w;
          };
          Counterparty.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.Counterparty();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Counterparty.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.Counterparty) return d;
            var m = new $root.ibc.core.channel.v1.Counterparty();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            return m;
          };
          Counterparty.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            return d;
          };
          Counterparty.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Counterparty;
        })();
        v1.Packet = (function () {
          function Packet(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Packet.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          Packet.prototype.sourcePort = "";
          Packet.prototype.sourceChannel = "";
          Packet.prototype.destinationPort = "";
          Packet.prototype.destinationChannel = "";
          Packet.prototype.data = $util.newBuffer([]);
          Packet.prototype.timeoutHeight = null;
          Packet.prototype.timeoutTimestamp = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          Packet.create = function create(properties) {
            return new Packet(properties);
          };
          Packet.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
              w.uint32(8).uint64(m.sequence);
            if (
              m.sourcePort != null &&
              Object.hasOwnProperty.call(m, "sourcePort")
            )
              w.uint32(18).string(m.sourcePort);
            if (
              m.sourceChannel != null &&
              Object.hasOwnProperty.call(m, "sourceChannel")
            )
              w.uint32(26).string(m.sourceChannel);
            if (
              m.destinationPort != null &&
              Object.hasOwnProperty.call(m, "destinationPort")
            )
              w.uint32(34).string(m.destinationPort);
            if (
              m.destinationChannel != null &&
              Object.hasOwnProperty.call(m, "destinationChannel")
            )
              w.uint32(42).string(m.destinationChannel);
            if (m.data != null && Object.hasOwnProperty.call(m, "data"))
              w.uint32(50).bytes(m.data);
            if (
              m.timeoutHeight != null &&
              Object.hasOwnProperty.call(m, "timeoutHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.timeoutHeight,
                w.uint32(58).fork()
              ).ldelim();
            if (
              m.timeoutTimestamp != null &&
              Object.hasOwnProperty.call(m, "timeoutTimestamp")
            )
              w.uint32(64).uint64(m.timeoutTimestamp);
            return w;
          };
          Packet.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.Packet();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.sequence = r.uint64();
                  break;
                case 2:
                  m.sourcePort = r.string();
                  break;
                case 3:
                  m.sourceChannel = r.string();
                  break;
                case 4:
                  m.destinationPort = r.string();
                  break;
                case 5:
                  m.destinationChannel = r.string();
                  break;
                case 6:
                  m.data = r.bytes();
                  break;
                case 7:
                  m.timeoutHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 8:
                  m.timeoutTimestamp = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Packet.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.Packet) return d;
            var m = new $root.ibc.core.channel.v1.Packet();
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            if (d.sourcePort != null) {
              m.sourcePort = String(d.sourcePort);
            }
            if (d.sourceChannel != null) {
              m.sourceChannel = String(d.sourceChannel);
            }
            if (d.destinationPort != null) {
              m.destinationPort = String(d.destinationPort);
            }
            if (d.destinationChannel != null) {
              m.destinationChannel = String(d.destinationChannel);
            }
            if (d.data != null) {
              if (typeof d.data === "string")
                $util.base64.decode(
                  d.data,
                  (m.data = $util.newBuffer($util.base64.length(d.data))),
                  0
                );
              else if (d.data.length) m.data = d.data;
            }
            if (d.timeoutHeight != null) {
              if (typeof d.timeoutHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.Packet.timeoutHeight: object expected"
                );
              m.timeoutHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.timeoutHeight
              );
            }
            if (d.timeoutTimestamp != null) {
              if ($util.Long)
                (m.timeoutTimestamp = $util.Long.fromValue(
                  d.timeoutTimestamp
                )).unsigned = true;
              else if (typeof d.timeoutTimestamp === "string")
                m.timeoutTimestamp = parseInt(d.timeoutTimestamp, 10);
              else if (typeof d.timeoutTimestamp === "number")
                m.timeoutTimestamp = d.timeoutTimestamp;
              else if (typeof d.timeoutTimestamp === "object")
                m.timeoutTimestamp = new $util.LongBits(
                  d.timeoutTimestamp.low >>> 0,
                  d.timeoutTimestamp.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          Packet.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? "0" : 0;
              d.sourcePort = "";
              d.sourceChannel = "";
              d.destinationPort = "";
              d.destinationChannel = "";
              if (o.bytes === String) d.data = "";
              else {
                d.data = [];
                if (o.bytes !== Array) d.data = $util.newBuffer(d.data);
              }
              d.timeoutHeight = null;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.timeoutTimestamp =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.timeoutTimestamp = o.longs === String ? "0" : 0;
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            if (m.sourcePort != null && m.hasOwnProperty("sourcePort")) {
              d.sourcePort = m.sourcePort;
            }
            if (m.sourceChannel != null && m.hasOwnProperty("sourceChannel")) {
              d.sourceChannel = m.sourceChannel;
            }
            if (
              m.destinationPort != null &&
              m.hasOwnProperty("destinationPort")
            ) {
              d.destinationPort = m.destinationPort;
            }
            if (
              m.destinationChannel != null &&
              m.hasOwnProperty("destinationChannel")
            ) {
              d.destinationChannel = m.destinationChannel;
            }
            if (m.data != null && m.hasOwnProperty("data")) {
              d.data =
                o.bytes === String
                  ? $util.base64.encode(m.data, 0, m.data.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.data)
                  : m.data;
            }
            if (m.timeoutHeight != null && m.hasOwnProperty("timeoutHeight")) {
              d.timeoutHeight = $root.ibc.core.client.v1.Height.toObject(
                m.timeoutHeight,
                o
              );
            }
            if (
              m.timeoutTimestamp != null &&
              m.hasOwnProperty("timeoutTimestamp")
            ) {
              if (typeof m.timeoutTimestamp === "number")
                d.timeoutTimestamp =
                  o.longs === String
                    ? String(m.timeoutTimestamp)
                    : m.timeoutTimestamp;
              else
                d.timeoutTimestamp =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.timeoutTimestamp)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.timeoutTimestamp.low >>> 0,
                        m.timeoutTimestamp.high >>> 0
                      ).toNumber(true)
                    : m.timeoutTimestamp;
            }
            return d;
          };
          Packet.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Packet;
        })();
        v1.PacketState = (function () {
          function PacketState(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          PacketState.prototype.portId = "";
          PacketState.prototype.channelId = "";
          PacketState.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          PacketState.prototype.data = $util.newBuffer([]);
          PacketState.create = function create(properties) {
            return new PacketState(properties);
          };
          PacketState.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
              w.uint32(24).uint64(m.sequence);
            if (m.data != null && Object.hasOwnProperty.call(m, "data"))
              w.uint32(34).bytes(m.data);
            return w;
          };
          PacketState.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.PacketState();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.sequence = r.uint64();
                  break;
                case 4:
                  m.data = r.bytes();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          PacketState.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.PacketState) return d;
            var m = new $root.ibc.core.channel.v1.PacketState();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            if (d.data != null) {
              if (typeof d.data === "string")
                $util.base64.decode(
                  d.data,
                  (m.data = $util.newBuffer($util.base64.length(d.data))),
                  0
                );
              else if (d.data.length) m.data = d.data;
            }
            return m;
          };
          PacketState.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? "0" : 0;
              if (o.bytes === String) d.data = "";
              else {
                d.data = [];
                if (o.bytes !== Array) d.data = $util.newBuffer(d.data);
              }
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            if (m.data != null && m.hasOwnProperty("data")) {
              d.data =
                o.bytes === String
                  ? $util.base64.encode(m.data, 0, m.data.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.data)
                  : m.data;
            }
            return d;
          };
          PacketState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return PacketState;
        })();
        v1.Acknowledgement = (function () {
          function Acknowledgement(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Acknowledgement.prototype.result = $util.newBuffer([]);
          Acknowledgement.prototype.error = "";
          let $oneOfFields;
          Object.defineProperty(Acknowledgement.prototype, "response", {
            get: $util.oneOfGetter(($oneOfFields = ["result", "error"])),
            set: $util.oneOfSetter($oneOfFields),
          });
          Acknowledgement.create = function create(properties) {
            return new Acknowledgement(properties);
          };
          Acknowledgement.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.result != null && Object.hasOwnProperty.call(m, "result"))
              w.uint32(170).bytes(m.result);
            if (m.error != null && Object.hasOwnProperty.call(m, "error"))
              w.uint32(178).string(m.error);
            return w;
          };
          Acknowledgement.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.Acknowledgement();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 21:
                  m.result = r.bytes();
                  break;
                case 22:
                  m.error = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Acknowledgement.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.Acknowledgement)
              return d;
            var m = new $root.ibc.core.channel.v1.Acknowledgement();
            if (d.result != null) {
              if (typeof d.result === "string")
                $util.base64.decode(
                  d.result,
                  (m.result = $util.newBuffer($util.base64.length(d.result))),
                  0
                );
              else if (d.result.length) m.result = d.result;
            }
            if (d.error != null) {
              m.error = String(d.error);
            }
            return m;
          };
          Acknowledgement.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (m.result != null && m.hasOwnProperty("result")) {
              d.result =
                o.bytes === String
                  ? $util.base64.encode(m.result, 0, m.result.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.result)
                  : m.result;
              if (o.oneofs) d.response = "result";
            }
            if (m.error != null && m.hasOwnProperty("error")) {
              d.error = m.error;
              if (o.oneofs) d.response = "error";
            }
            return d;
          };
          Acknowledgement.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Acknowledgement;
        })();
        v1.Query = (function () {
          function Query(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(
              this,
              rpcImpl,
              requestDelimited,
              responseDelimited
            );
          }
          (Query.prototype = Object.create(
            $protobuf.rpc.Service.prototype
          )).constructor = Query;
          Query.create = function create(
            rpcImpl,
            requestDelimited,
            responseDelimited
          ) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
          };
          Object.defineProperty(
            (Query.prototype.channel = function channel(request, callback) {
              return this.rpcCall(
                channel,
                $root.ibc.core.channel.v1.QueryChannelRequest,
                $root.ibc.core.channel.v1.QueryChannelResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "Channel" }
          );
          Object.defineProperty(
            (Query.prototype.channels = function channels(request, callback) {
              return this.rpcCall(
                channels,
                $root.ibc.core.channel.v1.QueryChannelsRequest,
                $root.ibc.core.channel.v1.QueryChannelsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "Channels" }
          );
          Object.defineProperty(
            (Query.prototype.connectionChannels = function connectionChannels(
              request,
              callback
            ) {
              return this.rpcCall(
                connectionChannels,
                $root.ibc.core.channel.v1.QueryConnectionChannelsRequest,
                $root.ibc.core.channel.v1.QueryConnectionChannelsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "ConnectionChannels" }
          );
          Object.defineProperty(
            (Query.prototype.channelClientState = function channelClientState(
              request,
              callback
            ) {
              return this.rpcCall(
                channelClientState,
                $root.ibc.core.channel.v1.QueryChannelClientStateRequest,
                $root.ibc.core.channel.v1.QueryChannelClientStateResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "ChannelClientState" }
          );
          Object.defineProperty(
            (Query.prototype.channelConsensusState = function channelConsensusState(
              request,
              callback
            ) {
              return this.rpcCall(
                channelConsensusState,
                $root.ibc.core.channel.v1.QueryChannelConsensusStateRequest,
                $root.ibc.core.channel.v1.QueryChannelConsensusStateResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "ChannelConsensusState" }
          );
          Object.defineProperty(
            (Query.prototype.packetCommitment = function packetCommitment(
              request,
              callback
            ) {
              return this.rpcCall(
                packetCommitment,
                $root.ibc.core.channel.v1.QueryPacketCommitmentRequest,
                $root.ibc.core.channel.v1.QueryPacketCommitmentResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "PacketCommitment" }
          );
          Object.defineProperty(
            (Query.prototype.packetCommitments = function packetCommitments(
              request,
              callback
            ) {
              return this.rpcCall(
                packetCommitments,
                $root.ibc.core.channel.v1.QueryPacketCommitmentsRequest,
                $root.ibc.core.channel.v1.QueryPacketCommitmentsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "PacketCommitments" }
          );
          Object.defineProperty(
            (Query.prototype.packetReceipt = function packetReceipt(
              request,
              callback
            ) {
              return this.rpcCall(
                packetReceipt,
                $root.ibc.core.channel.v1.QueryPacketReceiptRequest,
                $root.ibc.core.channel.v1.QueryPacketReceiptResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "PacketReceipt" }
          );
          Object.defineProperty(
            (Query.prototype.packetAcknowledgement = function packetAcknowledgement(
              request,
              callback
            ) {
              return this.rpcCall(
                packetAcknowledgement,
                $root.ibc.core.channel.v1.QueryPacketAcknowledgementRequest,
                $root.ibc.core.channel.v1.QueryPacketAcknowledgementResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "PacketAcknowledgement" }
          );
          Object.defineProperty(
            (Query.prototype.packetAcknowledgements = function packetAcknowledgements(
              request,
              callback
            ) {
              return this.rpcCall(
                packetAcknowledgements,
                $root.ibc.core.channel.v1.QueryPacketAcknowledgementsRequest,
                $root.ibc.core.channel.v1.QueryPacketAcknowledgementsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "PacketAcknowledgements" }
          );
          Object.defineProperty(
            (Query.prototype.unreceivedPackets = function unreceivedPackets(
              request,
              callback
            ) {
              return this.rpcCall(
                unreceivedPackets,
                $root.ibc.core.channel.v1.QueryUnreceivedPacketsRequest,
                $root.ibc.core.channel.v1.QueryUnreceivedPacketsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "UnreceivedPackets" }
          );
          Object.defineProperty(
            (Query.prototype.unreceivedAcks = function unreceivedAcks(
              request,
              callback
            ) {
              return this.rpcCall(
                unreceivedAcks,
                $root.ibc.core.channel.v1.QueryUnreceivedAcksRequest,
                $root.ibc.core.channel.v1.QueryUnreceivedAcksResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "UnreceivedAcks" }
          );
          Object.defineProperty(
            (Query.prototype.nextSequenceReceive = function nextSequenceReceive(
              request,
              callback
            ) {
              return this.rpcCall(
                nextSequenceReceive,
                $root.ibc.core.channel.v1.QueryNextSequenceReceiveRequest,
                $root.ibc.core.channel.v1.QueryNextSequenceReceiveResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "NextSequenceReceive" }
          );
          return Query;
        })();
        v1.QueryChannelRequest = (function () {
          function QueryChannelRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelRequest.prototype.portId = "";
          QueryChannelRequest.prototype.channelId = "";
          QueryChannelRequest.create = function create(properties) {
            return new QueryChannelRequest(properties);
          };
          QueryChannelRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            return w;
          };
          QueryChannelRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.QueryChannelRequest)
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            return m;
          };
          QueryChannelRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            return d;
          };
          QueryChannelRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelRequest;
        })();
        v1.QueryChannelResponse = (function () {
          function QueryChannelResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelResponse.prototype.channel = null;
          QueryChannelResponse.prototype.proof = $util.newBuffer([]);
          QueryChannelResponse.prototype.proofHeight = null;
          QueryChannelResponse.create = function create(properties) {
            return new QueryChannelResponse(properties);
          };
          QueryChannelResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.channel != null && Object.hasOwnProperty.call(m, "channel"))
              $root.ibc.core.channel.v1.Channel.encode(
                m.channel,
                w.uint32(10).fork()
              ).ldelim();
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryChannelResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.channel = $root.ibc.core.channel.v1.Channel.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.QueryChannelResponse)
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelResponse();
            if (d.channel != null) {
              if (typeof d.channel !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelResponse.channel: object expected"
                );
              m.channel = $root.ibc.core.channel.v1.Channel.fromObject(
                d.channel
              );
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryChannelResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.channel = null;
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (m.channel != null && m.hasOwnProperty("channel")) {
              d.channel = $root.ibc.core.channel.v1.Channel.toObject(
                m.channel,
                o
              );
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryChannelResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelResponse;
        })();
        v1.QueryChannelsRequest = (function () {
          function QueryChannelsRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelsRequest.prototype.pagination = null;
          QueryChannelsRequest.create = function create(properties) {
            return new QueryChannelsRequest(properties);
          };
          QueryChannelsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageRequest.encode(
                m.pagination,
                w.uint32(10).fork()
              ).ldelim();
            return w;
          };
          QueryChannelsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelsRequest.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.QueryChannelsRequest)
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelsRequest();
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelsRequest.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.fromObject(
                d.pagination
              );
            }
            return m;
          };
          QueryChannelsRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.pagination = null;
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageRequest.toObject(
                m.pagination,
                o
              );
            }
            return d;
          };
          QueryChannelsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelsRequest;
        })();
        v1.QueryChannelsResponse = (function () {
          function QueryChannelsResponse(p) {
            this.channels = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelsResponse.prototype.channels = $util.emptyArray;
          QueryChannelsResponse.prototype.pagination = null;
          QueryChannelsResponse.prototype.height = null;
          QueryChannelsResponse.create = function create(properties) {
            return new QueryChannelsResponse(properties);
          };
          QueryChannelsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.channels != null && m.channels.length) {
              for (var i = 0; i < m.channels.length; ++i)
                $root.ibc.core.channel.v1.IdentifiedChannel.encode(
                  m.channels[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageResponse.encode(
                m.pagination,
                w.uint32(18).fork()
              ).ldelim();
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryChannelsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.channels && m.channels.length)) m.channels = [];
                  m.channels.push(
                    $root.ibc.core.channel.v1.IdentifiedChannel.decode(
                      r,
                      r.uint32()
                    )
                  );
                  break;
                case 2:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelsResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.channel.v1.QueryChannelsResponse)
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelsResponse();
            if (d.channels) {
              if (!Array.isArray(d.channels))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelsResponse.channels: array expected"
                );
              m.channels = [];
              for (var i = 0; i < d.channels.length; ++i) {
                if (typeof d.channels[i] !== "object")
                  throw TypeError(
                    ".ibc.core.channel.v1.QueryChannelsResponse.channels: object expected"
                  );
                m.channels[
                  i
                ] = $root.ibc.core.channel.v1.IdentifiedChannel.fromObject(
                  d.channels[i]
                );
              }
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelsResponse.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.fromObject(
                d.pagination
              );
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelsResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryChannelsResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.channels = [];
            }
            if (o.defaults) {
              d.pagination = null;
              d.height = null;
            }
            if (m.channels && m.channels.length) {
              d.channels = [];
              for (var j = 0; j < m.channels.length; ++j) {
                d.channels[
                  j
                ] = $root.ibc.core.channel.v1.IdentifiedChannel.toObject(
                  m.channels[j],
                  o
                );
              }
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageResponse.toObject(
                m.pagination,
                o
              );
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryChannelsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelsResponse;
        })();
        v1.QueryConnectionChannelsRequest = (function () {
          function QueryConnectionChannelsRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionChannelsRequest.prototype.connection = "";
          QueryConnectionChannelsRequest.prototype.pagination = null;
          QueryConnectionChannelsRequest.create = function create(properties) {
            return new QueryConnectionChannelsRequest(properties);
          };
          QueryConnectionChannelsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.connection != null &&
              Object.hasOwnProperty.call(m, "connection")
            )
              w.uint32(10).string(m.connection);
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageRequest.encode(
                m.pagination,
                w.uint32(18).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionChannelsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryConnectionChannelsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.connection = r.string();
                  break;
                case 2:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionChannelsRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryConnectionChannelsRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryConnectionChannelsRequest();
            if (d.connection != null) {
              m.connection = String(d.connection);
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryConnectionChannelsRequest.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.fromObject(
                d.pagination
              );
            }
            return m;
          };
          QueryConnectionChannelsRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.connection = "";
              d.pagination = null;
            }
            if (m.connection != null && m.hasOwnProperty("connection")) {
              d.connection = m.connection;
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageRequest.toObject(
                m.pagination,
                o
              );
            }
            return d;
          };
          QueryConnectionChannelsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionChannelsRequest;
        })();
        v1.QueryConnectionChannelsResponse = (function () {
          function QueryConnectionChannelsResponse(p) {
            this.channels = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionChannelsResponse.prototype.channels = $util.emptyArray;
          QueryConnectionChannelsResponse.prototype.pagination = null;
          QueryConnectionChannelsResponse.prototype.height = null;
          QueryConnectionChannelsResponse.create = function create(properties) {
            return new QueryConnectionChannelsResponse(properties);
          };
          QueryConnectionChannelsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.channels != null && m.channels.length) {
              for (var i = 0; i < m.channels.length; ++i)
                $root.ibc.core.channel.v1.IdentifiedChannel.encode(
                  m.channels[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageResponse.encode(
                m.pagination,
                w.uint32(18).fork()
              ).ldelim();
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionChannelsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryConnectionChannelsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.channels && m.channels.length)) m.channels = [];
                  m.channels.push(
                    $root.ibc.core.channel.v1.IdentifiedChannel.decode(
                      r,
                      r.uint32()
                    )
                  );
                  break;
                case 2:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionChannelsResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryConnectionChannelsResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryConnectionChannelsResponse();
            if (d.channels) {
              if (!Array.isArray(d.channels))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryConnectionChannelsResponse.channels: array expected"
                );
              m.channels = [];
              for (var i = 0; i < d.channels.length; ++i) {
                if (typeof d.channels[i] !== "object")
                  throw TypeError(
                    ".ibc.core.channel.v1.QueryConnectionChannelsResponse.channels: object expected"
                  );
                m.channels[
                  i
                ] = $root.ibc.core.channel.v1.IdentifiedChannel.fromObject(
                  d.channels[i]
                );
              }
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryConnectionChannelsResponse.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.fromObject(
                d.pagination
              );
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryConnectionChannelsResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryConnectionChannelsResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.channels = [];
            }
            if (o.defaults) {
              d.pagination = null;
              d.height = null;
            }
            if (m.channels && m.channels.length) {
              d.channels = [];
              for (var j = 0; j < m.channels.length; ++j) {
                d.channels[
                  j
                ] = $root.ibc.core.channel.v1.IdentifiedChannel.toObject(
                  m.channels[j],
                  o
                );
              }
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageResponse.toObject(
                m.pagination,
                o
              );
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryConnectionChannelsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionChannelsResponse;
        })();
        v1.QueryChannelClientStateRequest = (function () {
          function QueryChannelClientStateRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelClientStateRequest.prototype.portId = "";
          QueryChannelClientStateRequest.prototype.channelId = "";
          QueryChannelClientStateRequest.create = function create(properties) {
            return new QueryChannelClientStateRequest(properties);
          };
          QueryChannelClientStateRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            return w;
          };
          QueryChannelClientStateRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelClientStateRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelClientStateRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryChannelClientStateRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelClientStateRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            return m;
          };
          QueryChannelClientStateRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            return d;
          };
          QueryChannelClientStateRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelClientStateRequest;
        })();
        v1.QueryChannelClientStateResponse = (function () {
          function QueryChannelClientStateResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelClientStateResponse.prototype.identifiedClientState = null;
          QueryChannelClientStateResponse.prototype.proof = $util.newBuffer([]);
          QueryChannelClientStateResponse.prototype.proofHeight = null;
          QueryChannelClientStateResponse.create = function create(properties) {
            return new QueryChannelClientStateResponse(properties);
          };
          QueryChannelClientStateResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.identifiedClientState != null &&
              Object.hasOwnProperty.call(m, "identifiedClientState")
            )
              $root.ibc.core.client.v1.IdentifiedClientState.encode(
                m.identifiedClientState,
                w.uint32(10).fork()
              ).ldelim();
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryChannelClientStateResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelClientStateResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.identifiedClientState = $root.ibc.core.client.v1.IdentifiedClientState.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelClientStateResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryChannelClientStateResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelClientStateResponse();
            if (d.identifiedClientState != null) {
              if (typeof d.identifiedClientState !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelClientStateResponse.identifiedClientState: object expected"
                );
              m.identifiedClientState = $root.ibc.core.client.v1.IdentifiedClientState.fromObject(
                d.identifiedClientState
              );
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelClientStateResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryChannelClientStateResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.identifiedClientState = null;
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (
              m.identifiedClientState != null &&
              m.hasOwnProperty("identifiedClientState")
            ) {
              d.identifiedClientState = $root.ibc.core.client.v1.IdentifiedClientState.toObject(
                m.identifiedClientState,
                o
              );
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryChannelClientStateResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelClientStateResponse;
        })();
        v1.QueryChannelConsensusStateRequest = (function () {
          function QueryChannelConsensusStateRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelConsensusStateRequest.prototype.portId = "";
          QueryChannelConsensusStateRequest.prototype.channelId = "";
          QueryChannelConsensusStateRequest.prototype.versionNumber = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryChannelConsensusStateRequest.prototype.versionHeight = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryChannelConsensusStateRequest.create = function create(
            properties
          ) {
            return new QueryChannelConsensusStateRequest(properties);
          };
          QueryChannelConsensusStateRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (
              m.versionNumber != null &&
              Object.hasOwnProperty.call(m, "versionNumber")
            )
              w.uint32(24).uint64(m.versionNumber);
            if (
              m.versionHeight != null &&
              Object.hasOwnProperty.call(m, "versionHeight")
            )
              w.uint32(32).uint64(m.versionHeight);
            return w;
          };
          QueryChannelConsensusStateRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelConsensusStateRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.versionNumber = r.uint64();
                  break;
                case 4:
                  m.versionHeight = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelConsensusStateRequest.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryChannelConsensusStateRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelConsensusStateRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.versionNumber != null) {
              if ($util.Long)
                (m.versionNumber = $util.Long.fromValue(
                  d.versionNumber
                )).unsigned = true;
              else if (typeof d.versionNumber === "string")
                m.versionNumber = parseInt(d.versionNumber, 10);
              else if (typeof d.versionNumber === "number")
                m.versionNumber = d.versionNumber;
              else if (typeof d.versionNumber === "object")
                m.versionNumber = new $util.LongBits(
                  d.versionNumber.low >>> 0,
                  d.versionNumber.high >>> 0
                ).toNumber(true);
            }
            if (d.versionHeight != null) {
              if ($util.Long)
                (m.versionHeight = $util.Long.fromValue(
                  d.versionHeight
                )).unsigned = true;
              else if (typeof d.versionHeight === "string")
                m.versionHeight = parseInt(d.versionHeight, 10);
              else if (typeof d.versionHeight === "number")
                m.versionHeight = d.versionHeight;
              else if (typeof d.versionHeight === "object")
                m.versionHeight = new $util.LongBits(
                  d.versionHeight.low >>> 0,
                  d.versionHeight.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          QueryChannelConsensusStateRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.versionNumber =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.versionNumber = o.longs === String ? "0" : 0;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.versionHeight =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.versionHeight = o.longs === String ? "0" : 0;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.versionNumber != null && m.hasOwnProperty("versionNumber")) {
              if (typeof m.versionNumber === "number")
                d.versionNumber =
                  o.longs === String
                    ? String(m.versionNumber)
                    : m.versionNumber;
              else
                d.versionNumber =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.versionNumber)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.versionNumber.low >>> 0,
                        m.versionNumber.high >>> 0
                      ).toNumber(true)
                    : m.versionNumber;
            }
            if (m.versionHeight != null && m.hasOwnProperty("versionHeight")) {
              if (typeof m.versionHeight === "number")
                d.versionHeight =
                  o.longs === String
                    ? String(m.versionHeight)
                    : m.versionHeight;
              else
                d.versionHeight =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.versionHeight)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.versionHeight.low >>> 0,
                        m.versionHeight.high >>> 0
                      ).toNumber(true)
                    : m.versionHeight;
            }
            return d;
          };
          QueryChannelConsensusStateRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelConsensusStateRequest;
        })();
        v1.QueryChannelConsensusStateResponse = (function () {
          function QueryChannelConsensusStateResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryChannelConsensusStateResponse.prototype.consensusState = null;
          QueryChannelConsensusStateResponse.prototype.clientId = "";
          QueryChannelConsensusStateResponse.prototype.proof = $util.newBuffer(
            []
          );
          QueryChannelConsensusStateResponse.prototype.proofHeight = null;
          QueryChannelConsensusStateResponse.create = function create(
            properties
          ) {
            return new QueryChannelConsensusStateResponse(properties);
          };
          QueryChannelConsensusStateResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.consensusState != null &&
              Object.hasOwnProperty.call(m, "consensusState")
            )
              $root.google.protobuf.Any.encode(
                m.consensusState,
                w.uint32(10).fork()
              ).ldelim();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(18).string(m.clientId);
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(26).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(34).fork()
              ).ldelim();
            return w;
          };
          QueryChannelConsensusStateResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryChannelConsensusStateResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.consensusState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.clientId = r.string();
                  break;
                case 3:
                  m.proof = r.bytes();
                  break;
                case 4:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryChannelConsensusStateResponse.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryChannelConsensusStateResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryChannelConsensusStateResponse();
            if (d.consensusState != null) {
              if (typeof d.consensusState !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelConsensusStateResponse.consensusState: object expected"
                );
              m.consensusState = $root.google.protobuf.Any.fromObject(
                d.consensusState
              );
            }
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryChannelConsensusStateResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryChannelConsensusStateResponse.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.consensusState = null;
              d.clientId = "";
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (
              m.consensusState != null &&
              m.hasOwnProperty("consensusState")
            ) {
              d.consensusState = $root.google.protobuf.Any.toObject(
                m.consensusState,
                o
              );
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryChannelConsensusStateResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryChannelConsensusStateResponse;
        })();
        v1.QueryPacketCommitmentRequest = (function () {
          function QueryPacketCommitmentRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketCommitmentRequest.prototype.portId = "";
          QueryPacketCommitmentRequest.prototype.channelId = "";
          QueryPacketCommitmentRequest.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryPacketCommitmentRequest.create = function create(properties) {
            return new QueryPacketCommitmentRequest(properties);
          };
          QueryPacketCommitmentRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
              w.uint32(24).uint64(m.sequence);
            return w;
          };
          QueryPacketCommitmentRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketCommitmentRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.sequence = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketCommitmentRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketCommitmentRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketCommitmentRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          QueryPacketCommitmentRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? "0" : 0;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            return d;
          };
          QueryPacketCommitmentRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketCommitmentRequest;
        })();
        v1.QueryPacketCommitmentResponse = (function () {
          function QueryPacketCommitmentResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketCommitmentResponse.prototype.commitment = $util.newBuffer(
            []
          );
          QueryPacketCommitmentResponse.prototype.proof = $util.newBuffer([]);
          QueryPacketCommitmentResponse.prototype.proofHeight = null;
          QueryPacketCommitmentResponse.create = function create(properties) {
            return new QueryPacketCommitmentResponse(properties);
          };
          QueryPacketCommitmentResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.commitment != null &&
              Object.hasOwnProperty.call(m, "commitment")
            )
              w.uint32(10).bytes(m.commitment);
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryPacketCommitmentResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketCommitmentResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.commitment = r.bytes();
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketCommitmentResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketCommitmentResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketCommitmentResponse();
            if (d.commitment != null) {
              if (typeof d.commitment === "string")
                $util.base64.decode(
                  d.commitment,
                  (m.commitment = $util.newBuffer(
                    $util.base64.length(d.commitment)
                  )),
                  0
                );
              else if (d.commitment.length) m.commitment = d.commitment;
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketCommitmentResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryPacketCommitmentResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.commitment = "";
              else {
                d.commitment = [];
                if (o.bytes !== Array)
                  d.commitment = $util.newBuffer(d.commitment);
              }
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (m.commitment != null && m.hasOwnProperty("commitment")) {
              d.commitment =
                o.bytes === String
                  ? $util.base64.encode(m.commitment, 0, m.commitment.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.commitment)
                  : m.commitment;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryPacketCommitmentResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketCommitmentResponse;
        })();
        v1.QueryPacketCommitmentsRequest = (function () {
          function QueryPacketCommitmentsRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketCommitmentsRequest.prototype.portId = "";
          QueryPacketCommitmentsRequest.prototype.channelId = "";
          QueryPacketCommitmentsRequest.prototype.pagination = null;
          QueryPacketCommitmentsRequest.create = function create(properties) {
            return new QueryPacketCommitmentsRequest(properties);
          };
          QueryPacketCommitmentsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageRequest.encode(
                m.pagination,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryPacketCommitmentsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketCommitmentsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketCommitmentsRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketCommitmentsRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketCommitmentsRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketCommitmentsRequest.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.fromObject(
                d.pagination
              );
            }
            return m;
          };
          QueryPacketCommitmentsRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              d.pagination = null;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageRequest.toObject(
                m.pagination,
                o
              );
            }
            return d;
          };
          QueryPacketCommitmentsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketCommitmentsRequest;
        })();
        v1.QueryPacketCommitmentsResponse = (function () {
          function QueryPacketCommitmentsResponse(p) {
            this.commitments = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketCommitmentsResponse.prototype.commitments =
            $util.emptyArray;
          QueryPacketCommitmentsResponse.prototype.pagination = null;
          QueryPacketCommitmentsResponse.prototype.height = null;
          QueryPacketCommitmentsResponse.create = function create(properties) {
            return new QueryPacketCommitmentsResponse(properties);
          };
          QueryPacketCommitmentsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.commitments != null && m.commitments.length) {
              for (var i = 0; i < m.commitments.length; ++i)
                $root.ibc.core.channel.v1.PacketState.encode(
                  m.commitments[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageResponse.encode(
                m.pagination,
                w.uint32(18).fork()
              ).ldelim();
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryPacketCommitmentsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketCommitmentsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.commitments && m.commitments.length))
                    m.commitments = [];
                  m.commitments.push(
                    $root.ibc.core.channel.v1.PacketState.decode(r, r.uint32())
                  );
                  break;
                case 2:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketCommitmentsResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketCommitmentsResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketCommitmentsResponse();
            if (d.commitments) {
              if (!Array.isArray(d.commitments))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketCommitmentsResponse.commitments: array expected"
                );
              m.commitments = [];
              for (var i = 0; i < d.commitments.length; ++i) {
                if (typeof d.commitments[i] !== "object")
                  throw TypeError(
                    ".ibc.core.channel.v1.QueryPacketCommitmentsResponse.commitments: object expected"
                  );
                m.commitments[
                  i
                ] = $root.ibc.core.channel.v1.PacketState.fromObject(
                  d.commitments[i]
                );
              }
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketCommitmentsResponse.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.fromObject(
                d.pagination
              );
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketCommitmentsResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryPacketCommitmentsResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.commitments = [];
            }
            if (o.defaults) {
              d.pagination = null;
              d.height = null;
            }
            if (m.commitments && m.commitments.length) {
              d.commitments = [];
              for (var j = 0; j < m.commitments.length; ++j) {
                d.commitments[
                  j
                ] = $root.ibc.core.channel.v1.PacketState.toObject(
                  m.commitments[j],
                  o
                );
              }
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageResponse.toObject(
                m.pagination,
                o
              );
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryPacketCommitmentsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketCommitmentsResponse;
        })();
        v1.QueryPacketReceiptRequest = (function () {
          function QueryPacketReceiptRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketReceiptRequest.prototype.portId = "";
          QueryPacketReceiptRequest.prototype.channelId = "";
          QueryPacketReceiptRequest.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryPacketReceiptRequest.create = function create(properties) {
            return new QueryPacketReceiptRequest(properties);
          };
          QueryPacketReceiptRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
              w.uint32(24).uint64(m.sequence);
            return w;
          };
          QueryPacketReceiptRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketReceiptRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.sequence = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketReceiptRequest.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.channel.v1.QueryPacketReceiptRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketReceiptRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          QueryPacketReceiptRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? "0" : 0;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            return d;
          };
          QueryPacketReceiptRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketReceiptRequest;
        })();
        v1.QueryPacketReceiptResponse = (function () {
          function QueryPacketReceiptResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketReceiptResponse.prototype.received = false;
          QueryPacketReceiptResponse.prototype.proof = $util.newBuffer([]);
          QueryPacketReceiptResponse.prototype.proofHeight = null;
          QueryPacketReceiptResponse.create = function create(properties) {
            return new QueryPacketReceiptResponse(properties);
          };
          QueryPacketReceiptResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.received != null && Object.hasOwnProperty.call(m, "received"))
              w.uint32(16).bool(m.received);
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(26).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(34).fork()
              ).ldelim();
            return w;
          };
          QueryPacketReceiptResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketReceiptResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 2:
                  m.received = r.bool();
                  break;
                case 3:
                  m.proof = r.bytes();
                  break;
                case 4:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketReceiptResponse.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.channel.v1.QueryPacketReceiptResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketReceiptResponse();
            if (d.received != null) {
              m.received = Boolean(d.received);
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketReceiptResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryPacketReceiptResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.received = false;
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (m.received != null && m.hasOwnProperty("received")) {
              d.received = m.received;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryPacketReceiptResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketReceiptResponse;
        })();
        v1.QueryPacketAcknowledgementRequest = (function () {
          function QueryPacketAcknowledgementRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketAcknowledgementRequest.prototype.portId = "";
          QueryPacketAcknowledgementRequest.prototype.channelId = "";
          QueryPacketAcknowledgementRequest.prototype.sequence = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryPacketAcknowledgementRequest.create = function create(
            properties
          ) {
            return new QueryPacketAcknowledgementRequest(properties);
          };
          QueryPacketAcknowledgementRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
              w.uint32(24).uint64(m.sequence);
            return w;
          };
          QueryPacketAcknowledgementRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.sequence = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketAcknowledgementRequest.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketAcknowledgementRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.sequence != null) {
              if ($util.Long)
                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string")
                m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(
                  d.sequence.low >>> 0,
                  d.sequence.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          QueryPacketAcknowledgementRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.sequence =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.sequence = o.longs === String ? "0" : 0;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence =
                  o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.sequence.low >>> 0,
                        m.sequence.high >>> 0
                      ).toNumber(true)
                    : m.sequence;
            }
            return d;
          };
          QueryPacketAcknowledgementRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketAcknowledgementRequest;
        })();
        v1.QueryPacketAcknowledgementResponse = (function () {
          function QueryPacketAcknowledgementResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketAcknowledgementResponse.prototype.acknowledgement = $util.newBuffer(
            []
          );
          QueryPacketAcknowledgementResponse.prototype.proof = $util.newBuffer(
            []
          );
          QueryPacketAcknowledgementResponse.prototype.proofHeight = null;
          QueryPacketAcknowledgementResponse.create = function create(
            properties
          ) {
            return new QueryPacketAcknowledgementResponse(properties);
          };
          QueryPacketAcknowledgementResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.acknowledgement != null &&
              Object.hasOwnProperty.call(m, "acknowledgement")
            )
              w.uint32(10).bytes(m.acknowledgement);
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryPacketAcknowledgementResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.acknowledgement = r.bytes();
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketAcknowledgementResponse.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketAcknowledgementResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementResponse();
            if (d.acknowledgement != null) {
              if (typeof d.acknowledgement === "string")
                $util.base64.decode(
                  d.acknowledgement,
                  (m.acknowledgement = $util.newBuffer(
                    $util.base64.length(d.acknowledgement)
                  )),
                  0
                );
              else if (d.acknowledgement.length)
                m.acknowledgement = d.acknowledgement;
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketAcknowledgementResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryPacketAcknowledgementResponse.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.acknowledgement = "";
              else {
                d.acknowledgement = [];
                if (o.bytes !== Array)
                  d.acknowledgement = $util.newBuffer(d.acknowledgement);
              }
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (
              m.acknowledgement != null &&
              m.hasOwnProperty("acknowledgement")
            ) {
              d.acknowledgement =
                o.bytes === String
                  ? $util.base64.encode(
                      m.acknowledgement,
                      0,
                      m.acknowledgement.length
                    )
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.acknowledgement)
                  : m.acknowledgement;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryPacketAcknowledgementResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketAcknowledgementResponse;
        })();
        v1.QueryPacketAcknowledgementsRequest = (function () {
          function QueryPacketAcknowledgementsRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketAcknowledgementsRequest.prototype.portId = "";
          QueryPacketAcknowledgementsRequest.prototype.channelId = "";
          QueryPacketAcknowledgementsRequest.prototype.pagination = null;
          QueryPacketAcknowledgementsRequest.create = function create(
            properties
          ) {
            return new QueryPacketAcknowledgementsRequest(properties);
          };
          QueryPacketAcknowledgementsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageRequest.encode(
                m.pagination,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryPacketAcknowledgementsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketAcknowledgementsRequest.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketAcknowledgementsRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementsRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketAcknowledgementsRequest.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.fromObject(
                d.pagination
              );
            }
            return m;
          };
          QueryPacketAcknowledgementsRequest.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
              d.pagination = null;
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageRequest.toObject(
                m.pagination,
                o
              );
            }
            return d;
          };
          QueryPacketAcknowledgementsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketAcknowledgementsRequest;
        })();
        v1.QueryPacketAcknowledgementsResponse = (function () {
          function QueryPacketAcknowledgementsResponse(p) {
            this.acknowledgements = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryPacketAcknowledgementsResponse.prototype.acknowledgements =
            $util.emptyArray;
          QueryPacketAcknowledgementsResponse.prototype.pagination = null;
          QueryPacketAcknowledgementsResponse.prototype.height = null;
          QueryPacketAcknowledgementsResponse.create = function create(
            properties
          ) {
            return new QueryPacketAcknowledgementsResponse(properties);
          };
          QueryPacketAcknowledgementsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.acknowledgements != null && m.acknowledgements.length) {
              for (var i = 0; i < m.acknowledgements.length; ++i)
                $root.ibc.core.channel.v1.PacketState.encode(
                  m.acknowledgements[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageResponse.encode(
                m.pagination,
                w.uint32(18).fork()
              ).ldelim();
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryPacketAcknowledgementsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.acknowledgements && m.acknowledgements.length))
                    m.acknowledgements = [];
                  m.acknowledgements.push(
                    $root.ibc.core.channel.v1.PacketState.decode(r, r.uint32())
                  );
                  break;
                case 2:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryPacketAcknowledgementsResponse.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryPacketAcknowledgementsResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryPacketAcknowledgementsResponse();
            if (d.acknowledgements) {
              if (!Array.isArray(d.acknowledgements))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketAcknowledgementsResponse.acknowledgements: array expected"
                );
              m.acknowledgements = [];
              for (var i = 0; i < d.acknowledgements.length; ++i) {
                if (typeof d.acknowledgements[i] !== "object")
                  throw TypeError(
                    ".ibc.core.channel.v1.QueryPacketAcknowledgementsResponse.acknowledgements: object expected"
                  );
                m.acknowledgements[
                  i
                ] = $root.ibc.core.channel.v1.PacketState.fromObject(
                  d.acknowledgements[i]
                );
              }
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketAcknowledgementsResponse.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.fromObject(
                d.pagination
              );
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryPacketAcknowledgementsResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryPacketAcknowledgementsResponse.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.acknowledgements = [];
            }
            if (o.defaults) {
              d.pagination = null;
              d.height = null;
            }
            if (m.acknowledgements && m.acknowledgements.length) {
              d.acknowledgements = [];
              for (var j = 0; j < m.acknowledgements.length; ++j) {
                d.acknowledgements[
                  j
                ] = $root.ibc.core.channel.v1.PacketState.toObject(
                  m.acknowledgements[j],
                  o
                );
              }
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageResponse.toObject(
                m.pagination,
                o
              );
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryPacketAcknowledgementsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryPacketAcknowledgementsResponse;
        })();
        v1.QueryUnreceivedPacketsRequest = (function () {
          function QueryUnreceivedPacketsRequest(p) {
            this.packetCommitmentSequences = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryUnreceivedPacketsRequest.prototype.portId = "";
          QueryUnreceivedPacketsRequest.prototype.channelId = "";
          QueryUnreceivedPacketsRequest.prototype.packetCommitmentSequences =
            $util.emptyArray;
          QueryUnreceivedPacketsRequest.create = function create(properties) {
            return new QueryUnreceivedPacketsRequest(properties);
          };
          QueryUnreceivedPacketsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (
              m.packetCommitmentSequences != null &&
              m.packetCommitmentSequences.length
            ) {
              w.uint32(26).fork();
              for (var i = 0; i < m.packetCommitmentSequences.length; ++i)
                w.uint64(m.packetCommitmentSequences[i]);
              w.ldelim();
            }
            return w;
          };
          QueryUnreceivedPacketsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryUnreceivedPacketsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  if (
                    !(
                      m.packetCommitmentSequences &&
                      m.packetCommitmentSequences.length
                    )
                  )
                    m.packetCommitmentSequences = [];
                  if ((t & 7) === 2) {
                    var c2 = r.uint32() + r.pos;
                    while (r.pos < c2)
                      m.packetCommitmentSequences.push(r.uint64());
                  } else m.packetCommitmentSequences.push(r.uint64());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryUnreceivedPacketsRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryUnreceivedPacketsRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryUnreceivedPacketsRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.packetCommitmentSequences) {
              if (!Array.isArray(d.packetCommitmentSequences))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryUnreceivedPacketsRequest.packetCommitmentSequences: array expected"
                );
              m.packetCommitmentSequences = [];
              for (var i = 0; i < d.packetCommitmentSequences.length; ++i) {
                if ($util.Long)
                  (m.packetCommitmentSequences[i] = $util.Long.fromValue(
                    d.packetCommitmentSequences[i]
                  )).unsigned = true;
                else if (typeof d.packetCommitmentSequences[i] === "string")
                  m.packetCommitmentSequences[i] = parseInt(
                    d.packetCommitmentSequences[i],
                    10
                  );
                else if (typeof d.packetCommitmentSequences[i] === "number")
                  m.packetCommitmentSequences[i] =
                    d.packetCommitmentSequences[i];
                else if (typeof d.packetCommitmentSequences[i] === "object")
                  m.packetCommitmentSequences[i] = new $util.LongBits(
                    d.packetCommitmentSequences[i].low >>> 0,
                    d.packetCommitmentSequences[i].high >>> 0
                  ).toNumber(true);
              }
            }
            return m;
          };
          QueryUnreceivedPacketsRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.packetCommitmentSequences = [];
            }
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (
              m.packetCommitmentSequences &&
              m.packetCommitmentSequences.length
            ) {
              d.packetCommitmentSequences = [];
              for (var j = 0; j < m.packetCommitmentSequences.length; ++j) {
                if (typeof m.packetCommitmentSequences[j] === "number")
                  d.packetCommitmentSequences[j] =
                    o.longs === String
                      ? String(m.packetCommitmentSequences[j])
                      : m.packetCommitmentSequences[j];
                else
                  d.packetCommitmentSequences[j] =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(
                          m.packetCommitmentSequences[j]
                        )
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.packetCommitmentSequences[j].low >>> 0,
                          m.packetCommitmentSequences[j].high >>> 0
                        ).toNumber(true)
                      : m.packetCommitmentSequences[j];
              }
            }
            return d;
          };
          QueryUnreceivedPacketsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryUnreceivedPacketsRequest;
        })();
        v1.QueryUnreceivedPacketsResponse = (function () {
          function QueryUnreceivedPacketsResponse(p) {
            this.sequences = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryUnreceivedPacketsResponse.prototype.sequences = $util.emptyArray;
          QueryUnreceivedPacketsResponse.prototype.height = null;
          QueryUnreceivedPacketsResponse.create = function create(properties) {
            return new QueryUnreceivedPacketsResponse(properties);
          };
          QueryUnreceivedPacketsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.sequences != null && m.sequences.length) {
              w.uint32(10).fork();
              for (var i = 0; i < m.sequences.length; ++i)
                w.uint64(m.sequences[i]);
              w.ldelim();
            }
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(18).fork()
              ).ldelim();
            return w;
          };
          QueryUnreceivedPacketsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryUnreceivedPacketsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.sequences && m.sequences.length)) m.sequences = [];
                  if ((t & 7) === 2) {
                    var c2 = r.uint32() + r.pos;
                    while (r.pos < c2) m.sequences.push(r.uint64());
                  } else m.sequences.push(r.uint64());
                  break;
                case 2:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryUnreceivedPacketsResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryUnreceivedPacketsResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryUnreceivedPacketsResponse();
            if (d.sequences) {
              if (!Array.isArray(d.sequences))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryUnreceivedPacketsResponse.sequences: array expected"
                );
              m.sequences = [];
              for (var i = 0; i < d.sequences.length; ++i) {
                if ($util.Long)
                  (m.sequences[i] = $util.Long.fromValue(
                    d.sequences[i]
                  )).unsigned = true;
                else if (typeof d.sequences[i] === "string")
                  m.sequences[i] = parseInt(d.sequences[i], 10);
                else if (typeof d.sequences[i] === "number")
                  m.sequences[i] = d.sequences[i];
                else if (typeof d.sequences[i] === "object")
                  m.sequences[i] = new $util.LongBits(
                    d.sequences[i].low >>> 0,
                    d.sequences[i].high >>> 0
                  ).toNumber(true);
              }
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryUnreceivedPacketsResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryUnreceivedPacketsResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.sequences = [];
            }
            if (o.defaults) {
              d.height = null;
            }
            if (m.sequences && m.sequences.length) {
              d.sequences = [];
              for (var j = 0; j < m.sequences.length; ++j) {
                if (typeof m.sequences[j] === "number")
                  d.sequences[j] =
                    o.longs === String
                      ? String(m.sequences[j])
                      : m.sequences[j];
                else
                  d.sequences[j] =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(m.sequences[j])
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.sequences[j].low >>> 0,
                          m.sequences[j].high >>> 0
                        ).toNumber(true)
                      : m.sequences[j];
              }
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryUnreceivedPacketsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryUnreceivedPacketsResponse;
        })();
        v1.QueryUnreceivedAcksRequest = (function () {
          function QueryUnreceivedAcksRequest(p) {
            this.packetAckSequences = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryUnreceivedAcksRequest.prototype.portId = "";
          QueryUnreceivedAcksRequest.prototype.channelId = "";
          QueryUnreceivedAcksRequest.prototype.packetAckSequences =
            $util.emptyArray;
          QueryUnreceivedAcksRequest.create = function create(properties) {
            return new QueryUnreceivedAcksRequest(properties);
          };
          QueryUnreceivedAcksRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            if (m.packetAckSequences != null && m.packetAckSequences.length) {
              w.uint32(26).fork();
              for (var i = 0; i < m.packetAckSequences.length; ++i)
                w.uint64(m.packetAckSequences[i]);
              w.ldelim();
            }
            return w;
          };
          QueryUnreceivedAcksRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryUnreceivedAcksRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                case 3:
                  if (!(m.packetAckSequences && m.packetAckSequences.length))
                    m.packetAckSequences = [];
                  if ((t & 7) === 2) {
                    var c2 = r.uint32() + r.pos;
                    while (r.pos < c2) m.packetAckSequences.push(r.uint64());
                  } else m.packetAckSequences.push(r.uint64());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryUnreceivedAcksRequest.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.channel.v1.QueryUnreceivedAcksRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryUnreceivedAcksRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            if (d.packetAckSequences) {
              if (!Array.isArray(d.packetAckSequences))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryUnreceivedAcksRequest.packetAckSequences: array expected"
                );
              m.packetAckSequences = [];
              for (var i = 0; i < d.packetAckSequences.length; ++i) {
                if ($util.Long)
                  (m.packetAckSequences[i] = $util.Long.fromValue(
                    d.packetAckSequences[i]
                  )).unsigned = true;
                else if (typeof d.packetAckSequences[i] === "string")
                  m.packetAckSequences[i] = parseInt(
                    d.packetAckSequences[i],
                    10
                  );
                else if (typeof d.packetAckSequences[i] === "number")
                  m.packetAckSequences[i] = d.packetAckSequences[i];
                else if (typeof d.packetAckSequences[i] === "object")
                  m.packetAckSequences[i] = new $util.LongBits(
                    d.packetAckSequences[i].low >>> 0,
                    d.packetAckSequences[i].high >>> 0
                  ).toNumber(true);
              }
            }
            return m;
          };
          QueryUnreceivedAcksRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.packetAckSequences = [];
            }
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            if (m.packetAckSequences && m.packetAckSequences.length) {
              d.packetAckSequences = [];
              for (var j = 0; j < m.packetAckSequences.length; ++j) {
                if (typeof m.packetAckSequences[j] === "number")
                  d.packetAckSequences[j] =
                    o.longs === String
                      ? String(m.packetAckSequences[j])
                      : m.packetAckSequences[j];
                else
                  d.packetAckSequences[j] =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(
                          m.packetAckSequences[j]
                        )
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.packetAckSequences[j].low >>> 0,
                          m.packetAckSequences[j].high >>> 0
                        ).toNumber(true)
                      : m.packetAckSequences[j];
              }
            }
            return d;
          };
          QueryUnreceivedAcksRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryUnreceivedAcksRequest;
        })();
        v1.QueryUnreceivedAcksResponse = (function () {
          function QueryUnreceivedAcksResponse(p) {
            this.sequences = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryUnreceivedAcksResponse.prototype.sequences = $util.emptyArray;
          QueryUnreceivedAcksResponse.prototype.height = null;
          QueryUnreceivedAcksResponse.create = function create(properties) {
            return new QueryUnreceivedAcksResponse(properties);
          };
          QueryUnreceivedAcksResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.sequences != null && m.sequences.length) {
              w.uint32(10).fork();
              for (var i = 0; i < m.sequences.length; ++i)
                w.uint64(m.sequences[i]);
              w.ldelim();
            }
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(18).fork()
              ).ldelim();
            return w;
          };
          QueryUnreceivedAcksResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryUnreceivedAcksResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.sequences && m.sequences.length)) m.sequences = [];
                  if ((t & 7) === 2) {
                    var c2 = r.uint32() + r.pos;
                    while (r.pos < c2) m.sequences.push(r.uint64());
                  } else m.sequences.push(r.uint64());
                  break;
                case 2:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryUnreceivedAcksResponse.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.channel.v1.QueryUnreceivedAcksResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryUnreceivedAcksResponse();
            if (d.sequences) {
              if (!Array.isArray(d.sequences))
                throw TypeError(
                  ".ibc.core.channel.v1.QueryUnreceivedAcksResponse.sequences: array expected"
                );
              m.sequences = [];
              for (var i = 0; i < d.sequences.length; ++i) {
                if ($util.Long)
                  (m.sequences[i] = $util.Long.fromValue(
                    d.sequences[i]
                  )).unsigned = true;
                else if (typeof d.sequences[i] === "string")
                  m.sequences[i] = parseInt(d.sequences[i], 10);
                else if (typeof d.sequences[i] === "number")
                  m.sequences[i] = d.sequences[i];
                else if (typeof d.sequences[i] === "object")
                  m.sequences[i] = new $util.LongBits(
                    d.sequences[i].low >>> 0,
                    d.sequences[i].high >>> 0
                  ).toNumber(true);
              }
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryUnreceivedAcksResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryUnreceivedAcksResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.sequences = [];
            }
            if (o.defaults) {
              d.height = null;
            }
            if (m.sequences && m.sequences.length) {
              d.sequences = [];
              for (var j = 0; j < m.sequences.length; ++j) {
                if (typeof m.sequences[j] === "number")
                  d.sequences[j] =
                    o.longs === String
                      ? String(m.sequences[j])
                      : m.sequences[j];
                else
                  d.sequences[j] =
                    o.longs === String
                      ? $util.Long.prototype.toString.call(m.sequences[j])
                      : o.longs === Number
                      ? new $util.LongBits(
                          m.sequences[j].low >>> 0,
                          m.sequences[j].high >>> 0
                        ).toNumber(true)
                      : m.sequences[j];
              }
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryUnreceivedAcksResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryUnreceivedAcksResponse;
        })();
        v1.QueryNextSequenceReceiveRequest = (function () {
          function QueryNextSequenceReceiveRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryNextSequenceReceiveRequest.prototype.portId = "";
          QueryNextSequenceReceiveRequest.prototype.channelId = "";
          QueryNextSequenceReceiveRequest.create = function create(properties) {
            return new QueryNextSequenceReceiveRequest(properties);
          };
          QueryNextSequenceReceiveRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.portId != null && Object.hasOwnProperty.call(m, "portId"))
              w.uint32(10).string(m.portId);
            if (
              m.channelId != null &&
              Object.hasOwnProperty.call(m, "channelId")
            )
              w.uint32(18).string(m.channelId);
            return w;
          };
          QueryNextSequenceReceiveRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryNextSequenceReceiveRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.portId = r.string();
                  break;
                case 2:
                  m.channelId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryNextSequenceReceiveRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryNextSequenceReceiveRequest
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryNextSequenceReceiveRequest();
            if (d.portId != null) {
              m.portId = String(d.portId);
            }
            if (d.channelId != null) {
              m.channelId = String(d.channelId);
            }
            return m;
          };
          QueryNextSequenceReceiveRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.portId = "";
              d.channelId = "";
            }
            if (m.portId != null && m.hasOwnProperty("portId")) {
              d.portId = m.portId;
            }
            if (m.channelId != null && m.hasOwnProperty("channelId")) {
              d.channelId = m.channelId;
            }
            return d;
          };
          QueryNextSequenceReceiveRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryNextSequenceReceiveRequest;
        })();
        v1.QueryNextSequenceReceiveResponse = (function () {
          function QueryNextSequenceReceiveResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryNextSequenceReceiveResponse.prototype.nextSequenceReceive = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryNextSequenceReceiveResponse.prototype.proof = $util.newBuffer(
            []
          );
          QueryNextSequenceReceiveResponse.prototype.proofHeight = null;
          QueryNextSequenceReceiveResponse.create = function create(
            properties
          ) {
            return new QueryNextSequenceReceiveResponse(properties);
          };
          QueryNextSequenceReceiveResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.nextSequenceReceive != null &&
              Object.hasOwnProperty.call(m, "nextSequenceReceive")
            )
              w.uint32(8).uint64(m.nextSequenceReceive);
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryNextSequenceReceiveResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.channel.v1.QueryNextSequenceReceiveResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.nextSequenceReceive = r.uint64();
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryNextSequenceReceiveResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.channel.v1.QueryNextSequenceReceiveResponse
            )
              return d;
            var m = new $root.ibc.core.channel.v1.QueryNextSequenceReceiveResponse();
            if (d.nextSequenceReceive != null) {
              if ($util.Long)
                (m.nextSequenceReceive = $util.Long.fromValue(
                  d.nextSequenceReceive
                )).unsigned = true;
              else if (typeof d.nextSequenceReceive === "string")
                m.nextSequenceReceive = parseInt(d.nextSequenceReceive, 10);
              else if (typeof d.nextSequenceReceive === "number")
                m.nextSequenceReceive = d.nextSequenceReceive;
              else if (typeof d.nextSequenceReceive === "object")
                m.nextSequenceReceive = new $util.LongBits(
                  d.nextSequenceReceive.low >>> 0,
                  d.nextSequenceReceive.high >>> 0
                ).toNumber(true);
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.channel.v1.QueryNextSequenceReceiveResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryNextSequenceReceiveResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.nextSequenceReceive =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.nextSequenceReceive = o.longs === String ? "0" : 0;
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (
              m.nextSequenceReceive != null &&
              m.hasOwnProperty("nextSequenceReceive")
            ) {
              if (typeof m.nextSequenceReceive === "number")
                d.nextSequenceReceive =
                  o.longs === String
                    ? String(m.nextSequenceReceive)
                    : m.nextSequenceReceive;
              else
                d.nextSequenceReceive =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.nextSequenceReceive)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.nextSequenceReceive.low >>> 0,
                        m.nextSequenceReceive.high >>> 0
                      ).toNumber(true)
                    : m.nextSequenceReceive;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryNextSequenceReceiveResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryNextSequenceReceiveResponse;
        })();
        return v1;
      })();
      return channel;
    })();
    core.client = (function () {
      const client = {};
      client.v1 = (function () {
        const v1 = {};
        v1.Msg = (function () {
          function Msg(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(
              this,
              rpcImpl,
              requestDelimited,
              responseDelimited
            );
          }
          (Msg.prototype = Object.create(
            $protobuf.rpc.Service.prototype
          )).constructor = Msg;
          Msg.create = function create(
            rpcImpl,
            requestDelimited,
            responseDelimited
          ) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
          };
          Object.defineProperty(
            (Msg.prototype.createClient = function createClient(
              request,
              callback
            ) {
              return this.rpcCall(
                createClient,
                $root.ibc.core.client.v1.MsgCreateClient,
                $root.ibc.core.client.v1.MsgCreateClientResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "CreateClient" }
          );
          Object.defineProperty(
            (Msg.prototype.updateClient = function updateClient(
              request,
              callback
            ) {
              return this.rpcCall(
                updateClient,
                $root.ibc.core.client.v1.MsgUpdateClient,
                $root.ibc.core.client.v1.MsgUpdateClientResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "UpdateClient" }
          );
          Object.defineProperty(
            (Msg.prototype.upgradeClient = function upgradeClient(
              request,
              callback
            ) {
              return this.rpcCall(
                upgradeClient,
                $root.ibc.core.client.v1.MsgUpgradeClient,
                $root.ibc.core.client.v1.MsgUpgradeClientResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "UpgradeClient" }
          );
          Object.defineProperty(
            (Msg.prototype.submitMisbehaviour = function submitMisbehaviour(
              request,
              callback
            ) {
              return this.rpcCall(
                submitMisbehaviour,
                $root.ibc.core.client.v1.MsgSubmitMisbehaviour,
                $root.ibc.core.client.v1.MsgSubmitMisbehaviourResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "SubmitMisbehaviour" }
          );
          return Msg;
        })();
        v1.MsgCreateClient = (function () {
          function MsgCreateClient(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgCreateClient.prototype.clientId = "";
          MsgCreateClient.prototype.clientState = null;
          MsgCreateClient.prototype.consensusState = null;
          MsgCreateClient.prototype.signer = "";
          MsgCreateClient.create = function create(properties) {
            return new MsgCreateClient(properties);
          };
          MsgCreateClient.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (
              m.clientState != null &&
              Object.hasOwnProperty.call(m, "clientState")
            )
              $root.google.protobuf.Any.encode(
                m.clientState,
                w.uint32(18).fork()
              ).ldelim();
            if (
              m.consensusState != null &&
              Object.hasOwnProperty.call(m, "consensusState")
            )
              $root.google.protobuf.Any.encode(
                m.consensusState,
                w.uint32(26).fork()
              ).ldelim();
            if (m.signer != null && Object.hasOwnProperty.call(m, "signer"))
              w.uint32(34).string(m.signer);
            return w;
          };
          MsgCreateClient.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgCreateClient();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  m.clientState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.consensusState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 4:
                  m.signer = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgCreateClient.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgCreateClient) return d;
            var m = new $root.ibc.core.client.v1.MsgCreateClient();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.clientState != null) {
              if (typeof d.clientState !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.MsgCreateClient.clientState: object expected"
                );
              m.clientState = $root.google.protobuf.Any.fromObject(
                d.clientState
              );
            }
            if (d.consensusState != null) {
              if (typeof d.consensusState !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.MsgCreateClient.consensusState: object expected"
                );
              m.consensusState = $root.google.protobuf.Any.fromObject(
                d.consensusState
              );
            }
            if (d.signer != null) {
              m.signer = String(d.signer);
            }
            return m;
          };
          MsgCreateClient.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
              d.clientState = null;
              d.consensusState = null;
              d.signer = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.clientState != null && m.hasOwnProperty("clientState")) {
              d.clientState = $root.google.protobuf.Any.toObject(
                m.clientState,
                o
              );
            }
            if (
              m.consensusState != null &&
              m.hasOwnProperty("consensusState")
            ) {
              d.consensusState = $root.google.protobuf.Any.toObject(
                m.consensusState,
                o
              );
            }
            if (m.signer != null && m.hasOwnProperty("signer")) {
              d.signer = m.signer;
            }
            return d;
          };
          MsgCreateClient.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgCreateClient;
        })();
        v1.MsgCreateClientResponse = (function () {
          function MsgCreateClientResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgCreateClientResponse.create = function create(properties) {
            return new MsgCreateClientResponse(properties);
          };
          MsgCreateClientResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            return w;
          };
          MsgCreateClientResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgCreateClientResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgCreateClientResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgCreateClientResponse)
              return d;
            return new $root.ibc.core.client.v1.MsgCreateClientResponse();
          };
          MsgCreateClientResponse.toObject = function toObject() {
            return {};
          };
          MsgCreateClientResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgCreateClientResponse;
        })();
        v1.MsgUpdateClient = (function () {
          function MsgUpdateClient(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgUpdateClient.prototype.clientId = "";
          MsgUpdateClient.prototype.header = null;
          MsgUpdateClient.prototype.signer = "";
          MsgUpdateClient.create = function create(properties) {
            return new MsgUpdateClient(properties);
          };
          MsgUpdateClient.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (m.header != null && Object.hasOwnProperty.call(m, "header"))
              $root.google.protobuf.Any.encode(
                m.header,
                w.uint32(18).fork()
              ).ldelim();
            if (m.signer != null && Object.hasOwnProperty.call(m, "signer"))
              w.uint32(26).string(m.signer);
            return w;
          };
          MsgUpdateClient.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgUpdateClient();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  m.header = $root.google.protobuf.Any.decode(r, r.uint32());
                  break;
                case 3:
                  m.signer = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgUpdateClient.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgUpdateClient) return d;
            var m = new $root.ibc.core.client.v1.MsgUpdateClient();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.header != null) {
              if (typeof d.header !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.MsgUpdateClient.header: object expected"
                );
              m.header = $root.google.protobuf.Any.fromObject(d.header);
            }
            if (d.signer != null) {
              m.signer = String(d.signer);
            }
            return m;
          };
          MsgUpdateClient.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
              d.header = null;
              d.signer = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.header != null && m.hasOwnProperty("header")) {
              d.header = $root.google.protobuf.Any.toObject(m.header, o);
            }
            if (m.signer != null && m.hasOwnProperty("signer")) {
              d.signer = m.signer;
            }
            return d;
          };
          MsgUpdateClient.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgUpdateClient;
        })();
        v1.MsgUpdateClientResponse = (function () {
          function MsgUpdateClientResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgUpdateClientResponse.create = function create(properties) {
            return new MsgUpdateClientResponse(properties);
          };
          MsgUpdateClientResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            return w;
          };
          MsgUpdateClientResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgUpdateClientResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgUpdateClientResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgUpdateClientResponse)
              return d;
            return new $root.ibc.core.client.v1.MsgUpdateClientResponse();
          };
          MsgUpdateClientResponse.toObject = function toObject() {
            return {};
          };
          MsgUpdateClientResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgUpdateClientResponse;
        })();
        v1.MsgUpgradeClient = (function () {
          function MsgUpgradeClient(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgUpgradeClient.prototype.clientId = "";
          MsgUpgradeClient.prototype.clientState = null;
          MsgUpgradeClient.prototype.upgradeHeight = null;
          MsgUpgradeClient.prototype.proofUpgrade = $util.newBuffer([]);
          MsgUpgradeClient.prototype.signer = "";
          MsgUpgradeClient.create = function create(properties) {
            return new MsgUpgradeClient(properties);
          };
          MsgUpgradeClient.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (
              m.clientState != null &&
              Object.hasOwnProperty.call(m, "clientState")
            )
              $root.google.protobuf.Any.encode(
                m.clientState,
                w.uint32(18).fork()
              ).ldelim();
            if (
              m.upgradeHeight != null &&
              Object.hasOwnProperty.call(m, "upgradeHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.upgradeHeight,
                w.uint32(26).fork()
              ).ldelim();
            if (
              m.proofUpgrade != null &&
              Object.hasOwnProperty.call(m, "proofUpgrade")
            )
              w.uint32(34).bytes(m.proofUpgrade);
            if (m.signer != null && Object.hasOwnProperty.call(m, "signer"))
              w.uint32(42).string(m.signer);
            return w;
          };
          MsgUpgradeClient.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgUpgradeClient();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  m.clientState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.upgradeHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 4:
                  m.proofUpgrade = r.bytes();
                  break;
                case 5:
                  m.signer = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgUpgradeClient.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgUpgradeClient)
              return d;
            var m = new $root.ibc.core.client.v1.MsgUpgradeClient();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.clientState != null) {
              if (typeof d.clientState !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.MsgUpgradeClient.clientState: object expected"
                );
              m.clientState = $root.google.protobuf.Any.fromObject(
                d.clientState
              );
            }
            if (d.upgradeHeight != null) {
              if (typeof d.upgradeHeight !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.MsgUpgradeClient.upgradeHeight: object expected"
                );
              m.upgradeHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.upgradeHeight
              );
            }
            if (d.proofUpgrade != null) {
              if (typeof d.proofUpgrade === "string")
                $util.base64.decode(
                  d.proofUpgrade,
                  (m.proofUpgrade = $util.newBuffer(
                    $util.base64.length(d.proofUpgrade)
                  )),
                  0
                );
              else if (d.proofUpgrade.length) m.proofUpgrade = d.proofUpgrade;
            }
            if (d.signer != null) {
              m.signer = String(d.signer);
            }
            return m;
          };
          MsgUpgradeClient.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
              d.clientState = null;
              d.upgradeHeight = null;
              if (o.bytes === String) d.proofUpgrade = "";
              else {
                d.proofUpgrade = [];
                if (o.bytes !== Array)
                  d.proofUpgrade = $util.newBuffer(d.proofUpgrade);
              }
              d.signer = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.clientState != null && m.hasOwnProperty("clientState")) {
              d.clientState = $root.google.protobuf.Any.toObject(
                m.clientState,
                o
              );
            }
            if (m.upgradeHeight != null && m.hasOwnProperty("upgradeHeight")) {
              d.upgradeHeight = $root.ibc.core.client.v1.Height.toObject(
                m.upgradeHeight,
                o
              );
            }
            if (m.proofUpgrade != null && m.hasOwnProperty("proofUpgrade")) {
              d.proofUpgrade =
                o.bytes === String
                  ? $util.base64.encode(
                      m.proofUpgrade,
                      0,
                      m.proofUpgrade.length
                    )
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proofUpgrade)
                  : m.proofUpgrade;
            }
            if (m.signer != null && m.hasOwnProperty("signer")) {
              d.signer = m.signer;
            }
            return d;
          };
          MsgUpgradeClient.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgUpgradeClient;
        })();
        v1.MsgUpgradeClientResponse = (function () {
          function MsgUpgradeClientResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgUpgradeClientResponse.create = function create(properties) {
            return new MsgUpgradeClientResponse(properties);
          };
          MsgUpgradeClientResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            return w;
          };
          MsgUpgradeClientResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgUpgradeClientResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgUpgradeClientResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgUpgradeClientResponse)
              return d;
            return new $root.ibc.core.client.v1.MsgUpgradeClientResponse();
          };
          MsgUpgradeClientResponse.toObject = function toObject() {
            return {};
          };
          MsgUpgradeClientResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgUpgradeClientResponse;
        })();
        v1.MsgSubmitMisbehaviour = (function () {
          function MsgSubmitMisbehaviour(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgSubmitMisbehaviour.prototype.clientId = "";
          MsgSubmitMisbehaviour.prototype.misbehaviour = null;
          MsgSubmitMisbehaviour.prototype.signer = "";
          MsgSubmitMisbehaviour.create = function create(properties) {
            return new MsgSubmitMisbehaviour(properties);
          };
          MsgSubmitMisbehaviour.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (
              m.misbehaviour != null &&
              Object.hasOwnProperty.call(m, "misbehaviour")
            )
              $root.google.protobuf.Any.encode(
                m.misbehaviour,
                w.uint32(18).fork()
              ).ldelim();
            if (m.signer != null && Object.hasOwnProperty.call(m, "signer"))
              w.uint32(26).string(m.signer);
            return w;
          };
          MsgSubmitMisbehaviour.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgSubmitMisbehaviour();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  m.misbehaviour = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.signer = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgSubmitMisbehaviour.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.MsgSubmitMisbehaviour)
              return d;
            var m = new $root.ibc.core.client.v1.MsgSubmitMisbehaviour();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.misbehaviour != null) {
              if (typeof d.misbehaviour !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.MsgSubmitMisbehaviour.misbehaviour: object expected"
                );
              m.misbehaviour = $root.google.protobuf.Any.fromObject(
                d.misbehaviour
              );
            }
            if (d.signer != null) {
              m.signer = String(d.signer);
            }
            return m;
          };
          MsgSubmitMisbehaviour.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
              d.misbehaviour = null;
              d.signer = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.misbehaviour != null && m.hasOwnProperty("misbehaviour")) {
              d.misbehaviour = $root.google.protobuf.Any.toObject(
                m.misbehaviour,
                o
              );
            }
            if (m.signer != null && m.hasOwnProperty("signer")) {
              d.signer = m.signer;
            }
            return d;
          };
          MsgSubmitMisbehaviour.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgSubmitMisbehaviour;
        })();
        v1.MsgSubmitMisbehaviourResponse = (function () {
          function MsgSubmitMisbehaviourResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgSubmitMisbehaviourResponse.create = function create(properties) {
            return new MsgSubmitMisbehaviourResponse(properties);
          };
          MsgSubmitMisbehaviourResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            return w;
          };
          MsgSubmitMisbehaviourResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.MsgSubmitMisbehaviourResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgSubmitMisbehaviourResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.client.v1.MsgSubmitMisbehaviourResponse
            )
              return d;
            return new $root.ibc.core.client.v1.MsgSubmitMisbehaviourResponse();
          };
          MsgSubmitMisbehaviourResponse.toObject = function toObject() {
            return {};
          };
          MsgSubmitMisbehaviourResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MsgSubmitMisbehaviourResponse;
        })();
        v1.IdentifiedClientState = (function () {
          function IdentifiedClientState(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          IdentifiedClientState.prototype.clientId = "";
          IdentifiedClientState.prototype.clientState = null;
          IdentifiedClientState.create = function create(properties) {
            return new IdentifiedClientState(properties);
          };
          IdentifiedClientState.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (
              m.clientState != null &&
              Object.hasOwnProperty.call(m, "clientState")
            )
              $root.google.protobuf.Any.encode(
                m.clientState,
                w.uint32(18).fork()
              ).ldelim();
            return w;
          };
          IdentifiedClientState.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.IdentifiedClientState();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  m.clientState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          IdentifiedClientState.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.IdentifiedClientState)
              return d;
            var m = new $root.ibc.core.client.v1.IdentifiedClientState();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.clientState != null) {
              if (typeof d.clientState !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.IdentifiedClientState.clientState: object expected"
                );
              m.clientState = $root.google.protobuf.Any.fromObject(
                d.clientState
              );
            }
            return m;
          };
          IdentifiedClientState.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
              d.clientState = null;
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.clientState != null && m.hasOwnProperty("clientState")) {
              d.clientState = $root.google.protobuf.Any.toObject(
                m.clientState,
                o
              );
            }
            return d;
          };
          IdentifiedClientState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return IdentifiedClientState;
        })();
        v1.ConsensusStateWithHeight = (function () {
          function ConsensusStateWithHeight(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          ConsensusStateWithHeight.prototype.height = null;
          ConsensusStateWithHeight.prototype.consensusState = null;
          ConsensusStateWithHeight.create = function create(properties) {
            return new ConsensusStateWithHeight(properties);
          };
          ConsensusStateWithHeight.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(10).fork()
              ).ldelim();
            if (
              m.consensusState != null &&
              Object.hasOwnProperty.call(m, "consensusState")
            )
              $root.google.protobuf.Any.encode(
                m.consensusState,
                w.uint32(18).fork()
              ).ldelim();
            return w;
          };
          ConsensusStateWithHeight.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.ConsensusStateWithHeight();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.consensusState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ConsensusStateWithHeight.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.ConsensusStateWithHeight)
              return d;
            var m = new $root.ibc.core.client.v1.ConsensusStateWithHeight();
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.ConsensusStateWithHeight.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            if (d.consensusState != null) {
              if (typeof d.consensusState !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.ConsensusStateWithHeight.consensusState: object expected"
                );
              m.consensusState = $root.google.protobuf.Any.fromObject(
                d.consensusState
              );
            }
            return m;
          };
          ConsensusStateWithHeight.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.height = null;
              d.consensusState = null;
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            if (
              m.consensusState != null &&
              m.hasOwnProperty("consensusState")
            ) {
              d.consensusState = $root.google.protobuf.Any.toObject(
                m.consensusState,
                o
              );
            }
            return d;
          };
          ConsensusStateWithHeight.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return ConsensusStateWithHeight;
        })();
        v1.ClientConsensusStates = (function () {
          function ClientConsensusStates(p) {
            this.consensusStates = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          ClientConsensusStates.prototype.clientId = "";
          ClientConsensusStates.prototype.consensusStates = $util.emptyArray;
          ClientConsensusStates.create = function create(properties) {
            return new ClientConsensusStates(properties);
          };
          ClientConsensusStates.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (m.consensusStates != null && m.consensusStates.length) {
              for (var i = 0; i < m.consensusStates.length; ++i)
                $root.ibc.core.client.v1.ConsensusStateWithHeight.encode(
                  m.consensusStates[i],
                  w.uint32(18).fork()
                ).ldelim();
            }
            return w;
          };
          ClientConsensusStates.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.ClientConsensusStates();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  if (!(m.consensusStates && m.consensusStates.length))
                    m.consensusStates = [];
                  m.consensusStates.push(
                    $root.ibc.core.client.v1.ConsensusStateWithHeight.decode(
                      r,
                      r.uint32()
                    )
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ClientConsensusStates.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.ClientConsensusStates)
              return d;
            var m = new $root.ibc.core.client.v1.ClientConsensusStates();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.consensusStates) {
              if (!Array.isArray(d.consensusStates))
                throw TypeError(
                  ".ibc.core.client.v1.ClientConsensusStates.consensusStates: array expected"
                );
              m.consensusStates = [];
              for (var i = 0; i < d.consensusStates.length; ++i) {
                if (typeof d.consensusStates[i] !== "object")
                  throw TypeError(
                    ".ibc.core.client.v1.ClientConsensusStates.consensusStates: object expected"
                  );
                m.consensusStates[
                  i
                ] = $root.ibc.core.client.v1.ConsensusStateWithHeight.fromObject(
                  d.consensusStates[i]
                );
              }
            }
            return m;
          };
          ClientConsensusStates.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.consensusStates = [];
            }
            if (o.defaults) {
              d.clientId = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.consensusStates && m.consensusStates.length) {
              d.consensusStates = [];
              for (var j = 0; j < m.consensusStates.length; ++j) {
                d.consensusStates[
                  j
                ] = $root.ibc.core.client.v1.ConsensusStateWithHeight.toObject(
                  m.consensusStates[j],
                  o
                );
              }
            }
            return d;
          };
          ClientConsensusStates.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return ClientConsensusStates;
        })();
        v1.ClientUpdateProposal = (function () {
          function ClientUpdateProposal(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          ClientUpdateProposal.prototype.title = "";
          ClientUpdateProposal.prototype.description = "";
          ClientUpdateProposal.prototype.clientId = "";
          ClientUpdateProposal.prototype.header = null;
          ClientUpdateProposal.create = function create(properties) {
            return new ClientUpdateProposal(properties);
          };
          ClientUpdateProposal.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.title != null && Object.hasOwnProperty.call(m, "title"))
              w.uint32(10).string(m.title);
            if (
              m.description != null &&
              Object.hasOwnProperty.call(m, "description")
            )
              w.uint32(18).string(m.description);
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(26).string(m.clientId);
            if (m.header != null && Object.hasOwnProperty.call(m, "header"))
              $root.google.protobuf.Any.encode(
                m.header,
                w.uint32(34).fork()
              ).ldelim();
            return w;
          };
          ClientUpdateProposal.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.ClientUpdateProposal();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.title = r.string();
                  break;
                case 2:
                  m.description = r.string();
                  break;
                case 3:
                  m.clientId = r.string();
                  break;
                case 4:
                  m.header = $root.google.protobuf.Any.decode(r, r.uint32());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ClientUpdateProposal.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.ClientUpdateProposal)
              return d;
            var m = new $root.ibc.core.client.v1.ClientUpdateProposal();
            if (d.title != null) {
              m.title = String(d.title);
            }
            if (d.description != null) {
              m.description = String(d.description);
            }
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.header != null) {
              if (typeof d.header !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.ClientUpdateProposal.header: object expected"
                );
              m.header = $root.google.protobuf.Any.fromObject(d.header);
            }
            return m;
          };
          ClientUpdateProposal.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.title = "";
              d.description = "";
              d.clientId = "";
              d.header = null;
            }
            if (m.title != null && m.hasOwnProperty("title")) {
              d.title = m.title;
            }
            if (m.description != null && m.hasOwnProperty("description")) {
              d.description = m.description;
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.header != null && m.hasOwnProperty("header")) {
              d.header = $root.google.protobuf.Any.toObject(m.header, o);
            }
            return d;
          };
          ClientUpdateProposal.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return ClientUpdateProposal;
        })();
        v1.Height = (function () {
          function Height(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Height.prototype.versionNumber = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          Height.prototype.versionHeight = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          Height.create = function create(properties) {
            return new Height(properties);
          };
          Height.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.versionNumber != null &&
              Object.hasOwnProperty.call(m, "versionNumber")
            )
              w.uint32(8).uint64(m.versionNumber);
            if (
              m.versionHeight != null &&
              Object.hasOwnProperty.call(m, "versionHeight")
            )
              w.uint32(16).uint64(m.versionHeight);
            return w;
          };
          Height.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.Height();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.versionNumber = r.uint64();
                  break;
                case 2:
                  m.versionHeight = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Height.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.Height) return d;
            var m = new $root.ibc.core.client.v1.Height();
            if (d.versionNumber != null) {
              if ($util.Long)
                (m.versionNumber = $util.Long.fromValue(
                  d.versionNumber
                )).unsigned = true;
              else if (typeof d.versionNumber === "string")
                m.versionNumber = parseInt(d.versionNumber, 10);
              else if (typeof d.versionNumber === "number")
                m.versionNumber = d.versionNumber;
              else if (typeof d.versionNumber === "object")
                m.versionNumber = new $util.LongBits(
                  d.versionNumber.low >>> 0,
                  d.versionNumber.high >>> 0
                ).toNumber(true);
            }
            if (d.versionHeight != null) {
              if ($util.Long)
                (m.versionHeight = $util.Long.fromValue(
                  d.versionHeight
                )).unsigned = true;
              else if (typeof d.versionHeight === "string")
                m.versionHeight = parseInt(d.versionHeight, 10);
              else if (typeof d.versionHeight === "number")
                m.versionHeight = d.versionHeight;
              else if (typeof d.versionHeight === "object")
                m.versionHeight = new $util.LongBits(
                  d.versionHeight.low >>> 0,
                  d.versionHeight.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          Height.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.versionNumber =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.versionNumber = o.longs === String ? "0" : 0;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.versionHeight =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.versionHeight = o.longs === String ? "0" : 0;
            }
            if (m.versionNumber != null && m.hasOwnProperty("versionNumber")) {
              if (typeof m.versionNumber === "number")
                d.versionNumber =
                  o.longs === String
                    ? String(m.versionNumber)
                    : m.versionNumber;
              else
                d.versionNumber =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.versionNumber)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.versionNumber.low >>> 0,
                        m.versionNumber.high >>> 0
                      ).toNumber(true)
                    : m.versionNumber;
            }
            if (m.versionHeight != null && m.hasOwnProperty("versionHeight")) {
              if (typeof m.versionHeight === "number")
                d.versionHeight =
                  o.longs === String
                    ? String(m.versionHeight)
                    : m.versionHeight;
              else
                d.versionHeight =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.versionHeight)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.versionHeight.low >>> 0,
                        m.versionHeight.high >>> 0
                      ).toNumber(true)
                    : m.versionHeight;
            }
            return d;
          };
          Height.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Height;
        })();
        return v1;
      })();
      return client;
    })();
    core.commitment = (function () {
      const commitment = {};
      commitment.v1 = (function () {
        const v1 = {};
        v1.MerkleRoot = (function () {
          function MerkleRoot(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MerkleRoot.prototype.hash = $util.newBuffer([]);
          MerkleRoot.create = function create(properties) {
            return new MerkleRoot(properties);
          };
          MerkleRoot.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
              w.uint32(10).bytes(m.hash);
            return w;
          };
          MerkleRoot.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.commitment.v1.MerkleRoot();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.hash = r.bytes();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MerkleRoot.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.commitment.v1.MerkleRoot) return d;
            var m = new $root.ibc.core.commitment.v1.MerkleRoot();
            if (d.hash != null) {
              if (typeof d.hash === "string")
                $util.base64.decode(
                  d.hash,
                  (m.hash = $util.newBuffer($util.base64.length(d.hash))),
                  0
                );
              else if (d.hash.length) m.hash = d.hash;
            }
            return m;
          };
          MerkleRoot.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.hash = "";
              else {
                d.hash = [];
                if (o.bytes !== Array) d.hash = $util.newBuffer(d.hash);
              }
            }
            if (m.hash != null && m.hasOwnProperty("hash")) {
              d.hash =
                o.bytes === String
                  ? $util.base64.encode(m.hash, 0, m.hash.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.hash)
                  : m.hash;
            }
            return d;
          };
          MerkleRoot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MerkleRoot;
        })();
        v1.MerklePrefix = (function () {
          function MerklePrefix(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MerklePrefix.prototype.keyPrefix = $util.newBuffer([]);
          MerklePrefix.create = function create(properties) {
            return new MerklePrefix(properties);
          };
          MerklePrefix.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.keyPrefix != null &&
              Object.hasOwnProperty.call(m, "keyPrefix")
            )
              w.uint32(10).bytes(m.keyPrefix);
            return w;
          };
          MerklePrefix.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.commitment.v1.MerklePrefix();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.keyPrefix = r.bytes();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MerklePrefix.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.commitment.v1.MerklePrefix)
              return d;
            var m = new $root.ibc.core.commitment.v1.MerklePrefix();
            if (d.keyPrefix != null) {
              if (typeof d.keyPrefix === "string")
                $util.base64.decode(
                  d.keyPrefix,
                  (m.keyPrefix = $util.newBuffer(
                    $util.base64.length(d.keyPrefix)
                  )),
                  0
                );
              else if (d.keyPrefix.length) m.keyPrefix = d.keyPrefix;
            }
            return m;
          };
          MerklePrefix.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.keyPrefix = "";
              else {
                d.keyPrefix = [];
                if (o.bytes !== Array)
                  d.keyPrefix = $util.newBuffer(d.keyPrefix);
              }
            }
            if (m.keyPrefix != null && m.hasOwnProperty("keyPrefix")) {
              d.keyPrefix =
                o.bytes === String
                  ? $util.base64.encode(m.keyPrefix, 0, m.keyPrefix.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.keyPrefix)
                  : m.keyPrefix;
            }
            return d;
          };
          MerklePrefix.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MerklePrefix;
        })();
        v1.MerklePath = (function () {
          function MerklePath(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MerklePath.prototype.keyPath = null;
          MerklePath.create = function create(properties) {
            return new MerklePath(properties);
          };
          MerklePath.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.keyPath != null && Object.hasOwnProperty.call(m, "keyPath"))
              $root.ibc.core.commitment.v1.KeyPath.encode(
                m.keyPath,
                w.uint32(10).fork()
              ).ldelim();
            return w;
          };
          MerklePath.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.commitment.v1.MerklePath();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.keyPath = $root.ibc.core.commitment.v1.KeyPath.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MerklePath.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.commitment.v1.MerklePath) return d;
            var m = new $root.ibc.core.commitment.v1.MerklePath();
            if (d.keyPath != null) {
              if (typeof d.keyPath !== "object")
                throw TypeError(
                  ".ibc.core.commitment.v1.MerklePath.keyPath: object expected"
                );
              m.keyPath = $root.ibc.core.commitment.v1.KeyPath.fromObject(
                d.keyPath
              );
            }
            return m;
          };
          MerklePath.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.keyPath = null;
            }
            if (m.keyPath != null && m.hasOwnProperty("keyPath")) {
              d.keyPath = $root.ibc.core.commitment.v1.KeyPath.toObject(
                m.keyPath,
                o
              );
            }
            return d;
          };
          MerklePath.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MerklePath;
        })();
        v1.MerkleProof = (function () {
          function MerkleProof(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MerkleProof.prototype.proof = null;
          MerkleProof.create = function create(properties) {
            return new MerkleProof(properties);
          };
          MerkleProof.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              $root.tendermint.crypto.ProofOps.encode(
                m.proof,
                w.uint32(10).fork()
              ).ldelim();
            return w;
          };
          MerkleProof.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.commitment.v1.MerkleProof();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.proof = $root.tendermint.crypto.ProofOps.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MerkleProof.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.commitment.v1.MerkleProof) return d;
            var m = new $root.ibc.core.commitment.v1.MerkleProof();
            if (d.proof != null) {
              if (typeof d.proof !== "object")
                throw TypeError(
                  ".ibc.core.commitment.v1.MerkleProof.proof: object expected"
                );
              m.proof = $root.tendermint.crypto.ProofOps.fromObject(d.proof);
            }
            return m;
          };
          MerkleProof.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.proof = null;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof = $root.tendermint.crypto.ProofOps.toObject(m.proof, o);
            }
            return d;
          };
          MerkleProof.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return MerkleProof;
        })();
        v1.KeyPath = (function () {
          function KeyPath(p) {
            this.keys = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          KeyPath.prototype.keys = $util.emptyArray;
          KeyPath.create = function create(properties) {
            return new KeyPath(properties);
          };
          KeyPath.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.keys != null && m.keys.length) {
              for (var i = 0; i < m.keys.length; ++i)
                $root.ibc.core.commitment.v1.Key.encode(
                  m.keys[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            return w;
          };
          KeyPath.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.commitment.v1.KeyPath();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.keys && m.keys.length)) m.keys = [];
                  m.keys.push(
                    $root.ibc.core.commitment.v1.Key.decode(r, r.uint32())
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          KeyPath.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.commitment.v1.KeyPath) return d;
            var m = new $root.ibc.core.commitment.v1.KeyPath();
            if (d.keys) {
              if (!Array.isArray(d.keys))
                throw TypeError(
                  ".ibc.core.commitment.v1.KeyPath.keys: array expected"
                );
              m.keys = [];
              for (var i = 0; i < d.keys.length; ++i) {
                if (typeof d.keys[i] !== "object")
                  throw TypeError(
                    ".ibc.core.commitment.v1.KeyPath.keys: object expected"
                  );
                m.keys[i] = $root.ibc.core.commitment.v1.Key.fromObject(
                  d.keys[i]
                );
              }
            }
            return m;
          };
          KeyPath.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.keys = [];
            }
            if (m.keys && m.keys.length) {
              d.keys = [];
              for (var j = 0; j < m.keys.length; ++j) {
                d.keys[j] = $root.ibc.core.commitment.v1.Key.toObject(
                  m.keys[j],
                  o
                );
              }
            }
            return d;
          };
          KeyPath.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return KeyPath;
        })();
        v1.Key = (function () {
          function Key(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Key.prototype.name = $util.newBuffer([]);
          Key.prototype.enc = 0;
          Key.create = function create(properties) {
            return new Key(properties);
          };
          Key.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.name != null && Object.hasOwnProperty.call(m, "name"))
              w.uint32(10).bytes(m.name);
            if (m.enc != null && Object.hasOwnProperty.call(m, "enc"))
              w.uint32(16).int32(m.enc);
            return w;
          };
          Key.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.commitment.v1.Key();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.name = r.bytes();
                  break;
                case 2:
                  m.enc = r.int32();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Key.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.commitment.v1.Key) return d;
            var m = new $root.ibc.core.commitment.v1.Key();
            if (d.name != null) {
              if (typeof d.name === "string")
                $util.base64.decode(
                  d.name,
                  (m.name = $util.newBuffer($util.base64.length(d.name))),
                  0
                );
              else if (d.name.length) m.name = d.name;
            }
            switch (d.enc) {
              case "KEY_ENCODING_URL_UNSPECIFIED":
              case 0:
                m.enc = 0;
                break;
              case "KEY_ENCODING_HEX":
              case 1:
                m.enc = 1;
                break;
            }
            return m;
          };
          Key.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              if (o.bytes === String) d.name = "";
              else {
                d.name = [];
                if (o.bytes !== Array) d.name = $util.newBuffer(d.name);
              }
              d.enc = o.enums === String ? "KEY_ENCODING_URL_UNSPECIFIED" : 0;
            }
            if (m.name != null && m.hasOwnProperty("name")) {
              d.name =
                o.bytes === String
                  ? $util.base64.encode(m.name, 0, m.name.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.name)
                  : m.name;
            }
            if (m.enc != null && m.hasOwnProperty("enc")) {
              d.enc =
                o.enums === String
                  ? $root.ibc.core.commitment.v1.KeyEncoding[m.enc]
                  : m.enc;
            }
            return d;
          };
          Key.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Key;
        })();
        v1.KeyEncoding = (function () {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "KEY_ENCODING_URL_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "KEY_ENCODING_HEX")] = 1;
          return values;
        })();
        return v1;
      })();
      return commitment;
    })();
    core.connection = (function () {
      const connection = {};
      connection.v1 = (function () {
        const v1 = {};
        v1.ConnectionEnd = (function () {
          function ConnectionEnd(p) {
            this.versions = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          ConnectionEnd.prototype.clientId = "";
          ConnectionEnd.prototype.versions = $util.emptyArray;
          ConnectionEnd.prototype.state = 0;
          ConnectionEnd.prototype.counterparty = null;
          ConnectionEnd.create = function create(properties) {
            return new ConnectionEnd(properties);
          };
          ConnectionEnd.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (m.versions != null && m.versions.length) {
              for (var i = 0; i < m.versions.length; ++i)
                $root.ibc.core.connection.v1.Version.encode(
                  m.versions[i],
                  w.uint32(18).fork()
                ).ldelim();
            }
            if (m.state != null && Object.hasOwnProperty.call(m, "state"))
              w.uint32(24).int32(m.state);
            if (
              m.counterparty != null &&
              Object.hasOwnProperty.call(m, "counterparty")
            )
              $root.ibc.core.connection.v1.Counterparty.encode(
                m.counterparty,
                w.uint32(34).fork()
              ).ldelim();
            return w;
          };
          ConnectionEnd.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.ConnectionEnd();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  if (!(m.versions && m.versions.length)) m.versions = [];
                  m.versions.push(
                    $root.ibc.core.connection.v1.Version.decode(r, r.uint32())
                  );
                  break;
                case 3:
                  m.state = r.int32();
                  break;
                case 4:
                  m.counterparty = $root.ibc.core.connection.v1.Counterparty.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ConnectionEnd.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.connection.v1.ConnectionEnd)
              return d;
            var m = new $root.ibc.core.connection.v1.ConnectionEnd();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.versions) {
              if (!Array.isArray(d.versions))
                throw TypeError(
                  ".ibc.core.connection.v1.ConnectionEnd.versions: array expected"
                );
              m.versions = [];
              for (var i = 0; i < d.versions.length; ++i) {
                if (typeof d.versions[i] !== "object")
                  throw TypeError(
                    ".ibc.core.connection.v1.ConnectionEnd.versions: object expected"
                  );
                m.versions[i] = $root.ibc.core.connection.v1.Version.fromObject(
                  d.versions[i]
                );
              }
            }
            switch (d.state) {
              case "STATE_UNINITIALIZED_UNSPECIFIED":
              case 0:
                m.state = 0;
                break;
              case "STATE_INIT":
              case 1:
                m.state = 1;
                break;
              case "STATE_TRYOPEN":
              case 2:
                m.state = 2;
                break;
              case "STATE_OPEN":
              case 3:
                m.state = 3;
                break;
            }
            if (d.counterparty != null) {
              if (typeof d.counterparty !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.ConnectionEnd.counterparty: object expected"
                );
              m.counterparty = $root.ibc.core.connection.v1.Counterparty.fromObject(
                d.counterparty
              );
            }
            return m;
          };
          ConnectionEnd.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.versions = [];
            }
            if (o.defaults) {
              d.clientId = "";
              d.state =
                o.enums === String ? "STATE_UNINITIALIZED_UNSPECIFIED" : 0;
              d.counterparty = null;
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.versions && m.versions.length) {
              d.versions = [];
              for (var j = 0; j < m.versions.length; ++j) {
                d.versions[j] = $root.ibc.core.connection.v1.Version.toObject(
                  m.versions[j],
                  o
                );
              }
            }
            if (m.state != null && m.hasOwnProperty("state")) {
              d.state =
                o.enums === String
                  ? $root.ibc.core.connection.v1.State[m.state]
                  : m.state;
            }
            if (m.counterparty != null && m.hasOwnProperty("counterparty")) {
              d.counterparty = $root.ibc.core.connection.v1.Counterparty.toObject(
                m.counterparty,
                o
              );
            }
            return d;
          };
          ConnectionEnd.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return ConnectionEnd;
        })();
        v1.IdentifiedConnection = (function () {
          function IdentifiedConnection(p) {
            this.versions = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          IdentifiedConnection.prototype.id = "";
          IdentifiedConnection.prototype.clientId = "";
          IdentifiedConnection.prototype.versions = $util.emptyArray;
          IdentifiedConnection.prototype.state = 0;
          IdentifiedConnection.prototype.counterparty = null;
          IdentifiedConnection.create = function create(properties) {
            return new IdentifiedConnection(properties);
          };
          IdentifiedConnection.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.id != null && Object.hasOwnProperty.call(m, "id"))
              w.uint32(10).string(m.id);
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(18).string(m.clientId);
            if (m.versions != null && m.versions.length) {
              for (var i = 0; i < m.versions.length; ++i)
                $root.ibc.core.connection.v1.Version.encode(
                  m.versions[i],
                  w.uint32(26).fork()
                ).ldelim();
            }
            if (m.state != null && Object.hasOwnProperty.call(m, "state"))
              w.uint32(32).int32(m.state);
            if (
              m.counterparty != null &&
              Object.hasOwnProperty.call(m, "counterparty")
            )
              $root.ibc.core.connection.v1.Counterparty.encode(
                m.counterparty,
                w.uint32(42).fork()
              ).ldelim();
            return w;
          };
          IdentifiedConnection.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.IdentifiedConnection();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.id = r.string();
                  break;
                case 2:
                  m.clientId = r.string();
                  break;
                case 3:
                  if (!(m.versions && m.versions.length)) m.versions = [];
                  m.versions.push(
                    $root.ibc.core.connection.v1.Version.decode(r, r.uint32())
                  );
                  break;
                case 4:
                  m.state = r.int32();
                  break;
                case 5:
                  m.counterparty = $root.ibc.core.connection.v1.Counterparty.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          IdentifiedConnection.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.connection.v1.IdentifiedConnection)
              return d;
            var m = new $root.ibc.core.connection.v1.IdentifiedConnection();
            if (d.id != null) {
              m.id = String(d.id);
            }
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.versions) {
              if (!Array.isArray(d.versions))
                throw TypeError(
                  ".ibc.core.connection.v1.IdentifiedConnection.versions: array expected"
                );
              m.versions = [];
              for (var i = 0; i < d.versions.length; ++i) {
                if (typeof d.versions[i] !== "object")
                  throw TypeError(
                    ".ibc.core.connection.v1.IdentifiedConnection.versions: object expected"
                  );
                m.versions[i] = $root.ibc.core.connection.v1.Version.fromObject(
                  d.versions[i]
                );
              }
            }
            switch (d.state) {
              case "STATE_UNINITIALIZED_UNSPECIFIED":
              case 0:
                m.state = 0;
                break;
              case "STATE_INIT":
              case 1:
                m.state = 1;
                break;
              case "STATE_TRYOPEN":
              case 2:
                m.state = 2;
                break;
              case "STATE_OPEN":
              case 3:
                m.state = 3;
                break;
            }
            if (d.counterparty != null) {
              if (typeof d.counterparty !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.IdentifiedConnection.counterparty: object expected"
                );
              m.counterparty = $root.ibc.core.connection.v1.Counterparty.fromObject(
                d.counterparty
              );
            }
            return m;
          };
          IdentifiedConnection.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.versions = [];
            }
            if (o.defaults) {
              d.id = "";
              d.clientId = "";
              d.state =
                o.enums === String ? "STATE_UNINITIALIZED_UNSPECIFIED" : 0;
              d.counterparty = null;
            }
            if (m.id != null && m.hasOwnProperty("id")) {
              d.id = m.id;
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.versions && m.versions.length) {
              d.versions = [];
              for (var j = 0; j < m.versions.length; ++j) {
                d.versions[j] = $root.ibc.core.connection.v1.Version.toObject(
                  m.versions[j],
                  o
                );
              }
            }
            if (m.state != null && m.hasOwnProperty("state")) {
              d.state =
                o.enums === String
                  ? $root.ibc.core.connection.v1.State[m.state]
                  : m.state;
            }
            if (m.counterparty != null && m.hasOwnProperty("counterparty")) {
              d.counterparty = $root.ibc.core.connection.v1.Counterparty.toObject(
                m.counterparty,
                o
              );
            }
            return d;
          };
          IdentifiedConnection.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return IdentifiedConnection;
        })();
        v1.State = (function () {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "STATE_UNINITIALIZED_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "STATE_INIT")] = 1;
          values[(valuesById[2] = "STATE_TRYOPEN")] = 2;
          values[(valuesById[3] = "STATE_OPEN")] = 3;
          return values;
        })();
        v1.Counterparty = (function () {
          function Counterparty(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Counterparty.prototype.clientId = "";
          Counterparty.prototype.connectionId = "";
          Counterparty.prototype.prefix = null;
          Counterparty.create = function create(properties) {
            return new Counterparty(properties);
          };
          Counterparty.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (
              m.connectionId != null &&
              Object.hasOwnProperty.call(m, "connectionId")
            )
              w.uint32(18).string(m.connectionId);
            if (m.prefix != null && Object.hasOwnProperty.call(m, "prefix"))
              $root.ibc.core.commitment.v1.MerklePrefix.encode(
                m.prefix,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          Counterparty.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.Counterparty();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  m.connectionId = r.string();
                  break;
                case 3:
                  m.prefix = $root.ibc.core.commitment.v1.MerklePrefix.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Counterparty.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.connection.v1.Counterparty)
              return d;
            var m = new $root.ibc.core.connection.v1.Counterparty();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.connectionId != null) {
              m.connectionId = String(d.connectionId);
            }
            if (d.prefix != null) {
              if (typeof d.prefix !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.Counterparty.prefix: object expected"
                );
              m.prefix = $root.ibc.core.commitment.v1.MerklePrefix.fromObject(
                d.prefix
              );
            }
            return m;
          };
          Counterparty.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
              d.connectionId = "";
              d.prefix = null;
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.connectionId != null && m.hasOwnProperty("connectionId")) {
              d.connectionId = m.connectionId;
            }
            if (m.prefix != null && m.hasOwnProperty("prefix")) {
              d.prefix = $root.ibc.core.commitment.v1.MerklePrefix.toObject(
                m.prefix,
                o
              );
            }
            return d;
          };
          Counterparty.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Counterparty;
        })();
        v1.ClientPaths = (function () {
          function ClientPaths(p) {
            this.paths = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          ClientPaths.prototype.paths = $util.emptyArray;
          ClientPaths.create = function create(properties) {
            return new ClientPaths(properties);
          };
          ClientPaths.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.paths != null && m.paths.length) {
              for (var i = 0; i < m.paths.length; ++i)
                w.uint32(10).string(m.paths[i]);
            }
            return w;
          };
          ClientPaths.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.ClientPaths();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.paths && m.paths.length)) m.paths = [];
                  m.paths.push(r.string());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ClientPaths.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.connection.v1.ClientPaths) return d;
            var m = new $root.ibc.core.connection.v1.ClientPaths();
            if (d.paths) {
              if (!Array.isArray(d.paths))
                throw TypeError(
                  ".ibc.core.connection.v1.ClientPaths.paths: array expected"
                );
              m.paths = [];
              for (var i = 0; i < d.paths.length; ++i) {
                m.paths[i] = String(d.paths[i]);
              }
            }
            return m;
          };
          ClientPaths.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.paths = [];
            }
            if (m.paths && m.paths.length) {
              d.paths = [];
              for (var j = 0; j < m.paths.length; ++j) {
                d.paths[j] = m.paths[j];
              }
            }
            return d;
          };
          ClientPaths.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return ClientPaths;
        })();
        v1.ConnectionPaths = (function () {
          function ConnectionPaths(p) {
            this.paths = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          ConnectionPaths.prototype.clientId = "";
          ConnectionPaths.prototype.paths = $util.emptyArray;
          ConnectionPaths.create = function create(properties) {
            return new ConnectionPaths(properties);
          };
          ConnectionPaths.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            if (m.paths != null && m.paths.length) {
              for (var i = 0; i < m.paths.length; ++i)
                w.uint32(18).string(m.paths[i]);
            }
            return w;
          };
          ConnectionPaths.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.ConnectionPaths();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                case 2:
                  if (!(m.paths && m.paths.length)) m.paths = [];
                  m.paths.push(r.string());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ConnectionPaths.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.connection.v1.ConnectionPaths)
              return d;
            var m = new $root.ibc.core.connection.v1.ConnectionPaths();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.paths) {
              if (!Array.isArray(d.paths))
                throw TypeError(
                  ".ibc.core.connection.v1.ConnectionPaths.paths: array expected"
                );
              m.paths = [];
              for (var i = 0; i < d.paths.length; ++i) {
                m.paths[i] = String(d.paths[i]);
              }
            }
            return m;
          };
          ConnectionPaths.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.paths = [];
            }
            if (o.defaults) {
              d.clientId = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.paths && m.paths.length) {
              d.paths = [];
              for (var j = 0; j < m.paths.length; ++j) {
                d.paths[j] = m.paths[j];
              }
            }
            return d;
          };
          ConnectionPaths.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return ConnectionPaths;
        })();
        v1.Version = (function () {
          function Version(p) {
            this.features = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Version.prototype.identifier = "";
          Version.prototype.features = $util.emptyArray;
          Version.create = function create(properties) {
            return new Version(properties);
          };
          Version.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.identifier != null &&
              Object.hasOwnProperty.call(m, "identifier")
            )
              w.uint32(10).string(m.identifier);
            if (m.features != null && m.features.length) {
              for (var i = 0; i < m.features.length; ++i)
                w.uint32(18).string(m.features[i]);
            }
            return w;
          };
          Version.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.Version();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.identifier = r.string();
                  break;
                case 2:
                  if (!(m.features && m.features.length)) m.features = [];
                  m.features.push(r.string());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Version.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.connection.v1.Version) return d;
            var m = new $root.ibc.core.connection.v1.Version();
            if (d.identifier != null) {
              m.identifier = String(d.identifier);
            }
            if (d.features) {
              if (!Array.isArray(d.features))
                throw TypeError(
                  ".ibc.core.connection.v1.Version.features: array expected"
                );
              m.features = [];
              for (var i = 0; i < d.features.length; ++i) {
                m.features[i] = String(d.features[i]);
              }
            }
            return m;
          };
          Version.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.features = [];
            }
            if (o.defaults) {
              d.identifier = "";
            }
            if (m.identifier != null && m.hasOwnProperty("identifier")) {
              d.identifier = m.identifier;
            }
            if (m.features && m.features.length) {
              d.features = [];
              for (var j = 0; j < m.features.length; ++j) {
                d.features[j] = m.features[j];
              }
            }
            return d;
          };
          Version.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return Version;
        })();
        v1.Query = (function () {
          function Query(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(
              this,
              rpcImpl,
              requestDelimited,
              responseDelimited
            );
          }
          (Query.prototype = Object.create(
            $protobuf.rpc.Service.prototype
          )).constructor = Query;
          Query.create = function create(
            rpcImpl,
            requestDelimited,
            responseDelimited
          ) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
          };
          Object.defineProperty(
            (Query.prototype.connection = function connection(
              request,
              callback
            ) {
              return this.rpcCall(
                connection,
                $root.ibc.core.connection.v1.QueryConnectionRequest,
                $root.ibc.core.connection.v1.QueryConnectionResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "Connection" }
          );
          Object.defineProperty(
            (Query.prototype.connections = function connections(
              request,
              callback
            ) {
              return this.rpcCall(
                connections,
                $root.ibc.core.connection.v1.QueryConnectionsRequest,
                $root.ibc.core.connection.v1.QueryConnectionsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "Connections" }
          );
          Object.defineProperty(
            (Query.prototype.clientConnections = function clientConnections(
              request,
              callback
            ) {
              return this.rpcCall(
                clientConnections,
                $root.ibc.core.connection.v1.QueryClientConnectionsRequest,
                $root.ibc.core.connection.v1.QueryClientConnectionsResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "ClientConnections" }
          );
          Object.defineProperty(
            (Query.prototype.connectionClientState = function connectionClientState(
              request,
              callback
            ) {
              return this.rpcCall(
                connectionClientState,
                $root.ibc.core.connection.v1.QueryConnectionClientStateRequest,
                $root.ibc.core.connection.v1.QueryConnectionClientStateResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "ConnectionClientState" }
          );
          Object.defineProperty(
            (Query.prototype.connectionConsensusState = function connectionConsensusState(
              request,
              callback
            ) {
              return this.rpcCall(
                connectionConsensusState,
                $root.ibc.core.connection.v1
                  .QueryConnectionConsensusStateRequest,
                $root.ibc.core.connection.v1
                  .QueryConnectionConsensusStateResponse,
                request,
                callback
              );
            }),
            "name",
            { value: "ConnectionConsensusState" }
          );
          return Query;
        })();
        v1.QueryConnectionRequest = (function () {
          function QueryConnectionRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionRequest.prototype.connectionId = "";
          QueryConnectionRequest.create = function create(properties) {
            return new QueryConnectionRequest(properties);
          };
          QueryConnectionRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.connectionId != null &&
              Object.hasOwnProperty.call(m, "connectionId")
            )
              w.uint32(10).string(m.connectionId);
            return w;
          };
          QueryConnectionRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.connectionId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionRequest.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.connection.v1.QueryConnectionRequest
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionRequest();
            if (d.connectionId != null) {
              m.connectionId = String(d.connectionId);
            }
            return m;
          };
          QueryConnectionRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.connectionId = "";
            }
            if (m.connectionId != null && m.hasOwnProperty("connectionId")) {
              d.connectionId = m.connectionId;
            }
            return d;
          };
          QueryConnectionRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionRequest;
        })();
        v1.QueryConnectionResponse = (function () {
          function QueryConnectionResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionResponse.prototype.connection = null;
          QueryConnectionResponse.prototype.proof = $util.newBuffer([]);
          QueryConnectionResponse.prototype.proofHeight = null;
          QueryConnectionResponse.create = function create(properties) {
            return new QueryConnectionResponse(properties);
          };
          QueryConnectionResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.connection != null &&
              Object.hasOwnProperty.call(m, "connection")
            )
              $root.ibc.core.connection.v1.ConnectionEnd.encode(
                m.connection,
                w.uint32(10).fork()
              ).ldelim();
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.connection = $root.ibc.core.connection.v1.ConnectionEnd.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionResponse.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.connection.v1.QueryConnectionResponse
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionResponse();
            if (d.connection != null) {
              if (typeof d.connection !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionResponse.connection: object expected"
                );
              m.connection = $root.ibc.core.connection.v1.ConnectionEnd.fromObject(
                d.connection
              );
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryConnectionResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.connection = null;
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (m.connection != null && m.hasOwnProperty("connection")) {
              d.connection = $root.ibc.core.connection.v1.ConnectionEnd.toObject(
                m.connection,
                o
              );
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryConnectionResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionResponse;
        })();
        v1.QueryConnectionsRequest = (function () {
          function QueryConnectionsRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionsRequest.prototype.pagination = null;
          QueryConnectionsRequest.create = function create(properties) {
            return new QueryConnectionsRequest(properties);
          };
          QueryConnectionsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageRequest.encode(
                m.pagination,
                w.uint32(10).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionsRequest.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.connection.v1.QueryConnectionsRequest
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionsRequest();
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionsRequest.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageRequest.fromObject(
                d.pagination
              );
            }
            return m;
          };
          QueryConnectionsRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.pagination = null;
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageRequest.toObject(
                m.pagination,
                o
              );
            }
            return d;
          };
          QueryConnectionsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionsRequest;
        })();
        v1.QueryConnectionsResponse = (function () {
          function QueryConnectionsResponse(p) {
            this.connections = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionsResponse.prototype.connections = $util.emptyArray;
          QueryConnectionsResponse.prototype.pagination = null;
          QueryConnectionsResponse.prototype.height = null;
          QueryConnectionsResponse.create = function create(properties) {
            return new QueryConnectionsResponse(properties);
          };
          QueryConnectionsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.connections != null && m.connections.length) {
              for (var i = 0; i < m.connections.length; ++i)
                $root.ibc.core.connection.v1.IdentifiedConnection.encode(
                  m.connections[i],
                  w.uint32(10).fork()
                ).ldelim();
            }
            if (
              m.pagination != null &&
              Object.hasOwnProperty.call(m, "pagination")
            )
              $root.cosmos.base.query.v1beta1.PageResponse.encode(
                m.pagination,
                w.uint32(18).fork()
              ).ldelim();
            if (m.height != null && Object.hasOwnProperty.call(m, "height"))
              $root.ibc.core.client.v1.Height.encode(
                m.height,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.connections && m.connections.length))
                    m.connections = [];
                  m.connections.push(
                    $root.ibc.core.connection.v1.IdentifiedConnection.decode(
                      r,
                      r.uint32()
                    )
                  );
                  break;
                case 2:
                  m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 3:
                  m.height = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionsResponse.fromObject = function fromObject(d) {
            if (
              d instanceof $root.ibc.core.connection.v1.QueryConnectionsResponse
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionsResponse();
            if (d.connections) {
              if (!Array.isArray(d.connections))
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionsResponse.connections: array expected"
                );
              m.connections = [];
              for (var i = 0; i < d.connections.length; ++i) {
                if (typeof d.connections[i] !== "object")
                  throw TypeError(
                    ".ibc.core.connection.v1.QueryConnectionsResponse.connections: object expected"
                  );
                m.connections[
                  i
                ] = $root.ibc.core.connection.v1.IdentifiedConnection.fromObject(
                  d.connections[i]
                );
              }
            }
            if (d.pagination != null) {
              if (typeof d.pagination !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionsResponse.pagination: object expected"
                );
              m.pagination = $root.cosmos.base.query.v1beta1.PageResponse.fromObject(
                d.pagination
              );
            }
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionsResponse.height: object expected"
                );
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            return m;
          };
          QueryConnectionsResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.connections = [];
            }
            if (o.defaults) {
              d.pagination = null;
              d.height = null;
            }
            if (m.connections && m.connections.length) {
              d.connections = [];
              for (var j = 0; j < m.connections.length; ++j) {
                d.connections[
                  j
                ] = $root.ibc.core.connection.v1.IdentifiedConnection.toObject(
                  m.connections[j],
                  o
                );
              }
            }
            if (m.pagination != null && m.hasOwnProperty("pagination")) {
              d.pagination = $root.cosmos.base.query.v1beta1.PageResponse.toObject(
                m.pagination,
                o
              );
            }
            if (m.height != null && m.hasOwnProperty("height")) {
              d.height = $root.ibc.core.client.v1.Height.toObject(m.height, o);
            }
            return d;
          };
          QueryConnectionsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionsResponse;
        })();
        v1.QueryClientConnectionsRequest = (function () {
          function QueryClientConnectionsRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryClientConnectionsRequest.prototype.clientId = "";
          QueryClientConnectionsRequest.create = function create(properties) {
            return new QueryClientConnectionsRequest(properties);
          };
          QueryClientConnectionsRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(10).string(m.clientId);
            return w;
          };
          QueryClientConnectionsRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryClientConnectionsRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.clientId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryClientConnectionsRequest.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.connection.v1.QueryClientConnectionsRequest
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryClientConnectionsRequest();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            return m;
          };
          QueryClientConnectionsRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.clientId = "";
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            return d;
          };
          QueryClientConnectionsRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryClientConnectionsRequest;
        })();
        v1.QueryClientConnectionsResponse = (function () {
          function QueryClientConnectionsResponse(p) {
            this.connectionPaths = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryClientConnectionsResponse.prototype.connectionPaths =
            $util.emptyArray;
          QueryClientConnectionsResponse.prototype.proof = $util.newBuffer([]);
          QueryClientConnectionsResponse.prototype.proofHeight = null;
          QueryClientConnectionsResponse.create = function create(properties) {
            return new QueryClientConnectionsResponse(properties);
          };
          QueryClientConnectionsResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.connectionPaths != null && m.connectionPaths.length) {
              for (var i = 0; i < m.connectionPaths.length; ++i)
                w.uint32(10).string(m.connectionPaths[i]);
            }
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryClientConnectionsResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryClientConnectionsResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.connectionPaths && m.connectionPaths.length))
                    m.connectionPaths = [];
                  m.connectionPaths.push(r.string());
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryClientConnectionsResponse.fromObject = function fromObject(d) {
            if (
              d instanceof
              $root.ibc.core.connection.v1.QueryClientConnectionsResponse
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryClientConnectionsResponse();
            if (d.connectionPaths) {
              if (!Array.isArray(d.connectionPaths))
                throw TypeError(
                  ".ibc.core.connection.v1.QueryClientConnectionsResponse.connectionPaths: array expected"
                );
              m.connectionPaths = [];
              for (var i = 0; i < d.connectionPaths.length; ++i) {
                m.connectionPaths[i] = String(d.connectionPaths[i]);
              }
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryClientConnectionsResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryClientConnectionsResponse.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.connectionPaths = [];
            }
            if (o.defaults) {
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (m.connectionPaths && m.connectionPaths.length) {
              d.connectionPaths = [];
              for (var j = 0; j < m.connectionPaths.length; ++j) {
                d.connectionPaths[j] = m.connectionPaths[j];
              }
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryClientConnectionsResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryClientConnectionsResponse;
        })();
        v1.QueryConnectionClientStateRequest = (function () {
          function QueryConnectionClientStateRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionClientStateRequest.prototype.connectionId = "";
          QueryConnectionClientStateRequest.create = function create(
            properties
          ) {
            return new QueryConnectionClientStateRequest(properties);
          };
          QueryConnectionClientStateRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.connectionId != null &&
              Object.hasOwnProperty.call(m, "connectionId")
            )
              w.uint32(10).string(m.connectionId);
            return w;
          };
          QueryConnectionClientStateRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionClientStateRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.connectionId = r.string();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionClientStateRequest.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.connection.v1.QueryConnectionClientStateRequest
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionClientStateRequest();
            if (d.connectionId != null) {
              m.connectionId = String(d.connectionId);
            }
            return m;
          };
          QueryConnectionClientStateRequest.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.connectionId = "";
            }
            if (m.connectionId != null && m.hasOwnProperty("connectionId")) {
              d.connectionId = m.connectionId;
            }
            return d;
          };
          QueryConnectionClientStateRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionClientStateRequest;
        })();
        v1.QueryConnectionClientStateResponse = (function () {
          function QueryConnectionClientStateResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionClientStateResponse.prototype.identifiedClientState = null;
          QueryConnectionClientStateResponse.prototype.proof = $util.newBuffer(
            []
          );
          QueryConnectionClientStateResponse.prototype.proofHeight = null;
          QueryConnectionClientStateResponse.create = function create(
            properties
          ) {
            return new QueryConnectionClientStateResponse(properties);
          };
          QueryConnectionClientStateResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.identifiedClientState != null &&
              Object.hasOwnProperty.call(m, "identifiedClientState")
            )
              $root.ibc.core.client.v1.IdentifiedClientState.encode(
                m.identifiedClientState,
                w.uint32(10).fork()
              ).ldelim();
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(18).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(26).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionClientStateResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionClientStateResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.identifiedClientState = $root.ibc.core.client.v1.IdentifiedClientState.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.proof = r.bytes();
                  break;
                case 3:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionClientStateResponse.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.connection.v1.QueryConnectionClientStateResponse
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionClientStateResponse();
            if (d.identifiedClientState != null) {
              if (typeof d.identifiedClientState !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionClientStateResponse.identifiedClientState: object expected"
                );
              m.identifiedClientState = $root.ibc.core.client.v1.IdentifiedClientState.fromObject(
                d.identifiedClientState
              );
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionClientStateResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryConnectionClientStateResponse.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.identifiedClientState = null;
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (
              m.identifiedClientState != null &&
              m.hasOwnProperty("identifiedClientState")
            ) {
              d.identifiedClientState = $root.ibc.core.client.v1.IdentifiedClientState.toObject(
                m.identifiedClientState,
                o
              );
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryConnectionClientStateResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionClientStateResponse;
        })();
        v1.QueryConnectionConsensusStateRequest = (function () {
          function QueryConnectionConsensusStateRequest(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionConsensusStateRequest.prototype.connectionId = "";
          QueryConnectionConsensusStateRequest.prototype.versionNumber = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryConnectionConsensusStateRequest.prototype.versionHeight = $util.Long
            ? $util.Long.fromBits(0, 0, true)
            : 0;
          QueryConnectionConsensusStateRequest.create = function create(
            properties
          ) {
            return new QueryConnectionConsensusStateRequest(properties);
          };
          QueryConnectionConsensusStateRequest.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.connectionId != null &&
              Object.hasOwnProperty.call(m, "connectionId")
            )
              w.uint32(10).string(m.connectionId);
            if (
              m.versionNumber != null &&
              Object.hasOwnProperty.call(m, "versionNumber")
            )
              w.uint32(16).uint64(m.versionNumber);
            if (
              m.versionHeight != null &&
              Object.hasOwnProperty.call(m, "versionHeight")
            )
              w.uint32(24).uint64(m.versionHeight);
            return w;
          };
          QueryConnectionConsensusStateRequest.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionConsensusStateRequest();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.connectionId = r.string();
                  break;
                case 2:
                  m.versionNumber = r.uint64();
                  break;
                case 3:
                  m.versionHeight = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionConsensusStateRequest.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.connection.v1.QueryConnectionConsensusStateRequest
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionConsensusStateRequest();
            if (d.connectionId != null) {
              m.connectionId = String(d.connectionId);
            }
            if (d.versionNumber != null) {
              if ($util.Long)
                (m.versionNumber = $util.Long.fromValue(
                  d.versionNumber
                )).unsigned = true;
              else if (typeof d.versionNumber === "string")
                m.versionNumber = parseInt(d.versionNumber, 10);
              else if (typeof d.versionNumber === "number")
                m.versionNumber = d.versionNumber;
              else if (typeof d.versionNumber === "object")
                m.versionNumber = new $util.LongBits(
                  d.versionNumber.low >>> 0,
                  d.versionNumber.high >>> 0
                ).toNumber(true);
            }
            if (d.versionHeight != null) {
              if ($util.Long)
                (m.versionHeight = $util.Long.fromValue(
                  d.versionHeight
                )).unsigned = true;
              else if (typeof d.versionHeight === "string")
                m.versionHeight = parseInt(d.versionHeight, 10);
              else if (typeof d.versionHeight === "number")
                m.versionHeight = d.versionHeight;
              else if (typeof d.versionHeight === "object")
                m.versionHeight = new $util.LongBits(
                  d.versionHeight.low >>> 0,
                  d.versionHeight.high >>> 0
                ).toNumber(true);
            }
            return m;
          };
          QueryConnectionConsensusStateRequest.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.connectionId = "";
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.versionNumber =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.versionNumber = o.longs === String ? "0" : 0;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.versionHeight =
                  o.longs === String
                    ? n.toString()
                    : o.longs === Number
                    ? n.toNumber()
                    : n;
              } else d.versionHeight = o.longs === String ? "0" : 0;
            }
            if (m.connectionId != null && m.hasOwnProperty("connectionId")) {
              d.connectionId = m.connectionId;
            }
            if (m.versionNumber != null && m.hasOwnProperty("versionNumber")) {
              if (typeof m.versionNumber === "number")
                d.versionNumber =
                  o.longs === String
                    ? String(m.versionNumber)
                    : m.versionNumber;
              else
                d.versionNumber =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.versionNumber)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.versionNumber.low >>> 0,
                        m.versionNumber.high >>> 0
                      ).toNumber(true)
                    : m.versionNumber;
            }
            if (m.versionHeight != null && m.hasOwnProperty("versionHeight")) {
              if (typeof m.versionHeight === "number")
                d.versionHeight =
                  o.longs === String
                    ? String(m.versionHeight)
                    : m.versionHeight;
              else
                d.versionHeight =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.versionHeight)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.versionHeight.low >>> 0,
                        m.versionHeight.high >>> 0
                      ).toNumber(true)
                    : m.versionHeight;
            }
            return d;
          };
          QueryConnectionConsensusStateRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionConsensusStateRequest;
        })();
        v1.QueryConnectionConsensusStateResponse = (function () {
          function QueryConnectionConsensusStateResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          QueryConnectionConsensusStateResponse.prototype.consensusState = null;
          QueryConnectionConsensusStateResponse.prototype.clientId = "";
          QueryConnectionConsensusStateResponse.prototype.proof = $util.newBuffer(
            []
          );
          QueryConnectionConsensusStateResponse.prototype.proofHeight = null;
          QueryConnectionConsensusStateResponse.create = function create(
            properties
          ) {
            return new QueryConnectionConsensusStateResponse(properties);
          };
          QueryConnectionConsensusStateResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (
              m.consensusState != null &&
              Object.hasOwnProperty.call(m, "consensusState")
            )
              $root.google.protobuf.Any.encode(
                m.consensusState,
                w.uint32(10).fork()
              ).ldelim();
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(18).string(m.clientId);
            if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
              w.uint32(26).bytes(m.proof);
            if (
              m.proofHeight != null &&
              Object.hasOwnProperty.call(m, "proofHeight")
            )
              $root.ibc.core.client.v1.Height.encode(
                m.proofHeight,
                w.uint32(34).fork()
              ).ldelim();
            return w;
          };
          QueryConnectionConsensusStateResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.connection.v1.QueryConnectionConsensusStateResponse();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.consensusState = $root.google.protobuf.Any.decode(
                    r,
                    r.uint32()
                  );
                  break;
                case 2:
                  m.clientId = r.string();
                  break;
                case 3:
                  m.proof = r.bytes();
                  break;
                case 4:
                  m.proofHeight = $root.ibc.core.client.v1.Height.decode(
                    r,
                    r.uint32()
                  );
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          QueryConnectionConsensusStateResponse.fromObject = function fromObject(
            d
          ) {
            if (
              d instanceof
              $root.ibc.core.connection.v1.QueryConnectionConsensusStateResponse
            )
              return d;
            var m = new $root.ibc.core.connection.v1.QueryConnectionConsensusStateResponse();
            if (d.consensusState != null) {
              if (typeof d.consensusState !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionConsensusStateResponse.consensusState: object expected"
                );
              m.consensusState = $root.google.protobuf.Any.fromObject(
                d.consensusState
              );
            }
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.proof != null) {
              if (typeof d.proof === "string")
                $util.base64.decode(
                  d.proof,
                  (m.proof = $util.newBuffer($util.base64.length(d.proof))),
                  0
                );
              else if (d.proof.length) m.proof = d.proof;
            }
            if (d.proofHeight != null) {
              if (typeof d.proofHeight !== "object")
                throw TypeError(
                  ".ibc.core.connection.v1.QueryConnectionConsensusStateResponse.proofHeight: object expected"
                );
              m.proofHeight = $root.ibc.core.client.v1.Height.fromObject(
                d.proofHeight
              );
            }
            return m;
          };
          QueryConnectionConsensusStateResponse.toObject = function toObject(
            m,
            o
          ) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.consensusState = null;
              d.clientId = "";
              if (o.bytes === String) d.proof = "";
              else {
                d.proof = [];
                if (o.bytes !== Array) d.proof = $util.newBuffer(d.proof);
              }
              d.proofHeight = null;
            }
            if (
              m.consensusState != null &&
              m.hasOwnProperty("consensusState")
            ) {
              d.consensusState = $root.google.protobuf.Any.toObject(
                m.consensusState,
                o
              );
            }
            if (m.clientId != null && m.hasOwnProperty("clientId")) {
              d.clientId = m.clientId;
            }
            if (m.proof != null && m.hasOwnProperty("proof")) {
              d.proof =
                o.bytes === String
                  ? $util.base64.encode(m.proof, 0, m.proof.length)
                  : o.bytes === Array
                  ? Array.prototype.slice.call(m.proof)
                  : m.proof;
            }
            if (m.proofHeight != null && m.hasOwnProperty("proofHeight")) {
              d.proofHeight = $root.ibc.core.client.v1.Height.toObject(
                m.proofHeight,
                o
              );
            }
            return d;
          };
          QueryConnectionConsensusStateResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(
              this,
              $protobuf.util.toJSONOptions
            );
          };
          return QueryConnectionConsensusStateResponse;
        })();
        return v1;
      })();
      return connection;
    })();
    return core;
  })();
  return ibc;
})();
exports.tendermint = $root.tendermint = (() => {
  const tendermint = {};
  tendermint.crypto = (function () {
    const crypto = {};
    crypto.PublicKey = (function () {
      function PublicKey(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      PublicKey.prototype.ed25519 = $util.newBuffer([]);
      PublicKey.prototype.secp256k1 = $util.newBuffer([]);
      let $oneOfFields;
      Object.defineProperty(PublicKey.prototype, "sum", {
        get: $util.oneOfGetter(($oneOfFields = ["ed25519", "secp256k1"])),
        set: $util.oneOfSetter($oneOfFields),
      });
      PublicKey.create = function create(properties) {
        return new PublicKey(properties);
      };
      PublicKey.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ed25519 != null && Object.hasOwnProperty.call(m, "ed25519"))
          w.uint32(10).bytes(m.ed25519);
        if (m.secp256k1 != null && Object.hasOwnProperty.call(m, "secp256k1"))
          w.uint32(18).bytes(m.secp256k1);
        return w;
      };
      PublicKey.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.PublicKey();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.ed25519 = r.bytes();
              break;
            case 2:
              m.secp256k1 = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      PublicKey.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.PublicKey) return d;
        var m = new $root.tendermint.crypto.PublicKey();
        if (d.ed25519 != null) {
          if (typeof d.ed25519 === "string")
            $util.base64.decode(
              d.ed25519,
              (m.ed25519 = $util.newBuffer($util.base64.length(d.ed25519))),
              0
            );
          else if (d.ed25519.length) m.ed25519 = d.ed25519;
        }
        if (d.secp256k1 != null) {
          if (typeof d.secp256k1 === "string")
            $util.base64.decode(
              d.secp256k1,
              (m.secp256k1 = $util.newBuffer($util.base64.length(d.secp256k1))),
              0
            );
          else if (d.secp256k1.length) m.secp256k1 = d.secp256k1;
        }
        return m;
      };
      PublicKey.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (m.ed25519 != null && m.hasOwnProperty("ed25519")) {
          d.ed25519 =
            o.bytes === String
              ? $util.base64.encode(m.ed25519, 0, m.ed25519.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.ed25519)
              : m.ed25519;
          if (o.oneofs) d.sum = "ed25519";
        }
        if (m.secp256k1 != null && m.hasOwnProperty("secp256k1")) {
          d.secp256k1 =
            o.bytes === String
              ? $util.base64.encode(m.secp256k1, 0, m.secp256k1.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.secp256k1)
              : m.secp256k1;
          if (o.oneofs) d.sum = "secp256k1";
        }
        return d;
      };
      PublicKey.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return PublicKey;
    })();
    crypto.Proof = (function () {
      function Proof(p) {
        this.aunts = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Proof.prototype.total = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Proof.prototype.index = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Proof.prototype.leafHash = $util.newBuffer([]);
      Proof.prototype.aunts = $util.emptyArray;
      Proof.create = function create(properties) {
        return new Proof(properties);
      };
      Proof.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.total != null && Object.hasOwnProperty.call(m, "total"))
          w.uint32(8).int64(m.total);
        if (m.index != null && Object.hasOwnProperty.call(m, "index"))
          w.uint32(16).int64(m.index);
        if (m.leafHash != null && Object.hasOwnProperty.call(m, "leafHash"))
          w.uint32(26).bytes(m.leafHash);
        if (m.aunts != null && m.aunts.length) {
          for (var i = 0; i < m.aunts.length; ++i)
            w.uint32(34).bytes(m.aunts[i]);
        }
        return w;
      };
      Proof.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.Proof();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.total = r.int64();
              break;
            case 2:
              m.index = r.int64();
              break;
            case 3:
              m.leafHash = r.bytes();
              break;
            case 4:
              if (!(m.aunts && m.aunts.length)) m.aunts = [];
              m.aunts.push(r.bytes());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Proof.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.Proof) return d;
        var m = new $root.tendermint.crypto.Proof();
        if (d.total != null) {
          if ($util.Long)
            (m.total = $util.Long.fromValue(d.total)).unsigned = false;
          else if (typeof d.total === "string") m.total = parseInt(d.total, 10);
          else if (typeof d.total === "number") m.total = d.total;
          else if (typeof d.total === "object")
            m.total = new $util.LongBits(
              d.total.low >>> 0,
              d.total.high >>> 0
            ).toNumber();
        }
        if (d.index != null) {
          if ($util.Long)
            (m.index = $util.Long.fromValue(d.index)).unsigned = false;
          else if (typeof d.index === "string") m.index = parseInt(d.index, 10);
          else if (typeof d.index === "number") m.index = d.index;
          else if (typeof d.index === "object")
            m.index = new $util.LongBits(
              d.index.low >>> 0,
              d.index.high >>> 0
            ).toNumber();
        }
        if (d.leafHash != null) {
          if (typeof d.leafHash === "string")
            $util.base64.decode(
              d.leafHash,
              (m.leafHash = $util.newBuffer($util.base64.length(d.leafHash))),
              0
            );
          else if (d.leafHash.length) m.leafHash = d.leafHash;
        }
        if (d.aunts) {
          if (!Array.isArray(d.aunts))
            throw TypeError(".tendermint.crypto.Proof.aunts: array expected");
          m.aunts = [];
          for (var i = 0; i < d.aunts.length; ++i) {
            if (typeof d.aunts[i] === "string")
              $util.base64.decode(
                d.aunts[i],
                (m.aunts[i] = $util.newBuffer($util.base64.length(d.aunts[i]))),
                0
              );
            else if (d.aunts[i].length) m.aunts[i] = d.aunts[i];
          }
        }
        return m;
      };
      Proof.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.aunts = [];
        }
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.total =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.total = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.index =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.index = o.longs === String ? "0" : 0;
          if (o.bytes === String) d.leafHash = "";
          else {
            d.leafHash = [];
            if (o.bytes !== Array) d.leafHash = $util.newBuffer(d.leafHash);
          }
        }
        if (m.total != null && m.hasOwnProperty("total")) {
          if (typeof m.total === "number")
            d.total = o.longs === String ? String(m.total) : m.total;
          else
            d.total =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.total)
                : o.longs === Number
                ? new $util.LongBits(
                    m.total.low >>> 0,
                    m.total.high >>> 0
                  ).toNumber()
                : m.total;
        }
        if (m.index != null && m.hasOwnProperty("index")) {
          if (typeof m.index === "number")
            d.index = o.longs === String ? String(m.index) : m.index;
          else
            d.index =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.index)
                : o.longs === Number
                ? new $util.LongBits(
                    m.index.low >>> 0,
                    m.index.high >>> 0
                  ).toNumber()
                : m.index;
        }
        if (m.leafHash != null && m.hasOwnProperty("leafHash")) {
          d.leafHash =
            o.bytes === String
              ? $util.base64.encode(m.leafHash, 0, m.leafHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.leafHash)
              : m.leafHash;
        }
        if (m.aunts && m.aunts.length) {
          d.aunts = [];
          for (var j = 0; j < m.aunts.length; ++j) {
            d.aunts[j] =
              o.bytes === String
                ? $util.base64.encode(m.aunts[j], 0, m.aunts[j].length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.aunts[j])
                : m.aunts[j];
          }
        }
        return d;
      };
      Proof.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Proof;
    })();
    crypto.ValueOp = (function () {
      function ValueOp(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ValueOp.prototype.key = $util.newBuffer([]);
      ValueOp.prototype.proof = null;
      ValueOp.create = function create(properties) {
        return new ValueOp(properties);
      };
      ValueOp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.key != null && Object.hasOwnProperty.call(m, "key"))
          w.uint32(10).bytes(m.key);
        if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
          $root.tendermint.crypto.Proof.encode(
            m.proof,
            w.uint32(18).fork()
          ).ldelim();
        return w;
      };
      ValueOp.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.ValueOp();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.key = r.bytes();
              break;
            case 2:
              m.proof = $root.tendermint.crypto.Proof.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      ValueOp.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.ValueOp) return d;
        var m = new $root.tendermint.crypto.ValueOp();
        if (d.key != null) {
          if (typeof d.key === "string")
            $util.base64.decode(
              d.key,
              (m.key = $util.newBuffer($util.base64.length(d.key))),
              0
            );
          else if (d.key.length) m.key = d.key;
        }
        if (d.proof != null) {
          if (typeof d.proof !== "object")
            throw TypeError(
              ".tendermint.crypto.ValueOp.proof: object expected"
            );
          m.proof = $root.tendermint.crypto.Proof.fromObject(d.proof);
        }
        return m;
      };
      ValueOp.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if (o.bytes === String) d.key = "";
          else {
            d.key = [];
            if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
          }
          d.proof = null;
        }
        if (m.key != null && m.hasOwnProperty("key")) {
          d.key =
            o.bytes === String
              ? $util.base64.encode(m.key, 0, m.key.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.key)
              : m.key;
        }
        if (m.proof != null && m.hasOwnProperty("proof")) {
          d.proof = $root.tendermint.crypto.Proof.toObject(m.proof, o);
        }
        return d;
      };
      ValueOp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return ValueOp;
    })();
    crypto.DominoOp = (function () {
      function DominoOp(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      DominoOp.prototype.key = "";
      DominoOp.prototype.input = "";
      DominoOp.prototype.output = "";
      DominoOp.create = function create(properties) {
        return new DominoOp(properties);
      };
      DominoOp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.key != null && Object.hasOwnProperty.call(m, "key"))
          w.uint32(10).string(m.key);
        if (m.input != null && Object.hasOwnProperty.call(m, "input"))
          w.uint32(18).string(m.input);
        if (m.output != null && Object.hasOwnProperty.call(m, "output"))
          w.uint32(26).string(m.output);
        return w;
      };
      DominoOp.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.DominoOp();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.key = r.string();
              break;
            case 2:
              m.input = r.string();
              break;
            case 3:
              m.output = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      DominoOp.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.DominoOp) return d;
        var m = new $root.tendermint.crypto.DominoOp();
        if (d.key != null) {
          m.key = String(d.key);
        }
        if (d.input != null) {
          m.input = String(d.input);
        }
        if (d.output != null) {
          m.output = String(d.output);
        }
        return m;
      };
      DominoOp.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.key = "";
          d.input = "";
          d.output = "";
        }
        if (m.key != null && m.hasOwnProperty("key")) {
          d.key = m.key;
        }
        if (m.input != null && m.hasOwnProperty("input")) {
          d.input = m.input;
        }
        if (m.output != null && m.hasOwnProperty("output")) {
          d.output = m.output;
        }
        return d;
      };
      DominoOp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return DominoOp;
    })();
    crypto.ProofOp = (function () {
      function ProofOp(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ProofOp.prototype.type = "";
      ProofOp.prototype.key = $util.newBuffer([]);
      ProofOp.prototype.data = $util.newBuffer([]);
      ProofOp.create = function create(properties) {
        return new ProofOp(properties);
      };
      ProofOp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.type != null && Object.hasOwnProperty.call(m, "type"))
          w.uint32(10).string(m.type);
        if (m.key != null && Object.hasOwnProperty.call(m, "key"))
          w.uint32(18).bytes(m.key);
        if (m.data != null && Object.hasOwnProperty.call(m, "data"))
          w.uint32(26).bytes(m.data);
        return w;
      };
      ProofOp.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.ProofOp();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.type = r.string();
              break;
            case 2:
              m.key = r.bytes();
              break;
            case 3:
              m.data = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      ProofOp.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.ProofOp) return d;
        var m = new $root.tendermint.crypto.ProofOp();
        if (d.type != null) {
          m.type = String(d.type);
        }
        if (d.key != null) {
          if (typeof d.key === "string")
            $util.base64.decode(
              d.key,
              (m.key = $util.newBuffer($util.base64.length(d.key))),
              0
            );
          else if (d.key.length) m.key = d.key;
        }
        if (d.data != null) {
          if (typeof d.data === "string")
            $util.base64.decode(
              d.data,
              (m.data = $util.newBuffer($util.base64.length(d.data))),
              0
            );
          else if (d.data.length) m.data = d.data;
        }
        return m;
      };
      ProofOp.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.type = "";
          if (o.bytes === String) d.key = "";
          else {
            d.key = [];
            if (o.bytes !== Array) d.key = $util.newBuffer(d.key);
          }
          if (o.bytes === String) d.data = "";
          else {
            d.data = [];
            if (o.bytes !== Array) d.data = $util.newBuffer(d.data);
          }
        }
        if (m.type != null && m.hasOwnProperty("type")) {
          d.type = m.type;
        }
        if (m.key != null && m.hasOwnProperty("key")) {
          d.key =
            o.bytes === String
              ? $util.base64.encode(m.key, 0, m.key.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.key)
              : m.key;
        }
        if (m.data != null && m.hasOwnProperty("data")) {
          d.data =
            o.bytes === String
              ? $util.base64.encode(m.data, 0, m.data.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.data)
              : m.data;
        }
        return d;
      };
      ProofOp.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return ProofOp;
    })();
    crypto.ProofOps = (function () {
      function ProofOps(p) {
        this.ops = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ProofOps.prototype.ops = $util.emptyArray;
      ProofOps.create = function create(properties) {
        return new ProofOps(properties);
      };
      ProofOps.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.ops != null && m.ops.length) {
          for (var i = 0; i < m.ops.length; ++i)
            $root.tendermint.crypto.ProofOp.encode(
              m.ops[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        return w;
      };
      ProofOps.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.crypto.ProofOps();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.ops && m.ops.length)) m.ops = [];
              m.ops.push($root.tendermint.crypto.ProofOp.decode(r, r.uint32()));
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      ProofOps.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.crypto.ProofOps) return d;
        var m = new $root.tendermint.crypto.ProofOps();
        if (d.ops) {
          if (!Array.isArray(d.ops))
            throw TypeError(".tendermint.crypto.ProofOps.ops: array expected");
          m.ops = [];
          for (var i = 0; i < d.ops.length; ++i) {
            if (typeof d.ops[i] !== "object")
              throw TypeError(
                ".tendermint.crypto.ProofOps.ops: object expected"
              );
            m.ops[i] = $root.tendermint.crypto.ProofOp.fromObject(d.ops[i]);
          }
        }
        return m;
      };
      ProofOps.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.ops = [];
        }
        if (m.ops && m.ops.length) {
          d.ops = [];
          for (var j = 0; j < m.ops.length; ++j) {
            d.ops[j] = $root.tendermint.crypto.ProofOp.toObject(m.ops[j], o);
          }
        }
        return d;
      };
      ProofOps.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return ProofOps;
    })();
    return crypto;
  })();
  tendermint.libs = (function () {
    const libs = {};
    libs.bits = (function () {
      const bits = {};
      bits.BitArray = (function () {
        function BitArray(p) {
          this.elems = [];
          if (p)
            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
              if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
        }
        BitArray.prototype.bits = $util.Long
          ? $util.Long.fromBits(0, 0, false)
          : 0;
        BitArray.prototype.elems = $util.emptyArray;
        BitArray.create = function create(properties) {
          return new BitArray(properties);
        };
        BitArray.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.bits != null && Object.hasOwnProperty.call(m, "bits"))
            w.uint32(8).int64(m.bits);
          if (m.elems != null && m.elems.length) {
            w.uint32(18).fork();
            for (var i = 0; i < m.elems.length; ++i) w.uint64(m.elems[i]);
            w.ldelim();
          }
          return w;
        };
        BitArray.decode = function decode(r, l) {
          if (!(r instanceof $Reader)) r = $Reader.create(r);
          var c = l === undefined ? r.len : r.pos + l,
            m = new $root.tendermint.libs.bits.BitArray();
          while (r.pos < c) {
            var t = r.uint32();
            switch (t >>> 3) {
              case 1:
                m.bits = r.int64();
                break;
              case 2:
                if (!(m.elems && m.elems.length)) m.elems = [];
                if ((t & 7) === 2) {
                  var c2 = r.uint32() + r.pos;
                  while (r.pos < c2) m.elems.push(r.uint64());
                } else m.elems.push(r.uint64());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        BitArray.fromObject = function fromObject(d) {
          if (d instanceof $root.tendermint.libs.bits.BitArray) return d;
          var m = new $root.tendermint.libs.bits.BitArray();
          if (d.bits != null) {
            if ($util.Long)
              (m.bits = $util.Long.fromValue(d.bits)).unsigned = false;
            else if (typeof d.bits === "string") m.bits = parseInt(d.bits, 10);
            else if (typeof d.bits === "number") m.bits = d.bits;
            else if (typeof d.bits === "object")
              m.bits = new $util.LongBits(
                d.bits.low >>> 0,
                d.bits.high >>> 0
              ).toNumber();
          }
          if (d.elems) {
            if (!Array.isArray(d.elems))
              throw TypeError(
                ".tendermint.libs.bits.BitArray.elems: array expected"
              );
            m.elems = [];
            for (var i = 0; i < d.elems.length; ++i) {
              if ($util.Long)
                (m.elems[i] = $util.Long.fromValue(d.elems[i])).unsigned = true;
              else if (typeof d.elems[i] === "string")
                m.elems[i] = parseInt(d.elems[i], 10);
              else if (typeof d.elems[i] === "number") m.elems[i] = d.elems[i];
              else if (typeof d.elems[i] === "object")
                m.elems[i] = new $util.LongBits(
                  d.elems[i].low >>> 0,
                  d.elems[i].high >>> 0
                ).toNumber(true);
            }
          }
          return m;
        };
        BitArray.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (o.arrays || o.defaults) {
            d.elems = [];
          }
          if (o.defaults) {
            if ($util.Long) {
              var n = new $util.Long(0, 0, false);
              d.bits =
                o.longs === String
                  ? n.toString()
                  : o.longs === Number
                  ? n.toNumber()
                  : n;
            } else d.bits = o.longs === String ? "0" : 0;
          }
          if (m.bits != null && m.hasOwnProperty("bits")) {
            if (typeof m.bits === "number")
              d.bits = o.longs === String ? String(m.bits) : m.bits;
            else
              d.bits =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.bits)
                  : o.longs === Number
                  ? new $util.LongBits(
                      m.bits.low >>> 0,
                      m.bits.high >>> 0
                    ).toNumber()
                  : m.bits;
          }
          if (m.elems && m.elems.length) {
            d.elems = [];
            for (var j = 0; j < m.elems.length; ++j) {
              if (typeof m.elems[j] === "number")
                d.elems[j] =
                  o.longs === String ? String(m.elems[j]) : m.elems[j];
              else
                d.elems[j] =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.elems[j])
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.elems[j].low >>> 0,
                        m.elems[j].high >>> 0
                      ).toNumber(true)
                    : m.elems[j];
            }
          }
          return d;
        };
        BitArray.prototype.toJSON = function toJSON() {
          return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
        return BitArray;
      })();
      return bits;
    })();
    return libs;
  })();
  tendermint.types = (function () {
    const types = {};
    types.BlockIDFlag = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = "BLOCK_ID_FLAG_UNKNOWN")] = 0;
      values[(valuesById[1] = "BLOCK_ID_FLAG_ABSENT")] = 1;
      values[(valuesById[2] = "BLOCK_ID_FLAG_COMMIT")] = 2;
      values[(valuesById[3] = "BLOCK_ID_FLAG_NIL")] = 3;
      return values;
    })();
    types.SignedMsgType = (function () {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = "SIGNED_MSG_TYPE_UNKNOWN")] = 0;
      values[(valuesById[1] = "SIGNED_MSG_TYPE_PREVOTE")] = 1;
      values[(valuesById[2] = "SIGNED_MSG_TYPE_PRECOMMIT")] = 2;
      values[(valuesById[32] = "SIGNED_MSG_TYPE_PROPOSAL")] = 32;
      return values;
    })();
    types.PartSetHeader = (function () {
      function PartSetHeader(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      PartSetHeader.prototype.total = 0;
      PartSetHeader.prototype.hash = $util.newBuffer([]);
      PartSetHeader.create = function create(properties) {
        return new PartSetHeader(properties);
      };
      PartSetHeader.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.total != null && Object.hasOwnProperty.call(m, "total"))
          w.uint32(8).uint32(m.total);
        if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
          w.uint32(18).bytes(m.hash);
        return w;
      };
      PartSetHeader.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.PartSetHeader();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.total = r.uint32();
              break;
            case 2:
              m.hash = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      PartSetHeader.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.PartSetHeader) return d;
        var m = new $root.tendermint.types.PartSetHeader();
        if (d.total != null) {
          m.total = d.total >>> 0;
        }
        if (d.hash != null) {
          if (typeof d.hash === "string")
            $util.base64.decode(
              d.hash,
              (m.hash = $util.newBuffer($util.base64.length(d.hash))),
              0
            );
          else if (d.hash.length) m.hash = d.hash;
        }
        return m;
      };
      PartSetHeader.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.total = 0;
          if (o.bytes === String) d.hash = "";
          else {
            d.hash = [];
            if (o.bytes !== Array) d.hash = $util.newBuffer(d.hash);
          }
        }
        if (m.total != null && m.hasOwnProperty("total")) {
          d.total = m.total;
        }
        if (m.hash != null && m.hasOwnProperty("hash")) {
          d.hash =
            o.bytes === String
              ? $util.base64.encode(m.hash, 0, m.hash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.hash)
              : m.hash;
        }
        return d;
      };
      PartSetHeader.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return PartSetHeader;
    })();
    types.Part = (function () {
      function Part(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Part.prototype.index = 0;
      Part.prototype.bytes = $util.newBuffer([]);
      Part.prototype.proof = null;
      Part.create = function create(properties) {
        return new Part(properties);
      };
      Part.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.index != null && Object.hasOwnProperty.call(m, "index"))
          w.uint32(8).uint32(m.index);
        if (m.bytes != null && Object.hasOwnProperty.call(m, "bytes"))
          w.uint32(18).bytes(m.bytes);
        if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
          $root.tendermint.crypto.Proof.encode(
            m.proof,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      Part.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Part();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.index = r.uint32();
              break;
            case 2:
              m.bytes = r.bytes();
              break;
            case 3:
              m.proof = $root.tendermint.crypto.Proof.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Part.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Part) return d;
        var m = new $root.tendermint.types.Part();
        if (d.index != null) {
          m.index = d.index >>> 0;
        }
        if (d.bytes != null) {
          if (typeof d.bytes === "string")
            $util.base64.decode(
              d.bytes,
              (m.bytes = $util.newBuffer($util.base64.length(d.bytes))),
              0
            );
          else if (d.bytes.length) m.bytes = d.bytes;
        }
        if (d.proof != null) {
          if (typeof d.proof !== "object")
            throw TypeError(".tendermint.types.Part.proof: object expected");
          m.proof = $root.tendermint.crypto.Proof.fromObject(d.proof);
        }
        return m;
      };
      Part.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.index = 0;
          if (o.bytes === String) d.bytes = "";
          else {
            d.bytes = [];
            if (o.bytes !== Array) d.bytes = $util.newBuffer(d.bytes);
          }
          d.proof = null;
        }
        if (m.index != null && m.hasOwnProperty("index")) {
          d.index = m.index;
        }
        if (m.bytes != null && m.hasOwnProperty("bytes")) {
          d.bytes =
            o.bytes === String
              ? $util.base64.encode(m.bytes, 0, m.bytes.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.bytes)
              : m.bytes;
        }
        if (m.proof != null && m.hasOwnProperty("proof")) {
          d.proof = $root.tendermint.crypto.Proof.toObject(m.proof, o);
        }
        return d;
      };
      Part.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Part;
    })();
    types.BlockID = (function () {
      function BlockID(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      BlockID.prototype.hash = $util.newBuffer([]);
      BlockID.prototype.partSetHeader = null;
      BlockID.create = function create(properties) {
        return new BlockID(properties);
      };
      BlockID.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.hash != null && Object.hasOwnProperty.call(m, "hash"))
          w.uint32(10).bytes(m.hash);
        if (
          m.partSetHeader != null &&
          Object.hasOwnProperty.call(m, "partSetHeader")
        )
          $root.tendermint.types.PartSetHeader.encode(
            m.partSetHeader,
            w.uint32(18).fork()
          ).ldelim();
        return w;
      };
      BlockID.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.BlockID();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.hash = r.bytes();
              break;
            case 2:
              m.partSetHeader = $root.tendermint.types.PartSetHeader.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      BlockID.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.BlockID) return d;
        var m = new $root.tendermint.types.BlockID();
        if (d.hash != null) {
          if (typeof d.hash === "string")
            $util.base64.decode(
              d.hash,
              (m.hash = $util.newBuffer($util.base64.length(d.hash))),
              0
            );
          else if (d.hash.length) m.hash = d.hash;
        }
        if (d.partSetHeader != null) {
          if (typeof d.partSetHeader !== "object")
            throw TypeError(
              ".tendermint.types.BlockID.partSetHeader: object expected"
            );
          m.partSetHeader = $root.tendermint.types.PartSetHeader.fromObject(
            d.partSetHeader
          );
        }
        return m;
      };
      BlockID.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if (o.bytes === String) d.hash = "";
          else {
            d.hash = [];
            if (o.bytes !== Array) d.hash = $util.newBuffer(d.hash);
          }
          d.partSetHeader = null;
        }
        if (m.hash != null && m.hasOwnProperty("hash")) {
          d.hash =
            o.bytes === String
              ? $util.base64.encode(m.hash, 0, m.hash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.hash)
              : m.hash;
        }
        if (m.partSetHeader != null && m.hasOwnProperty("partSetHeader")) {
          d.partSetHeader = $root.tendermint.types.PartSetHeader.toObject(
            m.partSetHeader,
            o
          );
        }
        return d;
      };
      BlockID.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return BlockID;
    })();
    types.Header = (function () {
      function Header(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Header.prototype.version = null;
      Header.prototype.chainId = "";
      Header.prototype.height = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Header.prototype.time = null;
      Header.prototype.lastBlockId = null;
      Header.prototype.lastCommitHash = $util.newBuffer([]);
      Header.prototype.dataHash = $util.newBuffer([]);
      Header.prototype.validatorsHash = $util.newBuffer([]);
      Header.prototype.nextValidatorsHash = $util.newBuffer([]);
      Header.prototype.consensusHash = $util.newBuffer([]);
      Header.prototype.appHash = $util.newBuffer([]);
      Header.prototype.lastResultsHash = $util.newBuffer([]);
      Header.prototype.evidenceHash = $util.newBuffer([]);
      Header.prototype.proposerAddress = $util.newBuffer([]);
      Header.create = function create(properties) {
        return new Header(properties);
      };
      Header.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.version != null && Object.hasOwnProperty.call(m, "version"))
          $root.tendermint.version.Consensus.encode(
            m.version,
            w.uint32(10).fork()
          ).ldelim();
        if (m.chainId != null && Object.hasOwnProperty.call(m, "chainId"))
          w.uint32(18).string(m.chainId);
        if (m.height != null && Object.hasOwnProperty.call(m, "height"))
          w.uint32(24).int64(m.height);
        if (m.time != null && Object.hasOwnProperty.call(m, "time"))
          $root.google.protobuf.Timestamp.encode(
            m.time,
            w.uint32(34).fork()
          ).ldelim();
        if (
          m.lastBlockId != null &&
          Object.hasOwnProperty.call(m, "lastBlockId")
        )
          $root.tendermint.types.BlockID.encode(
            m.lastBlockId,
            w.uint32(42).fork()
          ).ldelim();
        if (
          m.lastCommitHash != null &&
          Object.hasOwnProperty.call(m, "lastCommitHash")
        )
          w.uint32(50).bytes(m.lastCommitHash);
        if (m.dataHash != null && Object.hasOwnProperty.call(m, "dataHash"))
          w.uint32(58).bytes(m.dataHash);
        if (
          m.validatorsHash != null &&
          Object.hasOwnProperty.call(m, "validatorsHash")
        )
          w.uint32(66).bytes(m.validatorsHash);
        if (
          m.nextValidatorsHash != null &&
          Object.hasOwnProperty.call(m, "nextValidatorsHash")
        )
          w.uint32(74).bytes(m.nextValidatorsHash);
        if (
          m.consensusHash != null &&
          Object.hasOwnProperty.call(m, "consensusHash")
        )
          w.uint32(82).bytes(m.consensusHash);
        if (m.appHash != null && Object.hasOwnProperty.call(m, "appHash"))
          w.uint32(90).bytes(m.appHash);
        if (
          m.lastResultsHash != null &&
          Object.hasOwnProperty.call(m, "lastResultsHash")
        )
          w.uint32(98).bytes(m.lastResultsHash);
        if (
          m.evidenceHash != null &&
          Object.hasOwnProperty.call(m, "evidenceHash")
        )
          w.uint32(106).bytes(m.evidenceHash);
        if (
          m.proposerAddress != null &&
          Object.hasOwnProperty.call(m, "proposerAddress")
        )
          w.uint32(114).bytes(m.proposerAddress);
        return w;
      };
      Header.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Header();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.version = $root.tendermint.version.Consensus.decode(
                r,
                r.uint32()
              );
              break;
            case 2:
              m.chainId = r.string();
              break;
            case 3:
              m.height = r.int64();
              break;
            case 4:
              m.time = $root.google.protobuf.Timestamp.decode(r, r.uint32());
              break;
            case 5:
              m.lastBlockId = $root.tendermint.types.BlockID.decode(
                r,
                r.uint32()
              );
              break;
            case 6:
              m.lastCommitHash = r.bytes();
              break;
            case 7:
              m.dataHash = r.bytes();
              break;
            case 8:
              m.validatorsHash = r.bytes();
              break;
            case 9:
              m.nextValidatorsHash = r.bytes();
              break;
            case 10:
              m.consensusHash = r.bytes();
              break;
            case 11:
              m.appHash = r.bytes();
              break;
            case 12:
              m.lastResultsHash = r.bytes();
              break;
            case 13:
              m.evidenceHash = r.bytes();
              break;
            case 14:
              m.proposerAddress = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Header.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Header) return d;
        var m = new $root.tendermint.types.Header();
        if (d.version != null) {
          if (typeof d.version !== "object")
            throw TypeError(
              ".tendermint.types.Header.version: object expected"
            );
          m.version = $root.tendermint.version.Consensus.fromObject(d.version);
        }
        if (d.chainId != null) {
          m.chainId = String(d.chainId);
        }
        if (d.height != null) {
          if ($util.Long)
            (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string")
            m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(
              d.height.low >>> 0,
              d.height.high >>> 0
            ).toNumber();
        }
        if (d.time != null) {
          if (typeof d.time !== "object")
            throw TypeError(".tendermint.types.Header.time: object expected");
          m.time = $root.google.protobuf.Timestamp.fromObject(d.time);
        }
        if (d.lastBlockId != null) {
          if (typeof d.lastBlockId !== "object")
            throw TypeError(
              ".tendermint.types.Header.lastBlockId: object expected"
            );
          m.lastBlockId = $root.tendermint.types.BlockID.fromObject(
            d.lastBlockId
          );
        }
        if (d.lastCommitHash != null) {
          if (typeof d.lastCommitHash === "string")
            $util.base64.decode(
              d.lastCommitHash,
              (m.lastCommitHash = $util.newBuffer(
                $util.base64.length(d.lastCommitHash)
              )),
              0
            );
          else if (d.lastCommitHash.length) m.lastCommitHash = d.lastCommitHash;
        }
        if (d.dataHash != null) {
          if (typeof d.dataHash === "string")
            $util.base64.decode(
              d.dataHash,
              (m.dataHash = $util.newBuffer($util.base64.length(d.dataHash))),
              0
            );
          else if (d.dataHash.length) m.dataHash = d.dataHash;
        }
        if (d.validatorsHash != null) {
          if (typeof d.validatorsHash === "string")
            $util.base64.decode(
              d.validatorsHash,
              (m.validatorsHash = $util.newBuffer(
                $util.base64.length(d.validatorsHash)
              )),
              0
            );
          else if (d.validatorsHash.length) m.validatorsHash = d.validatorsHash;
        }
        if (d.nextValidatorsHash != null) {
          if (typeof d.nextValidatorsHash === "string")
            $util.base64.decode(
              d.nextValidatorsHash,
              (m.nextValidatorsHash = $util.newBuffer(
                $util.base64.length(d.nextValidatorsHash)
              )),
              0
            );
          else if (d.nextValidatorsHash.length)
            m.nextValidatorsHash = d.nextValidatorsHash;
        }
        if (d.consensusHash != null) {
          if (typeof d.consensusHash === "string")
            $util.base64.decode(
              d.consensusHash,
              (m.consensusHash = $util.newBuffer(
                $util.base64.length(d.consensusHash)
              )),
              0
            );
          else if (d.consensusHash.length) m.consensusHash = d.consensusHash;
        }
        if (d.appHash != null) {
          if (typeof d.appHash === "string")
            $util.base64.decode(
              d.appHash,
              (m.appHash = $util.newBuffer($util.base64.length(d.appHash))),
              0
            );
          else if (d.appHash.length) m.appHash = d.appHash;
        }
        if (d.lastResultsHash != null) {
          if (typeof d.lastResultsHash === "string")
            $util.base64.decode(
              d.lastResultsHash,
              (m.lastResultsHash = $util.newBuffer(
                $util.base64.length(d.lastResultsHash)
              )),
              0
            );
          else if (d.lastResultsHash.length)
            m.lastResultsHash = d.lastResultsHash;
        }
        if (d.evidenceHash != null) {
          if (typeof d.evidenceHash === "string")
            $util.base64.decode(
              d.evidenceHash,
              (m.evidenceHash = $util.newBuffer(
                $util.base64.length(d.evidenceHash)
              )),
              0
            );
          else if (d.evidenceHash.length) m.evidenceHash = d.evidenceHash;
        }
        if (d.proposerAddress != null) {
          if (typeof d.proposerAddress === "string")
            $util.base64.decode(
              d.proposerAddress,
              (m.proposerAddress = $util.newBuffer(
                $util.base64.length(d.proposerAddress)
              )),
              0
            );
          else if (d.proposerAddress.length)
            m.proposerAddress = d.proposerAddress;
        }
        return m;
      };
      Header.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.version = null;
          d.chainId = "";
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.height =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.time = null;
          d.lastBlockId = null;
          if (o.bytes === String) d.lastCommitHash = "";
          else {
            d.lastCommitHash = [];
            if (o.bytes !== Array)
              d.lastCommitHash = $util.newBuffer(d.lastCommitHash);
          }
          if (o.bytes === String) d.dataHash = "";
          else {
            d.dataHash = [];
            if (o.bytes !== Array) d.dataHash = $util.newBuffer(d.dataHash);
          }
          if (o.bytes === String) d.validatorsHash = "";
          else {
            d.validatorsHash = [];
            if (o.bytes !== Array)
              d.validatorsHash = $util.newBuffer(d.validatorsHash);
          }
          if (o.bytes === String) d.nextValidatorsHash = "";
          else {
            d.nextValidatorsHash = [];
            if (o.bytes !== Array)
              d.nextValidatorsHash = $util.newBuffer(d.nextValidatorsHash);
          }
          if (o.bytes === String) d.consensusHash = "";
          else {
            d.consensusHash = [];
            if (o.bytes !== Array)
              d.consensusHash = $util.newBuffer(d.consensusHash);
          }
          if (o.bytes === String) d.appHash = "";
          else {
            d.appHash = [];
            if (o.bytes !== Array) d.appHash = $util.newBuffer(d.appHash);
          }
          if (o.bytes === String) d.lastResultsHash = "";
          else {
            d.lastResultsHash = [];
            if (o.bytes !== Array)
              d.lastResultsHash = $util.newBuffer(d.lastResultsHash);
          }
          if (o.bytes === String) d.evidenceHash = "";
          else {
            d.evidenceHash = [];
            if (o.bytes !== Array)
              d.evidenceHash = $util.newBuffer(d.evidenceHash);
          }
          if (o.bytes === String) d.proposerAddress = "";
          else {
            d.proposerAddress = [];
            if (o.bytes !== Array)
              d.proposerAddress = $util.newBuffer(d.proposerAddress);
          }
        }
        if (m.version != null && m.hasOwnProperty("version")) {
          d.version = $root.tendermint.version.Consensus.toObject(m.version, o);
        }
        if (m.chainId != null && m.hasOwnProperty("chainId")) {
          d.chainId = m.chainId;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number")
            d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(
                    m.height.low >>> 0,
                    m.height.high >>> 0
                  ).toNumber()
                : m.height;
        }
        if (m.time != null && m.hasOwnProperty("time")) {
          d.time = $root.google.protobuf.Timestamp.toObject(m.time, o);
        }
        if (m.lastBlockId != null && m.hasOwnProperty("lastBlockId")) {
          d.lastBlockId = $root.tendermint.types.BlockID.toObject(
            m.lastBlockId,
            o
          );
        }
        if (m.lastCommitHash != null && m.hasOwnProperty("lastCommitHash")) {
          d.lastCommitHash =
            o.bytes === String
              ? $util.base64.encode(
                  m.lastCommitHash,
                  0,
                  m.lastCommitHash.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.lastCommitHash)
              : m.lastCommitHash;
        }
        if (m.dataHash != null && m.hasOwnProperty("dataHash")) {
          d.dataHash =
            o.bytes === String
              ? $util.base64.encode(m.dataHash, 0, m.dataHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.dataHash)
              : m.dataHash;
        }
        if (m.validatorsHash != null && m.hasOwnProperty("validatorsHash")) {
          d.validatorsHash =
            o.bytes === String
              ? $util.base64.encode(
                  m.validatorsHash,
                  0,
                  m.validatorsHash.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.validatorsHash)
              : m.validatorsHash;
        }
        if (
          m.nextValidatorsHash != null &&
          m.hasOwnProperty("nextValidatorsHash")
        ) {
          d.nextValidatorsHash =
            o.bytes === String
              ? $util.base64.encode(
                  m.nextValidatorsHash,
                  0,
                  m.nextValidatorsHash.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.nextValidatorsHash)
              : m.nextValidatorsHash;
        }
        if (m.consensusHash != null && m.hasOwnProperty("consensusHash")) {
          d.consensusHash =
            o.bytes === String
              ? $util.base64.encode(m.consensusHash, 0, m.consensusHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.consensusHash)
              : m.consensusHash;
        }
        if (m.appHash != null && m.hasOwnProperty("appHash")) {
          d.appHash =
            o.bytes === String
              ? $util.base64.encode(m.appHash, 0, m.appHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.appHash)
              : m.appHash;
        }
        if (m.lastResultsHash != null && m.hasOwnProperty("lastResultsHash")) {
          d.lastResultsHash =
            o.bytes === String
              ? $util.base64.encode(
                  m.lastResultsHash,
                  0,
                  m.lastResultsHash.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.lastResultsHash)
              : m.lastResultsHash;
        }
        if (m.evidenceHash != null && m.hasOwnProperty("evidenceHash")) {
          d.evidenceHash =
            o.bytes === String
              ? $util.base64.encode(m.evidenceHash, 0, m.evidenceHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.evidenceHash)
              : m.evidenceHash;
        }
        if (m.proposerAddress != null && m.hasOwnProperty("proposerAddress")) {
          d.proposerAddress =
            o.bytes === String
              ? $util.base64.encode(
                  m.proposerAddress,
                  0,
                  m.proposerAddress.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.proposerAddress)
              : m.proposerAddress;
        }
        return d;
      };
      Header.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Header;
    })();
    types.Data = (function () {
      function Data(p) {
        this.txs = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Data.prototype.txs = $util.emptyArray;
      Data.create = function create(properties) {
        return new Data(properties);
      };
      Data.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.txs != null && m.txs.length) {
          for (var i = 0; i < m.txs.length; ++i) w.uint32(10).bytes(m.txs[i]);
        }
        return w;
      };
      Data.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Data();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.txs && m.txs.length)) m.txs = [];
              m.txs.push(r.bytes());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Data.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Data) return d;
        var m = new $root.tendermint.types.Data();
        if (d.txs) {
          if (!Array.isArray(d.txs))
            throw TypeError(".tendermint.types.Data.txs: array expected");
          m.txs = [];
          for (var i = 0; i < d.txs.length; ++i) {
            if (typeof d.txs[i] === "string")
              $util.base64.decode(
                d.txs[i],
                (m.txs[i] = $util.newBuffer($util.base64.length(d.txs[i]))),
                0
              );
            else if (d.txs[i].length) m.txs[i] = d.txs[i];
          }
        }
        return m;
      };
      Data.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.txs = [];
        }
        if (m.txs && m.txs.length) {
          d.txs = [];
          for (var j = 0; j < m.txs.length; ++j) {
            d.txs[j] =
              o.bytes === String
                ? $util.base64.encode(m.txs[j], 0, m.txs[j].length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.txs[j])
                : m.txs[j];
          }
        }
        return d;
      };
      Data.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Data;
    })();
    types.Vote = (function () {
      function Vote(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Vote.prototype.type = 0;
      Vote.prototype.height = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Vote.prototype.round = 0;
      Vote.prototype.blockId = null;
      Vote.prototype.timestamp = null;
      Vote.prototype.validatorAddress = $util.newBuffer([]);
      Vote.prototype.validatorIndex = 0;
      Vote.prototype.signature = $util.newBuffer([]);
      Vote.create = function create(properties) {
        return new Vote(properties);
      };
      Vote.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.type != null && Object.hasOwnProperty.call(m, "type"))
          w.uint32(8).int32(m.type);
        if (m.height != null && Object.hasOwnProperty.call(m, "height"))
          w.uint32(16).int64(m.height);
        if (m.round != null && Object.hasOwnProperty.call(m, "round"))
          w.uint32(24).int32(m.round);
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(
            m.blockId,
            w.uint32(34).fork()
          ).ldelim();
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(
            m.timestamp,
            w.uint32(42).fork()
          ).ldelim();
        if (
          m.validatorAddress != null &&
          Object.hasOwnProperty.call(m, "validatorAddress")
        )
          w.uint32(50).bytes(m.validatorAddress);
        if (
          m.validatorIndex != null &&
          Object.hasOwnProperty.call(m, "validatorIndex")
        )
          w.uint32(56).int32(m.validatorIndex);
        if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
          w.uint32(66).bytes(m.signature);
        return w;
      };
      Vote.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Vote();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.type = r.int32();
              break;
            case 2:
              m.height = r.int64();
              break;
            case 3:
              m.round = r.int32();
              break;
            case 4:
              m.blockId = $root.tendermint.types.BlockID.decode(r, r.uint32());
              break;
            case 5:
              m.timestamp = $root.google.protobuf.Timestamp.decode(
                r,
                r.uint32()
              );
              break;
            case 6:
              m.validatorAddress = r.bytes();
              break;
            case 7:
              m.validatorIndex = r.int32();
              break;
            case 8:
              m.signature = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Vote.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Vote) return d;
        var m = new $root.tendermint.types.Vote();
        switch (d.type) {
          case "SIGNED_MSG_TYPE_UNKNOWN":
          case 0:
            m.type = 0;
            break;
          case "SIGNED_MSG_TYPE_PREVOTE":
          case 1:
            m.type = 1;
            break;
          case "SIGNED_MSG_TYPE_PRECOMMIT":
          case 2:
            m.type = 2;
            break;
          case "SIGNED_MSG_TYPE_PROPOSAL":
          case 32:
            m.type = 32;
            break;
        }
        if (d.height != null) {
          if ($util.Long)
            (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string")
            m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(
              d.height.low >>> 0,
              d.height.high >>> 0
            ).toNumber();
        }
        if (d.round != null) {
          m.round = d.round | 0;
        }
        if (d.blockId != null) {
          if (typeof d.blockId !== "object")
            throw TypeError(".tendermint.types.Vote.blockId: object expected");
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.timestamp != null) {
          if (typeof d.timestamp !== "object")
            throw TypeError(
              ".tendermint.types.Vote.timestamp: object expected"
            );
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        if (d.validatorAddress != null) {
          if (typeof d.validatorAddress === "string")
            $util.base64.decode(
              d.validatorAddress,
              (m.validatorAddress = $util.newBuffer(
                $util.base64.length(d.validatorAddress)
              )),
              0
            );
          else if (d.validatorAddress.length)
            m.validatorAddress = d.validatorAddress;
        }
        if (d.validatorIndex != null) {
          m.validatorIndex = d.validatorIndex | 0;
        }
        if (d.signature != null) {
          if (typeof d.signature === "string")
            $util.base64.decode(
              d.signature,
              (m.signature = $util.newBuffer($util.base64.length(d.signature))),
              0
            );
          else if (d.signature.length) m.signature = d.signature;
        }
        return m;
      };
      Vote.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.type = o.enums === String ? "SIGNED_MSG_TYPE_UNKNOWN" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.height =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.round = 0;
          d.blockId = null;
          d.timestamp = null;
          if (o.bytes === String) d.validatorAddress = "";
          else {
            d.validatorAddress = [];
            if (o.bytes !== Array)
              d.validatorAddress = $util.newBuffer(d.validatorAddress);
          }
          d.validatorIndex = 0;
          if (o.bytes === String) d.signature = "";
          else {
            d.signature = [];
            if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
          }
        }
        if (m.type != null && m.hasOwnProperty("type")) {
          d.type =
            o.enums === String
              ? $root.tendermint.types.SignedMsgType[m.type]
              : m.type;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number")
            d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(
                    m.height.low >>> 0,
                    m.height.high >>> 0
                  ).toNumber()
                : m.height;
        }
        if (m.round != null && m.hasOwnProperty("round")) {
          d.round = m.round;
        }
        if (m.blockId != null && m.hasOwnProperty("blockId")) {
          d.blockId = $root.tendermint.types.BlockID.toObject(m.blockId, o);
        }
        if (m.timestamp != null && m.hasOwnProperty("timestamp")) {
          d.timestamp = $root.google.protobuf.Timestamp.toObject(
            m.timestamp,
            o
          );
        }
        if (
          m.validatorAddress != null &&
          m.hasOwnProperty("validatorAddress")
        ) {
          d.validatorAddress =
            o.bytes === String
              ? $util.base64.encode(
                  m.validatorAddress,
                  0,
                  m.validatorAddress.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.validatorAddress)
              : m.validatorAddress;
        }
        if (m.validatorIndex != null && m.hasOwnProperty("validatorIndex")) {
          d.validatorIndex = m.validatorIndex;
        }
        if (m.signature != null && m.hasOwnProperty("signature")) {
          d.signature =
            o.bytes === String
              ? $util.base64.encode(m.signature, 0, m.signature.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.signature)
              : m.signature;
        }
        return d;
      };
      Vote.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Vote;
    })();
    types.Commit = (function () {
      function Commit(p) {
        this.signatures = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Commit.prototype.height = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Commit.prototype.round = 0;
      Commit.prototype.blockId = null;
      Commit.prototype.signatures = $util.emptyArray;
      Commit.create = function create(properties) {
        return new Commit(properties);
      };
      Commit.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.height != null && Object.hasOwnProperty.call(m, "height"))
          w.uint32(8).int64(m.height);
        if (m.round != null && Object.hasOwnProperty.call(m, "round"))
          w.uint32(16).int32(m.round);
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(
            m.blockId,
            w.uint32(26).fork()
          ).ldelim();
        if (m.signatures != null && m.signatures.length) {
          for (var i = 0; i < m.signatures.length; ++i)
            $root.tendermint.types.CommitSig.encode(
              m.signatures[i],
              w.uint32(34).fork()
            ).ldelim();
        }
        return w;
      };
      Commit.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Commit();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.height = r.int64();
              break;
            case 2:
              m.round = r.int32();
              break;
            case 3:
              m.blockId = $root.tendermint.types.BlockID.decode(r, r.uint32());
              break;
            case 4:
              if (!(m.signatures && m.signatures.length)) m.signatures = [];
              m.signatures.push(
                $root.tendermint.types.CommitSig.decode(r, r.uint32())
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Commit.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Commit) return d;
        var m = new $root.tendermint.types.Commit();
        if (d.height != null) {
          if ($util.Long)
            (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string")
            m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(
              d.height.low >>> 0,
              d.height.high >>> 0
            ).toNumber();
        }
        if (d.round != null) {
          m.round = d.round | 0;
        }
        if (d.blockId != null) {
          if (typeof d.blockId !== "object")
            throw TypeError(
              ".tendermint.types.Commit.blockId: object expected"
            );
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.signatures) {
          if (!Array.isArray(d.signatures))
            throw TypeError(
              ".tendermint.types.Commit.signatures: array expected"
            );
          m.signatures = [];
          for (var i = 0; i < d.signatures.length; ++i) {
            if (typeof d.signatures[i] !== "object")
              throw TypeError(
                ".tendermint.types.Commit.signatures: object expected"
              );
            m.signatures[i] = $root.tendermint.types.CommitSig.fromObject(
              d.signatures[i]
            );
          }
        }
        return m;
      };
      Commit.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.signatures = [];
        }
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.height =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.round = 0;
          d.blockId = null;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number")
            d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(
                    m.height.low >>> 0,
                    m.height.high >>> 0
                  ).toNumber()
                : m.height;
        }
        if (m.round != null && m.hasOwnProperty("round")) {
          d.round = m.round;
        }
        if (m.blockId != null && m.hasOwnProperty("blockId")) {
          d.blockId = $root.tendermint.types.BlockID.toObject(m.blockId, o);
        }
        if (m.signatures && m.signatures.length) {
          d.signatures = [];
          for (var j = 0; j < m.signatures.length; ++j) {
            d.signatures[j] = $root.tendermint.types.CommitSig.toObject(
              m.signatures[j],
              o
            );
          }
        }
        return d;
      };
      Commit.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Commit;
    })();
    types.CommitSig = (function () {
      function CommitSig(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      CommitSig.prototype.blockIdFlag = 0;
      CommitSig.prototype.validatorAddress = $util.newBuffer([]);
      CommitSig.prototype.timestamp = null;
      CommitSig.prototype.signature = $util.newBuffer([]);
      CommitSig.create = function create(properties) {
        return new CommitSig(properties);
      };
      CommitSig.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.blockIdFlag != null &&
          Object.hasOwnProperty.call(m, "blockIdFlag")
        )
          w.uint32(8).int32(m.blockIdFlag);
        if (
          m.validatorAddress != null &&
          Object.hasOwnProperty.call(m, "validatorAddress")
        )
          w.uint32(18).bytes(m.validatorAddress);
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(
            m.timestamp,
            w.uint32(26).fork()
          ).ldelim();
        if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
          w.uint32(34).bytes(m.signature);
        return w;
      };
      CommitSig.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.CommitSig();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.blockIdFlag = r.int32();
              break;
            case 2:
              m.validatorAddress = r.bytes();
              break;
            case 3:
              m.timestamp = $root.google.protobuf.Timestamp.decode(
                r,
                r.uint32()
              );
              break;
            case 4:
              m.signature = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      CommitSig.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.CommitSig) return d;
        var m = new $root.tendermint.types.CommitSig();
        switch (d.blockIdFlag) {
          case "BLOCK_ID_FLAG_UNKNOWN":
          case 0:
            m.blockIdFlag = 0;
            break;
          case "BLOCK_ID_FLAG_ABSENT":
          case 1:
            m.blockIdFlag = 1;
            break;
          case "BLOCK_ID_FLAG_COMMIT":
          case 2:
            m.blockIdFlag = 2;
            break;
          case "BLOCK_ID_FLAG_NIL":
          case 3:
            m.blockIdFlag = 3;
            break;
        }
        if (d.validatorAddress != null) {
          if (typeof d.validatorAddress === "string")
            $util.base64.decode(
              d.validatorAddress,
              (m.validatorAddress = $util.newBuffer(
                $util.base64.length(d.validatorAddress)
              )),
              0
            );
          else if (d.validatorAddress.length)
            m.validatorAddress = d.validatorAddress;
        }
        if (d.timestamp != null) {
          if (typeof d.timestamp !== "object")
            throw TypeError(
              ".tendermint.types.CommitSig.timestamp: object expected"
            );
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        if (d.signature != null) {
          if (typeof d.signature === "string")
            $util.base64.decode(
              d.signature,
              (m.signature = $util.newBuffer($util.base64.length(d.signature))),
              0
            );
          else if (d.signature.length) m.signature = d.signature;
        }
        return m;
      };
      CommitSig.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.blockIdFlag = o.enums === String ? "BLOCK_ID_FLAG_UNKNOWN" : 0;
          if (o.bytes === String) d.validatorAddress = "";
          else {
            d.validatorAddress = [];
            if (o.bytes !== Array)
              d.validatorAddress = $util.newBuffer(d.validatorAddress);
          }
          d.timestamp = null;
          if (o.bytes === String) d.signature = "";
          else {
            d.signature = [];
            if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
          }
        }
        if (m.blockIdFlag != null && m.hasOwnProperty("blockIdFlag")) {
          d.blockIdFlag =
            o.enums === String
              ? $root.tendermint.types.BlockIDFlag[m.blockIdFlag]
              : m.blockIdFlag;
        }
        if (
          m.validatorAddress != null &&
          m.hasOwnProperty("validatorAddress")
        ) {
          d.validatorAddress =
            o.bytes === String
              ? $util.base64.encode(
                  m.validatorAddress,
                  0,
                  m.validatorAddress.length
                )
              : o.bytes === Array
              ? Array.prototype.slice.call(m.validatorAddress)
              : m.validatorAddress;
        }
        if (m.timestamp != null && m.hasOwnProperty("timestamp")) {
          d.timestamp = $root.google.protobuf.Timestamp.toObject(
            m.timestamp,
            o
          );
        }
        if (m.signature != null && m.hasOwnProperty("signature")) {
          d.signature =
            o.bytes === String
              ? $util.base64.encode(m.signature, 0, m.signature.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.signature)
              : m.signature;
        }
        return d;
      };
      CommitSig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return CommitSig;
    })();
    types.Proposal = (function () {
      function Proposal(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Proposal.prototype.type = 0;
      Proposal.prototype.height = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Proposal.prototype.round = 0;
      Proposal.prototype.polRound = 0;
      Proposal.prototype.blockId = null;
      Proposal.prototype.timestamp = null;
      Proposal.prototype.signature = $util.newBuffer([]);
      Proposal.create = function create(properties) {
        return new Proposal(properties);
      };
      Proposal.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.type != null && Object.hasOwnProperty.call(m, "type"))
          w.uint32(8).int32(m.type);
        if (m.height != null && Object.hasOwnProperty.call(m, "height"))
          w.uint32(16).int64(m.height);
        if (m.round != null && Object.hasOwnProperty.call(m, "round"))
          w.uint32(24).int32(m.round);
        if (m.polRound != null && Object.hasOwnProperty.call(m, "polRound"))
          w.uint32(32).int32(m.polRound);
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(
            m.blockId,
            w.uint32(42).fork()
          ).ldelim();
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(
            m.timestamp,
            w.uint32(50).fork()
          ).ldelim();
        if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
          w.uint32(58).bytes(m.signature);
        return w;
      };
      Proposal.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Proposal();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.type = r.int32();
              break;
            case 2:
              m.height = r.int64();
              break;
            case 3:
              m.round = r.int32();
              break;
            case 4:
              m.polRound = r.int32();
              break;
            case 5:
              m.blockId = $root.tendermint.types.BlockID.decode(r, r.uint32());
              break;
            case 6:
              m.timestamp = $root.google.protobuf.Timestamp.decode(
                r,
                r.uint32()
              );
              break;
            case 7:
              m.signature = r.bytes();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Proposal.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Proposal) return d;
        var m = new $root.tendermint.types.Proposal();
        switch (d.type) {
          case "SIGNED_MSG_TYPE_UNKNOWN":
          case 0:
            m.type = 0;
            break;
          case "SIGNED_MSG_TYPE_PREVOTE":
          case 1:
            m.type = 1;
            break;
          case "SIGNED_MSG_TYPE_PRECOMMIT":
          case 2:
            m.type = 2;
            break;
          case "SIGNED_MSG_TYPE_PROPOSAL":
          case 32:
            m.type = 32;
            break;
        }
        if (d.height != null) {
          if ($util.Long)
            (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string")
            m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(
              d.height.low >>> 0,
              d.height.high >>> 0
            ).toNumber();
        }
        if (d.round != null) {
          m.round = d.round | 0;
        }
        if (d.polRound != null) {
          m.polRound = d.polRound | 0;
        }
        if (d.blockId != null) {
          if (typeof d.blockId !== "object")
            throw TypeError(
              ".tendermint.types.Proposal.blockId: object expected"
            );
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.timestamp != null) {
          if (typeof d.timestamp !== "object")
            throw TypeError(
              ".tendermint.types.Proposal.timestamp: object expected"
            );
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        if (d.signature != null) {
          if (typeof d.signature === "string")
            $util.base64.decode(
              d.signature,
              (m.signature = $util.newBuffer($util.base64.length(d.signature))),
              0
            );
          else if (d.signature.length) m.signature = d.signature;
        }
        return m;
      };
      Proposal.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.type = o.enums === String ? "SIGNED_MSG_TYPE_UNKNOWN" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.height =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.round = 0;
          d.polRound = 0;
          d.blockId = null;
          d.timestamp = null;
          if (o.bytes === String) d.signature = "";
          else {
            d.signature = [];
            if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
          }
        }
        if (m.type != null && m.hasOwnProperty("type")) {
          d.type =
            o.enums === String
              ? $root.tendermint.types.SignedMsgType[m.type]
              : m.type;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number")
            d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(
                    m.height.low >>> 0,
                    m.height.high >>> 0
                  ).toNumber()
                : m.height;
        }
        if (m.round != null && m.hasOwnProperty("round")) {
          d.round = m.round;
        }
        if (m.polRound != null && m.hasOwnProperty("polRound")) {
          d.polRound = m.polRound;
        }
        if (m.blockId != null && m.hasOwnProperty("blockId")) {
          d.blockId = $root.tendermint.types.BlockID.toObject(m.blockId, o);
        }
        if (m.timestamp != null && m.hasOwnProperty("timestamp")) {
          d.timestamp = $root.google.protobuf.Timestamp.toObject(
            m.timestamp,
            o
          );
        }
        if (m.signature != null && m.hasOwnProperty("signature")) {
          d.signature =
            o.bytes === String
              ? $util.base64.encode(m.signature, 0, m.signature.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.signature)
              : m.signature;
        }
        return d;
      };
      Proposal.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Proposal;
    })();
    types.SignedHeader = (function () {
      function SignedHeader(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      SignedHeader.prototype.header = null;
      SignedHeader.prototype.commit = null;
      SignedHeader.create = function create(properties) {
        return new SignedHeader(properties);
      };
      SignedHeader.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.header != null && Object.hasOwnProperty.call(m, "header"))
          $root.tendermint.types.Header.encode(
            m.header,
            w.uint32(10).fork()
          ).ldelim();
        if (m.commit != null && Object.hasOwnProperty.call(m, "commit"))
          $root.tendermint.types.Commit.encode(
            m.commit,
            w.uint32(18).fork()
          ).ldelim();
        return w;
      };
      SignedHeader.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.SignedHeader();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.header = $root.tendermint.types.Header.decode(r, r.uint32());
              break;
            case 2:
              m.commit = $root.tendermint.types.Commit.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      SignedHeader.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.SignedHeader) return d;
        var m = new $root.tendermint.types.SignedHeader();
        if (d.header != null) {
          if (typeof d.header !== "object")
            throw TypeError(
              ".tendermint.types.SignedHeader.header: object expected"
            );
          m.header = $root.tendermint.types.Header.fromObject(d.header);
        }
        if (d.commit != null) {
          if (typeof d.commit !== "object")
            throw TypeError(
              ".tendermint.types.SignedHeader.commit: object expected"
            );
          m.commit = $root.tendermint.types.Commit.fromObject(d.commit);
        }
        return m;
      };
      SignedHeader.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.header = null;
          d.commit = null;
        }
        if (m.header != null && m.hasOwnProperty("header")) {
          d.header = $root.tendermint.types.Header.toObject(m.header, o);
        }
        if (m.commit != null && m.hasOwnProperty("commit")) {
          d.commit = $root.tendermint.types.Commit.toObject(m.commit, o);
        }
        return d;
      };
      SignedHeader.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return SignedHeader;
    })();
    types.LightBlock = (function () {
      function LightBlock(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      LightBlock.prototype.signedHeader = null;
      LightBlock.prototype.validatorSet = null;
      LightBlock.create = function create(properties) {
        return new LightBlock(properties);
      };
      LightBlock.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (
          m.signedHeader != null &&
          Object.hasOwnProperty.call(m, "signedHeader")
        )
          $root.tendermint.types.SignedHeader.encode(
            m.signedHeader,
            w.uint32(10).fork()
          ).ldelim();
        if (
          m.validatorSet != null &&
          Object.hasOwnProperty.call(m, "validatorSet")
        )
          $root.tendermint.types.ValidatorSet.encode(
            m.validatorSet,
            w.uint32(18).fork()
          ).ldelim();
        return w;
      };
      LightBlock.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.LightBlock();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.signedHeader = $root.tendermint.types.SignedHeader.decode(
                r,
                r.uint32()
              );
              break;
            case 2:
              m.validatorSet = $root.tendermint.types.ValidatorSet.decode(
                r,
                r.uint32()
              );
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      LightBlock.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.LightBlock) return d;
        var m = new $root.tendermint.types.LightBlock();
        if (d.signedHeader != null) {
          if (typeof d.signedHeader !== "object")
            throw TypeError(
              ".tendermint.types.LightBlock.signedHeader: object expected"
            );
          m.signedHeader = $root.tendermint.types.SignedHeader.fromObject(
            d.signedHeader
          );
        }
        if (d.validatorSet != null) {
          if (typeof d.validatorSet !== "object")
            throw TypeError(
              ".tendermint.types.LightBlock.validatorSet: object expected"
            );
          m.validatorSet = $root.tendermint.types.ValidatorSet.fromObject(
            d.validatorSet
          );
        }
        return m;
      };
      LightBlock.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.signedHeader = null;
          d.validatorSet = null;
        }
        if (m.signedHeader != null && m.hasOwnProperty("signedHeader")) {
          d.signedHeader = $root.tendermint.types.SignedHeader.toObject(
            m.signedHeader,
            o
          );
        }
        if (m.validatorSet != null && m.hasOwnProperty("validatorSet")) {
          d.validatorSet = $root.tendermint.types.ValidatorSet.toObject(
            m.validatorSet,
            o
          );
        }
        return d;
      };
      LightBlock.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return LightBlock;
    })();
    types.BlockMeta = (function () {
      function BlockMeta(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      BlockMeta.prototype.blockId = null;
      BlockMeta.prototype.blockSize = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      BlockMeta.prototype.header = null;
      BlockMeta.prototype.numTxs = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      BlockMeta.create = function create(properties) {
        return new BlockMeta(properties);
      };
      BlockMeta.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(
            m.blockId,
            w.uint32(10).fork()
          ).ldelim();
        if (m.blockSize != null && Object.hasOwnProperty.call(m, "blockSize"))
          w.uint32(16).int64(m.blockSize);
        if (m.header != null && Object.hasOwnProperty.call(m, "header"))
          $root.tendermint.types.Header.encode(
            m.header,
            w.uint32(26).fork()
          ).ldelim();
        if (m.numTxs != null && Object.hasOwnProperty.call(m, "numTxs"))
          w.uint32(32).int64(m.numTxs);
        return w;
      };
      BlockMeta.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.BlockMeta();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.blockId = $root.tendermint.types.BlockID.decode(r, r.uint32());
              break;
            case 2:
              m.blockSize = r.int64();
              break;
            case 3:
              m.header = $root.tendermint.types.Header.decode(r, r.uint32());
              break;
            case 4:
              m.numTxs = r.int64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      BlockMeta.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.BlockMeta) return d;
        var m = new $root.tendermint.types.BlockMeta();
        if (d.blockId != null) {
          if (typeof d.blockId !== "object")
            throw TypeError(
              ".tendermint.types.BlockMeta.blockId: object expected"
            );
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.blockSize != null) {
          if ($util.Long)
            (m.blockSize = $util.Long.fromValue(d.blockSize)).unsigned = false;
          else if (typeof d.blockSize === "string")
            m.blockSize = parseInt(d.blockSize, 10);
          else if (typeof d.blockSize === "number") m.blockSize = d.blockSize;
          else if (typeof d.blockSize === "object")
            m.blockSize = new $util.LongBits(
              d.blockSize.low >>> 0,
              d.blockSize.high >>> 0
            ).toNumber();
        }
        if (d.header != null) {
          if (typeof d.header !== "object")
            throw TypeError(
              ".tendermint.types.BlockMeta.header: object expected"
            );
          m.header = $root.tendermint.types.Header.fromObject(d.header);
        }
        if (d.numTxs != null) {
          if ($util.Long)
            (m.numTxs = $util.Long.fromValue(d.numTxs)).unsigned = false;
          else if (typeof d.numTxs === "string")
            m.numTxs = parseInt(d.numTxs, 10);
          else if (typeof d.numTxs === "number") m.numTxs = d.numTxs;
          else if (typeof d.numTxs === "object")
            m.numTxs = new $util.LongBits(
              d.numTxs.low >>> 0,
              d.numTxs.high >>> 0
            ).toNumber();
        }
        return m;
      };
      BlockMeta.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.blockId = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.blockSize =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.blockSize = o.longs === String ? "0" : 0;
          d.header = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.numTxs =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.numTxs = o.longs === String ? "0" : 0;
        }
        if (m.blockId != null && m.hasOwnProperty("blockId")) {
          d.blockId = $root.tendermint.types.BlockID.toObject(m.blockId, o);
        }
        if (m.blockSize != null && m.hasOwnProperty("blockSize")) {
          if (typeof m.blockSize === "number")
            d.blockSize =
              o.longs === String ? String(m.blockSize) : m.blockSize;
          else
            d.blockSize =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.blockSize)
                : o.longs === Number
                ? new $util.LongBits(
                    m.blockSize.low >>> 0,
                    m.blockSize.high >>> 0
                  ).toNumber()
                : m.blockSize;
        }
        if (m.header != null && m.hasOwnProperty("header")) {
          d.header = $root.tendermint.types.Header.toObject(m.header, o);
        }
        if (m.numTxs != null && m.hasOwnProperty("numTxs")) {
          if (typeof m.numTxs === "number")
            d.numTxs = o.longs === String ? String(m.numTxs) : m.numTxs;
          else
            d.numTxs =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.numTxs)
                : o.longs === Number
                ? new $util.LongBits(
                    m.numTxs.low >>> 0,
                    m.numTxs.high >>> 0
                  ).toNumber()
                : m.numTxs;
        }
        return d;
      };
      BlockMeta.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return BlockMeta;
    })();
    types.TxProof = (function () {
      function TxProof(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      TxProof.prototype.rootHash = $util.newBuffer([]);
      TxProof.prototype.data = $util.newBuffer([]);
      TxProof.prototype.proof = null;
      TxProof.create = function create(properties) {
        return new TxProof(properties);
      };
      TxProof.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.rootHash != null && Object.hasOwnProperty.call(m, "rootHash"))
          w.uint32(10).bytes(m.rootHash);
        if (m.data != null && Object.hasOwnProperty.call(m, "data"))
          w.uint32(18).bytes(m.data);
        if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
          $root.tendermint.crypto.Proof.encode(
            m.proof,
            w.uint32(26).fork()
          ).ldelim();
        return w;
      };
      TxProof.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.TxProof();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.rootHash = r.bytes();
              break;
            case 2:
              m.data = r.bytes();
              break;
            case 3:
              m.proof = $root.tendermint.crypto.Proof.decode(r, r.uint32());
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      TxProof.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.TxProof) return d;
        var m = new $root.tendermint.types.TxProof();
        if (d.rootHash != null) {
          if (typeof d.rootHash === "string")
            $util.base64.decode(
              d.rootHash,
              (m.rootHash = $util.newBuffer($util.base64.length(d.rootHash))),
              0
            );
          else if (d.rootHash.length) m.rootHash = d.rootHash;
        }
        if (d.data != null) {
          if (typeof d.data === "string")
            $util.base64.decode(
              d.data,
              (m.data = $util.newBuffer($util.base64.length(d.data))),
              0
            );
          else if (d.data.length) m.data = d.data;
        }
        if (d.proof != null) {
          if (typeof d.proof !== "object")
            throw TypeError(".tendermint.types.TxProof.proof: object expected");
          m.proof = $root.tendermint.crypto.Proof.fromObject(d.proof);
        }
        return m;
      };
      TxProof.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if (o.bytes === String) d.rootHash = "";
          else {
            d.rootHash = [];
            if (o.bytes !== Array) d.rootHash = $util.newBuffer(d.rootHash);
          }
          if (o.bytes === String) d.data = "";
          else {
            d.data = [];
            if (o.bytes !== Array) d.data = $util.newBuffer(d.data);
          }
          d.proof = null;
        }
        if (m.rootHash != null && m.hasOwnProperty("rootHash")) {
          d.rootHash =
            o.bytes === String
              ? $util.base64.encode(m.rootHash, 0, m.rootHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.rootHash)
              : m.rootHash;
        }
        if (m.data != null && m.hasOwnProperty("data")) {
          d.data =
            o.bytes === String
              ? $util.base64.encode(m.data, 0, m.data.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.data)
              : m.data;
        }
        if (m.proof != null && m.hasOwnProperty("proof")) {
          d.proof = $root.tendermint.crypto.Proof.toObject(m.proof, o);
        }
        return d;
      };
      TxProof.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return TxProof;
    })();
    types.ValidatorSet = (function () {
      function ValidatorSet(p) {
        this.validators = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ValidatorSet.prototype.validators = $util.emptyArray;
      ValidatorSet.prototype.proposer = null;
      ValidatorSet.prototype.totalVotingPower = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      ValidatorSet.create = function create(properties) {
        return new ValidatorSet(properties);
      };
      ValidatorSet.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.validators != null && m.validators.length) {
          for (var i = 0; i < m.validators.length; ++i)
            $root.tendermint.types.Validator.encode(
              m.validators[i],
              w.uint32(10).fork()
            ).ldelim();
        }
        if (m.proposer != null && Object.hasOwnProperty.call(m, "proposer"))
          $root.tendermint.types.Validator.encode(
            m.proposer,
            w.uint32(18).fork()
          ).ldelim();
        if (
          m.totalVotingPower != null &&
          Object.hasOwnProperty.call(m, "totalVotingPower")
        )
          w.uint32(24).int64(m.totalVotingPower);
        return w;
      };
      ValidatorSet.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.ValidatorSet();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              if (!(m.validators && m.validators.length)) m.validators = [];
              m.validators.push(
                $root.tendermint.types.Validator.decode(r, r.uint32())
              );
              break;
            case 2:
              m.proposer = $root.tendermint.types.Validator.decode(
                r,
                r.uint32()
              );
              break;
            case 3:
              m.totalVotingPower = r.int64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      ValidatorSet.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.ValidatorSet) return d;
        var m = new $root.tendermint.types.ValidatorSet();
        if (d.validators) {
          if (!Array.isArray(d.validators))
            throw TypeError(
              ".tendermint.types.ValidatorSet.validators: array expected"
            );
          m.validators = [];
          for (var i = 0; i < d.validators.length; ++i) {
            if (typeof d.validators[i] !== "object")
              throw TypeError(
                ".tendermint.types.ValidatorSet.validators: object expected"
              );
            m.validators[i] = $root.tendermint.types.Validator.fromObject(
              d.validators[i]
            );
          }
        }
        if (d.proposer != null) {
          if (typeof d.proposer !== "object")
            throw TypeError(
              ".tendermint.types.ValidatorSet.proposer: object expected"
            );
          m.proposer = $root.tendermint.types.Validator.fromObject(d.proposer);
        }
        if (d.totalVotingPower != null) {
          if ($util.Long)
            (m.totalVotingPower = $util.Long.fromValue(
              d.totalVotingPower
            )).unsigned = false;
          else if (typeof d.totalVotingPower === "string")
            m.totalVotingPower = parseInt(d.totalVotingPower, 10);
          else if (typeof d.totalVotingPower === "number")
            m.totalVotingPower = d.totalVotingPower;
          else if (typeof d.totalVotingPower === "object")
            m.totalVotingPower = new $util.LongBits(
              d.totalVotingPower.low >>> 0,
              d.totalVotingPower.high >>> 0
            ).toNumber();
        }
        return m;
      };
      ValidatorSet.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.arrays || o.defaults) {
          d.validators = [];
        }
        if (o.defaults) {
          d.proposer = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.totalVotingPower =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.totalVotingPower = o.longs === String ? "0" : 0;
        }
        if (m.validators && m.validators.length) {
          d.validators = [];
          for (var j = 0; j < m.validators.length; ++j) {
            d.validators[j] = $root.tendermint.types.Validator.toObject(
              m.validators[j],
              o
            );
          }
        }
        if (m.proposer != null && m.hasOwnProperty("proposer")) {
          d.proposer = $root.tendermint.types.Validator.toObject(m.proposer, o);
        }
        if (
          m.totalVotingPower != null &&
          m.hasOwnProperty("totalVotingPower")
        ) {
          if (typeof m.totalVotingPower === "number")
            d.totalVotingPower =
              o.longs === String
                ? String(m.totalVotingPower)
                : m.totalVotingPower;
          else
            d.totalVotingPower =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.totalVotingPower)
                : o.longs === Number
                ? new $util.LongBits(
                    m.totalVotingPower.low >>> 0,
                    m.totalVotingPower.high >>> 0
                  ).toNumber()
                : m.totalVotingPower;
        }
        return d;
      };
      ValidatorSet.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return ValidatorSet;
    })();
    types.Validator = (function () {
      function Validator(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Validator.prototype.address = $util.newBuffer([]);
      Validator.prototype.pubKey = null;
      Validator.prototype.votingPower = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Validator.prototype.proposerPriority = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      Validator.create = function create(properties) {
        return new Validator(properties);
      };
      Validator.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.address != null && Object.hasOwnProperty.call(m, "address"))
          w.uint32(10).bytes(m.address);
        if (m.pubKey != null && Object.hasOwnProperty.call(m, "pubKey"))
          $root.tendermint.crypto.PublicKey.encode(
            m.pubKey,
            w.uint32(18).fork()
          ).ldelim();
        if (
          m.votingPower != null &&
          Object.hasOwnProperty.call(m, "votingPower")
        )
          w.uint32(24).int64(m.votingPower);
        if (
          m.proposerPriority != null &&
          Object.hasOwnProperty.call(m, "proposerPriority")
        )
          w.uint32(32).int64(m.proposerPriority);
        return w;
      };
      Validator.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.Validator();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.address = r.bytes();
              break;
            case 2:
              m.pubKey = $root.tendermint.crypto.PublicKey.decode(
                r,
                r.uint32()
              );
              break;
            case 3:
              m.votingPower = r.int64();
              break;
            case 4:
              m.proposerPriority = r.int64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Validator.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.Validator) return d;
        var m = new $root.tendermint.types.Validator();
        if (d.address != null) {
          if (typeof d.address === "string")
            $util.base64.decode(
              d.address,
              (m.address = $util.newBuffer($util.base64.length(d.address))),
              0
            );
          else if (d.address.length) m.address = d.address;
        }
        if (d.pubKey != null) {
          if (typeof d.pubKey !== "object")
            throw TypeError(
              ".tendermint.types.Validator.pubKey: object expected"
            );
          m.pubKey = $root.tendermint.crypto.PublicKey.fromObject(d.pubKey);
        }
        if (d.votingPower != null) {
          if ($util.Long)
            (m.votingPower = $util.Long.fromValue(
              d.votingPower
            )).unsigned = false;
          else if (typeof d.votingPower === "string")
            m.votingPower = parseInt(d.votingPower, 10);
          else if (typeof d.votingPower === "number")
            m.votingPower = d.votingPower;
          else if (typeof d.votingPower === "object")
            m.votingPower = new $util.LongBits(
              d.votingPower.low >>> 0,
              d.votingPower.high >>> 0
            ).toNumber();
        }
        if (d.proposerPriority != null) {
          if ($util.Long)
            (m.proposerPriority = $util.Long.fromValue(
              d.proposerPriority
            )).unsigned = false;
          else if (typeof d.proposerPriority === "string")
            m.proposerPriority = parseInt(d.proposerPriority, 10);
          else if (typeof d.proposerPriority === "number")
            m.proposerPriority = d.proposerPriority;
          else if (typeof d.proposerPriority === "object")
            m.proposerPriority = new $util.LongBits(
              d.proposerPriority.low >>> 0,
              d.proposerPriority.high >>> 0
            ).toNumber();
        }
        return m;
      };
      Validator.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if (o.bytes === String) d.address = "";
          else {
            d.address = [];
            if (o.bytes !== Array) d.address = $util.newBuffer(d.address);
          }
          d.pubKey = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.votingPower =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.votingPower = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.proposerPriority =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.proposerPriority = o.longs === String ? "0" : 0;
        }
        if (m.address != null && m.hasOwnProperty("address")) {
          d.address =
            o.bytes === String
              ? $util.base64.encode(m.address, 0, m.address.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.address)
              : m.address;
        }
        if (m.pubKey != null && m.hasOwnProperty("pubKey")) {
          d.pubKey = $root.tendermint.crypto.PublicKey.toObject(m.pubKey, o);
        }
        if (m.votingPower != null && m.hasOwnProperty("votingPower")) {
          if (typeof m.votingPower === "number")
            d.votingPower =
              o.longs === String ? String(m.votingPower) : m.votingPower;
          else
            d.votingPower =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.votingPower)
                : o.longs === Number
                ? new $util.LongBits(
                    m.votingPower.low >>> 0,
                    m.votingPower.high >>> 0
                  ).toNumber()
                : m.votingPower;
        }
        if (
          m.proposerPriority != null &&
          m.hasOwnProperty("proposerPriority")
        ) {
          if (typeof m.proposerPriority === "number")
            d.proposerPriority =
              o.longs === String
                ? String(m.proposerPriority)
                : m.proposerPriority;
          else
            d.proposerPriority =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.proposerPriority)
                : o.longs === Number
                ? new $util.LongBits(
                    m.proposerPriority.low >>> 0,
                    m.proposerPriority.high >>> 0
                  ).toNumber()
                : m.proposerPriority;
        }
        return d;
      };
      Validator.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Validator;
    })();
    types.SimpleValidator = (function () {
      function SimpleValidator(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      SimpleValidator.prototype.pubKey = null;
      SimpleValidator.prototype.votingPower = $util.Long
        ? $util.Long.fromBits(0, 0, false)
        : 0;
      SimpleValidator.create = function create(properties) {
        return new SimpleValidator(properties);
      };
      SimpleValidator.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.pubKey != null && Object.hasOwnProperty.call(m, "pubKey"))
          $root.tendermint.crypto.PublicKey.encode(
            m.pubKey,
            w.uint32(10).fork()
          ).ldelim();
        if (
          m.votingPower != null &&
          Object.hasOwnProperty.call(m, "votingPower")
        )
          w.uint32(16).int64(m.votingPower);
        return w;
      };
      SimpleValidator.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.types.SimpleValidator();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.pubKey = $root.tendermint.crypto.PublicKey.decode(
                r,
                r.uint32()
              );
              break;
            case 2:
              m.votingPower = r.int64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      SimpleValidator.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.types.SimpleValidator) return d;
        var m = new $root.tendermint.types.SimpleValidator();
        if (d.pubKey != null) {
          if (typeof d.pubKey !== "object")
            throw TypeError(
              ".tendermint.types.SimpleValidator.pubKey: object expected"
            );
          m.pubKey = $root.tendermint.crypto.PublicKey.fromObject(d.pubKey);
        }
        if (d.votingPower != null) {
          if ($util.Long)
            (m.votingPower = $util.Long.fromValue(
              d.votingPower
            )).unsigned = false;
          else if (typeof d.votingPower === "string")
            m.votingPower = parseInt(d.votingPower, 10);
          else if (typeof d.votingPower === "number")
            m.votingPower = d.votingPower;
          else if (typeof d.votingPower === "object")
            m.votingPower = new $util.LongBits(
              d.votingPower.low >>> 0,
              d.votingPower.high >>> 0
            ).toNumber();
        }
        return m;
      };
      SimpleValidator.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          d.pubKey = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.votingPower =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.votingPower = o.longs === String ? "0" : 0;
        }
        if (m.pubKey != null && m.hasOwnProperty("pubKey")) {
          d.pubKey = $root.tendermint.crypto.PublicKey.toObject(m.pubKey, o);
        }
        if (m.votingPower != null && m.hasOwnProperty("votingPower")) {
          if (typeof m.votingPower === "number")
            d.votingPower =
              o.longs === String ? String(m.votingPower) : m.votingPower;
          else
            d.votingPower =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.votingPower)
                : o.longs === Number
                ? new $util.LongBits(
                    m.votingPower.low >>> 0,
                    m.votingPower.high >>> 0
                  ).toNumber()
                : m.votingPower;
        }
        return d;
      };
      SimpleValidator.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return SimpleValidator;
    })();
    return types;
  })();
  tendermint.version = (function () {
    const version = {};
    version.App = (function () {
      function App(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      App.prototype.protocol = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      App.prototype.software = "";
      App.create = function create(properties) {
        return new App(properties);
      };
      App.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.protocol != null && Object.hasOwnProperty.call(m, "protocol"))
          w.uint32(8).uint64(m.protocol);
        if (m.software != null && Object.hasOwnProperty.call(m, "software"))
          w.uint32(18).string(m.software);
        return w;
      };
      App.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.version.App();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.protocol = r.uint64();
              break;
            case 2:
              m.software = r.string();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      App.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.version.App) return d;
        var m = new $root.tendermint.version.App();
        if (d.protocol != null) {
          if ($util.Long)
            (m.protocol = $util.Long.fromValue(d.protocol)).unsigned = true;
          else if (typeof d.protocol === "string")
            m.protocol = parseInt(d.protocol, 10);
          else if (typeof d.protocol === "number") m.protocol = d.protocol;
          else if (typeof d.protocol === "object")
            m.protocol = new $util.LongBits(
              d.protocol.low >>> 0,
              d.protocol.high >>> 0
            ).toNumber(true);
        }
        if (d.software != null) {
          m.software = String(d.software);
        }
        return m;
      };
      App.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.protocol =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.protocol = o.longs === String ? "0" : 0;
          d.software = "";
        }
        if (m.protocol != null && m.hasOwnProperty("protocol")) {
          if (typeof m.protocol === "number")
            d.protocol = o.longs === String ? String(m.protocol) : m.protocol;
          else
            d.protocol =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.protocol)
                : o.longs === Number
                ? new $util.LongBits(
                    m.protocol.low >>> 0,
                    m.protocol.high >>> 0
                  ).toNumber(true)
                : m.protocol;
        }
        if (m.software != null && m.hasOwnProperty("software")) {
          d.software = m.software;
        }
        return d;
      };
      App.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return App;
    })();
    version.Consensus = (function () {
      function Consensus(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Consensus.prototype.block = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      Consensus.prototype.app = $util.Long
        ? $util.Long.fromBits(0, 0, true)
        : 0;
      Consensus.create = function create(properties) {
        return new Consensus(properties);
      };
      Consensus.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.block != null && Object.hasOwnProperty.call(m, "block"))
          w.uint32(8).uint64(m.block);
        if (m.app != null && Object.hasOwnProperty.call(m, "app"))
          w.uint32(16).uint64(m.app);
        return w;
      };
      Consensus.decode = function decode(r, l) {
        if (!(r instanceof $Reader)) r = $Reader.create(r);
        var c = l === undefined ? r.len : r.pos + l,
          m = new $root.tendermint.version.Consensus();
        while (r.pos < c) {
          var t = r.uint32();
          switch (t >>> 3) {
            case 1:
              m.block = r.uint64();
              break;
            case 2:
              m.app = r.uint64();
              break;
            default:
              r.skipType(t & 7);
              break;
          }
        }
        return m;
      };
      Consensus.fromObject = function fromObject(d) {
        if (d instanceof $root.tendermint.version.Consensus) return d;
        var m = new $root.tendermint.version.Consensus();
        if (d.block != null) {
          if ($util.Long)
            (m.block = $util.Long.fromValue(d.block)).unsigned = true;
          else if (typeof d.block === "string") m.block = parseInt(d.block, 10);
          else if (typeof d.block === "number") m.block = d.block;
          else if (typeof d.block === "object")
            m.block = new $util.LongBits(
              d.block.low >>> 0,
              d.block.high >>> 0
            ).toNumber(true);
        }
        if (d.app != null) {
          if ($util.Long) (m.app = $util.Long.fromValue(d.app)).unsigned = true;
          else if (typeof d.app === "string") m.app = parseInt(d.app, 10);
          else if (typeof d.app === "number") m.app = d.app;
          else if (typeof d.app === "object")
            m.app = new $util.LongBits(
              d.app.low >>> 0,
              d.app.high >>> 0
            ).toNumber(true);
        }
        return m;
      };
      Consensus.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.block =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.block = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.app =
              o.longs === String
                ? n.toString()
                : o.longs === Number
                ? n.toNumber()
                : n;
          } else d.app = o.longs === String ? "0" : 0;
        }
        if (m.block != null && m.hasOwnProperty("block")) {
          if (typeof m.block === "number")
            d.block = o.longs === String ? String(m.block) : m.block;
          else
            d.block =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.block)
                : o.longs === Number
                ? new $util.LongBits(
                    m.block.low >>> 0,
                    m.block.high >>> 0
                  ).toNumber(true)
                : m.block;
        }
        if (m.app != null && m.hasOwnProperty("app")) {
          if (typeof m.app === "number")
            d.app = o.longs === String ? String(m.app) : m.app;
          else
            d.app =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.app)
                : o.longs === Number
                ? new $util.LongBits(
                    m.app.low >>> 0,
                    m.app.high >>> 0
                  ).toNumber(true)
                : m.app;
        }
        return d;
      };
      Consensus.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return Consensus;
    })();
    return version;
  })();
  return tendermint;
})();
module.exports = $root;

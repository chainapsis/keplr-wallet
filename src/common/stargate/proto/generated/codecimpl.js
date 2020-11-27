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
  cosmos.auth = (function() {
    const auth = {};
    auth.v1beta1 = (function() {
      const v1beta1 = {};
      v1beta1.BaseAccount = (function() {
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
        return BaseAccount;
      })();
      v1beta1.ModuleAccount = (function() {
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
        return ModuleAccount;
      })();
      v1beta1.Params = (function() {
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
        return Params;
      })();
      v1beta1.Query = (function() {
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
      v1beta1.QueryAccountRequest = (function() {
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
        return QueryAccountRequest;
      })();
      v1beta1.QueryAccountResponse = (function() {
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
        return QueryAccountResponse;
      })();
      v1beta1.QueryParamsRequest = (function() {
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
        return QueryParamsRequest;
      })();
      v1beta1.QueryParamsResponse = (function() {
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
        return QueryParamsResponse;
      })();
      return v1beta1;
    })();
    return auth;
  })();
  cosmos.bank = (function() {
    const bank = {};
    bank.v1beta1 = (function() {
      const v1beta1 = {};
      v1beta1.Params = (function() {
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
        return Params;
      })();
      v1beta1.SendEnabled = (function() {
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
        return SendEnabled;
      })();
      v1beta1.Input = (function() {
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
        return Input;
      })();
      v1beta1.Output = (function() {
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
        return Output;
      })();
      v1beta1.Supply = (function() {
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
        return Supply;
      })();
      v1beta1.DenomUnit = (function() {
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
        return DenomUnit;
      })();
      v1beta1.Metadata = (function() {
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
        return Metadata;
      })();
      v1beta1.Query = (function() {
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
      v1beta1.QueryBalanceRequest = (function() {
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
        return QueryBalanceRequest;
      })();
      v1beta1.QueryBalanceResponse = (function() {
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
        return QueryBalanceResponse;
      })();
      v1beta1.QueryAllBalancesRequest = (function() {
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
        return QueryAllBalancesRequest;
      })();
      v1beta1.QueryAllBalancesResponse = (function() {
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
        return QueryAllBalancesResponse;
      })();
      v1beta1.QueryTotalSupplyRequest = (function() {
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
        return QueryTotalSupplyRequest;
      })();
      v1beta1.QueryTotalSupplyResponse = (function() {
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
        return QueryTotalSupplyResponse;
      })();
      v1beta1.QuerySupplyOfRequest = (function() {
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
        return QuerySupplyOfRequest;
      })();
      v1beta1.QuerySupplyOfResponse = (function() {
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
        return QuerySupplyOfResponse;
      })();
      v1beta1.QueryParamsRequest = (function() {
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
        return QueryParamsRequest;
      })();
      v1beta1.QueryParamsResponse = (function() {
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
        return QueryParamsResponse;
      })();
      v1beta1.Msg = (function() {
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
      v1beta1.MsgSend = (function() {
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
        return MsgSend;
      })();
      v1beta1.MsgSendResponse = (function() {
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
        return MsgSendResponse;
      })();
      v1beta1.MsgMultiSend = (function() {
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
        return MsgMultiSend;
      })();
      v1beta1.MsgMultiSendResponse = (function() {
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
        return MsgMultiSendResponse;
      })();
      return v1beta1;
    })();
    return bank;
  })();
  cosmos.base = (function() {
    const base = {};
    base.query = (function() {
      const query = {};
      query.v1beta1 = (function() {
        const v1beta1 = {};
        v1beta1.PageRequest = (function() {
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
          return PageRequest;
        })();
        v1beta1.PageResponse = (function() {
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
          return PageResponse;
        })();
        return v1beta1;
      })();
      return query;
    })();
    base.v1beta1 = (function() {
      const v1beta1 = {};
      v1beta1.Coin = (function() {
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
        return Coin;
      })();
      v1beta1.DecCoin = (function() {
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
        return DecCoin;
      })();
      v1beta1.IntProto = (function() {
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
        return IntProto;
      })();
      v1beta1.DecProto = (function() {
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
        return DecProto;
      })();
      return v1beta1;
    })();
    return base;
  })();
  cosmos.crypto = (function() {
    const crypto = {};
    crypto.multisig = (function() {
      const multisig = {};
      multisig.v1beta1 = (function() {
        const v1beta1 = {};
        v1beta1.MultiSignature = (function() {
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
          return MultiSignature;
        })();
        v1beta1.CompactBitArray = (function() {
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
          return CompactBitArray;
        })();
        return v1beta1;
      })();
      return multisig;
    })();
    crypto.secp256k1 = (function() {
      const secp256k1 = {};
      secp256k1.PubKey = (function() {
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
        return PubKey;
      })();
      secp256k1.PrivKey = (function() {
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
        return PrivKey;
      })();
      return secp256k1;
    })();
    return crypto;
  })();
  cosmos.staking = (function() {
    const staking = {};
    staking.v1beta1 = (function() {
      const v1beta1 = {};
      v1beta1.HistoricalInfo = (function() {
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
        return HistoricalInfo;
      })();
      v1beta1.CommissionRates = (function() {
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
        return CommissionRates;
      })();
      v1beta1.Commission = (function() {
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
        return Commission;
      })();
      v1beta1.Description = (function() {
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
        return Description;
      })();
      v1beta1.Validator = (function() {
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
        return Validator;
      })();
      v1beta1.BondStatus = (function() {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = "BOND_STATUS_UNSPECIFIED")] = 0;
        values[(valuesById[1] = "BOND_STATUS_UNBONDED")] = 1;
        values[(valuesById[2] = "BOND_STATUS_UNBONDING")] = 2;
        values[(valuesById[3] = "BOND_STATUS_BONDED")] = 3;
        return values;
      })();
      v1beta1.ValAddresses = (function() {
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
        return ValAddresses;
      })();
      v1beta1.DVPair = (function() {
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
        return DVPair;
      })();
      v1beta1.DVPairs = (function() {
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
        return DVPairs;
      })();
      v1beta1.DVVTriplet = (function() {
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
        return DVVTriplet;
      })();
      v1beta1.DVVTriplets = (function() {
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
        return DVVTriplets;
      })();
      v1beta1.Delegation = (function() {
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
        return Delegation;
      })();
      v1beta1.UnbondingDelegation = (function() {
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
        return UnbondingDelegation;
      })();
      v1beta1.UnbondingDelegationEntry = (function() {
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
        return UnbondingDelegationEntry;
      })();
      v1beta1.RedelegationEntry = (function() {
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
        return RedelegationEntry;
      })();
      v1beta1.Redelegation = (function() {
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
        return Redelegation;
      })();
      v1beta1.Params = (function() {
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
        return Params;
      })();
      v1beta1.DelegationResponse = (function() {
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
        return DelegationResponse;
      })();
      v1beta1.RedelegationEntryResponse = (function() {
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
        return RedelegationEntryResponse;
      })();
      v1beta1.RedelegationResponse = (function() {
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
        return RedelegationResponse;
      })();
      v1beta1.Pool = (function() {
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
        return Pool;
      })();
      v1beta1.Msg = (function() {
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
      v1beta1.MsgCreateValidator = (function() {
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
        return MsgCreateValidator;
      })();
      v1beta1.MsgCreateValidatorResponse = (function() {
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
        return MsgCreateValidatorResponse;
      })();
      v1beta1.MsgEditValidator = (function() {
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
        return MsgEditValidator;
      })();
      v1beta1.MsgEditValidatorResponse = (function() {
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
        return MsgEditValidatorResponse;
      })();
      v1beta1.MsgDelegate = (function() {
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
        return MsgDelegate;
      })();
      v1beta1.MsgDelegateResponse = (function() {
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
        return MsgDelegateResponse;
      })();
      v1beta1.MsgBeginRedelegate = (function() {
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
        return MsgBeginRedelegate;
      })();
      v1beta1.MsgBeginRedelegateResponse = (function() {
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
        return MsgBeginRedelegateResponse;
      })();
      v1beta1.MsgUndelegate = (function() {
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
        return MsgUndelegate;
      })();
      v1beta1.MsgUndelegateResponse = (function() {
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
        return MsgUndelegateResponse;
      })();
      return v1beta1;
    })();
    return staking;
  })();
  cosmos.tx = (function() {
    const tx = {};
    tx.signing = (function() {
      const signing = {};
      signing.v1beta1 = (function() {
        const v1beta1 = {};
        v1beta1.SignMode = (function() {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "SIGN_MODE_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "SIGN_MODE_DIRECT")] = 1;
          values[(valuesById[2] = "SIGN_MODE_TEXTUAL")] = 2;
          values[(valuesById[127] = "SIGN_MODE_LEGACY_AMINO_JSON")] = 127;
          return values;
        })();
        v1beta1.SignatureDescriptors = (function() {
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
          return SignatureDescriptors;
        })();
        v1beta1.SignatureDescriptor = (function() {
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
          SignatureDescriptor.Data = (function() {
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
              set: $util.oneOfSetter($oneOfFields)
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
            Data.Single = (function() {
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
              return Single;
            })();
            Data.Multi = (function() {
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
    tx.v1beta1 = (function() {
      const v1beta1 = {};
      v1beta1.Tx = (function() {
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
        return Tx;
      })();
      v1beta1.TxRaw = (function() {
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
        return TxRaw;
      })();
      v1beta1.SignDoc = (function() {
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
        return SignDoc;
      })();
      v1beta1.TxBody = (function() {
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
        return TxBody;
      })();
      v1beta1.AuthInfo = (function() {
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
        return AuthInfo;
      })();
      v1beta1.SignerInfo = (function() {
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
        return SignerInfo;
      })();
      v1beta1.ModeInfo = (function() {
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
          set: $util.oneOfSetter($oneOfFields)
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
        ModeInfo.Single = (function() {
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
          return Single;
        })();
        ModeInfo.Multi = (function() {
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
          return Multi;
        })();
        return ModeInfo;
      })();
      v1beta1.Fee = (function() {
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
  google.protobuf = (function() {
    const protobuf = {};
    protobuf.Any = (function() {
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
      return Any;
    })();
    protobuf.FileDescriptorSet = (function() {
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
      return FileDescriptorSet;
    })();
    protobuf.FileDescriptorProto = (function() {
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
      return FileDescriptorProto;
    })();
    protobuf.DescriptorProto = (function() {
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
      DescriptorProto.ExtensionRange = (function() {
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
        return ExtensionRange;
      })();
      DescriptorProto.ReservedRange = (function() {
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
        return ReservedRange;
      })();
      return DescriptorProto;
    })();
    protobuf.FieldDescriptorProto = (function() {
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
      FieldDescriptorProto.Type = (function() {
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
      FieldDescriptorProto.Label = (function() {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[1] = "LABEL_OPTIONAL")] = 1;
        values[(valuesById[2] = "LABEL_REQUIRED")] = 2;
        values[(valuesById[3] = "LABEL_REPEATED")] = 3;
        return values;
      })();
      return FieldDescriptorProto;
    })();
    protobuf.OneofDescriptorProto = (function() {
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
      return OneofDescriptorProto;
    })();
    protobuf.EnumDescriptorProto = (function() {
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
      return EnumDescriptorProto;
    })();
    protobuf.EnumValueDescriptorProto = (function() {
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
      return EnumValueDescriptorProto;
    })();
    protobuf.ServiceDescriptorProto = (function() {
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
      return ServiceDescriptorProto;
    })();
    protobuf.MethodDescriptorProto = (function() {
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
      return MethodDescriptorProto;
    })();
    protobuf.FileOptions = (function() {
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
      FileOptions.OptimizeMode = (function() {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[1] = "SPEED")] = 1;
        values[(valuesById[2] = "CODE_SIZE")] = 2;
        values[(valuesById[3] = "LITE_RUNTIME")] = 3;
        return values;
      })();
      return FileOptions;
    })();
    protobuf.MessageOptions = (function() {
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
      return MessageOptions;
    })();
    protobuf.FieldOptions = (function() {
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
      FieldOptions.CType = (function() {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = "STRING")] = 0;
        values[(valuesById[1] = "CORD")] = 1;
        values[(valuesById[2] = "STRING_PIECE")] = 2;
        return values;
      })();
      FieldOptions.JSType = (function() {
        const valuesById = {},
          values = Object.create(valuesById);
        values[(valuesById[0] = "JS_NORMAL")] = 0;
        values[(valuesById[1] = "JS_STRING")] = 1;
        values[(valuesById[2] = "JS_NUMBER")] = 2;
        return values;
      })();
      return FieldOptions;
    })();
    protobuf.OneofOptions = (function() {
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
      return OneofOptions;
    })();
    protobuf.EnumOptions = (function() {
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
      return EnumOptions;
    })();
    protobuf.EnumValueOptions = (function() {
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
      return EnumValueOptions;
    })();
    protobuf.ServiceOptions = (function() {
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
      return ServiceOptions;
    })();
    protobuf.MethodOptions = (function() {
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
      return MethodOptions;
    })();
    protobuf.UninterpretedOption = (function() {
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
      UninterpretedOption.NamePart = (function() {
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
              instance: m
            });
          if (!m.hasOwnProperty("isExtension"))
            throw $util.ProtocolError("missing required 'isExtension'", {
              instance: m
            });
          return m;
        };
        return NamePart;
      })();
      return UninterpretedOption;
    })();
    protobuf.SourceCodeInfo = (function() {
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
      SourceCodeInfo.Location = (function() {
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
        return Location;
      })();
      return SourceCodeInfo;
    })();
    protobuf.GeneratedCodeInfo = (function() {
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
      GeneratedCodeInfo.Annotation = (function() {
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
        return Annotation;
      })();
      return GeneratedCodeInfo;
    })();
    protobuf.Duration = (function() {
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
      return Duration;
    })();
    protobuf.Timestamp = (function() {
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
      return Timestamp;
    })();
    return protobuf;
  })();
  google.api = (function() {
    const api = {};
    api.Http = (function() {
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
      return Http;
    })();
    api.HttpRule = (function() {
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
        set: $util.oneOfSetter($oneOfFields)
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
      return HttpRule;
    })();
    api.CustomHttpPattern = (function() {
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
      return CustomHttpPattern;
    })();
    return api;
  })();
  return google;
})();
exports.ibc = $root.ibc = (() => {
  const ibc = {};
  ibc.core = (function() {
    const core = {};
    core.channel = (function() {
      const channel = {};
      channel.v1 = (function() {
        const v1 = {};
        v1.Channel = (function() {
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
          return Channel;
        })();
        v1.IdentifiedChannel = (function() {
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
          return IdentifiedChannel;
        })();
        v1.State = (function() {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "STATE_UNINITIALIZED_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "STATE_INIT")] = 1;
          values[(valuesById[2] = "STATE_TRYOPEN")] = 2;
          values[(valuesById[3] = "STATE_OPEN")] = 3;
          values[(valuesById[4] = "STATE_CLOSED")] = 4;
          return values;
        })();
        v1.Order = (function() {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "ORDER_NONE_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "ORDER_UNORDERED")] = 1;
          values[(valuesById[2] = "ORDER_ORDERED")] = 2;
          return values;
        })();
        v1.Counterparty = (function() {
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
          return Counterparty;
        })();
        v1.Packet = (function() {
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
          return Packet;
        })();
        v1.PacketState = (function() {
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
          return PacketState;
        })();
        v1.Acknowledgement = (function() {
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
            set: $util.oneOfSetter($oneOfFields)
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
          return Acknowledgement;
        })();
        v1.Query = (function() {
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
        v1.QueryChannelRequest = (function() {
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
          return QueryChannelRequest;
        })();
        v1.QueryChannelResponse = (function() {
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
          return QueryChannelResponse;
        })();
        v1.QueryChannelsRequest = (function() {
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
          return QueryChannelsRequest;
        })();
        v1.QueryChannelsResponse = (function() {
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
          return QueryChannelsResponse;
        })();
        v1.QueryConnectionChannelsRequest = (function() {
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
          return QueryConnectionChannelsRequest;
        })();
        v1.QueryConnectionChannelsResponse = (function() {
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
          return QueryConnectionChannelsResponse;
        })();
        v1.QueryChannelClientStateRequest = (function() {
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
          return QueryChannelClientStateRequest;
        })();
        v1.QueryChannelClientStateResponse = (function() {
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
          return QueryChannelClientStateResponse;
        })();
        v1.QueryChannelConsensusStateRequest = (function() {
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
          return QueryChannelConsensusStateRequest;
        })();
        v1.QueryChannelConsensusStateResponse = (function() {
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
          return QueryChannelConsensusStateResponse;
        })();
        v1.QueryPacketCommitmentRequest = (function() {
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
          return QueryPacketCommitmentRequest;
        })();
        v1.QueryPacketCommitmentResponse = (function() {
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
          return QueryPacketCommitmentResponse;
        })();
        v1.QueryPacketCommitmentsRequest = (function() {
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
          return QueryPacketCommitmentsRequest;
        })();
        v1.QueryPacketCommitmentsResponse = (function() {
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
          return QueryPacketCommitmentsResponse;
        })();
        v1.QueryPacketReceiptRequest = (function() {
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
          return QueryPacketReceiptRequest;
        })();
        v1.QueryPacketReceiptResponse = (function() {
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
          return QueryPacketReceiptResponse;
        })();
        v1.QueryPacketAcknowledgementRequest = (function() {
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
          return QueryPacketAcknowledgementRequest;
        })();
        v1.QueryPacketAcknowledgementResponse = (function() {
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
          return QueryPacketAcknowledgementResponse;
        })();
        v1.QueryPacketAcknowledgementsRequest = (function() {
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
          return QueryPacketAcknowledgementsRequest;
        })();
        v1.QueryPacketAcknowledgementsResponse = (function() {
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
          return QueryPacketAcknowledgementsResponse;
        })();
        v1.QueryUnreceivedPacketsRequest = (function() {
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
          return QueryUnreceivedPacketsRequest;
        })();
        v1.QueryUnreceivedPacketsResponse = (function() {
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
          return QueryUnreceivedPacketsResponse;
        })();
        v1.QueryUnreceivedAcksRequest = (function() {
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
          return QueryUnreceivedAcksRequest;
        })();
        v1.QueryUnreceivedAcksResponse = (function() {
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
          return QueryUnreceivedAcksResponse;
        })();
        v1.QueryNextSequenceReceiveRequest = (function() {
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
          return QueryNextSequenceReceiveRequest;
        })();
        v1.QueryNextSequenceReceiveResponse = (function() {
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
          return QueryNextSequenceReceiveResponse;
        })();
        return v1;
      })();
      return channel;
    })();
    core.client = (function() {
      const client = {};
      client.v1 = (function() {
        const v1 = {};
        v1.Msg = (function() {
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
        v1.MsgCreateClient = (function() {
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
          return MsgCreateClient;
        })();
        v1.MsgCreateClientResponse = (function() {
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
          return MsgCreateClientResponse;
        })();
        v1.MsgUpdateClient = (function() {
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
          return MsgUpdateClient;
        })();
        v1.MsgUpdateClientResponse = (function() {
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
          return MsgUpdateClientResponse;
        })();
        v1.MsgUpgradeClient = (function() {
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
          return MsgUpgradeClient;
        })();
        v1.MsgUpgradeClientResponse = (function() {
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
          return MsgUpgradeClientResponse;
        })();
        v1.MsgSubmitMisbehaviour = (function() {
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
          return MsgSubmitMisbehaviour;
        })();
        v1.MsgSubmitMisbehaviourResponse = (function() {
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
          return MsgSubmitMisbehaviourResponse;
        })();
        v1.IdentifiedClientState = (function() {
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
          return IdentifiedClientState;
        })();
        v1.ConsensusStateWithHeight = (function() {
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
          return ConsensusStateWithHeight;
        })();
        v1.ClientConsensusStates = (function() {
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
          return ClientConsensusStates;
        })();
        v1.ClientUpdateProposal = (function() {
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
          return ClientUpdateProposal;
        })();
        v1.Height = (function() {
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
          return Height;
        })();
        return v1;
      })();
      return client;
    })();
    core.commitment = (function() {
      const commitment = {};
      commitment.v1 = (function() {
        const v1 = {};
        v1.MerkleRoot = (function() {
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
          return MerkleRoot;
        })();
        v1.MerklePrefix = (function() {
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
          return MerklePrefix;
        })();
        v1.MerklePath = (function() {
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
          return MerklePath;
        })();
        v1.MerkleProof = (function() {
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
          return MerkleProof;
        })();
        v1.KeyPath = (function() {
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
          return KeyPath;
        })();
        v1.Key = (function() {
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
          return Key;
        })();
        v1.KeyEncoding = (function() {
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
    core.connection = (function() {
      const connection = {};
      connection.v1 = (function() {
        const v1 = {};
        v1.ConnectionEnd = (function() {
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
          return ConnectionEnd;
        })();
        v1.IdentifiedConnection = (function() {
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
          return IdentifiedConnection;
        })();
        v1.State = (function() {
          const valuesById = {},
            values = Object.create(valuesById);
          values[(valuesById[0] = "STATE_UNINITIALIZED_UNSPECIFIED")] = 0;
          values[(valuesById[1] = "STATE_INIT")] = 1;
          values[(valuesById[2] = "STATE_TRYOPEN")] = 2;
          values[(valuesById[3] = "STATE_OPEN")] = 3;
          return values;
        })();
        v1.Counterparty = (function() {
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
          return Counterparty;
        })();
        v1.ClientPaths = (function() {
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
          return ClientPaths;
        })();
        v1.ConnectionPaths = (function() {
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
          return ConnectionPaths;
        })();
        v1.Version = (function() {
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
          return Version;
        })();
        v1.Query = (function() {
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
        v1.QueryConnectionRequest = (function() {
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
          return QueryConnectionRequest;
        })();
        v1.QueryConnectionResponse = (function() {
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
          return QueryConnectionResponse;
        })();
        v1.QueryConnectionsRequest = (function() {
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
          return QueryConnectionsRequest;
        })();
        v1.QueryConnectionsResponse = (function() {
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
          return QueryConnectionsResponse;
        })();
        v1.QueryClientConnectionsRequest = (function() {
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
          return QueryClientConnectionsRequest;
        })();
        v1.QueryClientConnectionsResponse = (function() {
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
          return QueryClientConnectionsResponse;
        })();
        v1.QueryConnectionClientStateRequest = (function() {
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
          return QueryConnectionClientStateRequest;
        })();
        v1.QueryConnectionClientStateResponse = (function() {
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
          return QueryConnectionClientStateResponse;
        })();
        v1.QueryConnectionConsensusStateRequest = (function() {
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
          return QueryConnectionConsensusStateRequest;
        })();
        v1.QueryConnectionConsensusStateResponse = (function() {
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
  tendermint.crypto = (function() {
    const crypto = {};
    crypto.PublicKey = (function() {
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
        set: $util.oneOfSetter($oneOfFields)
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
      return PublicKey;
    })();
    crypto.Proof = (function() {
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
      return Proof;
    })();
    crypto.ValueOp = (function() {
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
      return ValueOp;
    })();
    crypto.DominoOp = (function() {
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
      return DominoOp;
    })();
    crypto.ProofOp = (function() {
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
      return ProofOp;
    })();
    crypto.ProofOps = (function() {
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
      return ProofOps;
    })();
    return crypto;
  })();
  tendermint.libs = (function() {
    const libs = {};
    libs.bits = (function() {
      const bits = {};
      bits.BitArray = (function() {
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
        return BitArray;
      })();
      return bits;
    })();
    return libs;
  })();
  tendermint.types = (function() {
    const types = {};
    types.BlockIDFlag = (function() {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = "BLOCK_ID_FLAG_UNKNOWN")] = 0;
      values[(valuesById[1] = "BLOCK_ID_FLAG_ABSENT")] = 1;
      values[(valuesById[2] = "BLOCK_ID_FLAG_COMMIT")] = 2;
      values[(valuesById[3] = "BLOCK_ID_FLAG_NIL")] = 3;
      return values;
    })();
    types.SignedMsgType = (function() {
      const valuesById = {},
        values = Object.create(valuesById);
      values[(valuesById[0] = "SIGNED_MSG_TYPE_UNKNOWN")] = 0;
      values[(valuesById[1] = "SIGNED_MSG_TYPE_PREVOTE")] = 1;
      values[(valuesById[2] = "SIGNED_MSG_TYPE_PRECOMMIT")] = 2;
      values[(valuesById[32] = "SIGNED_MSG_TYPE_PROPOSAL")] = 32;
      return values;
    })();
    types.PartSetHeader = (function() {
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
      return PartSetHeader;
    })();
    types.Part = (function() {
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
      return Part;
    })();
    types.BlockID = (function() {
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
      return BlockID;
    })();
    types.Header = (function() {
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
      return Header;
    })();
    types.Data = (function() {
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
      return Data;
    })();
    types.Vote = (function() {
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
      return Vote;
    })();
    types.Commit = (function() {
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
      return Commit;
    })();
    types.CommitSig = (function() {
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
      return CommitSig;
    })();
    types.Proposal = (function() {
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
      return Proposal;
    })();
    types.SignedHeader = (function() {
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
      return SignedHeader;
    })();
    types.LightBlock = (function() {
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
      return LightBlock;
    })();
    types.BlockMeta = (function() {
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
      return BlockMeta;
    })();
    types.TxProof = (function() {
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
      return TxProof;
    })();
    types.ValidatorSet = (function() {
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
      return ValidatorSet;
    })();
    types.Validator = (function() {
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
      return Validator;
    })();
    types.SimpleValidator = (function() {
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
      return SimpleValidator;
    })();
    return types;
  })();
  tendermint.version = (function() {
    const version = {};
    version.App = (function() {
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
      return App;
    })();
    version.Consensus = (function() {
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
      return Consensus;
    })();
    return version;
  })();
  return tendermint;
})();
module.exports = $root;

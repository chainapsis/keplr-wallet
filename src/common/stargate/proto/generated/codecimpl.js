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
              $root.cosmos.bank.v1beta1.SendEnabled.encode(m.sendEnabled[i], w.uint32(10).fork()).ldelim();
          }
          if (m.defaultSendEnabled != null && Object.hasOwnProperty.call(m, "defaultSendEnabled"))
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
                if (!(m.sendEnabled && m.sendEnabled.length)) m.sendEnabled = [];
                m.sendEnabled.push($root.cosmos.bank.v1beta1.SendEnabled.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.bank.v1beta1.Params.sendEnabled: array expected");
            m.sendEnabled = [];
            for (var i = 0; i < d.sendEnabled.length; ++i) {
              if (typeof d.sendEnabled[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.Params.sendEnabled: object expected");
              m.sendEnabled[i] = $root.cosmos.bank.v1beta1.SendEnabled.fromObject(d.sendEnabled[i]);
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
              d.sendEnabled[j] = $root.cosmos.bank.v1beta1.SendEnabled.toObject(m.sendEnabled[j], o);
            }
          }
          if (m.defaultSendEnabled != null && m.hasOwnProperty("defaultSendEnabled")) {
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
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom")) w.uint32(10).string(m.denom);
          if (m.enabled != null && Object.hasOwnProperty.call(m, "enabled")) w.uint32(16).bool(m.enabled);
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
          if (m.address != null && Object.hasOwnProperty.call(m, "address")) w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(18).fork()).ldelim();
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
                m.coins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
            if (!Array.isArray(d.coins)) throw TypeError(".cosmos.bank.v1beta1.Input.coins: array expected");
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.Input.coins: object expected");
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
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
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
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
          if (m.address != null && Object.hasOwnProperty.call(m, "address")) w.uint32(10).string(m.address);
          if (m.coins != null && m.coins.length) {
            for (var i = 0; i < m.coins.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(18).fork()).ldelim();
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
                m.coins.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
            if (!Array.isArray(d.coins)) throw TypeError(".cosmos.bank.v1beta1.Output.coins: array expected");
            m.coins = [];
            for (var i = 0; i < d.coins.length; ++i) {
              if (typeof d.coins[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.Output.coins: object expected");
              m.coins[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.coins[i]);
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
              d.coins[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.coins[j], o);
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
              $root.cosmos.base.v1beta1.Coin.encode(m.total[i], w.uint32(10).fork()).ldelim();
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
                m.total.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
            if (!Array.isArray(d.total)) throw TypeError(".cosmos.bank.v1beta1.Supply.total: array expected");
            m.total = [];
            for (var i = 0; i < d.total.length; ++i) {
              if (typeof d.total[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.Supply.total: object expected");
              m.total[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.total[i]);
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
              d.total[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.total[j], o);
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
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom")) w.uint32(10).string(m.denom);
          if (m.exponent != null && Object.hasOwnProperty.call(m, "exponent"))
            w.uint32(16).uint32(m.exponent);
          if (m.aliases != null && m.aliases.length) {
            for (var i = 0; i < m.aliases.length; ++i) w.uint32(26).string(m.aliases[i]);
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
              throw TypeError(".cosmos.bank.v1beta1.DenomUnit.aliases: array expected");
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
          if (m.description != null && Object.hasOwnProperty.call(m, "description"))
            w.uint32(10).string(m.description);
          if (m.denomUnits != null && m.denomUnits.length) {
            for (var i = 0; i < m.denomUnits.length; ++i)
              $root.cosmos.bank.v1beta1.DenomUnit.encode(m.denomUnits[i], w.uint32(18).fork()).ldelim();
          }
          if (m.base != null && Object.hasOwnProperty.call(m, "base")) w.uint32(26).string(m.base);
          if (m.display != null && Object.hasOwnProperty.call(m, "display")) w.uint32(34).string(m.display);
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
                m.denomUnits.push($root.cosmos.bank.v1beta1.DenomUnit.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.bank.v1beta1.Metadata.denomUnits: array expected");
            m.denomUnits = [];
            for (var i = 0; i < d.denomUnits.length; ++i) {
              if (typeof d.denomUnits[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.Metadata.denomUnits: object expected");
              m.denomUnits[i] = $root.cosmos.bank.v1beta1.DenomUnit.fromObject(d.denomUnits[i]);
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
              d.denomUnits[j] = $root.cosmos.bank.v1beta1.DenomUnit.toObject(m.denomUnits[j], o);
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
      v1beta1.Msg = (function () {
        function Msg(rpcImpl, requestDelimited, responseDelimited) {
          $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }
        (Msg.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Msg;
        Msg.create = function create(rpcImpl, requestDelimited, responseDelimited) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.send = function send(request, callback) {
            return this.rpcCall(
              send,
              $root.cosmos.bank.v1beta1.MsgSend,
              $root.cosmos.bank.v1beta1.MsgSendResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "Send" },
        );
        Object.defineProperty(
          (Msg.prototype.multiSend = function multiSend(request, callback) {
            return this.rpcCall(
              multiSend,
              $root.cosmos.bank.v1beta1.MsgMultiSend,
              $root.cosmos.bank.v1beta1.MsgMultiSendResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "MultiSend" },
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
          if (m.fromAddress != null && Object.hasOwnProperty.call(m, "fromAddress"))
            w.uint32(10).string(m.fromAddress);
          if (m.toAddress != null && Object.hasOwnProperty.call(m, "toAddress"))
            w.uint32(18).string(m.toAddress);
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(m.amount[i], w.uint32(26).fork()).ldelim();
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
                m.amount.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.bank.v1beta1.MsgSend.amount: array expected");
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.MsgSend.amount: object expected");
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount[i]);
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
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.amount[j], o);
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
              $root.cosmos.bank.v1beta1.Input.encode(m.inputs[i], w.uint32(10).fork()).ldelim();
          }
          if (m.outputs != null && m.outputs.length) {
            for (var i = 0; i < m.outputs.length; ++i)
              $root.cosmos.bank.v1beta1.Output.encode(m.outputs[i], w.uint32(18).fork()).ldelim();
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
                m.inputs.push($root.cosmos.bank.v1beta1.Input.decode(r, r.uint32()));
                break;
              case 2:
                if (!(m.outputs && m.outputs.length)) m.outputs = [];
                m.outputs.push($root.cosmos.bank.v1beta1.Output.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.bank.v1beta1.MsgMultiSend.inputs: array expected");
            m.inputs = [];
            for (var i = 0; i < d.inputs.length; ++i) {
              if (typeof d.inputs[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.MsgMultiSend.inputs: object expected");
              m.inputs[i] = $root.cosmos.bank.v1beta1.Input.fromObject(d.inputs[i]);
            }
          }
          if (d.outputs) {
            if (!Array.isArray(d.outputs))
              throw TypeError(".cosmos.bank.v1beta1.MsgMultiSend.outputs: array expected");
            m.outputs = [];
            for (var i = 0; i < d.outputs.length; ++i) {
              if (typeof d.outputs[i] !== "object")
                throw TypeError(".cosmos.bank.v1beta1.MsgMultiSend.outputs: object expected");
              m.outputs[i] = $root.cosmos.bank.v1beta1.Output.fromObject(d.outputs[i]);
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
              d.inputs[j] = $root.cosmos.bank.v1beta1.Input.toObject(m.inputs[j], o);
            }
          }
          if (m.outputs && m.outputs.length) {
            d.outputs = [];
            for (var j = 0; j < m.outputs.length; ++j) {
              d.outputs[j] = $root.cosmos.bank.v1beta1.Output.toObject(m.outputs[j], o);
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
          if (d instanceof $root.cosmos.bank.v1beta1.MsgMultiSendResponse) return d;
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
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom")) w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount")) w.uint32(18).string(m.amount);
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
          if (m.denom != null && Object.hasOwnProperty.call(m, "denom")) w.uint32(10).string(m.denom);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount")) w.uint32(18).string(m.amount);
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
          if (m.int != null && Object.hasOwnProperty.call(m, "int")) w.uint32(10).string(m.int);
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
          if (m.dec != null && Object.hasOwnProperty.call(m, "dec")) w.uint32(10).string(m.dec);
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
            $root.tendermint.types.Header.encode(m.header, w.uint32(10).fork()).ldelim();
          if (m.valset != null && m.valset.length) {
            for (var i = 0; i < m.valset.length; ++i)
              $root.cosmos.staking.v1beta1.Validator.encode(m.valset[i], w.uint32(18).fork()).ldelim();
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
                m.valset.push($root.cosmos.staking.v1beta1.Validator.decode(r, r.uint32()));
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        HistoricalInfo.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.HistoricalInfo) return d;
          var m = new $root.cosmos.staking.v1beta1.HistoricalInfo();
          if (d.header != null) {
            if (typeof d.header !== "object")
              throw TypeError(".cosmos.staking.v1beta1.HistoricalInfo.header: object expected");
            m.header = $root.tendermint.types.Header.fromObject(d.header);
          }
          if (d.valset) {
            if (!Array.isArray(d.valset))
              throw TypeError(".cosmos.staking.v1beta1.HistoricalInfo.valset: array expected");
            m.valset = [];
            for (var i = 0; i < d.valset.length; ++i) {
              if (typeof d.valset[i] !== "object")
                throw TypeError(".cosmos.staking.v1beta1.HistoricalInfo.valset: object expected");
              m.valset[i] = $root.cosmos.staking.v1beta1.Validator.fromObject(d.valset[i]);
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
              d.valset[j] = $root.cosmos.staking.v1beta1.Validator.toObject(m.valset[j], o);
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
          if (m.rate != null && Object.hasOwnProperty.call(m, "rate")) w.uint32(10).string(m.rate);
          if (m.maxRate != null && Object.hasOwnProperty.call(m, "maxRate")) w.uint32(18).string(m.maxRate);
          if (m.maxChangeRate != null && Object.hasOwnProperty.call(m, "maxChangeRate"))
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
          if (d instanceof $root.cosmos.staking.v1beta1.CommissionRates) return d;
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
          if (m.commissionRates != null && Object.hasOwnProperty.call(m, "commissionRates"))
            $root.cosmos.staking.v1beta1.CommissionRates.encode(
              m.commissionRates,
              w.uint32(10).fork(),
            ).ldelim();
          if (m.updateTime != null && Object.hasOwnProperty.call(m, "updateTime"))
            $root.google.protobuf.Timestamp.encode(m.updateTime, w.uint32(18).fork()).ldelim();
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
                m.commissionRates = $root.cosmos.staking.v1beta1.CommissionRates.decode(r, r.uint32());
                break;
              case 2:
                m.updateTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
              throw TypeError(".cosmos.staking.v1beta1.Commission.commissionRates: object expected");
            m.commissionRates = $root.cosmos.staking.v1beta1.CommissionRates.fromObject(d.commissionRates);
          }
          if (d.updateTime != null) {
            if (typeof d.updateTime !== "object")
              throw TypeError(".cosmos.staking.v1beta1.Commission.updateTime: object expected");
            m.updateTime = $root.google.protobuf.Timestamp.fromObject(d.updateTime);
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
          if (m.commissionRates != null && m.hasOwnProperty("commissionRates")) {
            d.commissionRates = $root.cosmos.staking.v1beta1.CommissionRates.toObject(m.commissionRates, o);
          }
          if (m.updateTime != null && m.hasOwnProperty("updateTime")) {
            d.updateTime = $root.google.protobuf.Timestamp.toObject(m.updateTime, o);
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
          if (m.moniker != null && Object.hasOwnProperty.call(m, "moniker")) w.uint32(10).string(m.moniker);
          if (m.identity != null && Object.hasOwnProperty.call(m, "identity"))
            w.uint32(18).string(m.identity);
          if (m.website != null && Object.hasOwnProperty.call(m, "website")) w.uint32(26).string(m.website);
          if (m.securityContact != null && Object.hasOwnProperty.call(m, "securityContact"))
            w.uint32(34).string(m.securityContact);
          if (m.details != null && Object.hasOwnProperty.call(m, "details")) w.uint32(42).string(m.details);
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
          if (m.securityContact != null && m.hasOwnProperty("securityContact")) {
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
        Validator.prototype.unbondingHeight = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        Validator.prototype.unbondingTime = null;
        Validator.prototype.commission = null;
        Validator.prototype.minSelfDelegation = "";
        Validator.create = function create(properties) {
          return new Validator(properties);
        };
        Validator.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.operatorAddress != null && Object.hasOwnProperty.call(m, "operatorAddress"))
            w.uint32(10).string(m.operatorAddress);
          if (m.consensusPubkey != null && Object.hasOwnProperty.call(m, "consensusPubkey"))
            $root.google.protobuf.Any.encode(m.consensusPubkey, w.uint32(18).fork()).ldelim();
          if (m.jailed != null && Object.hasOwnProperty.call(m, "jailed")) w.uint32(24).bool(m.jailed);
          if (m.status != null && Object.hasOwnProperty.call(m, "status")) w.uint32(32).int32(m.status);
          if (m.tokens != null && Object.hasOwnProperty.call(m, "tokens")) w.uint32(42).string(m.tokens);
          if (m.delegatorShares != null && Object.hasOwnProperty.call(m, "delegatorShares"))
            w.uint32(50).string(m.delegatorShares);
          if (m.description != null && Object.hasOwnProperty.call(m, "description"))
            $root.cosmos.staking.v1beta1.Description.encode(m.description, w.uint32(58).fork()).ldelim();
          if (m.unbondingHeight != null && Object.hasOwnProperty.call(m, "unbondingHeight"))
            w.uint32(64).int64(m.unbondingHeight);
          if (m.unbondingTime != null && Object.hasOwnProperty.call(m, "unbondingTime"))
            $root.google.protobuf.Timestamp.encode(m.unbondingTime, w.uint32(74).fork()).ldelim();
          if (m.commission != null && Object.hasOwnProperty.call(m, "commission"))
            $root.cosmos.staking.v1beta1.Commission.encode(m.commission, w.uint32(82).fork()).ldelim();
          if (m.minSelfDelegation != null && Object.hasOwnProperty.call(m, "minSelfDelegation"))
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
                m.consensusPubkey = $root.google.protobuf.Any.decode(r, r.uint32());
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
                m.description = $root.cosmos.staking.v1beta1.Description.decode(r, r.uint32());
                break;
              case 8:
                m.unbondingHeight = r.int64();
                break;
              case 9:
                m.unbondingTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
                break;
              case 10:
                m.commission = $root.cosmos.staking.v1beta1.Commission.decode(r, r.uint32());
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
              throw TypeError(".cosmos.staking.v1beta1.Validator.consensusPubkey: object expected");
            m.consensusPubkey = $root.google.protobuf.Any.fromObject(d.consensusPubkey);
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
              throw TypeError(".cosmos.staking.v1beta1.Validator.description: object expected");
            m.description = $root.cosmos.staking.v1beta1.Description.fromObject(d.description);
          }
          if (d.unbondingHeight != null) {
            if ($util.Long) (m.unbondingHeight = $util.Long.fromValue(d.unbondingHeight)).unsigned = false;
            else if (typeof d.unbondingHeight === "string")
              m.unbondingHeight = parseInt(d.unbondingHeight, 10);
            else if (typeof d.unbondingHeight === "number") m.unbondingHeight = d.unbondingHeight;
            else if (typeof d.unbondingHeight === "object")
              m.unbondingHeight = new $util.LongBits(
                d.unbondingHeight.low >>> 0,
                d.unbondingHeight.high >>> 0,
              ).toNumber();
          }
          if (d.unbondingTime != null) {
            if (typeof d.unbondingTime !== "object")
              throw TypeError(".cosmos.staking.v1beta1.Validator.unbondingTime: object expected");
            m.unbondingTime = $root.google.protobuf.Timestamp.fromObject(d.unbondingTime);
          }
          if (d.commission != null) {
            if (typeof d.commission !== "object")
              throw TypeError(".cosmos.staking.v1beta1.Validator.commission: object expected");
            m.commission = $root.cosmos.staking.v1beta1.Commission.fromObject(d.commission);
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
              d.unbondingHeight = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else d.unbondingHeight = o.longs === String ? "0" : 0;
            d.unbondingTime = null;
            d.commission = null;
            d.minSelfDelegation = "";
          }
          if (m.operatorAddress != null && m.hasOwnProperty("operatorAddress")) {
            d.operatorAddress = m.operatorAddress;
          }
          if (m.consensusPubkey != null && m.hasOwnProperty("consensusPubkey")) {
            d.consensusPubkey = $root.google.protobuf.Any.toObject(m.consensusPubkey, o);
          }
          if (m.jailed != null && m.hasOwnProperty("jailed")) {
            d.jailed = m.jailed;
          }
          if (m.status != null && m.hasOwnProperty("status")) {
            d.status = o.enums === String ? $root.cosmos.staking.v1beta1.BondStatus[m.status] : m.status;
          }
          if (m.tokens != null && m.hasOwnProperty("tokens")) {
            d.tokens = m.tokens;
          }
          if (m.delegatorShares != null && m.hasOwnProperty("delegatorShares")) {
            d.delegatorShares = m.delegatorShares;
          }
          if (m.description != null && m.hasOwnProperty("description")) {
            d.description = $root.cosmos.staking.v1beta1.Description.toObject(m.description, o);
          }
          if (m.unbondingHeight != null && m.hasOwnProperty("unbondingHeight")) {
            if (typeof m.unbondingHeight === "number")
              d.unbondingHeight = o.longs === String ? String(m.unbondingHeight) : m.unbondingHeight;
            else
              d.unbondingHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.unbondingHeight)
                  : o.longs === Number
                  ? new $util.LongBits(m.unbondingHeight.low >>> 0, m.unbondingHeight.high >>> 0).toNumber()
                  : m.unbondingHeight;
          }
          if (m.unbondingTime != null && m.hasOwnProperty("unbondingTime")) {
            d.unbondingTime = $root.google.protobuf.Timestamp.toObject(m.unbondingTime, o);
          }
          if (m.commission != null && m.hasOwnProperty("commission")) {
            d.commission = $root.cosmos.staking.v1beta1.Commission.toObject(m.commission, o);
          }
          if (m.minSelfDelegation != null && m.hasOwnProperty("minSelfDelegation")) {
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
            for (var i = 0; i < m.addresses.length; ++i) w.uint32(10).string(m.addresses[i]);
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
              throw TypeError(".cosmos.staking.v1beta1.ValAddresses.addresses: array expected");
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
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
              $root.cosmos.staking.v1beta1.DVPair.encode(m.pairs[i], w.uint32(10).fork()).ldelim();
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
                m.pairs.push($root.cosmos.staking.v1beta1.DVPair.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.staking.v1beta1.DVPairs.pairs: array expected");
            m.pairs = [];
            for (var i = 0; i < d.pairs.length; ++i) {
              if (typeof d.pairs[i] !== "object")
                throw TypeError(".cosmos.staking.v1beta1.DVPairs.pairs: object expected");
              m.pairs[i] = $root.cosmos.staking.v1beta1.DVPair.fromObject(d.pairs[i]);
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
              d.pairs[j] = $root.cosmos.staking.v1beta1.DVPair.toObject(m.pairs[j], o);
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorSrcAddress != null && Object.hasOwnProperty.call(m, "validatorSrcAddress"))
            w.uint32(18).string(m.validatorSrcAddress);
          if (m.validatorDstAddress != null && Object.hasOwnProperty.call(m, "validatorDstAddress"))
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorSrcAddress != null && m.hasOwnProperty("validatorSrcAddress")) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (m.validatorDstAddress != null && m.hasOwnProperty("validatorDstAddress")) {
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
              $root.cosmos.staking.v1beta1.DVVTriplet.encode(m.triplets[i], w.uint32(10).fork()).ldelim();
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
                m.triplets.push($root.cosmos.staking.v1beta1.DVVTriplet.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.staking.v1beta1.DVVTriplets.triplets: array expected");
            m.triplets = [];
            for (var i = 0; i < d.triplets.length; ++i) {
              if (typeof d.triplets[i] !== "object")
                throw TypeError(".cosmos.staking.v1beta1.DVVTriplets.triplets: object expected");
              m.triplets[i] = $root.cosmos.staking.v1beta1.DVVTriplet.fromObject(d.triplets[i]);
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
              d.triplets[j] = $root.cosmos.staking.v1beta1.DVVTriplet.toObject(m.triplets[j], o);
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
            w.uint32(18).string(m.validatorAddress);
          if (m.shares != null && Object.hasOwnProperty.call(m, "shares")) w.uint32(26).string(m.shares);
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
            w.uint32(18).string(m.validatorAddress);
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.encode(
                m.entries[i],
                w.uint32(26).fork(),
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
                m.entries.push($root.cosmos.staking.v1beta1.UnbondingDelegationEntry.decode(r, r.uint32()));
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        UnbondingDelegation.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.UnbondingDelegation) return d;
          var m = new $root.cosmos.staking.v1beta1.UnbondingDelegation();
          if (d.delegatorAddress != null) {
            m.delegatorAddress = String(d.delegatorAddress);
          }
          if (d.validatorAddress != null) {
            m.validatorAddress = String(d.validatorAddress);
          }
          if (d.entries) {
            if (!Array.isArray(d.entries))
              throw TypeError(".cosmos.staking.v1beta1.UnbondingDelegation.entries: array expected");
            m.entries = [];
            for (var i = 0; i < d.entries.length; ++i) {
              if (typeof d.entries[i] !== "object")
                throw TypeError(".cosmos.staking.v1beta1.UnbondingDelegation.entries: object expected");
              m.entries[i] = $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.fromObject(d.entries[i]);
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.entries && m.entries.length) {
            d.entries = [];
            for (var j = 0; j < m.entries.length; ++j) {
              d.entries[j] = $root.cosmos.staking.v1beta1.UnbondingDelegationEntry.toObject(m.entries[j], o);
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
        UnbondingDelegationEntry.prototype.creationHeight = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        UnbondingDelegationEntry.prototype.completionTime = null;
        UnbondingDelegationEntry.prototype.initialBalance = "";
        UnbondingDelegationEntry.prototype.balance = "";
        UnbondingDelegationEntry.create = function create(properties) {
          return new UnbondingDelegationEntry(properties);
        };
        UnbondingDelegationEntry.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.creationHeight != null && Object.hasOwnProperty.call(m, "creationHeight"))
            w.uint32(8).int64(m.creationHeight);
          if (m.completionTime != null && Object.hasOwnProperty.call(m, "completionTime"))
            $root.google.protobuf.Timestamp.encode(m.completionTime, w.uint32(18).fork()).ldelim();
          if (m.initialBalance != null && Object.hasOwnProperty.call(m, "initialBalance"))
            w.uint32(26).string(m.initialBalance);
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance")) w.uint32(34).string(m.balance);
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
                m.completionTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
          if (d instanceof $root.cosmos.staking.v1beta1.UnbondingDelegationEntry) return d;
          var m = new $root.cosmos.staking.v1beta1.UnbondingDelegationEntry();
          if (d.creationHeight != null) {
            if ($util.Long) (m.creationHeight = $util.Long.fromValue(d.creationHeight)).unsigned = false;
            else if (typeof d.creationHeight === "string") m.creationHeight = parseInt(d.creationHeight, 10);
            else if (typeof d.creationHeight === "number") m.creationHeight = d.creationHeight;
            else if (typeof d.creationHeight === "object")
              m.creationHeight = new $util.LongBits(
                d.creationHeight.low >>> 0,
                d.creationHeight.high >>> 0,
              ).toNumber();
          }
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.UnbondingDelegationEntry.completionTime: object expected",
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(d.completionTime);
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
              d.creationHeight = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else d.creationHeight = o.longs === String ? "0" : 0;
            d.completionTime = null;
            d.initialBalance = "";
            d.balance = "";
          }
          if (m.creationHeight != null && m.hasOwnProperty("creationHeight")) {
            if (typeof m.creationHeight === "number")
              d.creationHeight = o.longs === String ? String(m.creationHeight) : m.creationHeight;
            else
              d.creationHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.creationHeight)
                  : o.longs === Number
                  ? new $util.LongBits(m.creationHeight.low >>> 0, m.creationHeight.high >>> 0).toNumber()
                  : m.creationHeight;
          }
          if (m.completionTime != null && m.hasOwnProperty("completionTime")) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(m.completionTime, o);
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
        RedelegationEntry.prototype.creationHeight = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
        RedelegationEntry.prototype.completionTime = null;
        RedelegationEntry.prototype.initialBalance = "";
        RedelegationEntry.prototype.sharesDst = "";
        RedelegationEntry.create = function create(properties) {
          return new RedelegationEntry(properties);
        };
        RedelegationEntry.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.creationHeight != null && Object.hasOwnProperty.call(m, "creationHeight"))
            w.uint32(8).int64(m.creationHeight);
          if (m.completionTime != null && Object.hasOwnProperty.call(m, "completionTime"))
            $root.google.protobuf.Timestamp.encode(m.completionTime, w.uint32(18).fork()).ldelim();
          if (m.initialBalance != null && Object.hasOwnProperty.call(m, "initialBalance"))
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
                m.completionTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
          if (d instanceof $root.cosmos.staking.v1beta1.RedelegationEntry) return d;
          var m = new $root.cosmos.staking.v1beta1.RedelegationEntry();
          if (d.creationHeight != null) {
            if ($util.Long) (m.creationHeight = $util.Long.fromValue(d.creationHeight)).unsigned = false;
            else if (typeof d.creationHeight === "string") m.creationHeight = parseInt(d.creationHeight, 10);
            else if (typeof d.creationHeight === "number") m.creationHeight = d.creationHeight;
            else if (typeof d.creationHeight === "object")
              m.creationHeight = new $util.LongBits(
                d.creationHeight.low >>> 0,
                d.creationHeight.high >>> 0,
              ).toNumber();
          }
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(".cosmos.staking.v1beta1.RedelegationEntry.completionTime: object expected");
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(d.completionTime);
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
              d.creationHeight = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else d.creationHeight = o.longs === String ? "0" : 0;
            d.completionTime = null;
            d.initialBalance = "";
            d.sharesDst = "";
          }
          if (m.creationHeight != null && m.hasOwnProperty("creationHeight")) {
            if (typeof m.creationHeight === "number")
              d.creationHeight = o.longs === String ? String(m.creationHeight) : m.creationHeight;
            else
              d.creationHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.creationHeight)
                  : o.longs === Number
                  ? new $util.LongBits(m.creationHeight.low >>> 0, m.creationHeight.high >>> 0).toNumber()
                  : m.creationHeight;
          }
          if (m.completionTime != null && m.hasOwnProperty("completionTime")) {
            d.completionTime = $root.google.protobuf.Timestamp.toObject(m.completionTime, o);
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorSrcAddress != null && Object.hasOwnProperty.call(m, "validatorSrcAddress"))
            w.uint32(18).string(m.validatorSrcAddress);
          if (m.validatorDstAddress != null && Object.hasOwnProperty.call(m, "validatorDstAddress"))
            w.uint32(26).string(m.validatorDstAddress);
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmos.staking.v1beta1.RedelegationEntry.encode(
                m.entries[i],
                w.uint32(34).fork(),
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
                m.entries.push($root.cosmos.staking.v1beta1.RedelegationEntry.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.staking.v1beta1.Redelegation.entries: array expected");
            m.entries = [];
            for (var i = 0; i < d.entries.length; ++i) {
              if (typeof d.entries[i] !== "object")
                throw TypeError(".cosmos.staking.v1beta1.Redelegation.entries: object expected");
              m.entries[i] = $root.cosmos.staking.v1beta1.RedelegationEntry.fromObject(d.entries[i]);
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorSrcAddress != null && m.hasOwnProperty("validatorSrcAddress")) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (m.validatorDstAddress != null && m.hasOwnProperty("validatorDstAddress")) {
            d.validatorDstAddress = m.validatorDstAddress;
          }
          if (m.entries && m.entries.length) {
            d.entries = [];
            for (var j = 0; j < m.entries.length; ++j) {
              d.entries[j] = $root.cosmos.staking.v1beta1.RedelegationEntry.toObject(m.entries[j], o);
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
          if (m.unbondingTime != null && Object.hasOwnProperty.call(m, "unbondingTime"))
            $root.google.protobuf.Duration.encode(m.unbondingTime, w.uint32(10).fork()).ldelim();
          if (m.maxValidators != null && Object.hasOwnProperty.call(m, "maxValidators"))
            w.uint32(16).uint32(m.maxValidators);
          if (m.maxEntries != null && Object.hasOwnProperty.call(m, "maxEntries"))
            w.uint32(24).uint32(m.maxEntries);
          if (m.historicalEntries != null && Object.hasOwnProperty.call(m, "historicalEntries"))
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
                m.unbondingTime = $root.google.protobuf.Duration.decode(r, r.uint32());
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
              throw TypeError(".cosmos.staking.v1beta1.Params.unbondingTime: object expected");
            m.unbondingTime = $root.google.protobuf.Duration.fromObject(d.unbondingTime);
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
            d.unbondingTime = $root.google.protobuf.Duration.toObject(m.unbondingTime, o);
          }
          if (m.maxValidators != null && m.hasOwnProperty("maxValidators")) {
            d.maxValidators = m.maxValidators;
          }
          if (m.maxEntries != null && m.hasOwnProperty("maxEntries")) {
            d.maxEntries = m.maxEntries;
          }
          if (m.historicalEntries != null && m.hasOwnProperty("historicalEntries")) {
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
          if (m.delegation != null && Object.hasOwnProperty.call(m, "delegation"))
            $root.cosmos.staking.v1beta1.Delegation.encode(m.delegation, w.uint32(10).fork()).ldelim();
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance"))
            $root.cosmos.base.v1beta1.Coin.encode(m.balance, w.uint32(18).fork()).ldelim();
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
                m.delegation = $root.cosmos.staking.v1beta1.Delegation.decode(r, r.uint32());
                break;
              case 2:
                m.balance = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        DelegationResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.DelegationResponse) return d;
          var m = new $root.cosmos.staking.v1beta1.DelegationResponse();
          if (d.delegation != null) {
            if (typeof d.delegation !== "object")
              throw TypeError(".cosmos.staking.v1beta1.DelegationResponse.delegation: object expected");
            m.delegation = $root.cosmos.staking.v1beta1.Delegation.fromObject(d.delegation);
          }
          if (d.balance != null) {
            if (typeof d.balance !== "object")
              throw TypeError(".cosmos.staking.v1beta1.DelegationResponse.balance: object expected");
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
            d.delegation = $root.cosmos.staking.v1beta1.Delegation.toObject(m.delegation, o);
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
          if (m.redelegationEntry != null && Object.hasOwnProperty.call(m, "redelegationEntry"))
            $root.cosmos.staking.v1beta1.RedelegationEntry.encode(
              m.redelegationEntry,
              w.uint32(10).fork(),
            ).ldelim();
          if (m.balance != null && Object.hasOwnProperty.call(m, "balance")) w.uint32(34).string(m.balance);
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
                m.redelegationEntry = $root.cosmos.staking.v1beta1.RedelegationEntry.decode(r, r.uint32());
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
          if (d instanceof $root.cosmos.staking.v1beta1.RedelegationEntryResponse) return d;
          var m = new $root.cosmos.staking.v1beta1.RedelegationEntryResponse();
          if (d.redelegationEntry != null) {
            if (typeof d.redelegationEntry !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.RedelegationEntryResponse.redelegationEntry: object expected",
              );
            m.redelegationEntry = $root.cosmos.staking.v1beta1.RedelegationEntry.fromObject(
              d.redelegationEntry,
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
          if (m.redelegationEntry != null && m.hasOwnProperty("redelegationEntry")) {
            d.redelegationEntry = $root.cosmos.staking.v1beta1.RedelegationEntry.toObject(
              m.redelegationEntry,
              o,
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
          if (m.redelegation != null && Object.hasOwnProperty.call(m, "redelegation"))
            $root.cosmos.staking.v1beta1.Redelegation.encode(m.redelegation, w.uint32(10).fork()).ldelim();
          if (m.entries != null && m.entries.length) {
            for (var i = 0; i < m.entries.length; ++i)
              $root.cosmos.staking.v1beta1.RedelegationEntryResponse.encode(
                m.entries[i],
                w.uint32(18).fork(),
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
                m.redelegation = $root.cosmos.staking.v1beta1.Redelegation.decode(r, r.uint32());
                break;
              case 2:
                if (!(m.entries && m.entries.length)) m.entries = [];
                m.entries.push($root.cosmos.staking.v1beta1.RedelegationEntryResponse.decode(r, r.uint32()));
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        RedelegationResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.RedelegationResponse) return d;
          var m = new $root.cosmos.staking.v1beta1.RedelegationResponse();
          if (d.redelegation != null) {
            if (typeof d.redelegation !== "object")
              throw TypeError(".cosmos.staking.v1beta1.RedelegationResponse.redelegation: object expected");
            m.redelegation = $root.cosmos.staking.v1beta1.Redelegation.fromObject(d.redelegation);
          }
          if (d.entries) {
            if (!Array.isArray(d.entries))
              throw TypeError(".cosmos.staking.v1beta1.RedelegationResponse.entries: array expected");
            m.entries = [];
            for (var i = 0; i < d.entries.length; ++i) {
              if (typeof d.entries[i] !== "object")
                throw TypeError(".cosmos.staking.v1beta1.RedelegationResponse.entries: object expected");
              m.entries[i] = $root.cosmos.staking.v1beta1.RedelegationEntryResponse.fromObject(d.entries[i]);
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
            d.redelegation = $root.cosmos.staking.v1beta1.Redelegation.toObject(m.redelegation, o);
          }
          if (m.entries && m.entries.length) {
            d.entries = [];
            for (var j = 0; j < m.entries.length; ++j) {
              d.entries[j] = $root.cosmos.staking.v1beta1.RedelegationEntryResponse.toObject(m.entries[j], o);
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
          if (m.notBondedTokens != null && Object.hasOwnProperty.call(m, "notBondedTokens"))
            w.uint32(10).string(m.notBondedTokens);
          if (m.bondedTokens != null && Object.hasOwnProperty.call(m, "bondedTokens"))
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
          if (m.notBondedTokens != null && m.hasOwnProperty("notBondedTokens")) {
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
          $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }
        (Msg.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Msg;
        Msg.create = function create(rpcImpl, requestDelimited, responseDelimited) {
          return new this(rpcImpl, requestDelimited, responseDelimited);
        };
        Object.defineProperty(
          (Msg.prototype.createValidator = function createValidator(request, callback) {
            return this.rpcCall(
              createValidator,
              $root.cosmos.staking.v1beta1.MsgCreateValidator,
              $root.cosmos.staking.v1beta1.MsgCreateValidatorResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "CreateValidator" },
        );
        Object.defineProperty(
          (Msg.prototype.editValidator = function editValidator(request, callback) {
            return this.rpcCall(
              editValidator,
              $root.cosmos.staking.v1beta1.MsgEditValidator,
              $root.cosmos.staking.v1beta1.MsgEditValidatorResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "EditValidator" },
        );
        Object.defineProperty(
          (Msg.prototype.delegate = function delegate(request, callback) {
            return this.rpcCall(
              delegate,
              $root.cosmos.staking.v1beta1.MsgDelegate,
              $root.cosmos.staking.v1beta1.MsgDelegateResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "Delegate" },
        );
        Object.defineProperty(
          (Msg.prototype.beginRedelegate = function beginRedelegate(request, callback) {
            return this.rpcCall(
              beginRedelegate,
              $root.cosmos.staking.v1beta1.MsgBeginRedelegate,
              $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "BeginRedelegate" },
        );
        Object.defineProperty(
          (Msg.prototype.undelegate = function undelegate(request, callback) {
            return this.rpcCall(
              undelegate,
              $root.cosmos.staking.v1beta1.MsgUndelegate,
              $root.cosmos.staking.v1beta1.MsgUndelegateResponse,
              request,
              callback,
            );
          }),
          "name",
          { value: "Undelegate" },
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
          if (m.description != null && Object.hasOwnProperty.call(m, "description"))
            $root.cosmos.staking.v1beta1.Description.encode(m.description, w.uint32(10).fork()).ldelim();
          if (m.commission != null && Object.hasOwnProperty.call(m, "commission"))
            $root.cosmos.staking.v1beta1.CommissionRates.encode(m.commission, w.uint32(18).fork()).ldelim();
          if (m.minSelfDelegation != null && Object.hasOwnProperty.call(m, "minSelfDelegation"))
            w.uint32(26).string(m.minSelfDelegation);
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(34).string(m.delegatorAddress);
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
            w.uint32(42).string(m.validatorAddress);
          if (m.pubkey != null && Object.hasOwnProperty.call(m, "pubkey"))
            $root.google.protobuf.Any.encode(m.pubkey, w.uint32(50).fork()).ldelim();
          if (m.value != null && Object.hasOwnProperty.call(m, "value"))
            $root.cosmos.base.v1beta1.Coin.encode(m.value, w.uint32(58).fork()).ldelim();
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
                m.description = $root.cosmos.staking.v1beta1.Description.decode(r, r.uint32());
                break;
              case 2:
                m.commission = $root.cosmos.staking.v1beta1.CommissionRates.decode(r, r.uint32());
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
          if (d instanceof $root.cosmos.staking.v1beta1.MsgCreateValidator) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgCreateValidator();
          if (d.description != null) {
            if (typeof d.description !== "object")
              throw TypeError(".cosmos.staking.v1beta1.MsgCreateValidator.description: object expected");
            m.description = $root.cosmos.staking.v1beta1.Description.fromObject(d.description);
          }
          if (d.commission != null) {
            if (typeof d.commission !== "object")
              throw TypeError(".cosmos.staking.v1beta1.MsgCreateValidator.commission: object expected");
            m.commission = $root.cosmos.staking.v1beta1.CommissionRates.fromObject(d.commission);
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
              throw TypeError(".cosmos.staking.v1beta1.MsgCreateValidator.pubkey: object expected");
            m.pubkey = $root.google.protobuf.Any.fromObject(d.pubkey);
          }
          if (d.value != null) {
            if (typeof d.value !== "object")
              throw TypeError(".cosmos.staking.v1beta1.MsgCreateValidator.value: object expected");
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
            d.description = $root.cosmos.staking.v1beta1.Description.toObject(m.description, o);
          }
          if (m.commission != null && m.hasOwnProperty("commission")) {
            d.commission = $root.cosmos.staking.v1beta1.CommissionRates.toObject(m.commission, o);
          }
          if (m.minSelfDelegation != null && m.hasOwnProperty("minSelfDelegation")) {
            d.minSelfDelegation = m.minSelfDelegation;
          }
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
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
          if (d instanceof $root.cosmos.staking.v1beta1.MsgCreateValidatorResponse) return d;
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
          if (m.description != null && Object.hasOwnProperty.call(m, "description"))
            $root.cosmos.staking.v1beta1.Description.encode(m.description, w.uint32(10).fork()).ldelim();
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
            w.uint32(18).string(m.validatorAddress);
          if (m.commissionRate != null && Object.hasOwnProperty.call(m, "commissionRate"))
            w.uint32(26).string(m.commissionRate);
          if (m.minSelfDelegation != null && Object.hasOwnProperty.call(m, "minSelfDelegation"))
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
                m.description = $root.cosmos.staking.v1beta1.Description.decode(r, r.uint32());
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
          if (d instanceof $root.cosmos.staking.v1beta1.MsgEditValidator) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgEditValidator();
          if (d.description != null) {
            if (typeof d.description !== "object")
              throw TypeError(".cosmos.staking.v1beta1.MsgEditValidator.description: object expected");
            m.description = $root.cosmos.staking.v1beta1.Description.fromObject(d.description);
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
            d.description = $root.cosmos.staking.v1beta1.Description.toObject(m.description, o);
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
            d.validatorAddress = m.validatorAddress;
          }
          if (m.commissionRate != null && m.hasOwnProperty("commissionRate")) {
            d.commissionRate = m.commissionRate;
          }
          if (m.minSelfDelegation != null && m.hasOwnProperty("minSelfDelegation")) {
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
          if (d instanceof $root.cosmos.staking.v1beta1.MsgEditValidatorResponse) return d;
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
            w.uint32(18).string(m.validatorAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(m.amount, w.uint32(26).fork()).ldelim();
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
              throw TypeError(".cosmos.staking.v1beta1.MsgDelegate.amount: object expected");
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
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
          if (d instanceof $root.cosmos.staking.v1beta1.MsgDelegateResponse) return d;
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorSrcAddress != null && Object.hasOwnProperty.call(m, "validatorSrcAddress"))
            w.uint32(18).string(m.validatorSrcAddress);
          if (m.validatorDstAddress != null && Object.hasOwnProperty.call(m, "validatorDstAddress"))
            w.uint32(26).string(m.validatorDstAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(m.amount, w.uint32(34).fork()).ldelim();
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
          if (d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegate) return d;
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
              throw TypeError(".cosmos.staking.v1beta1.MsgBeginRedelegate.amount: object expected");
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorSrcAddress != null && m.hasOwnProperty("validatorSrcAddress")) {
            d.validatorSrcAddress = m.validatorSrcAddress;
          }
          if (m.validatorDstAddress != null && m.hasOwnProperty("validatorDstAddress")) {
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
          if (m.completionTime != null && Object.hasOwnProperty.call(m, "completionTime"))
            $root.google.protobuf.Timestamp.encode(m.completionTime, w.uint32(10).fork()).ldelim();
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
                m.completionTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgBeginRedelegateResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgBeginRedelegateResponse.completionTime: object expected",
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(d.completionTime);
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
            d.completionTime = $root.google.protobuf.Timestamp.toObject(m.completionTime, o);
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
          if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
            w.uint32(10).string(m.delegatorAddress);
          if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
            w.uint32(18).string(m.validatorAddress);
          if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
            $root.cosmos.base.v1beta1.Coin.encode(m.amount, w.uint32(26).fork()).ldelim();
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
              throw TypeError(".cosmos.staking.v1beta1.MsgUndelegate.amount: object expected");
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
          if (m.delegatorAddress != null && m.hasOwnProperty("delegatorAddress")) {
            d.delegatorAddress = m.delegatorAddress;
          }
          if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
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
          if (m.completionTime != null && Object.hasOwnProperty.call(m, "completionTime"))
            $root.google.protobuf.Timestamp.encode(m.completionTime, w.uint32(10).fork()).ldelim();
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
                m.completionTime = $root.google.protobuf.Timestamp.decode(r, r.uint32());
                break;
              default:
                r.skipType(t & 7);
                break;
            }
          }
          return m;
        };
        MsgUndelegateResponse.fromObject = function fromObject(d) {
          if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegateResponse) return d;
          var m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
          if (d.completionTime != null) {
            if (typeof d.completionTime !== "object")
              throw TypeError(
                ".cosmos.staking.v1beta1.MsgUndelegateResponse.completionTime: object expected",
              );
            m.completionTime = $root.google.protobuf.Timestamp.fromObject(d.completionTime);
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
            d.completionTime = $root.google.protobuf.Timestamp.toObject(m.completionTime, o);
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
              for (var i = 0; i < m.signatures.length; ++i) w.uint32(10).bytes(m.signatures[i]);
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
            if (d instanceof $root.cosmos.crypto.multisig.v1beta1.MultiSignature) return d;
            var m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
            if (d.signatures) {
              if (!Array.isArray(d.signatures))
                throw TypeError(".cosmos.crypto.multisig.v1beta1.MultiSignature.signatures: array expected");
              m.signatures = [];
              for (var i = 0; i < d.signatures.length; ++i) {
                if (typeof d.signatures[i] === "string")
                  $util.base64.decode(
                    d.signatures[i],
                    (m.signatures[i] = $util.newBuffer($util.base64.length(d.signatures[i]))),
                    0,
                  );
                else if (d.signatures[i].length) m.signatures[i] = d.signatures[i];
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
                    ? $util.base64.encode(m.signatures[j], 0, m.signatures[j].length)
                    : o.bytes === Array
                    ? Array.prototype.slice.call(m.signatures[j])
                    : m.signatures[j];
              }
            }
            return d;
          };
          MultiSignature.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
            if (m.extraBitsStored != null && Object.hasOwnProperty.call(m, "extraBitsStored"))
              w.uint32(8).uint32(m.extraBitsStored);
            if (m.elems != null && Object.hasOwnProperty.call(m, "elems")) w.uint32(18).bytes(m.elems);
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
            if (d instanceof $root.cosmos.crypto.multisig.v1beta1.CompactBitArray) return d;
            var m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
            if (d.extraBitsStored != null) {
              m.extraBitsStored = d.extraBitsStored >>> 0;
            }
            if (d.elems != null) {
              if (typeof d.elems === "string")
                $util.base64.decode(d.elems, (m.elems = $util.newBuffer($util.base64.length(d.elems))), 0);
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
            if (m.extraBitsStored != null && m.hasOwnProperty("extraBitsStored")) {
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
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
          if (m.key != null && Object.hasOwnProperty.call(m, "key")) w.uint32(10).bytes(m.key);
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
              $util.base64.decode(d.key, (m.key = $util.newBuffer($util.base64.length(d.key))), 0);
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
          if (m.key != null && Object.hasOwnProperty.call(m, "key")) w.uint32(10).bytes(m.key);
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
              $util.base64.decode(d.key, (m.key = $util.newBuffer($util.base64.length(d.key))), 0);
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
  cosmos.tx = (function () {
    const tx = {};
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
            $root.cosmos.tx.v1beta1.TxBody.encode(m.body, w.uint32(10).fork()).ldelim();
          if (m.authInfo != null && Object.hasOwnProperty.call(m, "authInfo"))
            $root.cosmos.tx.v1beta1.AuthInfo.encode(m.authInfo, w.uint32(18).fork()).ldelim();
          if (m.signatures != null && m.signatures.length) {
            for (var i = 0; i < m.signatures.length; ++i) w.uint32(26).bytes(m.signatures[i]);
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
                m.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.decode(r, r.uint32());
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
            if (typeof d.body !== "object") throw TypeError(".cosmos.tx.v1beta1.Tx.body: object expected");
            m.body = $root.cosmos.tx.v1beta1.TxBody.fromObject(d.body);
          }
          if (d.authInfo != null) {
            if (typeof d.authInfo !== "object")
              throw TypeError(".cosmos.tx.v1beta1.Tx.authInfo: object expected");
            m.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.fromObject(d.authInfo);
          }
          if (d.signatures) {
            if (!Array.isArray(d.signatures))
              throw TypeError(".cosmos.tx.v1beta1.Tx.signatures: array expected");
            m.signatures = [];
            for (var i = 0; i < d.signatures.length; ++i) {
              if (typeof d.signatures[i] === "string")
                $util.base64.decode(
                  d.signatures[i],
                  (m.signatures[i] = $util.newBuffer($util.base64.length(d.signatures[i]))),
                  0,
                );
              else if (d.signatures[i].length) m.signatures[i] = d.signatures[i];
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
            d.authInfo = $root.cosmos.tx.v1beta1.AuthInfo.toObject(m.authInfo, o);
          }
          if (m.signatures && m.signatures.length) {
            d.signatures = [];
            for (var j = 0; j < m.signatures.length; ++j) {
              d.signatures[j] =
                o.bytes === String
                  ? $util.base64.encode(m.signatures[j], 0, m.signatures[j].length)
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
          if (m.authInfoBytes != null && Object.hasOwnProperty.call(m, "authInfoBytes"))
            w.uint32(18).bytes(m.authInfoBytes);
          if (m.signatures != null && m.signatures.length) {
            for (var i = 0; i < m.signatures.length; ++i) w.uint32(26).bytes(m.signatures[i]);
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
                (m.bodyBytes = $util.newBuffer($util.base64.length(d.bodyBytes))),
                0,
              );
            else if (d.bodyBytes.length) m.bodyBytes = d.bodyBytes;
          }
          if (d.authInfoBytes != null) {
            if (typeof d.authInfoBytes === "string")
              $util.base64.decode(
                d.authInfoBytes,
                (m.authInfoBytes = $util.newBuffer($util.base64.length(d.authInfoBytes))),
                0,
              );
            else if (d.authInfoBytes.length) m.authInfoBytes = d.authInfoBytes;
          }
          if (d.signatures) {
            if (!Array.isArray(d.signatures))
              throw TypeError(".cosmos.tx.v1beta1.TxRaw.signatures: array expected");
            m.signatures = [];
            for (var i = 0; i < d.signatures.length; ++i) {
              if (typeof d.signatures[i] === "string")
                $util.base64.decode(
                  d.signatures[i],
                  (m.signatures[i] = $util.newBuffer($util.base64.length(d.signatures[i]))),
                  0,
                );
              else if (d.signatures[i].length) m.signatures[i] = d.signatures[i];
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
              if (o.bytes !== Array) d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
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
                ? $util.base64.encode(m.authInfoBytes, 0, m.authInfoBytes.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.authInfoBytes)
                : m.authInfoBytes;
          }
          if (m.signatures && m.signatures.length) {
            d.signatures = [];
            for (var j = 0; j < m.signatures.length; ++j) {
              d.signatures[j] =
                o.bytes === String
                  ? $util.base64.encode(m.signatures[j], 0, m.signatures[j].length)
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
        SignDoc.prototype.accountNumber = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        SignDoc.create = function create(properties) {
          return new SignDoc(properties);
        };
        SignDoc.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.bodyBytes != null && Object.hasOwnProperty.call(m, "bodyBytes"))
            w.uint32(10).bytes(m.bodyBytes);
          if (m.authInfoBytes != null && Object.hasOwnProperty.call(m, "authInfoBytes"))
            w.uint32(18).bytes(m.authInfoBytes);
          if (m.chainId != null && Object.hasOwnProperty.call(m, "chainId")) w.uint32(26).string(m.chainId);
          if (m.accountNumber != null && Object.hasOwnProperty.call(m, "accountNumber"))
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
                (m.bodyBytes = $util.newBuffer($util.base64.length(d.bodyBytes))),
                0,
              );
            else if (d.bodyBytes.length) m.bodyBytes = d.bodyBytes;
          }
          if (d.authInfoBytes != null) {
            if (typeof d.authInfoBytes === "string")
              $util.base64.decode(
                d.authInfoBytes,
                (m.authInfoBytes = $util.newBuffer($util.base64.length(d.authInfoBytes))),
                0,
              );
            else if (d.authInfoBytes.length) m.authInfoBytes = d.authInfoBytes;
          }
          if (d.chainId != null) {
            m.chainId = String(d.chainId);
          }
          if (d.accountNumber != null) {
            if ($util.Long) (m.accountNumber = $util.Long.fromValue(d.accountNumber)).unsigned = true;
            else if (typeof d.accountNumber === "string") m.accountNumber = parseInt(d.accountNumber, 10);
            else if (typeof d.accountNumber === "number") m.accountNumber = d.accountNumber;
            else if (typeof d.accountNumber === "object")
              m.accountNumber = new $util.LongBits(
                d.accountNumber.low >>> 0,
                d.accountNumber.high >>> 0,
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
              if (o.bytes !== Array) d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
            }
            d.chainId = "";
            if ($util.Long) {
              var n = new $util.Long(0, 0, true);
              d.accountNumber = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
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
                ? $util.base64.encode(m.authInfoBytes, 0, m.authInfoBytes.length)
                : o.bytes === Array
                ? Array.prototype.slice.call(m.authInfoBytes)
                : m.authInfoBytes;
          }
          if (m.chainId != null && m.hasOwnProperty("chainId")) {
            d.chainId = m.chainId;
          }
          if (m.accountNumber != null && m.hasOwnProperty("accountNumber")) {
            if (typeof m.accountNumber === "number")
              d.accountNumber = o.longs === String ? String(m.accountNumber) : m.accountNumber;
            else
              d.accountNumber =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.accountNumber)
                  : o.longs === Number
                  ? new $util.LongBits(m.accountNumber.low >>> 0, m.accountNumber.high >>> 0).toNumber(true)
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
        TxBody.prototype.timeoutHeight = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        TxBody.prototype.extensionOptions = $util.emptyArray;
        TxBody.prototype.nonCriticalExtensionOptions = $util.emptyArray;
        TxBody.create = function create(properties) {
          return new TxBody(properties);
        };
        TxBody.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.messages != null && m.messages.length) {
            for (var i = 0; i < m.messages.length; ++i)
              $root.google.protobuf.Any.encode(m.messages[i], w.uint32(10).fork()).ldelim();
          }
          if (m.memo != null && Object.hasOwnProperty.call(m, "memo")) w.uint32(18).string(m.memo);
          if (m.timeoutHeight != null && Object.hasOwnProperty.call(m, "timeoutHeight"))
            w.uint32(24).uint64(m.timeoutHeight);
          if (m.extensionOptions != null && m.extensionOptions.length) {
            for (var i = 0; i < m.extensionOptions.length; ++i)
              $root.google.protobuf.Any.encode(m.extensionOptions[i], w.uint32(8186).fork()).ldelim();
          }
          if (m.nonCriticalExtensionOptions != null && m.nonCriticalExtensionOptions.length) {
            for (var i = 0; i < m.nonCriticalExtensionOptions.length; ++i)
              $root.google.protobuf.Any.encode(
                m.nonCriticalExtensionOptions[i],
                w.uint32(16378).fork(),
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
                m.messages.push($root.google.protobuf.Any.decode(r, r.uint32()));
                break;
              case 2:
                m.memo = r.string();
                break;
              case 3:
                m.timeoutHeight = r.uint64();
                break;
              case 1023:
                if (!(m.extensionOptions && m.extensionOptions.length)) m.extensionOptions = [];
                m.extensionOptions.push($root.google.protobuf.Any.decode(r, r.uint32()));
                break;
              case 2047:
                if (!(m.nonCriticalExtensionOptions && m.nonCriticalExtensionOptions.length))
                  m.nonCriticalExtensionOptions = [];
                m.nonCriticalExtensionOptions.push($root.google.protobuf.Any.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.tx.v1beta1.TxBody.messages: array expected");
            m.messages = [];
            for (var i = 0; i < d.messages.length; ++i) {
              if (typeof d.messages[i] !== "object")
                throw TypeError(".cosmos.tx.v1beta1.TxBody.messages: object expected");
              m.messages[i] = $root.google.protobuf.Any.fromObject(d.messages[i]);
            }
          }
          if (d.memo != null) {
            m.memo = String(d.memo);
          }
          if (d.timeoutHeight != null) {
            if ($util.Long) (m.timeoutHeight = $util.Long.fromValue(d.timeoutHeight)).unsigned = true;
            else if (typeof d.timeoutHeight === "string") m.timeoutHeight = parseInt(d.timeoutHeight, 10);
            else if (typeof d.timeoutHeight === "number") m.timeoutHeight = d.timeoutHeight;
            else if (typeof d.timeoutHeight === "object")
              m.timeoutHeight = new $util.LongBits(
                d.timeoutHeight.low >>> 0,
                d.timeoutHeight.high >>> 0,
              ).toNumber(true);
          }
          if (d.extensionOptions) {
            if (!Array.isArray(d.extensionOptions))
              throw TypeError(".cosmos.tx.v1beta1.TxBody.extensionOptions: array expected");
            m.extensionOptions = [];
            for (var i = 0; i < d.extensionOptions.length; ++i) {
              if (typeof d.extensionOptions[i] !== "object")
                throw TypeError(".cosmos.tx.v1beta1.TxBody.extensionOptions: object expected");
              m.extensionOptions[i] = $root.google.protobuf.Any.fromObject(d.extensionOptions[i]);
            }
          }
          if (d.nonCriticalExtensionOptions) {
            if (!Array.isArray(d.nonCriticalExtensionOptions))
              throw TypeError(".cosmos.tx.v1beta1.TxBody.nonCriticalExtensionOptions: array expected");
            m.nonCriticalExtensionOptions = [];
            for (var i = 0; i < d.nonCriticalExtensionOptions.length; ++i) {
              if (typeof d.nonCriticalExtensionOptions[i] !== "object")
                throw TypeError(".cosmos.tx.v1beta1.TxBody.nonCriticalExtensionOptions: object expected");
              m.nonCriticalExtensionOptions[i] = $root.google.protobuf.Any.fromObject(
                d.nonCriticalExtensionOptions[i],
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
              d.timeoutHeight = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else d.timeoutHeight = o.longs === String ? "0" : 0;
          }
          if (m.messages && m.messages.length) {
            d.messages = [];
            for (var j = 0; j < m.messages.length; ++j) {
              d.messages[j] = $root.google.protobuf.Any.toObject(m.messages[j], o);
            }
          }
          if (m.memo != null && m.hasOwnProperty("memo")) {
            d.memo = m.memo;
          }
          if (m.timeoutHeight != null && m.hasOwnProperty("timeoutHeight")) {
            if (typeof m.timeoutHeight === "number")
              d.timeoutHeight = o.longs === String ? String(m.timeoutHeight) : m.timeoutHeight;
            else
              d.timeoutHeight =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.timeoutHeight)
                  : o.longs === Number
                  ? new $util.LongBits(m.timeoutHeight.low >>> 0, m.timeoutHeight.high >>> 0).toNumber(true)
                  : m.timeoutHeight;
          }
          if (m.extensionOptions && m.extensionOptions.length) {
            d.extensionOptions = [];
            for (var j = 0; j < m.extensionOptions.length; ++j) {
              d.extensionOptions[j] = $root.google.protobuf.Any.toObject(m.extensionOptions[j], o);
            }
          }
          if (m.nonCriticalExtensionOptions && m.nonCriticalExtensionOptions.length) {
            d.nonCriticalExtensionOptions = [];
            for (var j = 0; j < m.nonCriticalExtensionOptions.length; ++j) {
              d.nonCriticalExtensionOptions[j] = $root.google.protobuf.Any.toObject(
                m.nonCriticalExtensionOptions[j],
                o,
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
              $root.cosmos.tx.v1beta1.SignerInfo.encode(m.signerInfos[i], w.uint32(10).fork()).ldelim();
          }
          if (m.fee != null && Object.hasOwnProperty.call(m, "fee"))
            $root.cosmos.tx.v1beta1.Fee.encode(m.fee, w.uint32(18).fork()).ldelim();
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
                if (!(m.signerInfos && m.signerInfos.length)) m.signerInfos = [];
                m.signerInfos.push($root.cosmos.tx.v1beta1.SignerInfo.decode(r, r.uint32()));
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
              throw TypeError(".cosmos.tx.v1beta1.AuthInfo.signerInfos: array expected");
            m.signerInfos = [];
            for (var i = 0; i < d.signerInfos.length; ++i) {
              if (typeof d.signerInfos[i] !== "object")
                throw TypeError(".cosmos.tx.v1beta1.AuthInfo.signerInfos: object expected");
              m.signerInfos[i] = $root.cosmos.tx.v1beta1.SignerInfo.fromObject(d.signerInfos[i]);
            }
          }
          if (d.fee != null) {
            if (typeof d.fee !== "object")
              throw TypeError(".cosmos.tx.v1beta1.AuthInfo.fee: object expected");
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
              d.signerInfos[j] = $root.cosmos.tx.v1beta1.SignerInfo.toObject(m.signerInfos[j], o);
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
        SignerInfo.prototype.sequence = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        SignerInfo.create = function create(properties) {
          return new SignerInfo(properties);
        };
        SignerInfo.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.publicKey != null && Object.hasOwnProperty.call(m, "publicKey"))
            $root.google.protobuf.Any.encode(m.publicKey, w.uint32(10).fork()).ldelim();
          if (m.modeInfo != null && Object.hasOwnProperty.call(m, "modeInfo"))
            $root.cosmos.tx.v1beta1.ModeInfo.encode(m.modeInfo, w.uint32(18).fork()).ldelim();
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
                m.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.decode(r, r.uint32());
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
              throw TypeError(".cosmos.tx.v1beta1.SignerInfo.publicKey: object expected");
            m.publicKey = $root.google.protobuf.Any.fromObject(d.publicKey);
          }
          if (d.modeInfo != null) {
            if (typeof d.modeInfo !== "object")
              throw TypeError(".cosmos.tx.v1beta1.SignerInfo.modeInfo: object expected");
            m.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.fromObject(d.modeInfo);
          }
          if (d.sequence != null) {
            if ($util.Long) (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
            else if (typeof d.sequence === "string") m.sequence = parseInt(d.sequence, 10);
            else if (typeof d.sequence === "number") m.sequence = d.sequence;
            else if (typeof d.sequence === "object")
              m.sequence = new $util.LongBits(d.sequence.low >>> 0, d.sequence.high >>> 0).toNumber(true);
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
              d.sequence = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else d.sequence = o.longs === String ? "0" : 0;
          }
          if (m.publicKey != null && m.hasOwnProperty("publicKey")) {
            d.publicKey = $root.google.protobuf.Any.toObject(m.publicKey, o);
          }
          if (m.modeInfo != null && m.hasOwnProperty("modeInfo")) {
            d.modeInfo = $root.cosmos.tx.v1beta1.ModeInfo.toObject(m.modeInfo, o);
          }
          if (m.sequence != null && m.hasOwnProperty("sequence")) {
            if (typeof m.sequence === "number")
              d.sequence = o.longs === String ? String(m.sequence) : m.sequence;
            else
              d.sequence =
                o.longs === String
                  ? $util.Long.prototype.toString.call(m.sequence)
                  : o.longs === Number
                  ? new $util.LongBits(m.sequence.low >>> 0, m.sequence.high >>> 0).toNumber(true)
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
            $root.cosmos.tx.v1beta1.ModeInfo.Single.encode(m.single, w.uint32(10).fork()).ldelim();
          if (m.multi != null && Object.hasOwnProperty.call(m, "multi"))
            $root.cosmos.tx.v1beta1.ModeInfo.Multi.encode(m.multi, w.uint32(18).fork()).ldelim();
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
                m.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.decode(r, r.uint32());
                break;
              case 2:
                m.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.decode(r, r.uint32());
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
              throw TypeError(".cosmos.tx.v1beta1.ModeInfo.single: object expected");
            m.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.fromObject(d.single);
          }
          if (d.multi != null) {
            if (typeof d.multi !== "object")
              throw TypeError(".cosmos.tx.v1beta1.ModeInfo.multi: object expected");
            m.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.fromObject(d.multi);
          }
          return m;
        };
        ModeInfo.toObject = function toObject(m, o) {
          if (!o) o = {};
          var d = {};
          if (m.single != null && m.hasOwnProperty("single")) {
            d.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.toObject(m.single, o);
            if (o.oneofs) d.sum = "single";
          }
          if (m.multi != null && m.hasOwnProperty("multi")) {
            d.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.toObject(m.multi, o);
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
            if (m.mode != null && Object.hasOwnProperty.call(m, "mode")) w.uint32(8).int32(m.mode);
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
              d.mode = o.enums === String ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode] : m.mode;
            }
            return d;
          };
          Single.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
                w.uint32(10).fork(),
              ).ldelim();
            if (m.modeInfos != null && m.modeInfos.length) {
              for (var i = 0; i < m.modeInfos.length; ++i)
                $root.cosmos.tx.v1beta1.ModeInfo.encode(m.modeInfos[i], w.uint32(18).fork()).ldelim();
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
                  m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(r, r.uint32());
                  break;
                case 2:
                  if (!(m.modeInfos && m.modeInfos.length)) m.modeInfos = [];
                  m.modeInfos.push($root.cosmos.tx.v1beta1.ModeInfo.decode(r, r.uint32()));
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
                throw TypeError(".cosmos.tx.v1beta1.ModeInfo.Multi.bitarray: object expected");
              m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(d.bitarray);
            }
            if (d.modeInfos) {
              if (!Array.isArray(d.modeInfos))
                throw TypeError(".cosmos.tx.v1beta1.ModeInfo.Multi.modeInfos: array expected");
              m.modeInfos = [];
              for (var i = 0; i < d.modeInfos.length; ++i) {
                if (typeof d.modeInfos[i] !== "object")
                  throw TypeError(".cosmos.tx.v1beta1.ModeInfo.Multi.modeInfos: object expected");
                m.modeInfos[i] = $root.cosmos.tx.v1beta1.ModeInfo.fromObject(d.modeInfos[i]);
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
              d.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.toObject(m.bitarray, o);
            }
            if (m.modeInfos && m.modeInfos.length) {
              d.modeInfos = [];
              for (var j = 0; j < m.modeInfos.length; ++j) {
                d.modeInfos[j] = $root.cosmos.tx.v1beta1.ModeInfo.toObject(m.modeInfos[j], o);
              }
            }
            return d;
          };
          Multi.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
        Fee.prototype.gasLimit = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
        Fee.prototype.payer = "";
        Fee.prototype.granter = "";
        Fee.create = function create(properties) {
          return new Fee(properties);
        };
        Fee.encode = function encode(m, w) {
          if (!w) w = $Writer.create();
          if (m.amount != null && m.amount.length) {
            for (var i = 0; i < m.amount.length; ++i)
              $root.cosmos.base.v1beta1.Coin.encode(m.amount[i], w.uint32(10).fork()).ldelim();
          }
          if (m.gasLimit != null && Object.hasOwnProperty.call(m, "gasLimit"))
            w.uint32(16).uint64(m.gasLimit);
          if (m.payer != null && Object.hasOwnProperty.call(m, "payer")) w.uint32(26).string(m.payer);
          if (m.granter != null && Object.hasOwnProperty.call(m, "granter")) w.uint32(34).string(m.granter);
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
                m.amount.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
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
            if (!Array.isArray(d.amount)) throw TypeError(".cosmos.tx.v1beta1.Fee.amount: array expected");
            m.amount = [];
            for (var i = 0; i < d.amount.length; ++i) {
              if (typeof d.amount[i] !== "object")
                throw TypeError(".cosmos.tx.v1beta1.Fee.amount: object expected");
              m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount[i]);
            }
          }
          if (d.gasLimit != null) {
            if ($util.Long) (m.gasLimit = $util.Long.fromValue(d.gasLimit)).unsigned = true;
            else if (typeof d.gasLimit === "string") m.gasLimit = parseInt(d.gasLimit, 10);
            else if (typeof d.gasLimit === "number") m.gasLimit = d.gasLimit;
            else if (typeof d.gasLimit === "object")
              m.gasLimit = new $util.LongBits(d.gasLimit.low >>> 0, d.gasLimit.high >>> 0).toNumber(true);
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
              d.gasLimit = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
            } else d.gasLimit = o.longs === String ? "0" : 0;
            d.payer = "";
            d.granter = "";
          }
          if (m.amount && m.amount.length) {
            d.amount = [];
            for (var j = 0; j < m.amount.length; ++j) {
              d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.amount[j], o);
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
                  ? new $util.LongBits(m.gasLimit.low >>> 0, m.gasLimit.high >>> 0).toNumber(true)
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
                  w.uint32(10).fork(),
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
                    $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.decode(r, r.uint32()),
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
            if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptors) return d;
            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
            if (d.signatures) {
              if (!Array.isArray(d.signatures))
                throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: array expected");
              m.signatures = [];
              for (var i = 0; i < d.signatures.length; ++i) {
                if (typeof d.signatures[i] !== "object")
                  throw TypeError(
                    ".cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: object expected",
                  );
                m.signatures[i] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.fromObject(
                  d.signatures[i],
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
                d.signatures[j] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.toObject(
                  m.signatures[j],
                  o,
                );
              }
            }
            return d;
          };
          SignatureDescriptors.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
          SignatureDescriptor.prototype.sequence = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
          SignatureDescriptor.create = function create(properties) {
            return new SignatureDescriptor(properties);
          };
          SignatureDescriptor.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.publicKey != null && Object.hasOwnProperty.call(m, "publicKey"))
              $root.google.protobuf.Any.encode(m.publicKey, w.uint32(10).fork()).ldelim();
            if (m.data != null && Object.hasOwnProperty.call(m, "data"))
              $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(
                m.data,
                w.uint32(18).fork(),
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
                  m.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(r, r.uint32());
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
            if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor) return d;
            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor();
            if (d.publicKey != null) {
              if (typeof d.publicKey !== "object")
                throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.publicKey: object expected");
              m.publicKey = $root.google.protobuf.Any.fromObject(d.publicKey);
            }
            if (d.data != null) {
              if (typeof d.data !== "object")
                throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.data: object expected");
              m.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(d.data);
            }
            if (d.sequence != null) {
              if ($util.Long) (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
              else if (typeof d.sequence === "string") m.sequence = parseInt(d.sequence, 10);
              else if (typeof d.sequence === "number") m.sequence = d.sequence;
              else if (typeof d.sequence === "object")
                m.sequence = new $util.LongBits(d.sequence.low >>> 0, d.sequence.high >>> 0).toNumber(true);
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
                d.sequence = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
              } else d.sequence = o.longs === String ? "0" : 0;
            }
            if (m.publicKey != null && m.hasOwnProperty("publicKey")) {
              d.publicKey = $root.google.protobuf.Any.toObject(m.publicKey, o);
            }
            if (m.data != null && m.hasOwnProperty("data")) {
              d.data = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(m.data, o);
            }
            if (m.sequence != null && m.hasOwnProperty("sequence")) {
              if (typeof m.sequence === "number")
                d.sequence = o.longs === String ? String(m.sequence) : m.sequence;
              else
                d.sequence =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.sequence)
                    : o.longs === Number
                    ? new $util.LongBits(m.sequence.low >>> 0, m.sequence.high >>> 0).toNumber(true)
                    : m.sequence;
            }
            return d;
          };
          SignatureDescriptor.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
                  w.uint32(10).fork(),
                ).ldelim();
              if (m.multi != null && Object.hasOwnProperty.call(m, "multi"))
                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.encode(
                  m.multi,
                  w.uint32(18).fork(),
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
                      r.uint32(),
                    );
                    break;
                  case 2:
                    m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.decode(
                      r,
                      r.uint32(),
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
              if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data) return d;
              var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
              if (d.single != null) {
                if (typeof d.single !== "object")
                  throw TypeError(
                    ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.single: object expected",
                  );
                m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.fromObject(
                  d.single,
                );
              }
              if (d.multi != null) {
                if (typeof d.multi !== "object")
                  throw TypeError(
                    ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.multi: object expected",
                  );
                m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.fromObject(d.multi);
              }
              return m;
            };
            Data.toObject = function toObject(m, o) {
              if (!o) o = {};
              var d = {};
              if (m.single != null && m.hasOwnProperty("single")) {
                d.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.toObject(
                  m.single,
                  o,
                );
                if (o.oneofs) d.sum = "single";
              }
              if (m.multi != null && m.hasOwnProperty("multi")) {
                d.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.toObject(m.multi, o);
                if (o.oneofs) d.sum = "multi";
              }
              return d;
            };
            Data.prototype.toJSON = function toJSON() {
              return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
                if (m.mode != null && Object.hasOwnProperty.call(m, "mode")) w.uint32(8).int32(m.mode);
                if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
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
                if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single) return d;
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
                      (m.signature = $util.newBuffer($util.base64.length(d.signature))),
                      0,
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
                    if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
                  }
                }
                if (m.mode != null && m.hasOwnProperty("mode")) {
                  d.mode = o.enums === String ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode] : m.mode;
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
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
                if (m.bitarray != null && Object.hasOwnProperty.call(m, "bitarray"))
                  $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(
                    m.bitarray,
                    w.uint32(10).fork(),
                  ).ldelim();
                if (m.signatures != null && m.signatures.length) {
                  for (var i = 0; i < m.signatures.length; ++i)
                    $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(
                      m.signatures[i],
                      w.uint32(18).fork(),
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
                      m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(r, r.uint32());
                      break;
                    case 2:
                      if (!(m.signatures && m.signatures.length)) m.signatures = [];
                      m.signatures.push(
                        $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(r, r.uint32()),
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
                if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi) return d;
                var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                if (d.bitarray != null) {
                  if (typeof d.bitarray !== "object")
                    throw TypeError(
                      ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.bitarray: object expected",
                    );
                  m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(d.bitarray);
                }
                if (d.signatures) {
                  if (!Array.isArray(d.signatures))
                    throw TypeError(
                      ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: array expected",
                    );
                  m.signatures = [];
                  for (var i = 0; i < d.signatures.length; ++i) {
                    if (typeof d.signatures[i] !== "object")
                      throw TypeError(
                        ".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: object expected",
                      );
                    m.signatures[i] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(
                      d.signatures[i],
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
                  d.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.toObject(m.bitarray, o);
                }
                if (m.signatures && m.signatures.length) {
                  d.signatures = [];
                  for (var j = 0; j < m.signatures.length; ++j) {
                    d.signatures[j] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(
                      m.signatures[j],
                      o,
                    );
                  }
                }
                return d;
              };
              Multi.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
        if (m.type_url != null && Object.hasOwnProperty.call(m, "type_url")) w.uint32(10).string(m.type_url);
        if (m.value != null && Object.hasOwnProperty.call(m, "value")) w.uint32(18).bytes(m.value);
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
            $util.base64.decode(d.value, (m.value = $util.newBuffer($util.base64.length(d.value))), 0);
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
    protobuf.Duration = (function () {
      function Duration(p) {
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      Duration.prototype.seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Duration.prototype.nanos = 0;
      Duration.create = function create(properties) {
        return new Duration(properties);
      };
      Duration.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds")) w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos")) w.uint32(16).int32(m.nanos);
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
          if ($util.Long) (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === "string") m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === "number") m.seconds = d.seconds;
          else if (typeof d.seconds === "object")
            m.seconds = new $util.LongBits(d.seconds.low >>> 0, d.seconds.high >>> 0).toNumber();
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
            d.seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.seconds = o.longs === String ? "0" : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty("seconds")) {
          if (typeof m.seconds === "number") d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(m.seconds.low >>> 0, m.seconds.high >>> 0).toNumber()
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
      Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Timestamp.prototype.nanos = 0;
      Timestamp.create = function create(properties) {
        return new Timestamp(properties);
      };
      Timestamp.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds")) w.uint32(8).int64(m.seconds);
        if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos")) w.uint32(16).int32(m.nanos);
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
          if ($util.Long) (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
          else if (typeof d.seconds === "string") m.seconds = parseInt(d.seconds, 10);
          else if (typeof d.seconds === "number") m.seconds = d.seconds;
          else if (typeof d.seconds === "object")
            m.seconds = new $util.LongBits(d.seconds.low >>> 0, d.seconds.high >>> 0).toNumber();
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
            d.seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.seconds = o.longs === String ? "0" : 0;
          d.nanos = 0;
        }
        if (m.seconds != null && m.hasOwnProperty("seconds")) {
          if (typeof m.seconds === "number") d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
          else
            d.seconds =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.seconds)
                : o.longs === Number
                ? new $util.LongBits(m.seconds.low >>> 0, m.seconds.high >>> 0).toNumber()
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
  return google;
})();
exports.ibc = $root.ibc = (() => {
  const ibc = {};
  ibc.core = (function () {
    const core = {};
    core.client = (function () {
      const client = {};
      client.v1 = (function () {
        const v1 = {};
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
            if (m.clientState != null && Object.hasOwnProperty.call(m, "clientState"))
              $root.google.protobuf.Any.encode(m.clientState, w.uint32(18).fork()).ldelim();
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
                  m.clientState = $root.google.protobuf.Any.decode(r, r.uint32());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          IdentifiedClientState.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.IdentifiedClientState) return d;
            var m = new $root.ibc.core.client.v1.IdentifiedClientState();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.clientState != null) {
              if (typeof d.clientState !== "object")
                throw TypeError(".ibc.core.client.v1.IdentifiedClientState.clientState: object expected");
              m.clientState = $root.google.protobuf.Any.fromObject(d.clientState);
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
              d.clientState = $root.google.protobuf.Any.toObject(m.clientState, o);
            }
            return d;
          };
          IdentifiedClientState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
              $root.ibc.core.client.v1.Height.encode(m.height, w.uint32(10).fork()).ldelim();
            if (m.consensusState != null && Object.hasOwnProperty.call(m, "consensusState"))
              $root.google.protobuf.Any.encode(m.consensusState, w.uint32(18).fork()).ldelim();
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
                  m.height = $root.ibc.core.client.v1.Height.decode(r, r.uint32());
                  break;
                case 2:
                  m.consensusState = $root.google.protobuf.Any.decode(r, r.uint32());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          ConsensusStateWithHeight.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.ConsensusStateWithHeight) return d;
            var m = new $root.ibc.core.client.v1.ConsensusStateWithHeight();
            if (d.height != null) {
              if (typeof d.height !== "object")
                throw TypeError(".ibc.core.client.v1.ConsensusStateWithHeight.height: object expected");
              m.height = $root.ibc.core.client.v1.Height.fromObject(d.height);
            }
            if (d.consensusState != null) {
              if (typeof d.consensusState !== "object")
                throw TypeError(
                  ".ibc.core.client.v1.ConsensusStateWithHeight.consensusState: object expected",
                );
              m.consensusState = $root.google.protobuf.Any.fromObject(d.consensusState);
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
            if (m.consensusState != null && m.hasOwnProperty("consensusState")) {
              d.consensusState = $root.google.protobuf.Any.toObject(m.consensusState, o);
            }
            return d;
          };
          ConsensusStateWithHeight.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
                  w.uint32(18).fork(),
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
                  if (!(m.consensusStates && m.consensusStates.length)) m.consensusStates = [];
                  m.consensusStates.push(
                    $root.ibc.core.client.v1.ConsensusStateWithHeight.decode(r, r.uint32()),
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
            if (d instanceof $root.ibc.core.client.v1.ClientConsensusStates) return d;
            var m = new $root.ibc.core.client.v1.ClientConsensusStates();
            if (d.clientId != null) {
              m.clientId = String(d.clientId);
            }
            if (d.consensusStates) {
              if (!Array.isArray(d.consensusStates))
                throw TypeError(".ibc.core.client.v1.ClientConsensusStates.consensusStates: array expected");
              m.consensusStates = [];
              for (var i = 0; i < d.consensusStates.length; ++i) {
                if (typeof d.consensusStates[i] !== "object")
                  throw TypeError(
                    ".ibc.core.client.v1.ClientConsensusStates.consensusStates: object expected",
                  );
                m.consensusStates[i] = $root.ibc.core.client.v1.ConsensusStateWithHeight.fromObject(
                  d.consensusStates[i],
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
                d.consensusStates[j] = $root.ibc.core.client.v1.ConsensusStateWithHeight.toObject(
                  m.consensusStates[j],
                  o,
                );
              }
            }
            return d;
          };
          ClientConsensusStates.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
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
            if (m.title != null && Object.hasOwnProperty.call(m, "title")) w.uint32(10).string(m.title);
            if (m.description != null && Object.hasOwnProperty.call(m, "description"))
              w.uint32(18).string(m.description);
            if (m.clientId != null && Object.hasOwnProperty.call(m, "clientId"))
              w.uint32(26).string(m.clientId);
            if (m.header != null && Object.hasOwnProperty.call(m, "header"))
              $root.google.protobuf.Any.encode(m.header, w.uint32(34).fork()).ldelim();
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
            if (d instanceof $root.ibc.core.client.v1.ClientUpdateProposal) return d;
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
                throw TypeError(".ibc.core.client.v1.ClientUpdateProposal.header: object expected");
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
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
          };
          return ClientUpdateProposal;
        })();
        v1.Height = (function () {
          function Height(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Height.prototype.revisionNumber = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
          Height.prototype.revisionHeight = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
          Height.create = function create(properties) {
            return new Height(properties);
          };
          Height.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.revisionNumber != null && Object.hasOwnProperty.call(m, "revisionNumber"))
              w.uint32(8).uint64(m.revisionNumber);
            if (m.revisionHeight != null && Object.hasOwnProperty.call(m, "revisionHeight"))
              w.uint32(16).uint64(m.revisionHeight);
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
                  m.revisionNumber = r.uint64();
                  break;
                case 2:
                  m.revisionHeight = r.uint64();
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
            if (d.revisionNumber != null) {
              if ($util.Long) (m.revisionNumber = $util.Long.fromValue(d.revisionNumber)).unsigned = true;
              else if (typeof d.revisionNumber === "string")
                m.revisionNumber = parseInt(d.revisionNumber, 10);
              else if (typeof d.revisionNumber === "number") m.revisionNumber = d.revisionNumber;
              else if (typeof d.revisionNumber === "object")
                m.revisionNumber = new $util.LongBits(
                  d.revisionNumber.low >>> 0,
                  d.revisionNumber.high >>> 0,
                ).toNumber(true);
            }
            if (d.revisionHeight != null) {
              if ($util.Long) (m.revisionHeight = $util.Long.fromValue(d.revisionHeight)).unsigned = true;
              else if (typeof d.revisionHeight === "string")
                m.revisionHeight = parseInt(d.revisionHeight, 10);
              else if (typeof d.revisionHeight === "number") m.revisionHeight = d.revisionHeight;
              else if (typeof d.revisionHeight === "object")
                m.revisionHeight = new $util.LongBits(
                  d.revisionHeight.low >>> 0,
                  d.revisionHeight.high >>> 0,
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
                d.revisionNumber = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
              } else d.revisionNumber = o.longs === String ? "0" : 0;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.revisionHeight = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
              } else d.revisionHeight = o.longs === String ? "0" : 0;
            }
            if (m.revisionNumber != null && m.hasOwnProperty("revisionNumber")) {
              if (typeof m.revisionNumber === "number")
                d.revisionNumber = o.longs === String ? String(m.revisionNumber) : m.revisionNumber;
              else
                d.revisionNumber =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.revisionNumber)
                    : o.longs === Number
                    ? new $util.LongBits(m.revisionNumber.low >>> 0, m.revisionNumber.high >>> 0).toNumber(
                        true,
                      )
                    : m.revisionNumber;
            }
            if (m.revisionHeight != null && m.hasOwnProperty("revisionHeight")) {
              if (typeof m.revisionHeight === "number")
                d.revisionHeight = o.longs === String ? String(m.revisionHeight) : m.revisionHeight;
              else
                d.revisionHeight =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.revisionHeight)
                    : o.longs === Number
                    ? new $util.LongBits(m.revisionHeight.low >>> 0, m.revisionHeight.high >>> 0).toNumber(
                        true,
                      )
                    : m.revisionHeight;
            }
            return d;
          };
          Height.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
          };
          return Height;
        })();
        v1.Params = (function () {
          function Params(p) {
            this.allowedClients = [];
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          Params.prototype.allowedClients = $util.emptyArray;
          Params.create = function create(properties) {
            return new Params(properties);
          };
          Params.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.allowedClients != null && m.allowedClients.length) {
              for (var i = 0; i < m.allowedClients.length; ++i) w.uint32(10).string(m.allowedClients[i]);
            }
            return w;
          };
          Params.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.core.client.v1.Params();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  if (!(m.allowedClients && m.allowedClients.length)) m.allowedClients = [];
                  m.allowedClients.push(r.string());
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          Params.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.core.client.v1.Params) return d;
            var m = new $root.ibc.core.client.v1.Params();
            if (d.allowedClients) {
              if (!Array.isArray(d.allowedClients))
                throw TypeError(".ibc.core.client.v1.Params.allowedClients: array expected");
              m.allowedClients = [];
              for (var i = 0; i < d.allowedClients.length; ++i) {
                m.allowedClients[i] = String(d.allowedClients[i]);
              }
            }
            return m;
          };
          Params.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.arrays || o.defaults) {
              d.allowedClients = [];
            }
            if (m.allowedClients && m.allowedClients.length) {
              d.allowedClients = [];
              for (var j = 0; j < m.allowedClients.length; ++j) {
                d.allowedClients[j] = m.allowedClients[j];
              }
            }
            return d;
          };
          Params.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
          };
          return Params;
        })();
        return v1;
      })();
      return client;
    })();
    return core;
  })();
  ibc.applications = (function () {
    const applications = {};
    applications.transfer = (function () {
      const transfer = {};
      transfer.v1 = (function () {
        const v1 = {};
        v1.Msg = (function () {
          function Msg(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
          }
          (Msg.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Msg;
          Msg.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
          };
          Object.defineProperty(
            (Msg.prototype.transfer = function transfer(request, callback) {
              return this.rpcCall(
                transfer,
                $root.ibc.applications.transfer.v1.MsgTransfer,
                $root.ibc.applications.transfer.v1.MsgTransferResponse,
                request,
                callback,
              );
            }),
            "name",
            { value: "Transfer" },
          );
          return Msg;
        })();
        v1.MsgTransfer = (function () {
          function MsgTransfer(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgTransfer.prototype.sourcePort = "";
          MsgTransfer.prototype.sourceChannel = "";
          MsgTransfer.prototype.token = null;
          MsgTransfer.prototype.sender = "";
          MsgTransfer.prototype.receiver = "";
          MsgTransfer.prototype.timeoutHeight = null;
          MsgTransfer.prototype.timeoutTimestamp = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
          MsgTransfer.create = function create(properties) {
            return new MsgTransfer(properties);
          };
          MsgTransfer.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            if (m.sourcePort != null && Object.hasOwnProperty.call(m, "sourcePort"))
              w.uint32(10).string(m.sourcePort);
            if (m.sourceChannel != null && Object.hasOwnProperty.call(m, "sourceChannel"))
              w.uint32(18).string(m.sourceChannel);
            if (m.token != null && Object.hasOwnProperty.call(m, "token"))
              $root.cosmos.base.v1beta1.Coin.encode(m.token, w.uint32(26).fork()).ldelim();
            if (m.sender != null && Object.hasOwnProperty.call(m, "sender")) w.uint32(34).string(m.sender);
            if (m.receiver != null && Object.hasOwnProperty.call(m, "receiver"))
              w.uint32(42).string(m.receiver);
            if (m.timeoutHeight != null && Object.hasOwnProperty.call(m, "timeoutHeight"))
              $root.ibc.core.client.v1.Height.encode(m.timeoutHeight, w.uint32(50).fork()).ldelim();
            if (m.timeoutTimestamp != null && Object.hasOwnProperty.call(m, "timeoutTimestamp"))
              w.uint32(56).uint64(m.timeoutTimestamp);
            return w;
          };
          MsgTransfer.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.applications.transfer.v1.MsgTransfer();
            while (r.pos < c) {
              var t = r.uint32();
              switch (t >>> 3) {
                case 1:
                  m.sourcePort = r.string();
                  break;
                case 2:
                  m.sourceChannel = r.string();
                  break;
                case 3:
                  m.token = $root.cosmos.base.v1beta1.Coin.decode(r, r.uint32());
                  break;
                case 4:
                  m.sender = r.string();
                  break;
                case 5:
                  m.receiver = r.string();
                  break;
                case 6:
                  m.timeoutHeight = $root.ibc.core.client.v1.Height.decode(r, r.uint32());
                  break;
                case 7:
                  m.timeoutTimestamp = r.uint64();
                  break;
                default:
                  r.skipType(t & 7);
                  break;
              }
            }
            return m;
          };
          MsgTransfer.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.applications.transfer.v1.MsgTransfer) return d;
            var m = new $root.ibc.applications.transfer.v1.MsgTransfer();
            if (d.sourcePort != null) {
              m.sourcePort = String(d.sourcePort);
            }
            if (d.sourceChannel != null) {
              m.sourceChannel = String(d.sourceChannel);
            }
            if (d.token != null) {
              if (typeof d.token !== "object")
                throw TypeError(".ibc.applications.transfer.v1.MsgTransfer.token: object expected");
              m.token = $root.cosmos.base.v1beta1.Coin.fromObject(d.token);
            }
            if (d.sender != null) {
              m.sender = String(d.sender);
            }
            if (d.receiver != null) {
              m.receiver = String(d.receiver);
            }
            if (d.timeoutHeight != null) {
              if (typeof d.timeoutHeight !== "object")
                throw TypeError(".ibc.applications.transfer.v1.MsgTransfer.timeoutHeight: object expected");
              m.timeoutHeight = $root.ibc.core.client.v1.Height.fromObject(d.timeoutHeight);
            }
            if (d.timeoutTimestamp != null) {
              if ($util.Long) (m.timeoutTimestamp = $util.Long.fromValue(d.timeoutTimestamp)).unsigned = true;
              else if (typeof d.timeoutTimestamp === "string")
                m.timeoutTimestamp = parseInt(d.timeoutTimestamp, 10);
              else if (typeof d.timeoutTimestamp === "number") m.timeoutTimestamp = d.timeoutTimestamp;
              else if (typeof d.timeoutTimestamp === "object")
                m.timeoutTimestamp = new $util.LongBits(
                  d.timeoutTimestamp.low >>> 0,
                  d.timeoutTimestamp.high >>> 0,
                ).toNumber(true);
            }
            return m;
          };
          MsgTransfer.toObject = function toObject(m, o) {
            if (!o) o = {};
            var d = {};
            if (o.defaults) {
              d.sourcePort = "";
              d.sourceChannel = "";
              d.token = null;
              d.sender = "";
              d.receiver = "";
              d.timeoutHeight = null;
              if ($util.Long) {
                var n = new $util.Long(0, 0, true);
                d.timeoutTimestamp =
                  o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
              } else d.timeoutTimestamp = o.longs === String ? "0" : 0;
            }
            if (m.sourcePort != null && m.hasOwnProperty("sourcePort")) {
              d.sourcePort = m.sourcePort;
            }
            if (m.sourceChannel != null && m.hasOwnProperty("sourceChannel")) {
              d.sourceChannel = m.sourceChannel;
            }
            if (m.token != null && m.hasOwnProperty("token")) {
              d.token = $root.cosmos.base.v1beta1.Coin.toObject(m.token, o);
            }
            if (m.sender != null && m.hasOwnProperty("sender")) {
              d.sender = m.sender;
            }
            if (m.receiver != null && m.hasOwnProperty("receiver")) {
              d.receiver = m.receiver;
            }
            if (m.timeoutHeight != null && m.hasOwnProperty("timeoutHeight")) {
              d.timeoutHeight = $root.ibc.core.client.v1.Height.toObject(m.timeoutHeight, o);
            }
            if (m.timeoutTimestamp != null && m.hasOwnProperty("timeoutTimestamp")) {
              if (typeof m.timeoutTimestamp === "number")
                d.timeoutTimestamp = o.longs === String ? String(m.timeoutTimestamp) : m.timeoutTimestamp;
              else
                d.timeoutTimestamp =
                  o.longs === String
                    ? $util.Long.prototype.toString.call(m.timeoutTimestamp)
                    : o.longs === Number
                    ? new $util.LongBits(
                        m.timeoutTimestamp.low >>> 0,
                        m.timeoutTimestamp.high >>> 0,
                      ).toNumber(true)
                    : m.timeoutTimestamp;
            }
            return d;
          };
          MsgTransfer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
          };
          return MsgTransfer;
        })();
        v1.MsgTransferResponse = (function () {
          function MsgTransferResponse(p) {
            if (p)
              for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
          }
          MsgTransferResponse.create = function create(properties) {
            return new MsgTransferResponse(properties);
          };
          MsgTransferResponse.encode = function encode(m, w) {
            if (!w) w = $Writer.create();
            return w;
          };
          MsgTransferResponse.decode = function decode(r, l) {
            if (!(r instanceof $Reader)) r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l,
              m = new $root.ibc.applications.transfer.v1.MsgTransferResponse();
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
          MsgTransferResponse.fromObject = function fromObject(d) {
            if (d instanceof $root.ibc.applications.transfer.v1.MsgTransferResponse) return d;
            return new $root.ibc.applications.transfer.v1.MsgTransferResponse();
          };
          MsgTransferResponse.toObject = function toObject() {
            return {};
          };
          MsgTransferResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
          };
          return MsgTransferResponse;
        })();
        return v1;
      })();
      return transfer;
    })();
    return applications;
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
        if (m.ed25519 != null && Object.hasOwnProperty.call(m, "ed25519")) w.uint32(10).bytes(m.ed25519);
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
            $util.base64.decode(d.ed25519, (m.ed25519 = $util.newBuffer($util.base64.length(d.ed25519))), 0);
          else if (d.ed25519.length) m.ed25519 = d.ed25519;
        }
        if (d.secp256k1 != null) {
          if (typeof d.secp256k1 === "string")
            $util.base64.decode(
              d.secp256k1,
              (m.secp256k1 = $util.newBuffer($util.base64.length(d.secp256k1))),
              0,
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
        if (m.total != null && Object.hasOwnProperty.call(m, "total")) w.uint32(8).int64(m.total);
        if (m.index != null && Object.hasOwnProperty.call(m, "index")) w.uint32(16).int64(m.index);
        if (m.leafHash != null && Object.hasOwnProperty.call(m, "leafHash")) w.uint32(26).bytes(m.leafHash);
        if (m.aunts != null && m.aunts.length) {
          for (var i = 0; i < m.aunts.length; ++i) w.uint32(34).bytes(m.aunts[i]);
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
          if ($util.Long) (m.total = $util.Long.fromValue(d.total)).unsigned = false;
          else if (typeof d.total === "string") m.total = parseInt(d.total, 10);
          else if (typeof d.total === "number") m.total = d.total;
          else if (typeof d.total === "object")
            m.total = new $util.LongBits(d.total.low >>> 0, d.total.high >>> 0).toNumber();
        }
        if (d.index != null) {
          if ($util.Long) (m.index = $util.Long.fromValue(d.index)).unsigned = false;
          else if (typeof d.index === "string") m.index = parseInt(d.index, 10);
          else if (typeof d.index === "number") m.index = d.index;
          else if (typeof d.index === "object")
            m.index = new $util.LongBits(d.index.low >>> 0, d.index.high >>> 0).toNumber();
        }
        if (d.leafHash != null) {
          if (typeof d.leafHash === "string")
            $util.base64.decode(
              d.leafHash,
              (m.leafHash = $util.newBuffer($util.base64.length(d.leafHash))),
              0,
            );
          else if (d.leafHash.length) m.leafHash = d.leafHash;
        }
        if (d.aunts) {
          if (!Array.isArray(d.aunts)) throw TypeError(".tendermint.crypto.Proof.aunts: array expected");
          m.aunts = [];
          for (var i = 0; i < d.aunts.length; ++i) {
            if (typeof d.aunts[i] === "string")
              $util.base64.decode(
                d.aunts[i],
                (m.aunts[i] = $util.newBuffer($util.base64.length(d.aunts[i]))),
                0,
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
            d.total = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.total = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.index = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.index = o.longs === String ? "0" : 0;
          if (o.bytes === String) d.leafHash = "";
          else {
            d.leafHash = [];
            if (o.bytes !== Array) d.leafHash = $util.newBuffer(d.leafHash);
          }
        }
        if (m.total != null && m.hasOwnProperty("total")) {
          if (typeof m.total === "number") d.total = o.longs === String ? String(m.total) : m.total;
          else
            d.total =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.total)
                : o.longs === Number
                ? new $util.LongBits(m.total.low >>> 0, m.total.high >>> 0).toNumber()
                : m.total;
        }
        if (m.index != null && m.hasOwnProperty("index")) {
          if (typeof m.index === "number") d.index = o.longs === String ? String(m.index) : m.index;
          else
            d.index =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.index)
                : o.longs === Number
                ? new $util.LongBits(m.index.low >>> 0, m.index.high >>> 0).toNumber()
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
        if (m.key != null && Object.hasOwnProperty.call(m, "key")) w.uint32(10).bytes(m.key);
        if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
          $root.tendermint.crypto.Proof.encode(m.proof, w.uint32(18).fork()).ldelim();
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
            $util.base64.decode(d.key, (m.key = $util.newBuffer($util.base64.length(d.key))), 0);
          else if (d.key.length) m.key = d.key;
        }
        if (d.proof != null) {
          if (typeof d.proof !== "object")
            throw TypeError(".tendermint.crypto.ValueOp.proof: object expected");
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
        if (m.key != null && Object.hasOwnProperty.call(m, "key")) w.uint32(10).string(m.key);
        if (m.input != null && Object.hasOwnProperty.call(m, "input")) w.uint32(18).string(m.input);
        if (m.output != null && Object.hasOwnProperty.call(m, "output")) w.uint32(26).string(m.output);
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
        if (m.type != null && Object.hasOwnProperty.call(m, "type")) w.uint32(10).string(m.type);
        if (m.key != null && Object.hasOwnProperty.call(m, "key")) w.uint32(18).bytes(m.key);
        if (m.data != null && Object.hasOwnProperty.call(m, "data")) w.uint32(26).bytes(m.data);
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
            $util.base64.decode(d.key, (m.key = $util.newBuffer($util.base64.length(d.key))), 0);
          else if (d.key.length) m.key = d.key;
        }
        if (d.data != null) {
          if (typeof d.data === "string")
            $util.base64.decode(d.data, (m.data = $util.newBuffer($util.base64.length(d.data))), 0);
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
            $root.tendermint.crypto.ProofOp.encode(m.ops[i], w.uint32(10).fork()).ldelim();
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
          if (!Array.isArray(d.ops)) throw TypeError(".tendermint.crypto.ProofOps.ops: array expected");
          m.ops = [];
          for (var i = 0; i < d.ops.length; ++i) {
            if (typeof d.ops[i] !== "object")
              throw TypeError(".tendermint.crypto.ProofOps.ops: object expected");
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
        if (m.protocol != null && Object.hasOwnProperty.call(m, "protocol")) w.uint32(8).uint64(m.protocol);
        if (m.software != null && Object.hasOwnProperty.call(m, "software")) w.uint32(18).string(m.software);
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
          if ($util.Long) (m.protocol = $util.Long.fromValue(d.protocol)).unsigned = true;
          else if (typeof d.protocol === "string") m.protocol = parseInt(d.protocol, 10);
          else if (typeof d.protocol === "number") m.protocol = d.protocol;
          else if (typeof d.protocol === "object")
            m.protocol = new $util.LongBits(d.protocol.low >>> 0, d.protocol.high >>> 0).toNumber(true);
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
            d.protocol = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
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
                ? new $util.LongBits(m.protocol.low >>> 0, m.protocol.high >>> 0).toNumber(true)
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
      Consensus.prototype.block = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      Consensus.prototype.app = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
      Consensus.create = function create(properties) {
        return new Consensus(properties);
      };
      Consensus.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.block != null && Object.hasOwnProperty.call(m, "block")) w.uint32(8).uint64(m.block);
        if (m.app != null && Object.hasOwnProperty.call(m, "app")) w.uint32(16).uint64(m.app);
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
          if ($util.Long) (m.block = $util.Long.fromValue(d.block)).unsigned = true;
          else if (typeof d.block === "string") m.block = parseInt(d.block, 10);
          else if (typeof d.block === "number") m.block = d.block;
          else if (typeof d.block === "object")
            m.block = new $util.LongBits(d.block.low >>> 0, d.block.high >>> 0).toNumber(true);
        }
        if (d.app != null) {
          if ($util.Long) (m.app = $util.Long.fromValue(d.app)).unsigned = true;
          else if (typeof d.app === "string") m.app = parseInt(d.app, 10);
          else if (typeof d.app === "number") m.app = d.app;
          else if (typeof d.app === "object")
            m.app = new $util.LongBits(d.app.low >>> 0, d.app.high >>> 0).toNumber(true);
        }
        return m;
      };
      Consensus.toObject = function toObject(m, o) {
        if (!o) o = {};
        var d = {};
        if (o.defaults) {
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.block = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.block = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, true);
            d.app = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.app = o.longs === String ? "0" : 0;
        }
        if (m.block != null && m.hasOwnProperty("block")) {
          if (typeof m.block === "number") d.block = o.longs === String ? String(m.block) : m.block;
          else
            d.block =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.block)
                : o.longs === Number
                ? new $util.LongBits(m.block.low >>> 0, m.block.high >>> 0).toNumber(true)
                : m.block;
        }
        if (m.app != null && m.hasOwnProperty("app")) {
          if (typeof m.app === "number") d.app = o.longs === String ? String(m.app) : m.app;
          else
            d.app =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.app)
                : o.longs === Number
                ? new $util.LongBits(m.app.low >>> 0, m.app.high >>> 0).toNumber(true)
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
  tendermint.types = (function () {
    const types = {};
    types.ValidatorSet = (function () {
      function ValidatorSet(p) {
        this.validators = [];
        if (p)
          for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
            if (p[ks[i]] != null) this[ks[i]] = p[ks[i]];
      }
      ValidatorSet.prototype.validators = $util.emptyArray;
      ValidatorSet.prototype.proposer = null;
      ValidatorSet.prototype.totalVotingPower = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      ValidatorSet.create = function create(properties) {
        return new ValidatorSet(properties);
      };
      ValidatorSet.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.validators != null && m.validators.length) {
          for (var i = 0; i < m.validators.length; ++i)
            $root.tendermint.types.Validator.encode(m.validators[i], w.uint32(10).fork()).ldelim();
        }
        if (m.proposer != null && Object.hasOwnProperty.call(m, "proposer"))
          $root.tendermint.types.Validator.encode(m.proposer, w.uint32(18).fork()).ldelim();
        if (m.totalVotingPower != null && Object.hasOwnProperty.call(m, "totalVotingPower"))
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
              m.validators.push($root.tendermint.types.Validator.decode(r, r.uint32()));
              break;
            case 2:
              m.proposer = $root.tendermint.types.Validator.decode(r, r.uint32());
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
            throw TypeError(".tendermint.types.ValidatorSet.validators: array expected");
          m.validators = [];
          for (var i = 0; i < d.validators.length; ++i) {
            if (typeof d.validators[i] !== "object")
              throw TypeError(".tendermint.types.ValidatorSet.validators: object expected");
            m.validators[i] = $root.tendermint.types.Validator.fromObject(d.validators[i]);
          }
        }
        if (d.proposer != null) {
          if (typeof d.proposer !== "object")
            throw TypeError(".tendermint.types.ValidatorSet.proposer: object expected");
          m.proposer = $root.tendermint.types.Validator.fromObject(d.proposer);
        }
        if (d.totalVotingPower != null) {
          if ($util.Long) (m.totalVotingPower = $util.Long.fromValue(d.totalVotingPower)).unsigned = false;
          else if (typeof d.totalVotingPower === "string")
            m.totalVotingPower = parseInt(d.totalVotingPower, 10);
          else if (typeof d.totalVotingPower === "number") m.totalVotingPower = d.totalVotingPower;
          else if (typeof d.totalVotingPower === "object")
            m.totalVotingPower = new $util.LongBits(
              d.totalVotingPower.low >>> 0,
              d.totalVotingPower.high >>> 0,
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
            d.totalVotingPower = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.totalVotingPower = o.longs === String ? "0" : 0;
        }
        if (m.validators && m.validators.length) {
          d.validators = [];
          for (var j = 0; j < m.validators.length; ++j) {
            d.validators[j] = $root.tendermint.types.Validator.toObject(m.validators[j], o);
          }
        }
        if (m.proposer != null && m.hasOwnProperty("proposer")) {
          d.proposer = $root.tendermint.types.Validator.toObject(m.proposer, o);
        }
        if (m.totalVotingPower != null && m.hasOwnProperty("totalVotingPower")) {
          if (typeof m.totalVotingPower === "number")
            d.totalVotingPower = o.longs === String ? String(m.totalVotingPower) : m.totalVotingPower;
          else
            d.totalVotingPower =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.totalVotingPower)
                : o.longs === Number
                ? new $util.LongBits(m.totalVotingPower.low >>> 0, m.totalVotingPower.high >>> 0).toNumber()
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
      Validator.prototype.votingPower = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Validator.prototype.proposerPriority = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Validator.create = function create(properties) {
        return new Validator(properties);
      };
      Validator.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.address != null && Object.hasOwnProperty.call(m, "address")) w.uint32(10).bytes(m.address);
        if (m.pubKey != null && Object.hasOwnProperty.call(m, "pubKey"))
          $root.tendermint.crypto.PublicKey.encode(m.pubKey, w.uint32(18).fork()).ldelim();
        if (m.votingPower != null && Object.hasOwnProperty.call(m, "votingPower"))
          w.uint32(24).int64(m.votingPower);
        if (m.proposerPriority != null && Object.hasOwnProperty.call(m, "proposerPriority"))
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
              m.pubKey = $root.tendermint.crypto.PublicKey.decode(r, r.uint32());
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
            $util.base64.decode(d.address, (m.address = $util.newBuffer($util.base64.length(d.address))), 0);
          else if (d.address.length) m.address = d.address;
        }
        if (d.pubKey != null) {
          if (typeof d.pubKey !== "object")
            throw TypeError(".tendermint.types.Validator.pubKey: object expected");
          m.pubKey = $root.tendermint.crypto.PublicKey.fromObject(d.pubKey);
        }
        if (d.votingPower != null) {
          if ($util.Long) (m.votingPower = $util.Long.fromValue(d.votingPower)).unsigned = false;
          else if (typeof d.votingPower === "string") m.votingPower = parseInt(d.votingPower, 10);
          else if (typeof d.votingPower === "number") m.votingPower = d.votingPower;
          else if (typeof d.votingPower === "object")
            m.votingPower = new $util.LongBits(d.votingPower.low >>> 0, d.votingPower.high >>> 0).toNumber();
        }
        if (d.proposerPriority != null) {
          if ($util.Long) (m.proposerPriority = $util.Long.fromValue(d.proposerPriority)).unsigned = false;
          else if (typeof d.proposerPriority === "string")
            m.proposerPriority = parseInt(d.proposerPriority, 10);
          else if (typeof d.proposerPriority === "number") m.proposerPriority = d.proposerPriority;
          else if (typeof d.proposerPriority === "object")
            m.proposerPriority = new $util.LongBits(
              d.proposerPriority.low >>> 0,
              d.proposerPriority.high >>> 0,
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
            d.votingPower = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.votingPower = o.longs === String ? "0" : 0;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.proposerPriority = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
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
            d.votingPower = o.longs === String ? String(m.votingPower) : m.votingPower;
          else
            d.votingPower =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.votingPower)
                : o.longs === Number
                ? new $util.LongBits(m.votingPower.low >>> 0, m.votingPower.high >>> 0).toNumber()
                : m.votingPower;
        }
        if (m.proposerPriority != null && m.hasOwnProperty("proposerPriority")) {
          if (typeof m.proposerPriority === "number")
            d.proposerPriority = o.longs === String ? String(m.proposerPriority) : m.proposerPriority;
          else
            d.proposerPriority =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.proposerPriority)
                : o.longs === Number
                ? new $util.LongBits(m.proposerPriority.low >>> 0, m.proposerPriority.high >>> 0).toNumber()
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
      SimpleValidator.prototype.votingPower = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      SimpleValidator.create = function create(properties) {
        return new SimpleValidator(properties);
      };
      SimpleValidator.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.pubKey != null && Object.hasOwnProperty.call(m, "pubKey"))
          $root.tendermint.crypto.PublicKey.encode(m.pubKey, w.uint32(10).fork()).ldelim();
        if (m.votingPower != null && Object.hasOwnProperty.call(m, "votingPower"))
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
              m.pubKey = $root.tendermint.crypto.PublicKey.decode(r, r.uint32());
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
            throw TypeError(".tendermint.types.SimpleValidator.pubKey: object expected");
          m.pubKey = $root.tendermint.crypto.PublicKey.fromObject(d.pubKey);
        }
        if (d.votingPower != null) {
          if ($util.Long) (m.votingPower = $util.Long.fromValue(d.votingPower)).unsigned = false;
          else if (typeof d.votingPower === "string") m.votingPower = parseInt(d.votingPower, 10);
          else if (typeof d.votingPower === "number") m.votingPower = d.votingPower;
          else if (typeof d.votingPower === "object")
            m.votingPower = new $util.LongBits(d.votingPower.low >>> 0, d.votingPower.high >>> 0).toNumber();
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
            d.votingPower = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.votingPower = o.longs === String ? "0" : 0;
        }
        if (m.pubKey != null && m.hasOwnProperty("pubKey")) {
          d.pubKey = $root.tendermint.crypto.PublicKey.toObject(m.pubKey, o);
        }
        if (m.votingPower != null && m.hasOwnProperty("votingPower")) {
          if (typeof m.votingPower === "number")
            d.votingPower = o.longs === String ? String(m.votingPower) : m.votingPower;
          else
            d.votingPower =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.votingPower)
                : o.longs === Number
                ? new $util.LongBits(m.votingPower.low >>> 0, m.votingPower.high >>> 0).toNumber()
                : m.votingPower;
        }
        return d;
      };
      SimpleValidator.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };
      return SimpleValidator;
    })();
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
        if (m.total != null && Object.hasOwnProperty.call(m, "total")) w.uint32(8).uint32(m.total);
        if (m.hash != null && Object.hasOwnProperty.call(m, "hash")) w.uint32(18).bytes(m.hash);
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
            $util.base64.decode(d.hash, (m.hash = $util.newBuffer($util.base64.length(d.hash))), 0);
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
        if (m.index != null && Object.hasOwnProperty.call(m, "index")) w.uint32(8).uint32(m.index);
        if (m.bytes != null && Object.hasOwnProperty.call(m, "bytes")) w.uint32(18).bytes(m.bytes);
        if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
          $root.tendermint.crypto.Proof.encode(m.proof, w.uint32(26).fork()).ldelim();
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
            $util.base64.decode(d.bytes, (m.bytes = $util.newBuffer($util.base64.length(d.bytes))), 0);
          else if (d.bytes.length) m.bytes = d.bytes;
        }
        if (d.proof != null) {
          if (typeof d.proof !== "object") throw TypeError(".tendermint.types.Part.proof: object expected");
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
        if (m.hash != null && Object.hasOwnProperty.call(m, "hash")) w.uint32(10).bytes(m.hash);
        if (m.partSetHeader != null && Object.hasOwnProperty.call(m, "partSetHeader"))
          $root.tendermint.types.PartSetHeader.encode(m.partSetHeader, w.uint32(18).fork()).ldelim();
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
              m.partSetHeader = $root.tendermint.types.PartSetHeader.decode(r, r.uint32());
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
            $util.base64.decode(d.hash, (m.hash = $util.newBuffer($util.base64.length(d.hash))), 0);
          else if (d.hash.length) m.hash = d.hash;
        }
        if (d.partSetHeader != null) {
          if (typeof d.partSetHeader !== "object")
            throw TypeError(".tendermint.types.BlockID.partSetHeader: object expected");
          m.partSetHeader = $root.tendermint.types.PartSetHeader.fromObject(d.partSetHeader);
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
          d.partSetHeader = $root.tendermint.types.PartSetHeader.toObject(m.partSetHeader, o);
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
      Header.prototype.height = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
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
          $root.tendermint.version.Consensus.encode(m.version, w.uint32(10).fork()).ldelim();
        if (m.chainId != null && Object.hasOwnProperty.call(m, "chainId")) w.uint32(18).string(m.chainId);
        if (m.height != null && Object.hasOwnProperty.call(m, "height")) w.uint32(24).int64(m.height);
        if (m.time != null && Object.hasOwnProperty.call(m, "time"))
          $root.google.protobuf.Timestamp.encode(m.time, w.uint32(34).fork()).ldelim();
        if (m.lastBlockId != null && Object.hasOwnProperty.call(m, "lastBlockId"))
          $root.tendermint.types.BlockID.encode(m.lastBlockId, w.uint32(42).fork()).ldelim();
        if (m.lastCommitHash != null && Object.hasOwnProperty.call(m, "lastCommitHash"))
          w.uint32(50).bytes(m.lastCommitHash);
        if (m.dataHash != null && Object.hasOwnProperty.call(m, "dataHash")) w.uint32(58).bytes(m.dataHash);
        if (m.validatorsHash != null && Object.hasOwnProperty.call(m, "validatorsHash"))
          w.uint32(66).bytes(m.validatorsHash);
        if (m.nextValidatorsHash != null && Object.hasOwnProperty.call(m, "nextValidatorsHash"))
          w.uint32(74).bytes(m.nextValidatorsHash);
        if (m.consensusHash != null && Object.hasOwnProperty.call(m, "consensusHash"))
          w.uint32(82).bytes(m.consensusHash);
        if (m.appHash != null && Object.hasOwnProperty.call(m, "appHash")) w.uint32(90).bytes(m.appHash);
        if (m.lastResultsHash != null && Object.hasOwnProperty.call(m, "lastResultsHash"))
          w.uint32(98).bytes(m.lastResultsHash);
        if (m.evidenceHash != null && Object.hasOwnProperty.call(m, "evidenceHash"))
          w.uint32(106).bytes(m.evidenceHash);
        if (m.proposerAddress != null && Object.hasOwnProperty.call(m, "proposerAddress"))
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
              m.version = $root.tendermint.version.Consensus.decode(r, r.uint32());
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
              m.lastBlockId = $root.tendermint.types.BlockID.decode(r, r.uint32());
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
            throw TypeError(".tendermint.types.Header.version: object expected");
          m.version = $root.tendermint.version.Consensus.fromObject(d.version);
        }
        if (d.chainId != null) {
          m.chainId = String(d.chainId);
        }
        if (d.height != null) {
          if ($util.Long) (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string") m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(d.height.low >>> 0, d.height.high >>> 0).toNumber();
        }
        if (d.time != null) {
          if (typeof d.time !== "object") throw TypeError(".tendermint.types.Header.time: object expected");
          m.time = $root.google.protobuf.Timestamp.fromObject(d.time);
        }
        if (d.lastBlockId != null) {
          if (typeof d.lastBlockId !== "object")
            throw TypeError(".tendermint.types.Header.lastBlockId: object expected");
          m.lastBlockId = $root.tendermint.types.BlockID.fromObject(d.lastBlockId);
        }
        if (d.lastCommitHash != null) {
          if (typeof d.lastCommitHash === "string")
            $util.base64.decode(
              d.lastCommitHash,
              (m.lastCommitHash = $util.newBuffer($util.base64.length(d.lastCommitHash))),
              0,
            );
          else if (d.lastCommitHash.length) m.lastCommitHash = d.lastCommitHash;
        }
        if (d.dataHash != null) {
          if (typeof d.dataHash === "string")
            $util.base64.decode(
              d.dataHash,
              (m.dataHash = $util.newBuffer($util.base64.length(d.dataHash))),
              0,
            );
          else if (d.dataHash.length) m.dataHash = d.dataHash;
        }
        if (d.validatorsHash != null) {
          if (typeof d.validatorsHash === "string")
            $util.base64.decode(
              d.validatorsHash,
              (m.validatorsHash = $util.newBuffer($util.base64.length(d.validatorsHash))),
              0,
            );
          else if (d.validatorsHash.length) m.validatorsHash = d.validatorsHash;
        }
        if (d.nextValidatorsHash != null) {
          if (typeof d.nextValidatorsHash === "string")
            $util.base64.decode(
              d.nextValidatorsHash,
              (m.nextValidatorsHash = $util.newBuffer($util.base64.length(d.nextValidatorsHash))),
              0,
            );
          else if (d.nextValidatorsHash.length) m.nextValidatorsHash = d.nextValidatorsHash;
        }
        if (d.consensusHash != null) {
          if (typeof d.consensusHash === "string")
            $util.base64.decode(
              d.consensusHash,
              (m.consensusHash = $util.newBuffer($util.base64.length(d.consensusHash))),
              0,
            );
          else if (d.consensusHash.length) m.consensusHash = d.consensusHash;
        }
        if (d.appHash != null) {
          if (typeof d.appHash === "string")
            $util.base64.decode(d.appHash, (m.appHash = $util.newBuffer($util.base64.length(d.appHash))), 0);
          else if (d.appHash.length) m.appHash = d.appHash;
        }
        if (d.lastResultsHash != null) {
          if (typeof d.lastResultsHash === "string")
            $util.base64.decode(
              d.lastResultsHash,
              (m.lastResultsHash = $util.newBuffer($util.base64.length(d.lastResultsHash))),
              0,
            );
          else if (d.lastResultsHash.length) m.lastResultsHash = d.lastResultsHash;
        }
        if (d.evidenceHash != null) {
          if (typeof d.evidenceHash === "string")
            $util.base64.decode(
              d.evidenceHash,
              (m.evidenceHash = $util.newBuffer($util.base64.length(d.evidenceHash))),
              0,
            );
          else if (d.evidenceHash.length) m.evidenceHash = d.evidenceHash;
        }
        if (d.proposerAddress != null) {
          if (typeof d.proposerAddress === "string")
            $util.base64.decode(
              d.proposerAddress,
              (m.proposerAddress = $util.newBuffer($util.base64.length(d.proposerAddress))),
              0,
            );
          else if (d.proposerAddress.length) m.proposerAddress = d.proposerAddress;
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
            d.height = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.time = null;
          d.lastBlockId = null;
          if (o.bytes === String) d.lastCommitHash = "";
          else {
            d.lastCommitHash = [];
            if (o.bytes !== Array) d.lastCommitHash = $util.newBuffer(d.lastCommitHash);
          }
          if (o.bytes === String) d.dataHash = "";
          else {
            d.dataHash = [];
            if (o.bytes !== Array) d.dataHash = $util.newBuffer(d.dataHash);
          }
          if (o.bytes === String) d.validatorsHash = "";
          else {
            d.validatorsHash = [];
            if (o.bytes !== Array) d.validatorsHash = $util.newBuffer(d.validatorsHash);
          }
          if (o.bytes === String) d.nextValidatorsHash = "";
          else {
            d.nextValidatorsHash = [];
            if (o.bytes !== Array) d.nextValidatorsHash = $util.newBuffer(d.nextValidatorsHash);
          }
          if (o.bytes === String) d.consensusHash = "";
          else {
            d.consensusHash = [];
            if (o.bytes !== Array) d.consensusHash = $util.newBuffer(d.consensusHash);
          }
          if (o.bytes === String) d.appHash = "";
          else {
            d.appHash = [];
            if (o.bytes !== Array) d.appHash = $util.newBuffer(d.appHash);
          }
          if (o.bytes === String) d.lastResultsHash = "";
          else {
            d.lastResultsHash = [];
            if (o.bytes !== Array) d.lastResultsHash = $util.newBuffer(d.lastResultsHash);
          }
          if (o.bytes === String) d.evidenceHash = "";
          else {
            d.evidenceHash = [];
            if (o.bytes !== Array) d.evidenceHash = $util.newBuffer(d.evidenceHash);
          }
          if (o.bytes === String) d.proposerAddress = "";
          else {
            d.proposerAddress = [];
            if (o.bytes !== Array) d.proposerAddress = $util.newBuffer(d.proposerAddress);
          }
        }
        if (m.version != null && m.hasOwnProperty("version")) {
          d.version = $root.tendermint.version.Consensus.toObject(m.version, o);
        }
        if (m.chainId != null && m.hasOwnProperty("chainId")) {
          d.chainId = m.chainId;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number") d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(m.height.low >>> 0, m.height.high >>> 0).toNumber()
                : m.height;
        }
        if (m.time != null && m.hasOwnProperty("time")) {
          d.time = $root.google.protobuf.Timestamp.toObject(m.time, o);
        }
        if (m.lastBlockId != null && m.hasOwnProperty("lastBlockId")) {
          d.lastBlockId = $root.tendermint.types.BlockID.toObject(m.lastBlockId, o);
        }
        if (m.lastCommitHash != null && m.hasOwnProperty("lastCommitHash")) {
          d.lastCommitHash =
            o.bytes === String
              ? $util.base64.encode(m.lastCommitHash, 0, m.lastCommitHash.length)
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
              ? $util.base64.encode(m.validatorsHash, 0, m.validatorsHash.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.validatorsHash)
              : m.validatorsHash;
        }
        if (m.nextValidatorsHash != null && m.hasOwnProperty("nextValidatorsHash")) {
          d.nextValidatorsHash =
            o.bytes === String
              ? $util.base64.encode(m.nextValidatorsHash, 0, m.nextValidatorsHash.length)
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
              ? $util.base64.encode(m.lastResultsHash, 0, m.lastResultsHash.length)
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
              ? $util.base64.encode(m.proposerAddress, 0, m.proposerAddress.length)
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
          if (!Array.isArray(d.txs)) throw TypeError(".tendermint.types.Data.txs: array expected");
          m.txs = [];
          for (var i = 0; i < d.txs.length; ++i) {
            if (typeof d.txs[i] === "string")
              $util.base64.decode(d.txs[i], (m.txs[i] = $util.newBuffer($util.base64.length(d.txs[i]))), 0);
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
        if (m.type != null && Object.hasOwnProperty.call(m, "type")) w.uint32(8).int32(m.type);
        if (m.height != null && Object.hasOwnProperty.call(m, "height")) w.uint32(16).int64(m.height);
        if (m.round != null && Object.hasOwnProperty.call(m, "round")) w.uint32(24).int32(m.round);
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(m.blockId, w.uint32(34).fork()).ldelim();
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(m.timestamp, w.uint32(42).fork()).ldelim();
        if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
          w.uint32(50).bytes(m.validatorAddress);
        if (m.validatorIndex != null && Object.hasOwnProperty.call(m, "validatorIndex"))
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
              m.timestamp = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
          if ($util.Long) (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string") m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(d.height.low >>> 0, d.height.high >>> 0).toNumber();
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
            throw TypeError(".tendermint.types.Vote.timestamp: object expected");
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        if (d.validatorAddress != null) {
          if (typeof d.validatorAddress === "string")
            $util.base64.decode(
              d.validatorAddress,
              (m.validatorAddress = $util.newBuffer($util.base64.length(d.validatorAddress))),
              0,
            );
          else if (d.validatorAddress.length) m.validatorAddress = d.validatorAddress;
        }
        if (d.validatorIndex != null) {
          m.validatorIndex = d.validatorIndex | 0;
        }
        if (d.signature != null) {
          if (typeof d.signature === "string")
            $util.base64.decode(
              d.signature,
              (m.signature = $util.newBuffer($util.base64.length(d.signature))),
              0,
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
            d.height = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.round = 0;
          d.blockId = null;
          d.timestamp = null;
          if (o.bytes === String) d.validatorAddress = "";
          else {
            d.validatorAddress = [];
            if (o.bytes !== Array) d.validatorAddress = $util.newBuffer(d.validatorAddress);
          }
          d.validatorIndex = 0;
          if (o.bytes === String) d.signature = "";
          else {
            d.signature = [];
            if (o.bytes !== Array) d.signature = $util.newBuffer(d.signature);
          }
        }
        if (m.type != null && m.hasOwnProperty("type")) {
          d.type = o.enums === String ? $root.tendermint.types.SignedMsgType[m.type] : m.type;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number") d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(m.height.low >>> 0, m.height.high >>> 0).toNumber()
                : m.height;
        }
        if (m.round != null && m.hasOwnProperty("round")) {
          d.round = m.round;
        }
        if (m.blockId != null && m.hasOwnProperty("blockId")) {
          d.blockId = $root.tendermint.types.BlockID.toObject(m.blockId, o);
        }
        if (m.timestamp != null && m.hasOwnProperty("timestamp")) {
          d.timestamp = $root.google.protobuf.Timestamp.toObject(m.timestamp, o);
        }
        if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
          d.validatorAddress =
            o.bytes === String
              ? $util.base64.encode(m.validatorAddress, 0, m.validatorAddress.length)
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
      Commit.prototype.height = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      Commit.prototype.round = 0;
      Commit.prototype.blockId = null;
      Commit.prototype.signatures = $util.emptyArray;
      Commit.create = function create(properties) {
        return new Commit(properties);
      };
      Commit.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.height != null && Object.hasOwnProperty.call(m, "height")) w.uint32(8).int64(m.height);
        if (m.round != null && Object.hasOwnProperty.call(m, "round")) w.uint32(16).int32(m.round);
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(m.blockId, w.uint32(26).fork()).ldelim();
        if (m.signatures != null && m.signatures.length) {
          for (var i = 0; i < m.signatures.length; ++i)
            $root.tendermint.types.CommitSig.encode(m.signatures[i], w.uint32(34).fork()).ldelim();
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
              m.signatures.push($root.tendermint.types.CommitSig.decode(r, r.uint32()));
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
          if ($util.Long) (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string") m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(d.height.low >>> 0, d.height.high >>> 0).toNumber();
        }
        if (d.round != null) {
          m.round = d.round | 0;
        }
        if (d.blockId != null) {
          if (typeof d.blockId !== "object")
            throw TypeError(".tendermint.types.Commit.blockId: object expected");
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.signatures) {
          if (!Array.isArray(d.signatures))
            throw TypeError(".tendermint.types.Commit.signatures: array expected");
          m.signatures = [];
          for (var i = 0; i < d.signatures.length; ++i) {
            if (typeof d.signatures[i] !== "object")
              throw TypeError(".tendermint.types.Commit.signatures: object expected");
            m.signatures[i] = $root.tendermint.types.CommitSig.fromObject(d.signatures[i]);
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
            d.height = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.height = o.longs === String ? "0" : 0;
          d.round = 0;
          d.blockId = null;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number") d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(m.height.low >>> 0, m.height.high >>> 0).toNumber()
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
            d.signatures[j] = $root.tendermint.types.CommitSig.toObject(m.signatures[j], o);
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
        if (m.blockIdFlag != null && Object.hasOwnProperty.call(m, "blockIdFlag"))
          w.uint32(8).int32(m.blockIdFlag);
        if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
          w.uint32(18).bytes(m.validatorAddress);
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(m.timestamp, w.uint32(26).fork()).ldelim();
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
              m.timestamp = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
              (m.validatorAddress = $util.newBuffer($util.base64.length(d.validatorAddress))),
              0,
            );
          else if (d.validatorAddress.length) m.validatorAddress = d.validatorAddress;
        }
        if (d.timestamp != null) {
          if (typeof d.timestamp !== "object")
            throw TypeError(".tendermint.types.CommitSig.timestamp: object expected");
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        if (d.signature != null) {
          if (typeof d.signature === "string")
            $util.base64.decode(
              d.signature,
              (m.signature = $util.newBuffer($util.base64.length(d.signature))),
              0,
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
            if (o.bytes !== Array) d.validatorAddress = $util.newBuffer(d.validatorAddress);
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
            o.enums === String ? $root.tendermint.types.BlockIDFlag[m.blockIdFlag] : m.blockIdFlag;
        }
        if (m.validatorAddress != null && m.hasOwnProperty("validatorAddress")) {
          d.validatorAddress =
            o.bytes === String
              ? $util.base64.encode(m.validatorAddress, 0, m.validatorAddress.length)
              : o.bytes === Array
              ? Array.prototype.slice.call(m.validatorAddress)
              : m.validatorAddress;
        }
        if (m.timestamp != null && m.hasOwnProperty("timestamp")) {
          d.timestamp = $root.google.protobuf.Timestamp.toObject(m.timestamp, o);
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
      Proposal.prototype.height = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
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
        if (m.type != null && Object.hasOwnProperty.call(m, "type")) w.uint32(8).int32(m.type);
        if (m.height != null && Object.hasOwnProperty.call(m, "height")) w.uint32(16).int64(m.height);
        if (m.round != null && Object.hasOwnProperty.call(m, "round")) w.uint32(24).int32(m.round);
        if (m.polRound != null && Object.hasOwnProperty.call(m, "polRound")) w.uint32(32).int32(m.polRound);
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(m.blockId, w.uint32(42).fork()).ldelim();
        if (m.timestamp != null && Object.hasOwnProperty.call(m, "timestamp"))
          $root.google.protobuf.Timestamp.encode(m.timestamp, w.uint32(50).fork()).ldelim();
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
              m.timestamp = $root.google.protobuf.Timestamp.decode(r, r.uint32());
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
          if ($util.Long) (m.height = $util.Long.fromValue(d.height)).unsigned = false;
          else if (typeof d.height === "string") m.height = parseInt(d.height, 10);
          else if (typeof d.height === "number") m.height = d.height;
          else if (typeof d.height === "object")
            m.height = new $util.LongBits(d.height.low >>> 0, d.height.high >>> 0).toNumber();
        }
        if (d.round != null) {
          m.round = d.round | 0;
        }
        if (d.polRound != null) {
          m.polRound = d.polRound | 0;
        }
        if (d.blockId != null) {
          if (typeof d.blockId !== "object")
            throw TypeError(".tendermint.types.Proposal.blockId: object expected");
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.timestamp != null) {
          if (typeof d.timestamp !== "object")
            throw TypeError(".tendermint.types.Proposal.timestamp: object expected");
          m.timestamp = $root.google.protobuf.Timestamp.fromObject(d.timestamp);
        }
        if (d.signature != null) {
          if (typeof d.signature === "string")
            $util.base64.decode(
              d.signature,
              (m.signature = $util.newBuffer($util.base64.length(d.signature))),
              0,
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
            d.height = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
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
          d.type = o.enums === String ? $root.tendermint.types.SignedMsgType[m.type] : m.type;
        }
        if (m.height != null && m.hasOwnProperty("height")) {
          if (typeof m.height === "number") d.height = o.longs === String ? String(m.height) : m.height;
          else
            d.height =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.height)
                : o.longs === Number
                ? new $util.LongBits(m.height.low >>> 0, m.height.high >>> 0).toNumber()
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
          d.timestamp = $root.google.protobuf.Timestamp.toObject(m.timestamp, o);
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
          $root.tendermint.types.Header.encode(m.header, w.uint32(10).fork()).ldelim();
        if (m.commit != null && Object.hasOwnProperty.call(m, "commit"))
          $root.tendermint.types.Commit.encode(m.commit, w.uint32(18).fork()).ldelim();
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
            throw TypeError(".tendermint.types.SignedHeader.header: object expected");
          m.header = $root.tendermint.types.Header.fromObject(d.header);
        }
        if (d.commit != null) {
          if (typeof d.commit !== "object")
            throw TypeError(".tendermint.types.SignedHeader.commit: object expected");
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
        if (m.signedHeader != null && Object.hasOwnProperty.call(m, "signedHeader"))
          $root.tendermint.types.SignedHeader.encode(m.signedHeader, w.uint32(10).fork()).ldelim();
        if (m.validatorSet != null && Object.hasOwnProperty.call(m, "validatorSet"))
          $root.tendermint.types.ValidatorSet.encode(m.validatorSet, w.uint32(18).fork()).ldelim();
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
              m.signedHeader = $root.tendermint.types.SignedHeader.decode(r, r.uint32());
              break;
            case 2:
              m.validatorSet = $root.tendermint.types.ValidatorSet.decode(r, r.uint32());
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
            throw TypeError(".tendermint.types.LightBlock.signedHeader: object expected");
          m.signedHeader = $root.tendermint.types.SignedHeader.fromObject(d.signedHeader);
        }
        if (d.validatorSet != null) {
          if (typeof d.validatorSet !== "object")
            throw TypeError(".tendermint.types.LightBlock.validatorSet: object expected");
          m.validatorSet = $root.tendermint.types.ValidatorSet.fromObject(d.validatorSet);
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
          d.signedHeader = $root.tendermint.types.SignedHeader.toObject(m.signedHeader, o);
        }
        if (m.validatorSet != null && m.hasOwnProperty("validatorSet")) {
          d.validatorSet = $root.tendermint.types.ValidatorSet.toObject(m.validatorSet, o);
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
      BlockMeta.prototype.blockSize = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      BlockMeta.prototype.header = null;
      BlockMeta.prototype.numTxs = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
      BlockMeta.create = function create(properties) {
        return new BlockMeta(properties);
      };
      BlockMeta.encode = function encode(m, w) {
        if (!w) w = $Writer.create();
        if (m.blockId != null && Object.hasOwnProperty.call(m, "blockId"))
          $root.tendermint.types.BlockID.encode(m.blockId, w.uint32(10).fork()).ldelim();
        if (m.blockSize != null && Object.hasOwnProperty.call(m, "blockSize"))
          w.uint32(16).int64(m.blockSize);
        if (m.header != null && Object.hasOwnProperty.call(m, "header"))
          $root.tendermint.types.Header.encode(m.header, w.uint32(26).fork()).ldelim();
        if (m.numTxs != null && Object.hasOwnProperty.call(m, "numTxs")) w.uint32(32).int64(m.numTxs);
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
            throw TypeError(".tendermint.types.BlockMeta.blockId: object expected");
          m.blockId = $root.tendermint.types.BlockID.fromObject(d.blockId);
        }
        if (d.blockSize != null) {
          if ($util.Long) (m.blockSize = $util.Long.fromValue(d.blockSize)).unsigned = false;
          else if (typeof d.blockSize === "string") m.blockSize = parseInt(d.blockSize, 10);
          else if (typeof d.blockSize === "number") m.blockSize = d.blockSize;
          else if (typeof d.blockSize === "object")
            m.blockSize = new $util.LongBits(d.blockSize.low >>> 0, d.blockSize.high >>> 0).toNumber();
        }
        if (d.header != null) {
          if (typeof d.header !== "object")
            throw TypeError(".tendermint.types.BlockMeta.header: object expected");
          m.header = $root.tendermint.types.Header.fromObject(d.header);
        }
        if (d.numTxs != null) {
          if ($util.Long) (m.numTxs = $util.Long.fromValue(d.numTxs)).unsigned = false;
          else if (typeof d.numTxs === "string") m.numTxs = parseInt(d.numTxs, 10);
          else if (typeof d.numTxs === "number") m.numTxs = d.numTxs;
          else if (typeof d.numTxs === "object")
            m.numTxs = new $util.LongBits(d.numTxs.low >>> 0, d.numTxs.high >>> 0).toNumber();
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
            d.blockSize = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.blockSize = o.longs === String ? "0" : 0;
          d.header = null;
          if ($util.Long) {
            var n = new $util.Long(0, 0, false);
            d.numTxs = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
          } else d.numTxs = o.longs === String ? "0" : 0;
        }
        if (m.blockId != null && m.hasOwnProperty("blockId")) {
          d.blockId = $root.tendermint.types.BlockID.toObject(m.blockId, o);
        }
        if (m.blockSize != null && m.hasOwnProperty("blockSize")) {
          if (typeof m.blockSize === "number")
            d.blockSize = o.longs === String ? String(m.blockSize) : m.blockSize;
          else
            d.blockSize =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.blockSize)
                : o.longs === Number
                ? new $util.LongBits(m.blockSize.low >>> 0, m.blockSize.high >>> 0).toNumber()
                : m.blockSize;
        }
        if (m.header != null && m.hasOwnProperty("header")) {
          d.header = $root.tendermint.types.Header.toObject(m.header, o);
        }
        if (m.numTxs != null && m.hasOwnProperty("numTxs")) {
          if (typeof m.numTxs === "number") d.numTxs = o.longs === String ? String(m.numTxs) : m.numTxs;
          else
            d.numTxs =
              o.longs === String
                ? $util.Long.prototype.toString.call(m.numTxs)
                : o.longs === Number
                ? new $util.LongBits(m.numTxs.low >>> 0, m.numTxs.high >>> 0).toNumber()
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
        if (m.rootHash != null && Object.hasOwnProperty.call(m, "rootHash")) w.uint32(10).bytes(m.rootHash);
        if (m.data != null && Object.hasOwnProperty.call(m, "data")) w.uint32(18).bytes(m.data);
        if (m.proof != null && Object.hasOwnProperty.call(m, "proof"))
          $root.tendermint.crypto.Proof.encode(m.proof, w.uint32(26).fork()).ldelim();
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
              0,
            );
          else if (d.rootHash.length) m.rootHash = d.rootHash;
        }
        if (d.data != null) {
          if (typeof d.data === "string")
            $util.base64.decode(d.data, (m.data = $util.newBuffer($util.base64.length(d.data))), 0);
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
    return types;
  })();
  return tendermint;
})();
module.exports = $root;

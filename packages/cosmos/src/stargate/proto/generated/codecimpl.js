"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tendermint = exports.ibc = exports.google = exports.cosmos = void 0;
var $protobuf = require("protobufjs/minimal");
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Params.prototype.sendEnabled = $util.emptyArray;
                Params.prototype.defaultSendEnabled = false;
                Params.create = function create(properties) {
                    return new Params(properties);
                };
                Params.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.sendEnabled != null && m.sendEnabled.length) {
                        for (var i = 0; i < m.sendEnabled.length; ++i)
                            $root.cosmos.bank.v1beta1.SendEnabled.encode(m.sendEnabled[i], w.uint32(10).fork()).ldelim();
                    }
                    if (m.defaultSendEnabled != null && Object.hasOwnProperty.call(m, "defaultSendEnabled"))
                        w.uint32(16).bool(m.defaultSendEnabled);
                    return w;
                };
                Params.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.Params();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                if (!(m.sendEnabled && m.sendEnabled.length))
                                    m.sendEnabled = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.Params)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                SendEnabled.prototype.denom = "";
                SendEnabled.prototype.enabled = false;
                SendEnabled.create = function create(properties) {
                    return new SendEnabled(properties);
                };
                SendEnabled.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
                        w.uint32(10).string(m.denom);
                    if (m.enabled != null && Object.hasOwnProperty.call(m, "enabled"))
                        w.uint32(16).bool(m.enabled);
                    return w;
                };
                SendEnabled.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.SendEnabled();
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
                    if (d instanceof $root.cosmos.bank.v1beta1.SendEnabled)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Input.prototype.address = "";
                Input.prototype.coins = $util.emptyArray;
                Input.create = function create(properties) {
                    return new Input(properties);
                };
                Input.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.address != null && Object.hasOwnProperty.call(m, "address"))
                        w.uint32(10).string(m.address);
                    if (m.coins != null && m.coins.length) {
                        for (var i = 0; i < m.coins.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(18).fork()).ldelim();
                    }
                    return w;
                };
                Input.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.Input();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.address = r.string();
                                break;
                            case 2:
                                if (!(m.coins && m.coins.length))
                                    m.coins = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.Input)
                        return d;
                    var m = new $root.cosmos.bank.v1beta1.Input();
                    if (d.address != null) {
                        m.address = String(d.address);
                    }
                    if (d.coins) {
                        if (!Array.isArray(d.coins))
                            throw TypeError(".cosmos.bank.v1beta1.Input.coins: array expected");
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Output.prototype.address = "";
                Output.prototype.coins = $util.emptyArray;
                Output.create = function create(properties) {
                    return new Output(properties);
                };
                Output.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.address != null && Object.hasOwnProperty.call(m, "address"))
                        w.uint32(10).string(m.address);
                    if (m.coins != null && m.coins.length) {
                        for (var i = 0; i < m.coins.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.coins[i], w.uint32(18).fork()).ldelim();
                    }
                    return w;
                };
                Output.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.Output();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.address = r.string();
                                break;
                            case 2:
                                if (!(m.coins && m.coins.length))
                                    m.coins = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.Output)
                        return d;
                    var m = new $root.cosmos.bank.v1beta1.Output();
                    if (d.address != null) {
                        m.address = String(d.address);
                    }
                    if (d.coins) {
                        if (!Array.isArray(d.coins))
                            throw TypeError(".cosmos.bank.v1beta1.Output.coins: array expected");
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Supply.prototype.total = $util.emptyArray;
                Supply.create = function create(properties) {
                    return new Supply(properties);
                };
                Supply.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.total != null && m.total.length) {
                        for (var i = 0; i < m.total.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.total[i], w.uint32(10).fork()).ldelim();
                    }
                    return w;
                };
                Supply.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.Supply();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                if (!(m.total && m.total.length))
                                    m.total = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.Supply)
                        return d;
                    var m = new $root.cosmos.bank.v1beta1.Supply();
                    if (d.total) {
                        if (!Array.isArray(d.total))
                            throw TypeError(".cosmos.bank.v1beta1.Supply.total: array expected");
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                DenomUnit.prototype.denom = "";
                DenomUnit.prototype.exponent = 0;
                DenomUnit.prototype.aliases = $util.emptyArray;
                DenomUnit.create = function create(properties) {
                    return new DenomUnit(properties);
                };
                DenomUnit.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
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
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.DenomUnit();
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
                                if (!(m.aliases && m.aliases.length))
                                    m.aliases = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.DenomUnit)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Metadata.prototype.description = "";
                Metadata.prototype.denomUnits = $util.emptyArray;
                Metadata.prototype.base = "";
                Metadata.prototype.display = "";
                Metadata.prototype.name = "";
                Metadata.prototype.symbol = "";
                Metadata.create = function create(properties) {
                    return new Metadata(properties);
                };
                Metadata.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.description != null && Object.hasOwnProperty.call(m, "description"))
                        w.uint32(10).string(m.description);
                    if (m.denomUnits != null && m.denomUnits.length) {
                        for (var i = 0; i < m.denomUnits.length; ++i)
                            $root.cosmos.bank.v1beta1.DenomUnit.encode(m.denomUnits[i], w.uint32(18).fork()).ldelim();
                    }
                    if (m.base != null && Object.hasOwnProperty.call(m, "base"))
                        w.uint32(26).string(m.base);
                    if (m.display != null && Object.hasOwnProperty.call(m, "display"))
                        w.uint32(34).string(m.display);
                    if (m.name != null && Object.hasOwnProperty.call(m, "name"))
                        w.uint32(42).string(m.name);
                    if (m.symbol != null && Object.hasOwnProperty.call(m, "symbol"))
                        w.uint32(50).string(m.symbol);
                    return w;
                };
                Metadata.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.Metadata();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.description = r.string();
                                break;
                            case 2:
                                if (!(m.denomUnits && m.denomUnits.length))
                                    m.denomUnits = [];
                                m.denomUnits.push($root.cosmos.bank.v1beta1.DenomUnit.decode(r, r.uint32()));
                                break;
                            case 3:
                                m.base = r.string();
                                break;
                            case 4:
                                m.display = r.string();
                                break;
                            case 5:
                                m.name = r.string();
                                break;
                            case 6:
                                m.symbol = r.string();
                                break;
                            default:
                                r.skipType(t & 7);
                                break;
                        }
                    }
                    return m;
                };
                Metadata.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.bank.v1beta1.Metadata)
                        return d;
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
                    if (d.name != null) {
                        m.name = String(d.name);
                    }
                    if (d.symbol != null) {
                        m.symbol = String(d.symbol);
                    }
                    return m;
                };
                Metadata.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.arrays || o.defaults) {
                        d.denomUnits = [];
                    }
                    if (o.defaults) {
                        d.description = "";
                        d.base = "";
                        d.display = "";
                        d.name = "";
                        d.symbol = "";
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
                    if (m.name != null && m.hasOwnProperty("name")) {
                        d.name = m.name;
                    }
                    if (m.symbol != null && m.hasOwnProperty("symbol")) {
                        d.symbol = m.symbol;
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
                Object.defineProperty(Msg.prototype.send = function send(request, callback) {
                    return this.rpcCall(send, $root.cosmos.bank.v1beta1.MsgSend, $root.cosmos.bank.v1beta1.MsgSendResponse, request, callback);
                }, "name", { value: "Send" });
                Object.defineProperty(Msg.prototype.multiSend = function multiSend(request, callback) {
                    return this.rpcCall(multiSend, $root.cosmos.bank.v1beta1.MsgMultiSend, $root.cosmos.bank.v1beta1.MsgMultiSendResponse, request, callback);
                }, "name", { value: "MultiSend" });
                return Msg;
            })();
            v1beta1.MsgSend = (function () {
                function MsgSend(p) {
                    this.amount = [];
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgSend.prototype.fromAddress = "";
                MsgSend.prototype.toAddress = "";
                MsgSend.prototype.amount = $util.emptyArray;
                MsgSend.create = function create(properties) {
                    return new MsgSend(properties);
                };
                MsgSend.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
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
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.MsgSend();
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
                                if (!(m.amount && m.amount.length))
                                    m.amount = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.MsgSend)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgSendResponse.create = function create(properties) {
                    return new MsgSendResponse(properties);
                };
                MsgSendResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };
                MsgSendResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.MsgSendResponse();
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
                    if (d instanceof $root.cosmos.bank.v1beta1.MsgSendResponse)
                        return d;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgMultiSend.prototype.inputs = $util.emptyArray;
                MsgMultiSend.prototype.outputs = $util.emptyArray;
                MsgMultiSend.create = function create(properties) {
                    return new MsgMultiSend(properties);
                };
                MsgMultiSend.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
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
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.MsgMultiSend();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                if (!(m.inputs && m.inputs.length))
                                    m.inputs = [];
                                m.inputs.push($root.cosmos.bank.v1beta1.Input.decode(r, r.uint32()));
                                break;
                            case 2:
                                if (!(m.outputs && m.outputs.length))
                                    m.outputs = [];
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
                    if (d instanceof $root.cosmos.bank.v1beta1.MsgMultiSend)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgMultiSendResponse.create = function create(properties) {
                    return new MsgMultiSendResponse(properties);
                };
                MsgMultiSendResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };
                MsgMultiSendResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.bank.v1beta1.MsgMultiSendResponse();
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
    cosmos.staking = (function () {
        const staking = {};
        staking.v1beta1 = (function () {
            const v1beta1 = {};
            v1beta1.Msg = (function () {
                function Msg(rpcImpl, requestDelimited, responseDelimited) {
                    $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
                }
                (Msg.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Msg;
                Msg.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                    return new this(rpcImpl, requestDelimited, responseDelimited);
                };
                Object.defineProperty(Msg.prototype.delegate = function delegate(request, callback) {
                    return this.rpcCall(delegate, $root.cosmos.staking.v1beta1.MsgDelegate, $root.cosmos.staking.v1beta1.MsgDelegateResponse, request, callback);
                }, "name", { value: "Delegate" });
                Object.defineProperty(Msg.prototype.beginRedelegate = function beginRedelegate(request, callback) {
                    return this.rpcCall(beginRedelegate, $root.cosmos.staking.v1beta1.MsgBeginRedelegate, $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse, request, callback);
                }, "name", { value: "BeginRedelegate" });
                Object.defineProperty(Msg.prototype.undelegate = function undelegate(request, callback) {
                    return this.rpcCall(undelegate, $root.cosmos.staking.v1beta1.MsgUndelegate, $root.cosmos.staking.v1beta1.MsgUndelegateResponse, request, callback);
                }, "name", { value: "Undelegate" });
                return Msg;
            })();
            v1beta1.MsgDelegate = (function () {
                function MsgDelegate(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgDelegate.prototype.delegatorAddress = "";
                MsgDelegate.prototype.validatorAddress = "";
                MsgDelegate.prototype.amount = null;
                MsgDelegate.create = function create(properties) {
                    return new MsgDelegate(properties);
                };
                MsgDelegate.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
                        w.uint32(10).string(m.delegatorAddress);
                    if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
                        w.uint32(18).string(m.validatorAddress);
                    if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
                        $root.cosmos.base.v1beta1.Coin.encode(m.amount, w.uint32(26).fork()).ldelim();
                    return w;
                };
                MsgDelegate.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.staking.v1beta1.MsgDelegate();
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
                    if (d instanceof $root.cosmos.staking.v1beta1.MsgDelegate)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgDelegateResponse.create = function create(properties) {
                    return new MsgDelegateResponse(properties);
                };
                MsgDelegateResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };
                MsgDelegateResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.staking.v1beta1.MsgDelegateResponse();
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgBeginRedelegate.prototype.delegatorAddress = "";
                MsgBeginRedelegate.prototype.validatorSrcAddress = "";
                MsgBeginRedelegate.prototype.validatorDstAddress = "";
                MsgBeginRedelegate.prototype.amount = null;
                MsgBeginRedelegate.create = function create(properties) {
                    return new MsgBeginRedelegate(properties);
                };
                MsgBeginRedelegate.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
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
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegate();
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
                            throw TypeError(".cosmos.staking.v1beta1.MsgBeginRedelegate.amount: object expected");
                        m.amount = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount);
                    }
                    return m;
                };
                MsgBeginRedelegate.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgBeginRedelegateResponse.prototype.completionTime = null;
                MsgBeginRedelegateResponse.create = function create(properties) {
                    return new MsgBeginRedelegateResponse(properties);
                };
                MsgBeginRedelegateResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.completionTime != null && Object.hasOwnProperty.call(m, "completionTime"))
                        $root.google.protobuf.Timestamp.encode(m.completionTime, w.uint32(10).fork()).ldelim();
                    return w;
                };
                MsgBeginRedelegateResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
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
                    if (d instanceof $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse)
                        return d;
                    var m = new $root.cosmos.staking.v1beta1.MsgBeginRedelegateResponse();
                    if (d.completionTime != null) {
                        if (typeof d.completionTime !== "object")
                            throw TypeError(".cosmos.staking.v1beta1.MsgBeginRedelegateResponse.completionTime: object expected");
                        m.completionTime = $root.google.protobuf.Timestamp.fromObject(d.completionTime);
                    }
                    return m;
                };
                MsgBeginRedelegateResponse.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgUndelegate.prototype.delegatorAddress = "";
                MsgUndelegate.prototype.validatorAddress = "";
                MsgUndelegate.prototype.amount = null;
                MsgUndelegate.create = function create(properties) {
                    return new MsgUndelegate(properties);
                };
                MsgUndelegate.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
                        w.uint32(10).string(m.delegatorAddress);
                    if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
                        w.uint32(18).string(m.validatorAddress);
                    if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
                        $root.cosmos.base.v1beta1.Coin.encode(m.amount, w.uint32(26).fork()).ldelim();
                    return w;
                };
                MsgUndelegate.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.staking.v1beta1.MsgUndelegate();
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
                    if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegate)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgUndelegateResponse.prototype.completionTime = null;
                MsgUndelegateResponse.create = function create(properties) {
                    return new MsgUndelegateResponse(properties);
                };
                MsgUndelegateResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.completionTime != null && Object.hasOwnProperty.call(m, "completionTime"))
                        $root.google.protobuf.Timestamp.encode(m.completionTime, w.uint32(10).fork()).ldelim();
                    return w;
                };
                MsgUndelegateResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
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
                    if (d instanceof $root.cosmos.staking.v1beta1.MsgUndelegateResponse)
                        return d;
                    var m = new $root.cosmos.staking.v1beta1.MsgUndelegateResponse();
                    if (d.completionTime != null) {
                        if (typeof d.completionTime !== "object")
                            throw TypeError(".cosmos.staking.v1beta1.MsgUndelegateResponse.completionTime: object expected");
                        m.completionTime = $root.google.protobuf.Timestamp.fromObject(d.completionTime);
                    }
                    return m;
                };
                MsgUndelegateResponse.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
    cosmos.gov = (function () {
        const gov = {};
        gov.v1beta1 = (function () {
            const v1beta1 = {};
            v1beta1.VoteOption = (function () {
                const valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "VOTE_OPTION_UNSPECIFIED"] = 0;
                values[valuesById[1] = "VOTE_OPTION_YES"] = 1;
                values[valuesById[2] = "VOTE_OPTION_ABSTAIN"] = 2;
                values[valuesById[3] = "VOTE_OPTION_NO"] = 3;
                values[valuesById[4] = "VOTE_OPTION_NO_WITH_VETO"] = 4;
                return values;
            })();
            v1beta1.Msg = (function () {
                function Msg(rpcImpl, requestDelimited, responseDelimited) {
                    $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
                }
                (Msg.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Msg;
                Msg.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                    return new this(rpcImpl, requestDelimited, responseDelimited);
                };
                Object.defineProperty(Msg.prototype.vote = function vote(request, callback) {
                    return this.rpcCall(vote, $root.cosmos.gov.v1beta1.MsgVote, $root.cosmos.gov.v1beta1.MsgVoteResponse, request, callback);
                }, "name", { value: "Vote" });
                Object.defineProperty(Msg.prototype.deposit = function deposit(request, callback) {
                    return this.rpcCall(deposit, $root.cosmos.gov.v1beta1.MsgDeposit, $root.cosmos.gov.v1beta1.MsgDepositResponse, request, callback);
                }, "name", { value: "Deposit" });
                return Msg;
            })();
            v1beta1.MsgVote = (function () {
                function MsgVote(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgVote.prototype.proposalId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                MsgVote.prototype.voter = "";
                MsgVote.prototype.option = 0;
                MsgVote.create = function create(properties) {
                    return new MsgVote(properties);
                };
                MsgVote.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.proposalId != null && Object.hasOwnProperty.call(m, "proposalId"))
                        w.uint32(8).uint64(m.proposalId);
                    if (m.voter != null && Object.hasOwnProperty.call(m, "voter"))
                        w.uint32(18).string(m.voter);
                    if (m.option != null && Object.hasOwnProperty.call(m, "option"))
                        w.uint32(24).int32(m.option);
                    return w;
                };
                MsgVote.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.gov.v1beta1.MsgVote();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.proposalId = r.uint64();
                                break;
                            case 2:
                                m.voter = r.string();
                                break;
                            case 3:
                                m.option = r.int32();
                                break;
                            default:
                                r.skipType(t & 7);
                                break;
                        }
                    }
                    return m;
                };
                MsgVote.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.gov.v1beta1.MsgVote)
                        return d;
                    var m = new $root.cosmos.gov.v1beta1.MsgVote();
                    if (d.proposalId != null) {
                        if ($util.Long)
                            (m.proposalId = $util.Long.fromValue(d.proposalId)).unsigned = true;
                        else if (typeof d.proposalId === "string")
                            m.proposalId = parseInt(d.proposalId, 10);
                        else if (typeof d.proposalId === "number")
                            m.proposalId = d.proposalId;
                        else if (typeof d.proposalId === "object")
                            m.proposalId = new $util.LongBits(d.proposalId.low >>> 0, d.proposalId.high >>> 0).toNumber(true);
                    }
                    if (d.voter != null) {
                        m.voter = String(d.voter);
                    }
                    switch (d.option) {
                        case "VOTE_OPTION_UNSPECIFIED":
                        case 0:
                            m.option = 0;
                            break;
                        case "VOTE_OPTION_YES":
                        case 1:
                            m.option = 1;
                            break;
                        case "VOTE_OPTION_ABSTAIN":
                        case 2:
                            m.option = 2;
                            break;
                        case "VOTE_OPTION_NO":
                        case 3:
                            m.option = 3;
                            break;
                        case "VOTE_OPTION_NO_WITH_VETO":
                        case 4:
                            m.option = 4;
                            break;
                    }
                    return m;
                };
                MsgVote.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.defaults) {
                        if ($util.Long) {
                            var n = new $util.Long(0, 0, true);
                            d.proposalId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                        }
                        else
                            d.proposalId = o.longs === String ? "0" : 0;
                        d.voter = "";
                        d.option = o.enums === String ? "VOTE_OPTION_UNSPECIFIED" : 0;
                    }
                    if (m.proposalId != null && m.hasOwnProperty("proposalId")) {
                        if (typeof m.proposalId === "number")
                            d.proposalId = o.longs === String ? String(m.proposalId) : m.proposalId;
                        else
                            d.proposalId = o.longs === String ? $util.Long.prototype.toString.call(m.proposalId) : o.longs === Number ? new $util.LongBits(m.proposalId.low >>> 0, m.proposalId.high >>> 0).toNumber(true) : m.proposalId;
                    }
                    if (m.voter != null && m.hasOwnProperty("voter")) {
                        d.voter = m.voter;
                    }
                    if (m.option != null && m.hasOwnProperty("option")) {
                        d.option = o.enums === String ? $root.cosmos.gov.v1beta1.VoteOption[m.option] : m.option;
                    }
                    return d;
                };
                MsgVote.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgVote;
            })();
            v1beta1.MsgVoteResponse = (function () {
                function MsgVoteResponse(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgVoteResponse.create = function create(properties) {
                    return new MsgVoteResponse(properties);
                };
                MsgVoteResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };
                MsgVoteResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.gov.v1beta1.MsgVoteResponse();
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
                MsgVoteResponse.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.gov.v1beta1.MsgVoteResponse)
                        return d;
                    return new $root.cosmos.gov.v1beta1.MsgVoteResponse();
                };
                MsgVoteResponse.toObject = function toObject() {
                    return {};
                };
                MsgVoteResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgVoteResponse;
            })();
            v1beta1.MsgDeposit = (function () {
                function MsgDeposit(p) {
                    this.amount = [];
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgDeposit.prototype.proposalId = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                MsgDeposit.prototype.depositor = "";
                MsgDeposit.prototype.amount = $util.emptyArray;
                MsgDeposit.create = function create(properties) {
                    return new MsgDeposit(properties);
                };
                MsgDeposit.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.proposalId != null && Object.hasOwnProperty.call(m, "proposalId"))
                        w.uint32(8).uint64(m.proposalId);
                    if (m.depositor != null && Object.hasOwnProperty.call(m, "depositor"))
                        w.uint32(18).string(m.depositor);
                    if (m.amount != null && m.amount.length) {
                        for (var i = 0; i < m.amount.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.amount[i], w.uint32(26).fork()).ldelim();
                    }
                    return w;
                };
                MsgDeposit.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.gov.v1beta1.MsgDeposit();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.proposalId = r.uint64();
                                break;
                            case 2:
                                m.depositor = r.string();
                                break;
                            case 3:
                                if (!(m.amount && m.amount.length))
                                    m.amount = [];
                                m.amount.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
                                break;
                            default:
                                r.skipType(t & 7);
                                break;
                        }
                    }
                    return m;
                };
                MsgDeposit.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.gov.v1beta1.MsgDeposit)
                        return d;
                    var m = new $root.cosmos.gov.v1beta1.MsgDeposit();
                    if (d.proposalId != null) {
                        if ($util.Long)
                            (m.proposalId = $util.Long.fromValue(d.proposalId)).unsigned = true;
                        else if (typeof d.proposalId === "string")
                            m.proposalId = parseInt(d.proposalId, 10);
                        else if (typeof d.proposalId === "number")
                            m.proposalId = d.proposalId;
                        else if (typeof d.proposalId === "object")
                            m.proposalId = new $util.LongBits(d.proposalId.low >>> 0, d.proposalId.high >>> 0).toNumber(true);
                    }
                    if (d.depositor != null) {
                        m.depositor = String(d.depositor);
                    }
                    if (d.amount) {
                        if (!Array.isArray(d.amount))
                            throw TypeError(".cosmos.gov.v1beta1.MsgDeposit.amount: array expected");
                        m.amount = [];
                        for (var i = 0; i < d.amount.length; ++i) {
                            if (typeof d.amount[i] !== "object")
                                throw TypeError(".cosmos.gov.v1beta1.MsgDeposit.amount: object expected");
                            m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount[i]);
                        }
                    }
                    return m;
                };
                MsgDeposit.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.arrays || o.defaults) {
                        d.amount = [];
                    }
                    if (o.defaults) {
                        if ($util.Long) {
                            var n = new $util.Long(0, 0, true);
                            d.proposalId = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                        }
                        else
                            d.proposalId = o.longs === String ? "0" : 0;
                        d.depositor = "";
                    }
                    if (m.proposalId != null && m.hasOwnProperty("proposalId")) {
                        if (typeof m.proposalId === "number")
                            d.proposalId = o.longs === String ? String(m.proposalId) : m.proposalId;
                        else
                            d.proposalId = o.longs === String ? $util.Long.prototype.toString.call(m.proposalId) : o.longs === Number ? new $util.LongBits(m.proposalId.low >>> 0, m.proposalId.high >>> 0).toNumber(true) : m.proposalId;
                    }
                    if (m.depositor != null && m.hasOwnProperty("depositor")) {
                        d.depositor = m.depositor;
                    }
                    if (m.amount && m.amount.length) {
                        d.amount = [];
                        for (var j = 0; j < m.amount.length; ++j) {
                            d.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.amount[j], o);
                        }
                    }
                    return d;
                };
                MsgDeposit.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgDeposit;
            })();
            v1beta1.MsgDepositResponse = (function () {
                function MsgDepositResponse(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgDepositResponse.create = function create(properties) {
                    return new MsgDepositResponse(properties);
                };
                MsgDepositResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };
                MsgDepositResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.gov.v1beta1.MsgDepositResponse();
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
                MsgDepositResponse.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.gov.v1beta1.MsgDepositResponse)
                        return d;
                    return new $root.cosmos.gov.v1beta1.MsgDepositResponse();
                };
                MsgDepositResponse.toObject = function toObject() {
                    return {};
                };
                MsgDepositResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgDepositResponse;
            })();
            return v1beta1;
        })();
        return gov;
    })();
    cosmos.distribution = (function () {
        const distribution = {};
        distribution.v1beta1 = (function () {
            const v1beta1 = {};
            v1beta1.Msg = (function () {
                function Msg(rpcImpl, requestDelimited, responseDelimited) {
                    $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
                }
                (Msg.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = Msg;
                Msg.create = function create(rpcImpl, requestDelimited, responseDelimited) {
                    return new this(rpcImpl, requestDelimited, responseDelimited);
                };
                Object.defineProperty(Msg.prototype.withdrawDelegatorReward = function withdrawDelegatorReward(request, callback) {
                    return this.rpcCall(withdrawDelegatorReward, $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward, $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse, request, callback);
                }, "name", { value: "WithdrawDelegatorReward" });
                return Msg;
            })();
            v1beta1.MsgWithdrawDelegatorReward = (function () {
                function MsgWithdrawDelegatorReward(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgWithdrawDelegatorReward.prototype.delegatorAddress = "";
                MsgWithdrawDelegatorReward.prototype.validatorAddress = "";
                MsgWithdrawDelegatorReward.create = function create(properties) {
                    return new MsgWithdrawDelegatorReward(properties);
                };
                MsgWithdrawDelegatorReward.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.delegatorAddress != null && Object.hasOwnProperty.call(m, "delegatorAddress"))
                        w.uint32(10).string(m.delegatorAddress);
                    if (m.validatorAddress != null && Object.hasOwnProperty.call(m, "validatorAddress"))
                        w.uint32(18).string(m.validatorAddress);
                    return w;
                };
                MsgWithdrawDelegatorReward.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward();
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
                MsgWithdrawDelegatorReward.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward)
                        return d;
                    var m = new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward();
                    if (d.delegatorAddress != null) {
                        m.delegatorAddress = String(d.delegatorAddress);
                    }
                    if (d.validatorAddress != null) {
                        m.validatorAddress = String(d.validatorAddress);
                    }
                    return m;
                };
                MsgWithdrawDelegatorReward.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                MsgWithdrawDelegatorReward.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgWithdrawDelegatorReward;
            })();
            v1beta1.MsgWithdrawDelegatorRewardResponse = (function () {
                function MsgWithdrawDelegatorRewardResponse(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgWithdrawDelegatorRewardResponse.create = function create(properties) {
                    return new MsgWithdrawDelegatorRewardResponse(properties);
                };
                MsgWithdrawDelegatorRewardResponse.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    return w;
                };
                MsgWithdrawDelegatorRewardResponse.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse();
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
                MsgWithdrawDelegatorRewardResponse.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse)
                        return d;
                    return new $root.cosmos.distribution.v1beta1.MsgWithdrawDelegatorRewardResponse();
                };
                MsgWithdrawDelegatorRewardResponse.toObject = function toObject() {
                    return {};
                };
                MsgWithdrawDelegatorRewardResponse.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgWithdrawDelegatorRewardResponse;
            })();
            return v1beta1;
        })();
        return distribution;
    })();
    cosmos.base = (function () {
        const base = {};
        base.v1beta1 = (function () {
            const v1beta1 = {};
            v1beta1.Coin = (function () {
                function Coin(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Coin.prototype.denom = "";
                Coin.prototype.amount = "";
                Coin.create = function create(properties) {
                    return new Coin(properties);
                };
                Coin.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
                        w.uint32(10).string(m.denom);
                    if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
                        w.uint32(18).string(m.amount);
                    return w;
                };
                Coin.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.base.v1beta1.Coin();
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
                    if (d instanceof $root.cosmos.base.v1beta1.Coin)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                DecCoin.prototype.denom = "";
                DecCoin.prototype.amount = "";
                DecCoin.create = function create(properties) {
                    return new DecCoin(properties);
                };
                DecCoin.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.denom != null && Object.hasOwnProperty.call(m, "denom"))
                        w.uint32(10).string(m.denom);
                    if (m.amount != null && Object.hasOwnProperty.call(m, "amount"))
                        w.uint32(18).string(m.amount);
                    return w;
                };
                DecCoin.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.base.v1beta1.DecCoin();
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
                    if (d instanceof $root.cosmos.base.v1beta1.DecCoin)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                IntProto.prototype.int = "";
                IntProto.create = function create(properties) {
                    return new IntProto(properties);
                };
                IntProto.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.int != null && Object.hasOwnProperty.call(m, "int"))
                        w.uint32(10).string(m.int);
                    return w;
                };
                IntProto.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.base.v1beta1.IntProto();
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
                    if (d instanceof $root.cosmos.base.v1beta1.IntProto)
                        return d;
                    var m = new $root.cosmos.base.v1beta1.IntProto();
                    if (d.int != null) {
                        m.int = String(d.int);
                    }
                    return m;
                };
                IntProto.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                DecProto.prototype.dec = "";
                DecProto.create = function create(properties) {
                    return new DecProto(properties);
                };
                DecProto.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.dec != null && Object.hasOwnProperty.call(m, "dec"))
                        w.uint32(10).string(m.dec);
                    return w;
                };
                DecProto.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.base.v1beta1.DecProto();
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
                    if (d instanceof $root.cosmos.base.v1beta1.DecProto)
                        return d;
                    var m = new $root.cosmos.base.v1beta1.DecProto();
                    if (d.dec != null) {
                        m.dec = String(d.dec);
                    }
                    return m;
                };
                DecProto.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    MultiSignature.prototype.signatures = $util.emptyArray;
                    MultiSignature.create = function create(properties) {
                        return new MultiSignature(properties);
                    };
                    MultiSignature.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.signatures != null && m.signatures.length) {
                            for (var i = 0; i < m.signatures.length; ++i)
                                w.uint32(10).bytes(m.signatures[i]);
                        }
                        return w;
                    };
                    MultiSignature.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                                case 1:
                                    if (!(m.signatures && m.signatures.length))
                                        m.signatures = [];
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
                        if (d instanceof $root.cosmos.crypto.multisig.v1beta1.MultiSignature)
                            return d;
                        var m = new $root.cosmos.crypto.multisig.v1beta1.MultiSignature();
                        if (d.signatures) {
                            if (!Array.isArray(d.signatures))
                                throw TypeError(".cosmos.crypto.multisig.v1beta1.MultiSignature.signatures: array expected");
                            m.signatures = [];
                            for (var i = 0; i < d.signatures.length; ++i) {
                                if (typeof d.signatures[i] === "string")
                                    $util.base64.decode(d.signatures[i], m.signatures[i] = $util.newBuffer($util.base64.length(d.signatures[i])), 0);
                                else if (d.signatures[i].length)
                                    m.signatures[i] = d.signatures[i];
                            }
                        }
                        return m;
                    };
                    MultiSignature.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.signatures = [];
                        }
                        if (m.signatures && m.signatures.length) {
                            d.signatures = [];
                            for (var j = 0; j < m.signatures.length; ++j) {
                                d.signatures[j] = o.bytes === String ? $util.base64.encode(m.signatures[j], 0, m.signatures[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.signatures[j]) : m.signatures[j];
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
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    CompactBitArray.prototype.extraBitsStored = 0;
                    CompactBitArray.prototype.elems = $util.newBuffer([]);
                    CompactBitArray.create = function create(properties) {
                        return new CompactBitArray(properties);
                    };
                    CompactBitArray.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.extraBitsStored != null && Object.hasOwnProperty.call(m, "extraBitsStored"))
                            w.uint32(8).uint32(m.extraBitsStored);
                        if (m.elems != null && Object.hasOwnProperty.call(m, "elems"))
                            w.uint32(18).bytes(m.elems);
                        return w;
                    };
                    CompactBitArray.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
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
                        if (d instanceof $root.cosmos.crypto.multisig.v1beta1.CompactBitArray)
                            return d;
                        var m = new $root.cosmos.crypto.multisig.v1beta1.CompactBitArray();
                        if (d.extraBitsStored != null) {
                            m.extraBitsStored = d.extraBitsStored >>> 0;
                        }
                        if (d.elems != null) {
                            if (typeof d.elems === "string")
                                $util.base64.decode(d.elems, m.elems = $util.newBuffer($util.base64.length(d.elems)), 0);
                            else if (d.elems.length)
                                m.elems = d.elems;
                        }
                        return m;
                    };
                    CompactBitArray.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            d.extraBitsStored = 0;
                            if (o.bytes === String)
                                d.elems = "";
                            else {
                                d.elems = [];
                                if (o.bytes !== Array)
                                    d.elems = $util.newBuffer(d.elems);
                            }
                        }
                        if (m.extraBitsStored != null && m.hasOwnProperty("extraBitsStored")) {
                            d.extraBitsStored = m.extraBitsStored;
                        }
                        if (m.elems != null && m.hasOwnProperty("elems")) {
                            d.elems = o.bytes === String ? $util.base64.encode(m.elems, 0, m.elems.length) : o.bytes === Array ? Array.prototype.slice.call(m.elems) : m.elems;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                PubKey.prototype.key = $util.newBuffer([]);
                PubKey.create = function create(properties) {
                    return new PubKey(properties);
                };
                PubKey.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.key != null && Object.hasOwnProperty.call(m, "key"))
                        w.uint32(10).bytes(m.key);
                    return w;
                };
                PubKey.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.crypto.secp256k1.PubKey();
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
                    if (d instanceof $root.cosmos.crypto.secp256k1.PubKey)
                        return d;
                    var m = new $root.cosmos.crypto.secp256k1.PubKey();
                    if (d.key != null) {
                        if (typeof d.key === "string")
                            $util.base64.decode(d.key, m.key = $util.newBuffer($util.base64.length(d.key)), 0);
                        else if (d.key.length)
                            m.key = d.key;
                    }
                    return m;
                };
                PubKey.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.defaults) {
                        if (o.bytes === String)
                            d.key = "";
                        else {
                            d.key = [];
                            if (o.bytes !== Array)
                                d.key = $util.newBuffer(d.key);
                        }
                    }
                    if (m.key != null && m.hasOwnProperty("key")) {
                        d.key = o.bytes === String ? $util.base64.encode(m.key, 0, m.key.length) : o.bytes === Array ? Array.prototype.slice.call(m.key) : m.key;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                PrivKey.prototype.key = $util.newBuffer([]);
                PrivKey.create = function create(properties) {
                    return new PrivKey(properties);
                };
                PrivKey.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.key != null && Object.hasOwnProperty.call(m, "key"))
                        w.uint32(10).bytes(m.key);
                    return w;
                };
                PrivKey.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.crypto.secp256k1.PrivKey();
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
                    if (d instanceof $root.cosmos.crypto.secp256k1.PrivKey)
                        return d;
                    var m = new $root.cosmos.crypto.secp256k1.PrivKey();
                    if (d.key != null) {
                        if (typeof d.key === "string")
                            $util.base64.decode(d.key, m.key = $util.newBuffer($util.base64.length(d.key)), 0);
                        else if (d.key.length)
                            m.key = d.key;
                    }
                    return m;
                };
                PrivKey.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.defaults) {
                        if (o.bytes === String)
                            d.key = "";
                        else {
                            d.key = [];
                            if (o.bytes !== Array)
                                d.key = $util.newBuffer(d.key);
                        }
                    }
                    if (m.key != null && m.hasOwnProperty("key")) {
                        d.key = o.bytes === String ? $util.base64.encode(m.key, 0, m.key.length) : o.bytes === Array ? Array.prototype.slice.call(m.key) : m.key;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Tx.prototype.body = null;
                Tx.prototype.authInfo = null;
                Tx.prototype.signatures = $util.emptyArray;
                Tx.create = function create(properties) {
                    return new Tx(properties);
                };
                Tx.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.body != null && Object.hasOwnProperty.call(m, "body"))
                        $root.cosmos.tx.v1beta1.TxBody.encode(m.body, w.uint32(10).fork()).ldelim();
                    if (m.authInfo != null && Object.hasOwnProperty.call(m, "authInfo"))
                        $root.cosmos.tx.v1beta1.AuthInfo.encode(m.authInfo, w.uint32(18).fork()).ldelim();
                    if (m.signatures != null && m.signatures.length) {
                        for (var i = 0; i < m.signatures.length; ++i)
                            w.uint32(26).bytes(m.signatures[i]);
                    }
                    return w;
                };
                Tx.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.Tx();
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
                                if (!(m.signatures && m.signatures.length))
                                    m.signatures = [];
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
                    if (d instanceof $root.cosmos.tx.v1beta1.Tx)
                        return d;
                    var m = new $root.cosmos.tx.v1beta1.Tx();
                    if (d.body != null) {
                        if (typeof d.body !== "object")
                            throw TypeError(".cosmos.tx.v1beta1.Tx.body: object expected");
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
                                $util.base64.decode(d.signatures[i], m.signatures[i] = $util.newBuffer($util.base64.length(d.signatures[i])), 0);
                            else if (d.signatures[i].length)
                                m.signatures[i] = d.signatures[i];
                        }
                    }
                    return m;
                };
                Tx.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                            d.signatures[j] = o.bytes === String ? $util.base64.encode(m.signatures[j], 0, m.signatures[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.signatures[j]) : m.signatures[j];
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                TxRaw.prototype.bodyBytes = $util.newBuffer([]);
                TxRaw.prototype.authInfoBytes = $util.newBuffer([]);
                TxRaw.prototype.signatures = $util.emptyArray;
                TxRaw.create = function create(properties) {
                    return new TxRaw(properties);
                };
                TxRaw.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.bodyBytes != null && Object.hasOwnProperty.call(m, "bodyBytes"))
                        w.uint32(10).bytes(m.bodyBytes);
                    if (m.authInfoBytes != null && Object.hasOwnProperty.call(m, "authInfoBytes"))
                        w.uint32(18).bytes(m.authInfoBytes);
                    if (m.signatures != null && m.signatures.length) {
                        for (var i = 0; i < m.signatures.length; ++i)
                            w.uint32(26).bytes(m.signatures[i]);
                    }
                    return w;
                };
                TxRaw.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.TxRaw();
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
                                if (!(m.signatures && m.signatures.length))
                                    m.signatures = [];
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
                    if (d instanceof $root.cosmos.tx.v1beta1.TxRaw)
                        return d;
                    var m = new $root.cosmos.tx.v1beta1.TxRaw();
                    if (d.bodyBytes != null) {
                        if (typeof d.bodyBytes === "string")
                            $util.base64.decode(d.bodyBytes, m.bodyBytes = $util.newBuffer($util.base64.length(d.bodyBytes)), 0);
                        else if (d.bodyBytes.length)
                            m.bodyBytes = d.bodyBytes;
                    }
                    if (d.authInfoBytes != null) {
                        if (typeof d.authInfoBytes === "string")
                            $util.base64.decode(d.authInfoBytes, m.authInfoBytes = $util.newBuffer($util.base64.length(d.authInfoBytes)), 0);
                        else if (d.authInfoBytes.length)
                            m.authInfoBytes = d.authInfoBytes;
                    }
                    if (d.signatures) {
                        if (!Array.isArray(d.signatures))
                            throw TypeError(".cosmos.tx.v1beta1.TxRaw.signatures: array expected");
                        m.signatures = [];
                        for (var i = 0; i < d.signatures.length; ++i) {
                            if (typeof d.signatures[i] === "string")
                                $util.base64.decode(d.signatures[i], m.signatures[i] = $util.newBuffer($util.base64.length(d.signatures[i])), 0);
                            else if (d.signatures[i].length)
                                m.signatures[i] = d.signatures[i];
                        }
                    }
                    return m;
                };
                TxRaw.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.arrays || o.defaults) {
                        d.signatures = [];
                    }
                    if (o.defaults) {
                        if (o.bytes === String)
                            d.bodyBytes = "";
                        else {
                            d.bodyBytes = [];
                            if (o.bytes !== Array)
                                d.bodyBytes = $util.newBuffer(d.bodyBytes);
                        }
                        if (o.bytes === String)
                            d.authInfoBytes = "";
                        else {
                            d.authInfoBytes = [];
                            if (o.bytes !== Array)
                                d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
                        }
                    }
                    if (m.bodyBytes != null && m.hasOwnProperty("bodyBytes")) {
                        d.bodyBytes = o.bytes === String ? $util.base64.encode(m.bodyBytes, 0, m.bodyBytes.length) : o.bytes === Array ? Array.prototype.slice.call(m.bodyBytes) : m.bodyBytes;
                    }
                    if (m.authInfoBytes != null && m.hasOwnProperty("authInfoBytes")) {
                        d.authInfoBytes = o.bytes === String ? $util.base64.encode(m.authInfoBytes, 0, m.authInfoBytes.length) : o.bytes === Array ? Array.prototype.slice.call(m.authInfoBytes) : m.authInfoBytes;
                    }
                    if (m.signatures && m.signatures.length) {
                        d.signatures = [];
                        for (var j = 0; j < m.signatures.length; ++j) {
                            d.signatures[j] = o.bytes === String ? $util.base64.encode(m.signatures[j], 0, m.signatures[j].length) : o.bytes === Array ? Array.prototype.slice.call(m.signatures[j]) : m.signatures[j];
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                SignDoc.prototype.bodyBytes = $util.newBuffer([]);
                SignDoc.prototype.authInfoBytes = $util.newBuffer([]);
                SignDoc.prototype.chainId = "";
                SignDoc.prototype.accountNumber = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                SignDoc.create = function create(properties) {
                    return new SignDoc(properties);
                };
                SignDoc.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.bodyBytes != null && Object.hasOwnProperty.call(m, "bodyBytes"))
                        w.uint32(10).bytes(m.bodyBytes);
                    if (m.authInfoBytes != null && Object.hasOwnProperty.call(m, "authInfoBytes"))
                        w.uint32(18).bytes(m.authInfoBytes);
                    if (m.chainId != null && Object.hasOwnProperty.call(m, "chainId"))
                        w.uint32(26).string(m.chainId);
                    if (m.accountNumber != null && Object.hasOwnProperty.call(m, "accountNumber"))
                        w.uint32(32).uint64(m.accountNumber);
                    return w;
                };
                SignDoc.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.SignDoc();
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
                    if (d instanceof $root.cosmos.tx.v1beta1.SignDoc)
                        return d;
                    var m = new $root.cosmos.tx.v1beta1.SignDoc();
                    if (d.bodyBytes != null) {
                        if (typeof d.bodyBytes === "string")
                            $util.base64.decode(d.bodyBytes, m.bodyBytes = $util.newBuffer($util.base64.length(d.bodyBytes)), 0);
                        else if (d.bodyBytes.length)
                            m.bodyBytes = d.bodyBytes;
                    }
                    if (d.authInfoBytes != null) {
                        if (typeof d.authInfoBytes === "string")
                            $util.base64.decode(d.authInfoBytes, m.authInfoBytes = $util.newBuffer($util.base64.length(d.authInfoBytes)), 0);
                        else if (d.authInfoBytes.length)
                            m.authInfoBytes = d.authInfoBytes;
                    }
                    if (d.chainId != null) {
                        m.chainId = String(d.chainId);
                    }
                    if (d.accountNumber != null) {
                        if ($util.Long)
                            (m.accountNumber = $util.Long.fromValue(d.accountNumber)).unsigned = true;
                        else if (typeof d.accountNumber === "string")
                            m.accountNumber = parseInt(d.accountNumber, 10);
                        else if (typeof d.accountNumber === "number")
                            m.accountNumber = d.accountNumber;
                        else if (typeof d.accountNumber === "object")
                            m.accountNumber = new $util.LongBits(d.accountNumber.low >>> 0, d.accountNumber.high >>> 0).toNumber(true);
                    }
                    return m;
                };
                SignDoc.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.defaults) {
                        if (o.bytes === String)
                            d.bodyBytes = "";
                        else {
                            d.bodyBytes = [];
                            if (o.bytes !== Array)
                                d.bodyBytes = $util.newBuffer(d.bodyBytes);
                        }
                        if (o.bytes === String)
                            d.authInfoBytes = "";
                        else {
                            d.authInfoBytes = [];
                            if (o.bytes !== Array)
                                d.authInfoBytes = $util.newBuffer(d.authInfoBytes);
                        }
                        d.chainId = "";
                        if ($util.Long) {
                            var n = new $util.Long(0, 0, true);
                            d.accountNumber = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                        }
                        else
                            d.accountNumber = o.longs === String ? "0" : 0;
                    }
                    if (m.bodyBytes != null && m.hasOwnProperty("bodyBytes")) {
                        d.bodyBytes = o.bytes === String ? $util.base64.encode(m.bodyBytes, 0, m.bodyBytes.length) : o.bytes === Array ? Array.prototype.slice.call(m.bodyBytes) : m.bodyBytes;
                    }
                    if (m.authInfoBytes != null && m.hasOwnProperty("authInfoBytes")) {
                        d.authInfoBytes = o.bytes === String ? $util.base64.encode(m.authInfoBytes, 0, m.authInfoBytes.length) : o.bytes === Array ? Array.prototype.slice.call(m.authInfoBytes) : m.authInfoBytes;
                    }
                    if (m.chainId != null && m.hasOwnProperty("chainId")) {
                        d.chainId = m.chainId;
                    }
                    if (m.accountNumber != null && m.hasOwnProperty("accountNumber")) {
                        if (typeof m.accountNumber === "number")
                            d.accountNumber = o.longs === String ? String(m.accountNumber) : m.accountNumber;
                        else
                            d.accountNumber = o.longs === String ? $util.Long.prototype.toString.call(m.accountNumber) : o.longs === Number ? new $util.LongBits(m.accountNumber.low >>> 0, m.accountNumber.high >>> 0).toNumber(true) : m.accountNumber;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
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
                    if (!w)
                        w = $Writer.create();
                    if (m.messages != null && m.messages.length) {
                        for (var i = 0; i < m.messages.length; ++i)
                            $root.google.protobuf.Any.encode(m.messages[i], w.uint32(10).fork()).ldelim();
                    }
                    if (m.memo != null && Object.hasOwnProperty.call(m, "memo"))
                        w.uint32(18).string(m.memo);
                    if (m.timeoutHeight != null && Object.hasOwnProperty.call(m, "timeoutHeight"))
                        w.uint32(24).uint64(m.timeoutHeight);
                    if (m.extensionOptions != null && m.extensionOptions.length) {
                        for (var i = 0; i < m.extensionOptions.length; ++i)
                            $root.google.protobuf.Any.encode(m.extensionOptions[i], w.uint32(8186).fork()).ldelim();
                    }
                    if (m.nonCriticalExtensionOptions != null && m.nonCriticalExtensionOptions.length) {
                        for (var i = 0; i < m.nonCriticalExtensionOptions.length; ++i)
                            $root.google.protobuf.Any.encode(m.nonCriticalExtensionOptions[i], w.uint32(16378).fork()).ldelim();
                    }
                    return w;
                };
                TxBody.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.TxBody();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                if (!(m.messages && m.messages.length))
                                    m.messages = [];
                                m.messages.push($root.google.protobuf.Any.decode(r, r.uint32()));
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
                    if (d instanceof $root.cosmos.tx.v1beta1.TxBody)
                        return d;
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
                        if ($util.Long)
                            (m.timeoutHeight = $util.Long.fromValue(d.timeoutHeight)).unsigned = true;
                        else if (typeof d.timeoutHeight === "string")
                            m.timeoutHeight = parseInt(d.timeoutHeight, 10);
                        else if (typeof d.timeoutHeight === "number")
                            m.timeoutHeight = d.timeoutHeight;
                        else if (typeof d.timeoutHeight === "object")
                            m.timeoutHeight = new $util.LongBits(d.timeoutHeight.low >>> 0, d.timeoutHeight.high >>> 0).toNumber(true);
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
                            m.nonCriticalExtensionOptions[i] = $root.google.protobuf.Any.fromObject(d.nonCriticalExtensionOptions[i]);
                        }
                    }
                    return m;
                };
                TxBody.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
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
                        }
                        else
                            d.timeoutHeight = o.longs === String ? "0" : 0;
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
                            d.timeoutHeight = o.longs === String ? $util.Long.prototype.toString.call(m.timeoutHeight) : o.longs === Number ? new $util.LongBits(m.timeoutHeight.low >>> 0, m.timeoutHeight.high >>> 0).toNumber(true) : m.timeoutHeight;
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
                            d.nonCriticalExtensionOptions[j] = $root.google.protobuf.Any.toObject(m.nonCriticalExtensionOptions[j], o);
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                AuthInfo.prototype.signerInfos = $util.emptyArray;
                AuthInfo.prototype.fee = null;
                AuthInfo.create = function create(properties) {
                    return new AuthInfo(properties);
                };
                AuthInfo.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.signerInfos != null && m.signerInfos.length) {
                        for (var i = 0; i < m.signerInfos.length; ++i)
                            $root.cosmos.tx.v1beta1.SignerInfo.encode(m.signerInfos[i], w.uint32(10).fork()).ldelim();
                    }
                    if (m.fee != null && Object.hasOwnProperty.call(m, "fee"))
                        $root.cosmos.tx.v1beta1.Fee.encode(m.fee, w.uint32(18).fork()).ldelim();
                    return w;
                };
                AuthInfo.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.AuthInfo();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                if (!(m.signerInfos && m.signerInfos.length))
                                    m.signerInfos = [];
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
                    if (d instanceof $root.cosmos.tx.v1beta1.AuthInfo)
                        return d;
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
                    if (!o)
                        o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                SignerInfo.prototype.publicKey = null;
                SignerInfo.prototype.modeInfo = null;
                SignerInfo.prototype.sequence = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                SignerInfo.create = function create(properties) {
                    return new SignerInfo(properties);
                };
                SignerInfo.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.publicKey != null && Object.hasOwnProperty.call(m, "publicKey"))
                        $root.google.protobuf.Any.encode(m.publicKey, w.uint32(10).fork()).ldelim();
                    if (m.modeInfo != null && Object.hasOwnProperty.call(m, "modeInfo"))
                        $root.cosmos.tx.v1beta1.ModeInfo.encode(m.modeInfo, w.uint32(18).fork()).ldelim();
                    if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
                        w.uint32(24).uint64(m.sequence);
                    return w;
                };
                SignerInfo.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.SignerInfo();
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
                    if (d instanceof $root.cosmos.tx.v1beta1.SignerInfo)
                        return d;
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
                        if ($util.Long)
                            (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
                        else if (typeof d.sequence === "string")
                            m.sequence = parseInt(d.sequence, 10);
                        else if (typeof d.sequence === "number")
                            m.sequence = d.sequence;
                        else if (typeof d.sequence === "object")
                            m.sequence = new $util.LongBits(d.sequence.low >>> 0, d.sequence.high >>> 0).toNumber(true);
                    }
                    return m;
                };
                SignerInfo.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.defaults) {
                        d.publicKey = null;
                        d.modeInfo = null;
                        if ($util.Long) {
                            var n = new $util.Long(0, 0, true);
                            d.sequence = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                        }
                        else
                            d.sequence = o.longs === String ? "0" : 0;
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
                            d.sequence = o.longs === String ? $util.Long.prototype.toString.call(m.sequence) : o.longs === Number ? new $util.LongBits(m.sequence.low >>> 0, m.sequence.high >>> 0).toNumber(true) : m.sequence;
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                ModeInfo.prototype.single = null;
                ModeInfo.prototype.multi = null;
                let $oneOfFields;
                Object.defineProperty(ModeInfo.prototype, "sum", {
                    get: $util.oneOfGetter($oneOfFields = ["single", "multi"]),
                    set: $util.oneOfSetter($oneOfFields)
                });
                ModeInfo.create = function create(properties) {
                    return new ModeInfo(properties);
                };
                ModeInfo.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.single != null && Object.hasOwnProperty.call(m, "single"))
                        $root.cosmos.tx.v1beta1.ModeInfo.Single.encode(m.single, w.uint32(10).fork()).ldelim();
                    if (m.multi != null && Object.hasOwnProperty.call(m, "multi"))
                        $root.cosmos.tx.v1beta1.ModeInfo.Multi.encode(m.multi, w.uint32(18).fork()).ldelim();
                    return w;
                };
                ModeInfo.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.ModeInfo();
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
                    if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo)
                        return d;
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
                    if (!o)
                        o = {};
                    var d = {};
                    if (m.single != null && m.hasOwnProperty("single")) {
                        d.single = $root.cosmos.tx.v1beta1.ModeInfo.Single.toObject(m.single, o);
                        if (o.oneofs)
                            d.sum = "single";
                    }
                    if (m.multi != null && m.hasOwnProperty("multi")) {
                        d.multi = $root.cosmos.tx.v1beta1.ModeInfo.Multi.toObject(m.multi, o);
                        if (o.oneofs)
                            d.sum = "multi";
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
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    Single.prototype.mode = 0;
                    Single.create = function create(properties) {
                        return new Single(properties);
                    };
                    Single.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                            w.uint32(8).int32(m.mode);
                        return w;
                    };
                    Single.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.ModeInfo.Single();
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
                        if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo.Single)
                            return d;
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
                        if (!o)
                            o = {};
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
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    Multi.prototype.bitarray = null;
                    Multi.prototype.modeInfos = $util.emptyArray;
                    Multi.create = function create(properties) {
                        return new Multi(properties);
                    };
                    Multi.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.bitarray != null && Object.hasOwnProperty.call(m, "bitarray"))
                            $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(m.bitarray, w.uint32(10).fork()).ldelim();
                        if (m.modeInfos != null && m.modeInfos.length) {
                            for (var i = 0; i < m.modeInfos.length; ++i)
                                $root.cosmos.tx.v1beta1.ModeInfo.encode(m.modeInfos[i], w.uint32(18).fork()).ldelim();
                        }
                        return w;
                    };
                    Multi.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.ModeInfo.Multi();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                                case 1:
                                    m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(r, r.uint32());
                                    break;
                                case 2:
                                    if (!(m.modeInfos && m.modeInfos.length))
                                        m.modeInfos = [];
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
                        if (d instanceof $root.cosmos.tx.v1beta1.ModeInfo.Multi)
                            return d;
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
                        if (!o)
                            o = {};
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
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                Fee.prototype.amount = $util.emptyArray;
                Fee.prototype.gasLimit = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                Fee.prototype.payer = "";
                Fee.prototype.granter = "";
                Fee.create = function create(properties) {
                    return new Fee(properties);
                };
                Fee.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.amount != null && m.amount.length) {
                        for (var i = 0; i < m.amount.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.amount[i], w.uint32(10).fork()).ldelim();
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
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.v1beta1.Fee();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                if (!(m.amount && m.amount.length))
                                    m.amount = [];
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
                    if (d instanceof $root.cosmos.tx.v1beta1.Fee)
                        return d;
                    var m = new $root.cosmos.tx.v1beta1.Fee();
                    if (d.amount) {
                        if (!Array.isArray(d.amount))
                            throw TypeError(".cosmos.tx.v1beta1.Fee.amount: array expected");
                        m.amount = [];
                        for (var i = 0; i < d.amount.length; ++i) {
                            if (typeof d.amount[i] !== "object")
                                throw TypeError(".cosmos.tx.v1beta1.Fee.amount: object expected");
                            m.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.amount[i]);
                        }
                    }
                    if (d.gasLimit != null) {
                        if ($util.Long)
                            (m.gasLimit = $util.Long.fromValue(d.gasLimit)).unsigned = true;
                        else if (typeof d.gasLimit === "string")
                            m.gasLimit = parseInt(d.gasLimit, 10);
                        else if (typeof d.gasLimit === "number")
                            m.gasLimit = d.gasLimit;
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
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.arrays || o.defaults) {
                        d.amount = [];
                    }
                    if (o.defaults) {
                        if ($util.Long) {
                            var n = new $util.Long(0, 0, true);
                            d.gasLimit = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                        }
                        else
                            d.gasLimit = o.longs === String ? "0" : 0;
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
                            d.gasLimit = o.longs === String ? $util.Long.prototype.toString.call(m.gasLimit) : o.longs === Number ? new $util.LongBits(m.gasLimit.low >>> 0, m.gasLimit.high >>> 0).toNumber(true) : m.gasLimit;
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
                    const valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "SIGN_MODE_UNSPECIFIED"] = 0;
                    values[valuesById[1] = "SIGN_MODE_DIRECT"] = 1;
                    values[valuesById[2] = "SIGN_MODE_TEXTUAL"] = 2;
                    values[valuesById[127] = "SIGN_MODE_LEGACY_AMINO_JSON"] = 127;
                    return values;
                })();
                v1beta1.SignatureDescriptors = (function () {
                    function SignatureDescriptors(p) {
                        this.signatures = [];
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    SignatureDescriptors.prototype.signatures = $util.emptyArray;
                    SignatureDescriptors.create = function create(properties) {
                        return new SignatureDescriptors(properties);
                    };
                    SignatureDescriptors.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.signatures != null && m.signatures.length) {
                            for (var i = 0; i < m.signatures.length; ++i)
                                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.encode(m.signatures[i], w.uint32(10).fork()).ldelim();
                        }
                        return w;
                    };
                    SignatureDescriptors.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                                case 1:
                                    if (!(m.signatures && m.signatures.length))
                                        m.signatures = [];
                                    m.signatures.push($root.cosmos.tx.signing.v1beta1.SignatureDescriptor.decode(r, r.uint32()));
                                    break;
                                default:
                                    r.skipType(t & 7);
                                    break;
                            }
                        }
                        return m;
                    };
                    SignatureDescriptors.fromObject = function fromObject(d) {
                        if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptors)
                            return d;
                        var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptors();
                        if (d.signatures) {
                            if (!Array.isArray(d.signatures))
                                throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: array expected");
                            m.signatures = [];
                            for (var i = 0; i < d.signatures.length; ++i) {
                                if (typeof d.signatures[i] !== "object")
                                    throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptors.signatures: object expected");
                                m.signatures[i] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.fromObject(d.signatures[i]);
                            }
                        }
                        return m;
                    };
                    SignatureDescriptors.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.signatures = [];
                        }
                        if (m.signatures && m.signatures.length) {
                            d.signatures = [];
                            for (var j = 0; j < m.signatures.length; ++j) {
                                d.signatures[j] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.toObject(m.signatures[j], o);
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
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    SignatureDescriptor.prototype.publicKey = null;
                    SignatureDescriptor.prototype.data = null;
                    SignatureDescriptor.prototype.sequence = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                    SignatureDescriptor.create = function create(properties) {
                        return new SignatureDescriptor(properties);
                    };
                    SignatureDescriptor.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.publicKey != null && Object.hasOwnProperty.call(m, "publicKey"))
                            $root.google.protobuf.Any.encode(m.publicKey, w.uint32(10).fork()).ldelim();
                        if (m.data != null && Object.hasOwnProperty.call(m, "data"))
                            $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(m.data, w.uint32(18).fork()).ldelim();
                        if (m.sequence != null && Object.hasOwnProperty.call(m, "sequence"))
                            w.uint32(24).uint64(m.sequence);
                        return w;
                    };
                    SignatureDescriptor.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor();
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
                        if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor)
                            return d;
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
                            if ($util.Long)
                                (m.sequence = $util.Long.fromValue(d.sequence)).unsigned = true;
                            else if (typeof d.sequence === "string")
                                m.sequence = parseInt(d.sequence, 10);
                            else if (typeof d.sequence === "number")
                                m.sequence = d.sequence;
                            else if (typeof d.sequence === "object")
                                m.sequence = new $util.LongBits(d.sequence.low >>> 0, d.sequence.high >>> 0).toNumber(true);
                        }
                        return m;
                    };
                    SignatureDescriptor.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            d.publicKey = null;
                            d.data = null;
                            if ($util.Long) {
                                var n = new $util.Long(0, 0, true);
                                d.sequence = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                            }
                            else
                                d.sequence = o.longs === String ? "0" : 0;
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
                                d.sequence = o.longs === String ? $util.Long.prototype.toString.call(m.sequence) : o.longs === Number ? new $util.LongBits(m.sequence.low >>> 0, m.sequence.high >>> 0).toNumber(true) : m.sequence;
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
                                    if (p[ks[i]] != null)
                                        this[ks[i]] = p[ks[i]];
                        }
                        Data.prototype.single = null;
                        Data.prototype.multi = null;
                        let $oneOfFields;
                        Object.defineProperty(Data.prototype, "sum", {
                            get: $util.oneOfGetter($oneOfFields = ["single", "multi"]),
                            set: $util.oneOfSetter($oneOfFields)
                        });
                        Data.create = function create(properties) {
                            return new Data(properties);
                        };
                        Data.encode = function encode(m, w) {
                            if (!w)
                                w = $Writer.create();
                            if (m.single != null && Object.hasOwnProperty.call(m, "single"))
                                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.encode(m.single, w.uint32(10).fork()).ldelim();
                            if (m.multi != null && Object.hasOwnProperty.call(m, "multi"))
                                $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.encode(m.multi, w.uint32(18).fork()).ldelim();
                            return w;
                        };
                        Data.decode = function decode(r, l) {
                            if (!(r instanceof $Reader))
                                r = $Reader.create(r);
                            var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
                            while (r.pos < c) {
                                var t = r.uint32();
                                switch (t >>> 3) {
                                    case 1:
                                        m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.decode(r, r.uint32());
                                        break;
                                    case 2:
                                        m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.decode(r, r.uint32());
                                        break;
                                    default:
                                        r.skipType(t & 7);
                                        break;
                                }
                            }
                            return m;
                        };
                        Data.fromObject = function fromObject(d) {
                            if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data)
                                return d;
                            var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data();
                            if (d.single != null) {
                                if (typeof d.single !== "object")
                                    throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.single: object expected");
                                m.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.fromObject(d.single);
                            }
                            if (d.multi != null) {
                                if (typeof d.multi !== "object")
                                    throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.multi: object expected");
                                m.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.fromObject(d.multi);
                            }
                            return m;
                        };
                        Data.toObject = function toObject(m, o) {
                            if (!o)
                                o = {};
                            var d = {};
                            if (m.single != null && m.hasOwnProperty("single")) {
                                d.single = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single.toObject(m.single, o);
                                if (o.oneofs)
                                    d.sum = "single";
                            }
                            if (m.multi != null && m.hasOwnProperty("multi")) {
                                d.multi = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.toObject(m.multi, o);
                                if (o.oneofs)
                                    d.sum = "multi";
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
                                        if (p[ks[i]] != null)
                                            this[ks[i]] = p[ks[i]];
                            }
                            Single.prototype.mode = 0;
                            Single.prototype.signature = $util.newBuffer([]);
                            Single.create = function create(properties) {
                                return new Single(properties);
                            };
                            Single.encode = function encode(m, w) {
                                if (!w)
                                    w = $Writer.create();
                                if (m.mode != null && Object.hasOwnProperty.call(m, "mode"))
                                    w.uint32(8).int32(m.mode);
                                if (m.signature != null && Object.hasOwnProperty.call(m, "signature"))
                                    w.uint32(18).bytes(m.signature);
                                return w;
                            };
                            Single.decode = function decode(r, l) {
                                if (!(r instanceof $Reader))
                                    r = $Reader.create(r);
                                var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single();
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
                                if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Single)
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
                                        $util.base64.decode(d.signature, m.signature = $util.newBuffer($util.base64.length(d.signature)), 0);
                                    else if (d.signature.length)
                                        m.signature = d.signature;
                                }
                                return m;
                            };
                            Single.toObject = function toObject(m, o) {
                                if (!o)
                                    o = {};
                                var d = {};
                                if (o.defaults) {
                                    d.mode = o.enums === String ? "SIGN_MODE_UNSPECIFIED" : 0;
                                    if (o.bytes === String)
                                        d.signature = "";
                                    else {
                                        d.signature = [];
                                        if (o.bytes !== Array)
                                            d.signature = $util.newBuffer(d.signature);
                                    }
                                }
                                if (m.mode != null && m.hasOwnProperty("mode")) {
                                    d.mode = o.enums === String ? $root.cosmos.tx.signing.v1beta1.SignMode[m.mode] : m.mode;
                                }
                                if (m.signature != null && m.hasOwnProperty("signature")) {
                                    d.signature = o.bytes === String ? $util.base64.encode(m.signature, 0, m.signature.length) : o.bytes === Array ? Array.prototype.slice.call(m.signature) : m.signature;
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
                                        if (p[ks[i]] != null)
                                            this[ks[i]] = p[ks[i]];
                            }
                            Multi.prototype.bitarray = null;
                            Multi.prototype.signatures = $util.emptyArray;
                            Multi.create = function create(properties) {
                                return new Multi(properties);
                            };
                            Multi.encode = function encode(m, w) {
                                if (!w)
                                    w = $Writer.create();
                                if (m.bitarray != null && Object.hasOwnProperty.call(m, "bitarray"))
                                    $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.encode(m.bitarray, w.uint32(10).fork()).ldelim();
                                if (m.signatures != null && m.signatures.length) {
                                    for (var i = 0; i < m.signatures.length; ++i)
                                        $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.encode(m.signatures[i], w.uint32(18).fork()).ldelim();
                                }
                                return w;
                            };
                            Multi.decode = function decode(r, l) {
                                if (!(r instanceof $Reader))
                                    r = $Reader.create(r);
                                var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                                while (r.pos < c) {
                                    var t = r.uint32();
                                    switch (t >>> 3) {
                                        case 1:
                                            m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.decode(r, r.uint32());
                                            break;
                                        case 2:
                                            if (!(m.signatures && m.signatures.length))
                                                m.signatures = [];
                                            m.signatures.push($root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.decode(r, r.uint32()));
                                            break;
                                        default:
                                            r.skipType(t & 7);
                                            break;
                                    }
                                }
                                return m;
                            };
                            Multi.fromObject = function fromObject(d) {
                                if (d instanceof $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi)
                                    return d;
                                var m = new $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi();
                                if (d.bitarray != null) {
                                    if (typeof d.bitarray !== "object")
                                        throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.bitarray: object expected");
                                    m.bitarray = $root.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject(d.bitarray);
                                }
                                if (d.signatures) {
                                    if (!Array.isArray(d.signatures))
                                        throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: array expected");
                                    m.signatures = [];
                                    for (var i = 0; i < d.signatures.length; ++i) {
                                        if (typeof d.signatures[i] !== "object")
                                            throw TypeError(".cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.Multi.signatures: object expected");
                                        m.signatures[i] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.fromObject(d.signatures[i]);
                                    }
                                }
                                return m;
                            };
                            Multi.toObject = function toObject(m, o) {
                                if (!o)
                                    o = {};
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
                                        d.signatures[j] = $root.cosmos.tx.signing.v1beta1.SignatureDescriptor.Data.toObject(m.signatures[j], o);
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
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }
            Any.prototype.type_url = "";
            Any.prototype.value = $util.newBuffer([]);
            Any.create = function create(properties) {
                return new Any(properties);
            };
            Any.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.type_url != null && Object.hasOwnProperty.call(m, "type_url"))
                    w.uint32(10).string(m.type_url);
                if (m.value != null && Object.hasOwnProperty.call(m, "value"))
                    w.uint32(18).bytes(m.value);
                return w;
            };
            Any.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.Any();
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
                if (d instanceof $root.google.protobuf.Any)
                    return d;
                var m = new $root.google.protobuf.Any();
                if (d.type_url != null) {
                    m.type_url = String(d.type_url);
                }
                if (d.value != null) {
                    if (typeof d.value === "string")
                        $util.base64.decode(d.value, m.value = $util.newBuffer($util.base64.length(d.value)), 0);
                    else if (d.value.length)
                        m.value = d.value;
                }
                return m;
            };
            Any.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    d.type_url = "";
                    if (o.bytes === String)
                        d.value = "";
                    else {
                        d.value = [];
                        if (o.bytes !== Array)
                            d.value = $util.newBuffer(d.value);
                    }
                }
                if (m.type_url != null && m.hasOwnProperty("type_url")) {
                    d.type_url = m.type_url;
                }
                if (m.value != null && m.hasOwnProperty("value")) {
                    d.value = o.bytes === String ? $util.base64.encode(m.value, 0, m.value.length) : o.bytes === Array ? Array.prototype.slice.call(m.value) : m.value;
                }
                return d;
            };
            Any.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            return Any;
        })();
        protobuf.Timestamp = (function () {
            function Timestamp(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0, 0, false) : 0;
            Timestamp.prototype.nanos = 0;
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };
            Timestamp.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
                    w.uint32(8).int64(m.seconds);
                if (m.nanos != null && Object.hasOwnProperty.call(m, "nanos"))
                    w.uint32(16).int32(m.nanos);
                return w;
            };
            Timestamp.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.google.protobuf.Timestamp();
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
                if (d instanceof $root.google.protobuf.Timestamp)
                    return d;
                var m = new $root.google.protobuf.Timestamp();
                if (d.seconds != null) {
                    if ($util.Long)
                        (m.seconds = $util.Long.fromValue(d.seconds)).unsigned = false;
                    else if (typeof d.seconds === "string")
                        m.seconds = parseInt(d.seconds, 10);
                    else if (typeof d.seconds === "number")
                        m.seconds = d.seconds;
                    else if (typeof d.seconds === "object")
                        m.seconds = new $util.LongBits(d.seconds.low >>> 0, d.seconds.high >>> 0).toNumber();
                }
                if (d.nanos != null) {
                    m.nanos = d.nanos | 0;
                }
                return m;
            };
            Timestamp.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (o.defaults) {
                    if ($util.Long) {
                        var n = new $util.Long(0, 0, false);
                        d.seconds = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                    }
                    else
                        d.seconds = o.longs === String ? "0" : 0;
                    d.nanos = 0;
                }
                if (m.seconds != null && m.hasOwnProperty("seconds")) {
                    if (typeof m.seconds === "number")
                        d.seconds = o.longs === String ? String(m.seconds) : m.seconds;
                    else
                        d.seconds = o.longs === String ? $util.Long.prototype.toString.call(m.seconds) : o.longs === Number ? new $util.LongBits(m.seconds.low >>> 0, m.seconds.high >>> 0).toNumber() : m.seconds;
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
                    Object.defineProperty(Msg.prototype.transfer = function transfer(request, callback) {
                        return this.rpcCall(transfer, $root.ibc.applications.transfer.v1.MsgTransfer, $root.ibc.applications.transfer.v1.MsgTransferResponse, request, callback);
                    }, "name", { value: "Transfer" });
                    return Msg;
                })();
                v1.MsgTransfer = (function () {
                    function MsgTransfer(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
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
                        if (!w)
                            w = $Writer.create();
                        if (m.sourcePort != null && Object.hasOwnProperty.call(m, "sourcePort"))
                            w.uint32(10).string(m.sourcePort);
                        if (m.sourceChannel != null && Object.hasOwnProperty.call(m, "sourceChannel"))
                            w.uint32(18).string(m.sourceChannel);
                        if (m.token != null && Object.hasOwnProperty.call(m, "token"))
                            $root.cosmos.base.v1beta1.Coin.encode(m.token, w.uint32(26).fork()).ldelim();
                        if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
                            w.uint32(34).string(m.sender);
                        if (m.receiver != null && Object.hasOwnProperty.call(m, "receiver"))
                            w.uint32(42).string(m.receiver);
                        if (m.timeoutHeight != null && Object.hasOwnProperty.call(m, "timeoutHeight"))
                            $root.ibc.core.client.v1.Height.encode(m.timeoutHeight, w.uint32(50).fork()).ldelim();
                        if (m.timeoutTimestamp != null && Object.hasOwnProperty.call(m, "timeoutTimestamp"))
                            w.uint32(56).uint64(m.timeoutTimestamp);
                        return w;
                    };
                    MsgTransfer.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.ibc.applications.transfer.v1.MsgTransfer();
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
                        if (d instanceof $root.ibc.applications.transfer.v1.MsgTransfer)
                            return d;
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
                            if ($util.Long)
                                (m.timeoutTimestamp = $util.Long.fromValue(d.timeoutTimestamp)).unsigned = true;
                            else if (typeof d.timeoutTimestamp === "string")
                                m.timeoutTimestamp = parseInt(d.timeoutTimestamp, 10);
                            else if (typeof d.timeoutTimestamp === "number")
                                m.timeoutTimestamp = d.timeoutTimestamp;
                            else if (typeof d.timeoutTimestamp === "object")
                                m.timeoutTimestamp = new $util.LongBits(d.timeoutTimestamp.low >>> 0, d.timeoutTimestamp.high >>> 0).toNumber(true);
                        }
                        return m;
                    };
                    MsgTransfer.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
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
                                d.timeoutTimestamp = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                            }
                            else
                                d.timeoutTimestamp = o.longs === String ? "0" : 0;
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
                                d.timeoutTimestamp = o.longs === String ? $util.Long.prototype.toString.call(m.timeoutTimestamp) : o.longs === Number ? new $util.LongBits(m.timeoutTimestamp.low >>> 0, m.timeoutTimestamp.high >>> 0).toNumber(true) : m.timeoutTimestamp;
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
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    MsgTransferResponse.create = function create(properties) {
                        return new MsgTransferResponse(properties);
                    };
                    MsgTransferResponse.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        return w;
                    };
                    MsgTransferResponse.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.ibc.applications.transfer.v1.MsgTransferResponse();
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
                        if (d instanceof $root.ibc.applications.transfer.v1.MsgTransferResponse)
                            return d;
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
    ibc.core = (function () {
        const core = {};
        core.client = (function () {
            const client = {};
            client.v1 = (function () {
                const v1 = {};
                v1.Height = (function () {
                    function Height(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    Height.prototype.revisionNumber = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                    Height.prototype.revisionHeight = $util.Long ? $util.Long.fromBits(0, 0, true) : 0;
                    Height.create = function create(properties) {
                        return new Height(properties);
                    };
                    Height.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.revisionNumber != null && Object.hasOwnProperty.call(m, "revisionNumber"))
                            w.uint32(8).uint64(m.revisionNumber);
                        if (m.revisionHeight != null && Object.hasOwnProperty.call(m, "revisionHeight"))
                            w.uint32(16).uint64(m.revisionHeight);
                        return w;
                    };
                    Height.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.ibc.core.client.v1.Height();
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
                        if (d instanceof $root.ibc.core.client.v1.Height)
                            return d;
                        var m = new $root.ibc.core.client.v1.Height();
                        if (d.revisionNumber != null) {
                            if ($util.Long)
                                (m.revisionNumber = $util.Long.fromValue(d.revisionNumber)).unsigned = true;
                            else if (typeof d.revisionNumber === "string")
                                m.revisionNumber = parseInt(d.revisionNumber, 10);
                            else if (typeof d.revisionNumber === "number")
                                m.revisionNumber = d.revisionNumber;
                            else if (typeof d.revisionNumber === "object")
                                m.revisionNumber = new $util.LongBits(d.revisionNumber.low >>> 0, d.revisionNumber.high >>> 0).toNumber(true);
                        }
                        if (d.revisionHeight != null) {
                            if ($util.Long)
                                (m.revisionHeight = $util.Long.fromValue(d.revisionHeight)).unsigned = true;
                            else if (typeof d.revisionHeight === "string")
                                m.revisionHeight = parseInt(d.revisionHeight, 10);
                            else if (typeof d.revisionHeight === "number")
                                m.revisionHeight = d.revisionHeight;
                            else if (typeof d.revisionHeight === "object")
                                m.revisionHeight = new $util.LongBits(d.revisionHeight.low >>> 0, d.revisionHeight.high >>> 0).toNumber(true);
                        }
                        return m;
                    };
                    Height.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            if ($util.Long) {
                                var n = new $util.Long(0, 0, true);
                                d.revisionNumber = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                            }
                            else
                                d.revisionNumber = o.longs === String ? "0" : 0;
                            if ($util.Long) {
                                var n = new $util.Long(0, 0, true);
                                d.revisionHeight = o.longs === String ? n.toString() : o.longs === Number ? n.toNumber() : n;
                            }
                            else
                                d.revisionHeight = o.longs === String ? "0" : 0;
                        }
                        if (m.revisionNumber != null && m.hasOwnProperty("revisionNumber")) {
                            if (typeof m.revisionNumber === "number")
                                d.revisionNumber = o.longs === String ? String(m.revisionNumber) : m.revisionNumber;
                            else
                                d.revisionNumber = o.longs === String ? $util.Long.prototype.toString.call(m.revisionNumber) : o.longs === Number ? new $util.LongBits(m.revisionNumber.low >>> 0, m.revisionNumber.high >>> 0).toNumber(true) : m.revisionNumber;
                        }
                        if (m.revisionHeight != null && m.hasOwnProperty("revisionHeight")) {
                            if (typeof m.revisionHeight === "number")
                                d.revisionHeight = o.longs === String ? String(m.revisionHeight) : m.revisionHeight;
                            else
                                d.revisionHeight = o.longs === String ? $util.Long.prototype.toString.call(m.revisionHeight) : o.longs === Number ? new $util.LongBits(m.revisionHeight.low >>> 0, m.revisionHeight.high >>> 0).toNumber(true) : m.revisionHeight;
                        }
                        return d;
                    };
                    Height.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };
                    return Height;
                })();
                return v1;
            })();
            return client;
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
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }
            PublicKey.prototype.ed25519 = $util.newBuffer([]);
            PublicKey.prototype.secp256k1 = $util.newBuffer([]);
            let $oneOfFields;
            Object.defineProperty(PublicKey.prototype, "sum", {
                get: $util.oneOfGetter($oneOfFields = ["ed25519", "secp256k1"]),
                set: $util.oneOfSetter($oneOfFields)
            });
            PublicKey.create = function create(properties) {
                return new PublicKey(properties);
            };
            PublicKey.encode = function encode(m, w) {
                if (!w)
                    w = $Writer.create();
                if (m.ed25519 != null && Object.hasOwnProperty.call(m, "ed25519"))
                    w.uint32(10).bytes(m.ed25519);
                if (m.secp256k1 != null && Object.hasOwnProperty.call(m, "secp256k1"))
                    w.uint32(18).bytes(m.secp256k1);
                return w;
            };
            PublicKey.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.tendermint.crypto.PublicKey();
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
                if (d instanceof $root.tendermint.crypto.PublicKey)
                    return d;
                var m = new $root.tendermint.crypto.PublicKey();
                if (d.ed25519 != null) {
                    if (typeof d.ed25519 === "string")
                        $util.base64.decode(d.ed25519, m.ed25519 = $util.newBuffer($util.base64.length(d.ed25519)), 0);
                    else if (d.ed25519.length)
                        m.ed25519 = d.ed25519;
                }
                if (d.secp256k1 != null) {
                    if (typeof d.secp256k1 === "string")
                        $util.base64.decode(d.secp256k1, m.secp256k1 = $util.newBuffer($util.base64.length(d.secp256k1)), 0);
                    else if (d.secp256k1.length)
                        m.secp256k1 = d.secp256k1;
                }
                return m;
            };
            PublicKey.toObject = function toObject(m, o) {
                if (!o)
                    o = {};
                var d = {};
                if (m.ed25519 != null && m.hasOwnProperty("ed25519")) {
                    d.ed25519 = o.bytes === String ? $util.base64.encode(m.ed25519, 0, m.ed25519.length) : o.bytes === Array ? Array.prototype.slice.call(m.ed25519) : m.ed25519;
                    if (o.oneofs)
                        d.sum = "ed25519";
                }
                if (m.secp256k1 != null && m.hasOwnProperty("secp256k1")) {
                    d.secp256k1 = o.bytes === String ? $util.base64.encode(m.secp256k1, 0, m.secp256k1.length) : o.bytes === Array ? Array.prototype.slice.call(m.secp256k1) : m.secp256k1;
                    if (o.oneofs)
                        d.sum = "secp256k1";
                }
                return d;
            };
            PublicKey.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
            return PublicKey;
        })();
        return crypto;
    })();
    return tendermint;
})();
module.exports = $root;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tendermint = exports.secret = exports.cosmwasm = exports.ibc = exports.google = exports.cosmos = void 0;
var $protobuf = require("protobufjs/minimal");
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $root = {};
exports.cosmos = $root.cosmos = (() => {
    const cosmos = {};
    cosmos.bank = (function () {
        const bank = {};
        bank.v1beta1 = (function () {
            const v1beta1 = {};
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
                MsgSend.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgSend.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
            return v1beta1;
        })();
        return bank;
    })();
    cosmos.staking = (function () {
        const staking = {};
        staking.v1beta1 = (function () {
            const v1beta1 = {};
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
                MsgDelegate.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgDelegate.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                MsgBeginRedelegate.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgBeginRedelegate.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                MsgUndelegate.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgUndelegate.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                MsgVote.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgVote.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                MsgDeposit.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgDeposit.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
            return v1beta1;
        })();
        return gov;
    })();
    cosmos.distribution = (function () {
        const distribution = {};
        distribution.v1beta1 = (function () {
            const v1beta1 = {};
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
                MsgWithdrawDelegatorReward.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                MsgWithdrawDelegatorReward.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                Coin.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                Coin.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                DecCoin.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                DecCoin.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                IntProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                IntProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                DecProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                DecProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
        base.abci = (function () {
            const abci = {};
            abci.v1beta1 = (function () {
                const v1beta1 = {};
                v1beta1.MsgData = (function () {
                    function MsgData(p) {
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    MsgData.prototype.msgType = "";
                    MsgData.prototype.data = $util.newBuffer([]);
                    MsgData.create = function create(properties) {
                        return new MsgData(properties);
                    };
                    MsgData.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.msgType != null && Object.hasOwnProperty.call(m, "msgType"))
                            w.uint32(10).string(m.msgType);
                        if (m.data != null && Object.hasOwnProperty.call(m, "data"))
                            w.uint32(18).bytes(m.data);
                        return w;
                    };
                    MsgData.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };
                    MsgData.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.base.abci.v1beta1.MsgData();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                                case 1:
                                    m.msgType = r.string();
                                    break;
                                case 2:
                                    m.data = r.bytes();
                                    break;
                                default:
                                    r.skipType(t & 7);
                                    break;
                            }
                        }
                        return m;
                    };
                    MsgData.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };
                    MsgData.fromObject = function fromObject(d) {
                        if (d instanceof $root.cosmos.base.abci.v1beta1.MsgData)
                            return d;
                        var m = new $root.cosmos.base.abci.v1beta1.MsgData();
                        if (d.msgType != null) {
                            m.msgType = String(d.msgType);
                        }
                        if (d.data != null) {
                            if (typeof d.data === "string")
                                $util.base64.decode(d.data, m.data = $util.newBuffer($util.base64.length(d.data)), 0);
                            else if (d.data.length)
                                m.data = d.data;
                        }
                        return m;
                    };
                    MsgData.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.defaults) {
                            d.msgType = "";
                            if (o.bytes === String)
                                d.data = "";
                            else {
                                d.data = [];
                                if (o.bytes !== Array)
                                    d.data = $util.newBuffer(d.data);
                            }
                        }
                        if (m.msgType != null && m.hasOwnProperty("msgType")) {
                            d.msgType = m.msgType;
                        }
                        if (m.data != null && m.hasOwnProperty("data")) {
                            d.data = o.bytes === String ? $util.base64.encode(m.data, 0, m.data.length) : o.bytes === Array ? Array.prototype.slice.call(m.data) : m.data;
                        }
                        return d;
                    };
                    MsgData.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };
                    return MsgData;
                })();
                v1beta1.TxMsgData = (function () {
                    function TxMsgData(p) {
                        this.data = [];
                        if (p)
                            for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                                if (p[ks[i]] != null)
                                    this[ks[i]] = p[ks[i]];
                    }
                    TxMsgData.prototype.data = $util.emptyArray;
                    TxMsgData.create = function create(properties) {
                        return new TxMsgData(properties);
                    };
                    TxMsgData.encode = function encode(m, w) {
                        if (!w)
                            w = $Writer.create();
                        if (m.data != null && m.data.length) {
                            for (var i = 0; i < m.data.length; ++i)
                                $root.cosmos.base.abci.v1beta1.MsgData.encode(m.data[i], w.uint32(10).fork()).ldelim();
                        }
                        return w;
                    };
                    TxMsgData.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
                    };
                    TxMsgData.decode = function decode(r, l) {
                        if (!(r instanceof $Reader))
                            r = $Reader.create(r);
                        var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmos.base.abci.v1beta1.TxMsgData();
                        while (r.pos < c) {
                            var t = r.uint32();
                            switch (t >>> 3) {
                                case 1:
                                    if (!(m.data && m.data.length))
                                        m.data = [];
                                    m.data.push($root.cosmos.base.abci.v1beta1.MsgData.decode(r, r.uint32()));
                                    break;
                                default:
                                    r.skipType(t & 7);
                                    break;
                            }
                        }
                        return m;
                    };
                    TxMsgData.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
                    };
                    TxMsgData.fromObject = function fromObject(d) {
                        if (d instanceof $root.cosmos.base.abci.v1beta1.TxMsgData)
                            return d;
                        var m = new $root.cosmos.base.abci.v1beta1.TxMsgData();
                        if (d.data) {
                            if (!Array.isArray(d.data))
                                throw TypeError(".cosmos.base.abci.v1beta1.TxMsgData.data: array expected");
                            m.data = [];
                            for (var i = 0; i < d.data.length; ++i) {
                                if (typeof d.data[i] !== "object")
                                    throw TypeError(".cosmos.base.abci.v1beta1.TxMsgData.data: object expected");
                                m.data[i] = $root.cosmos.base.abci.v1beta1.MsgData.fromObject(d.data[i]);
                            }
                        }
                        return m;
                    };
                    TxMsgData.toObject = function toObject(m, o) {
                        if (!o)
                            o = {};
                        var d = {};
                        if (o.arrays || o.defaults) {
                            d.data = [];
                        }
                        if (m.data && m.data.length) {
                            d.data = [];
                            for (var j = 0; j < m.data.length; ++j) {
                                d.data[j] = $root.cosmos.base.abci.v1beta1.MsgData.toObject(m.data[j], o);
                            }
                        }
                        return d;
                    };
                    TxMsgData.prototype.toJSON = function toJSON() {
                        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                    };
                    return TxMsgData;
                })();
                return v1beta1;
            })();
            return abci;
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
                    MultiSignature.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    MultiSignature.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                    CompactBitArray.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    CompactBitArray.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                PubKey.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                PubKey.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                PrivKey.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                PrivKey.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                Tx.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                Tx.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                TxRaw.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                TxRaw.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                SignDoc.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                SignDoc.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                TxBody.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                TxBody.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                AuthInfo.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                AuthInfo.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                SignerInfo.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                SignerInfo.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                ModeInfo.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                ModeInfo.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                    Single.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    Single.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                    Multi.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    Multi.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                Fee.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
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
                Fee.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
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
                    SignatureDescriptors.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    SignatureDescriptors.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                    SignatureDescriptor.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    SignatureDescriptor.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                        Data.encodeDelimited = function encodeDelimited(message, writer) {
                            return this.encode(message, writer).ldelim();
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
                        Data.decodeDelimited = function decodeDelimited(reader) {
                            if (!(reader instanceof $Reader))
                                reader = new $Reader(reader);
                            return this.decode(reader, reader.uint32());
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
                            Single.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim();
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
                            Single.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader))
                                    reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32());
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
                            Multi.encodeDelimited = function encodeDelimited(message, writer) {
                                return this.encode(message, writer).ldelim();
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
                            Multi.decodeDelimited = function decodeDelimited(reader) {
                                if (!(reader instanceof $Reader))
                                    reader = new $Reader(reader);
                                return this.decode(reader, reader.uint32());
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
            Any.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
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
            Any.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
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
                    MsgTransfer.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    MsgTransfer.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
                    Height.encodeDelimited = function encodeDelimited(message, writer) {
                        return this.encode(message, writer).ldelim();
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
                    Height.decodeDelimited = function decodeDelimited(reader) {
                        if (!(reader instanceof $Reader))
                            reader = new $Reader(reader);
                        return this.decode(reader, reader.uint32());
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
exports.cosmwasm = $root.cosmwasm = (() => {
    const cosmwasm = {};
    cosmwasm.wasm = (function () {
        const wasm = {};
        wasm.v1 = (function () {
            const v1 = {};
            v1.MsgExecuteContract = (function () {
                function MsgExecuteContract(p) {
                    this.funds = [];
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgExecuteContract.prototype.sender = "";
                MsgExecuteContract.prototype.contract = "";
                MsgExecuteContract.prototype.msg = $util.newBuffer([]);
                MsgExecuteContract.prototype.funds = $util.emptyArray;
                MsgExecuteContract.create = function create(properties) {
                    return new MsgExecuteContract(properties);
                };
                MsgExecuteContract.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
                        w.uint32(10).string(m.sender);
                    if (m.contract != null && Object.hasOwnProperty.call(m, "contract"))
                        w.uint32(18).string(m.contract);
                    if (m.msg != null && Object.hasOwnProperty.call(m, "msg"))
                        w.uint32(26).bytes(m.msg);
                    if (m.funds != null && m.funds.length) {
                        for (var i = 0; i < m.funds.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.funds[i], w.uint32(42).fork()).ldelim();
                    }
                    return w;
                };
                MsgExecuteContract.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
                MsgExecuteContract.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.cosmwasm.wasm.v1.MsgExecuteContract();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.sender = r.string();
                                break;
                            case 2:
                                m.contract = r.string();
                                break;
                            case 3:
                                m.msg = r.bytes();
                                break;
                            case 5:
                                if (!(m.funds && m.funds.length))
                                    m.funds = [];
                                m.funds.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
                                break;
                            default:
                                r.skipType(t & 7);
                                break;
                        }
                    }
                    return m;
                };
                MsgExecuteContract.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
                MsgExecuteContract.fromObject = function fromObject(d) {
                    if (d instanceof $root.cosmwasm.wasm.v1.MsgExecuteContract)
                        return d;
                    var m = new $root.cosmwasm.wasm.v1.MsgExecuteContract();
                    if (d.sender != null) {
                        m.sender = String(d.sender);
                    }
                    if (d.contract != null) {
                        m.contract = String(d.contract);
                    }
                    if (d.msg != null) {
                        if (typeof d.msg === "string")
                            $util.base64.decode(d.msg, m.msg = $util.newBuffer($util.base64.length(d.msg)), 0);
                        else if (d.msg.length)
                            m.msg = d.msg;
                    }
                    if (d.funds) {
                        if (!Array.isArray(d.funds))
                            throw TypeError(".cosmwasm.wasm.v1.MsgExecuteContract.funds: array expected");
                        m.funds = [];
                        for (var i = 0; i < d.funds.length; ++i) {
                            if (typeof d.funds[i] !== "object")
                                throw TypeError(".cosmwasm.wasm.v1.MsgExecuteContract.funds: object expected");
                            m.funds[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.funds[i]);
                        }
                    }
                    return m;
                };
                MsgExecuteContract.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.arrays || o.defaults) {
                        d.funds = [];
                    }
                    if (o.defaults) {
                        d.sender = "";
                        d.contract = "";
                        if (o.bytes === String)
                            d.msg = "";
                        else {
                            d.msg = [];
                            if (o.bytes !== Array)
                                d.msg = $util.newBuffer(d.msg);
                        }
                    }
                    if (m.sender != null && m.hasOwnProperty("sender")) {
                        d.sender = m.sender;
                    }
                    if (m.contract != null && m.hasOwnProperty("contract")) {
                        d.contract = m.contract;
                    }
                    if (m.msg != null && m.hasOwnProperty("msg")) {
                        d.msg = o.bytes === String ? $util.base64.encode(m.msg, 0, m.msg.length) : o.bytes === Array ? Array.prototype.slice.call(m.msg) : m.msg;
                    }
                    if (m.funds && m.funds.length) {
                        d.funds = [];
                        for (var j = 0; j < m.funds.length; ++j) {
                            d.funds[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.funds[j], o);
                        }
                    }
                    return d;
                };
                MsgExecuteContract.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgExecuteContract;
            })();
            return v1;
        })();
        return wasm;
    })();
    return cosmwasm;
})();
exports.secret = $root.secret = (() => {
    const secret = {};
    secret.compute = (function () {
        const compute = {};
        compute.v1beta1 = (function () {
            const v1beta1 = {};
            v1beta1.MsgExecuteContract = (function () {
                function MsgExecuteContract(p) {
                    this.sentFunds = [];
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }
                MsgExecuteContract.prototype.sender = $util.newBuffer([]);
                MsgExecuteContract.prototype.contract = $util.newBuffer([]);
                MsgExecuteContract.prototype.msg = $util.newBuffer([]);
                MsgExecuteContract.prototype.callbackCodeHash = "";
                MsgExecuteContract.prototype.sentFunds = $util.emptyArray;
                MsgExecuteContract.prototype.callbackSig = $util.newBuffer([]);
                MsgExecuteContract.create = function create(properties) {
                    return new MsgExecuteContract(properties);
                };
                MsgExecuteContract.encode = function encode(m, w) {
                    if (!w)
                        w = $Writer.create();
                    if (m.sender != null && Object.hasOwnProperty.call(m, "sender"))
                        w.uint32(10).bytes(m.sender);
                    if (m.contract != null && Object.hasOwnProperty.call(m, "contract"))
                        w.uint32(18).bytes(m.contract);
                    if (m.msg != null && Object.hasOwnProperty.call(m, "msg"))
                        w.uint32(26).bytes(m.msg);
                    if (m.callbackCodeHash != null && Object.hasOwnProperty.call(m, "callbackCodeHash"))
                        w.uint32(34).string(m.callbackCodeHash);
                    if (m.sentFunds != null && m.sentFunds.length) {
                        for (var i = 0; i < m.sentFunds.length; ++i)
                            $root.cosmos.base.v1beta1.Coin.encode(m.sentFunds[i], w.uint32(42).fork()).ldelim();
                    }
                    if (m.callbackSig != null && Object.hasOwnProperty.call(m, "callbackSig"))
                        w.uint32(50).bytes(m.callbackSig);
                    return w;
                };
                MsgExecuteContract.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };
                MsgExecuteContract.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.secret.compute.v1beta1.MsgExecuteContract();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                            case 1:
                                m.sender = r.bytes();
                                break;
                            case 2:
                                m.contract = r.bytes();
                                break;
                            case 3:
                                m.msg = r.bytes();
                                break;
                            case 4:
                                m.callbackCodeHash = r.string();
                                break;
                            case 5:
                                if (!(m.sentFunds && m.sentFunds.length))
                                    m.sentFunds = [];
                                m.sentFunds.push($root.cosmos.base.v1beta1.Coin.decode(r, r.uint32()));
                                break;
                            case 6:
                                m.callbackSig = r.bytes();
                                break;
                            default:
                                r.skipType(t & 7);
                                break;
                        }
                    }
                    return m;
                };
                MsgExecuteContract.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };
                MsgExecuteContract.fromObject = function fromObject(d) {
                    if (d instanceof $root.secret.compute.v1beta1.MsgExecuteContract)
                        return d;
                    var m = new $root.secret.compute.v1beta1.MsgExecuteContract();
                    if (d.sender != null) {
                        if (typeof d.sender === "string")
                            $util.base64.decode(d.sender, m.sender = $util.newBuffer($util.base64.length(d.sender)), 0);
                        else if (d.sender.length)
                            m.sender = d.sender;
                    }
                    if (d.contract != null) {
                        if (typeof d.contract === "string")
                            $util.base64.decode(d.contract, m.contract = $util.newBuffer($util.base64.length(d.contract)), 0);
                        else if (d.contract.length)
                            m.contract = d.contract;
                    }
                    if (d.msg != null) {
                        if (typeof d.msg === "string")
                            $util.base64.decode(d.msg, m.msg = $util.newBuffer($util.base64.length(d.msg)), 0);
                        else if (d.msg.length)
                            m.msg = d.msg;
                    }
                    if (d.callbackCodeHash != null) {
                        m.callbackCodeHash = String(d.callbackCodeHash);
                    }
                    if (d.sentFunds) {
                        if (!Array.isArray(d.sentFunds))
                            throw TypeError(".secret.compute.v1beta1.MsgExecuteContract.sentFunds: array expected");
                        m.sentFunds = [];
                        for (var i = 0; i < d.sentFunds.length; ++i) {
                            if (typeof d.sentFunds[i] !== "object")
                                throw TypeError(".secret.compute.v1beta1.MsgExecuteContract.sentFunds: object expected");
                            m.sentFunds[i] = $root.cosmos.base.v1beta1.Coin.fromObject(d.sentFunds[i]);
                        }
                    }
                    if (d.callbackSig != null) {
                        if (typeof d.callbackSig === "string")
                            $util.base64.decode(d.callbackSig, m.callbackSig = $util.newBuffer($util.base64.length(d.callbackSig)), 0);
                        else if (d.callbackSig.length)
                            m.callbackSig = d.callbackSig;
                    }
                    return m;
                };
                MsgExecuteContract.toObject = function toObject(m, o) {
                    if (!o)
                        o = {};
                    var d = {};
                    if (o.arrays || o.defaults) {
                        d.sentFunds = [];
                    }
                    if (o.defaults) {
                        if (o.bytes === String)
                            d.sender = "";
                        else {
                            d.sender = [];
                            if (o.bytes !== Array)
                                d.sender = $util.newBuffer(d.sender);
                        }
                        if (o.bytes === String)
                            d.contract = "";
                        else {
                            d.contract = [];
                            if (o.bytes !== Array)
                                d.contract = $util.newBuffer(d.contract);
                        }
                        if (o.bytes === String)
                            d.msg = "";
                        else {
                            d.msg = [];
                            if (o.bytes !== Array)
                                d.msg = $util.newBuffer(d.msg);
                        }
                        d.callbackCodeHash = "";
                        if (o.bytes === String)
                            d.callbackSig = "";
                        else {
                            d.callbackSig = [];
                            if (o.bytes !== Array)
                                d.callbackSig = $util.newBuffer(d.callbackSig);
                        }
                    }
                    if (m.sender != null && m.hasOwnProperty("sender")) {
                        d.sender = o.bytes === String ? $util.base64.encode(m.sender, 0, m.sender.length) : o.bytes === Array ? Array.prototype.slice.call(m.sender) : m.sender;
                    }
                    if (m.contract != null && m.hasOwnProperty("contract")) {
                        d.contract = o.bytes === String ? $util.base64.encode(m.contract, 0, m.contract.length) : o.bytes === Array ? Array.prototype.slice.call(m.contract) : m.contract;
                    }
                    if (m.msg != null && m.hasOwnProperty("msg")) {
                        d.msg = o.bytes === String ? $util.base64.encode(m.msg, 0, m.msg.length) : o.bytes === Array ? Array.prototype.slice.call(m.msg) : m.msg;
                    }
                    if (m.callbackCodeHash != null && m.hasOwnProperty("callbackCodeHash")) {
                        d.callbackCodeHash = m.callbackCodeHash;
                    }
                    if (m.sentFunds && m.sentFunds.length) {
                        d.sentFunds = [];
                        for (var j = 0; j < m.sentFunds.length; ++j) {
                            d.sentFunds[j] = $root.cosmos.base.v1beta1.Coin.toObject(m.sentFunds[j], o);
                        }
                    }
                    if (m.callbackSig != null && m.hasOwnProperty("callbackSig")) {
                        d.callbackSig = o.bytes === String ? $util.base64.encode(m.callbackSig, 0, m.callbackSig.length) : o.bytes === Array ? Array.prototype.slice.call(m.callbackSig) : m.callbackSig;
                    }
                    return d;
                };
                MsgExecuteContract.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };
                return MsgExecuteContract;
            })();
            return v1beta1;
        })();
        return compute;
    })();
    return secret;
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
            PublicKey.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
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
            PublicKey.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
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

"use strict";

function t(t) {
    return t && "object" == typeof t && "default" in t ? t.default : t
}
Object.defineProperty(exports, "__esModule", {
    value: !0
});
var e = t(require("bitcoinsource")),
    n = t(require("axios"));
const s = "testnet",
    r = 546,
    a = 2750,
    i = 2e3,
    o = "https://tbch.blockdozer.com/api",
    u = "http://localhost:3000";
var c = {
    BITCOIN_NETWORK: "testnet",
    BLOCK_EXPLORER_URL: o,
    MIN_SATOSHI_AMOUNT: 546,
    MIN_NON_DUST_AMOUNT: 2750,
    UN_P2SH_URL: u,
    DEFAULT_FEE: 2e3
};
e.versionGuard = (() => !0), e.Networks.defaultNetwork = e.Networks[c.BITCOIN_NETWORK];
class d {
    constructor(t) {
        this.kind = t
    }
    toJSON() {
        return {}
    }
}
class h extends Error {
    constructor(t, e, ...n) {
        super(...n), this.name = "Error", this.message = t + (e ? `: ${e}` : ""), Error.captureStackTrace && Error.captureStackTrace(this, h)
    }
}

function p(t) {
    return {
        writable: !0,
        value: t
    }
}

function l(t) {
    return Buffer.from(t)
}

function m(t) {
    return t.toString()
}

function w(t, e, {
    [t]: n,
    ...s
}) {
    return {
        [e]: n,
        ...s
    }
}
const g = async t => {
    try {
        return (await t).data
    } catch (t) {
        if (t.response) {
            const {
                status: e,
                statusText: n,
                data: s
            } = t.response, {
                method: r,
                url: a
            } = t.response.config || {
                method: "unknown",
                url: "unknown"
            }, i = t.response.config.data, o = s.error || (-1 !== s.indexOf("Code:") ? s : n);
            throw new h(`\nCommunication Error\n\nstatus\t${e} ${n}\nmessage\t${o}\nrequest\t${r} ${a}${i?`\ndata\t${i}`:""}`)
        }
        throw new h("Communication error", "Service unavailable.")
    }
}, f = async (t, e = c.BLOCK_EXPLORER_URL) => g(n.get(`${e}${t}`)), y = async (t, e, s = c.BLOCK_EXPLORER_URL) => g(n.post(`${s}${t}`, e)), S = async t => f(`/addr/${t.toString()}`), b = async t => {
    const {
        balanceSat: e,
        unconfirmedBalanceSat: n
    } = await S(t);
    return e + n
}, O = async t => {
    return w("txid", "txId", await y("/tx/send", {
        rawtx: t.toString()
    }))
}, P = t => t.filter((t, e, n) => n.findIndex(e => e.txId === t.txId && e.vout === t.vout) === e), x = async t => f(`/tx/${t}`), I = async t => {
    return (await f(`/rawtx/${t}`)).rawtx
}, D = async t => {
    const e = t.toString(),
        n = (await f(`/addr/${e}/utxo`)).map(t => w("txid", "txId", t));
    return P(n).map(t => (t.spent = !1, t))
}, K = async t => {
    const e = await x(t.txId),
        n = e.vout[t.outputNumber],
        s = n.scriptPubKey.addresses[0],
        {
            txId: r
        } = t,
        a = t.outputNumber,
        i = parseFloat(n.value),
        o = 1e8 * i,
        u = e.blockheight,
        {
            confirmations: c
        } = e,
        d = !!n.spentTxId;
    return {
        address: s,
        txId: r,
        vout: a,
        scriptPubKey: n.scriptPubKey.hex,
        amount: i,
        satoshis: o,
        height: u,
        confirmations: c,
        spent: d
    }
}, N = async t => y("/", t, c.UN_P2SH_URL), _ = async t => f(`/un-p2sh/${t}`, c.UN_P2SH_URL), k = async t => f(`/txos/${t}`, c.UN_P2SH_URL), M = async (t, e) => y("/txos/set-spent/", {
    txId: t,
    vOut: e
}, c.UN_P2SH_URL), {
    PublicKey: T,
    Transaction: v
} = e;
class E extends d {
    constructor(t, e, n) {
        super("script"), this.publicKeys = e || [], this.data = t || [], this.amount = n || c.MIN_NON_DUST_AMOUNT
    }
    getData(t) {
        return this.data[t]
    }
    getSerializeData() {
        return Object.entries(this.data).reduce((t, e) => t.concat(e), []).map(l)
    }
    setSerializedData(t) {
        const e = t.map(m),
            n = {};
        for (let t = 0; t < e.length; t += 2) n[e[t]] = e[t + 1];
        this.data = n
    }
    static fromMultiSigScriptHashInput(t) {
        const e = t.redeemScript || C.redeemScriptFromP2shScript(C.fromBuffer(t._scriptBuffer));
        return this.fromRedeemScript(e)
    }
    static fromRedeemScript(t) {
        const e = new this({}, t.getPublicKeys().map(t => new T(t)), c.MIN_SATOSHI_AMOUNT),
            {
                chunks: n
            } = t,
            s = n.slice(4, n.length).filter((t, e) => e % 2 == 0).map(t => t.buf);
        return e.setSerializedData(s), e
    }
    toJSON() {
        return {
            kind: "script",
            data: this.data,
            publicKeys: this.publicKeys.map(t => t.toString()),
            amount: this.amount
        }
    }
    static isJSON(t) {
        return t.data && t.publicKeys && t.amount
    }
    static fromJSON(t) {
        const e = t.publicKeys.map(t => new T(t));
        return new this(t.data, e, t.amount)
    }
}
const {
    PublicKey: U,
    Address: A,
    Transaction: R
} = e;
class H extends d {
    constructor(t, e) {
        super("pkh"), this.address = t, this.amount = e
    }
    static fromPublicKeyHashInput(t) {
        const {
            output: e
        } = t;
        return new this(e.script.toAddress(), e.satoshis)
    }
    toJSON() {
        return {
            kind: "pkh",
            address: this.address.toString(),
            amount: this.amount
        }
    }
    static isJSON(t) {
        return t.address && t.amount
    }
    static fromJSON(t) {
        return new this(new A(t.address), t.amount)
    }
}
class J extends d {
    constructor(t) {
        super("return"), this.data = t || ""
    }
    getData() {
        return this.data
    }
    toJSON() {
        return {
            kind: "return",
            data: this.data
        }
    }
    static isJSON(t) {
        return !!t.data
    }
    static fromJSON(t) {
        return new this(t.data)
    }
}
const {
    Address: $,
    PublicKey: W,
    Signature: F,
    Script: B,
    Opcode: L
} = e;
class C extends B {
    static outputScriptFromScriptOutputData(t) {
        const {
            publicKeys: e
        } = t, n = t.getSerializeData(), s = new C;
        return s.add("OP_1"), e.forEach(t => s.add(t.toBuffer())), s.add(`OP_${e.length}`), s.add("OP_CHECKMULTISIG"), n.forEach(t => s.add(t).add("OP_DROP")), s
    }
    getPublicKeys() {
        let t = 1;
        const e = [];
        for (; this.chunks[t].buf;) e.push(new W(this.chunks[t].buf)), t += 1;
        return e
    }
    static inputScriptFromScriptOutputData(t, e, n, s) {
        const r = new C;
        return n.forEach(t => {
            r.add(t)
        }), r.add(s), r
    }
    isDbDataScript() {
        return !(!(this.chunks.length >= 5 && this.chunks[0].opcodenum === L.OP_1 && this.chunks[1].buf) || 20 !== this.chunks[1].buf.length && 33 !== this.chunks[1].buf.length || this.chunks[2].opcodenum !== L.OP_1 || this.chunks[3].opcodenum !== L.OP_CHECKMULTISIG || !this.chunks[4].buf || this.chunks[5].opcodenum !== L.OP_DROP)
    }
    static isP2shScript(t) {
        return !(3 !== t.chunks.length || t.chunks[0].opcodenum !== L.OP_0 || !t.chunks[1].buf || !t.chunks[2].buf)
    }
    static redeemScriptFromP2shScript(t) {
        if (!this.isP2shScript(t)) throw new Error("not a p2sh script");
        const e = new B(t.chunks[2].buf),
            n = new C;
        return n.chunks = e.chunks, n
    }
    toOutputData(t = c.MIN_SATOSHI_AMOUNT) {
        if (this.isDbDataScript()) {
            const t = new E({}, [new W(this.chunks[1].buf)], c.MIN_SATOSHI_AMOUNT),
                e = this.chunks.slice(4, this.chunks.length).filter((t, e) => e % 2 == 0).map(t => t.buf);
            return t.setSerializedData(e), t
        }
        if (this.isPublicKeyHashOut()) {
            const e = new $(this.getData());
            return new H(e, t)
        }
        if (this.isDataOut()) return new J(this.getData().toString());
        throw new Error("unknown script type")
    }
}
const {
    PublicKey: j,
    Address: z
} = e;
class q extends d {
    constructor(t) {
        super("change"), this.address = t
    }
    toJSON() {
        return {
            kind: "change",
            address: this.address.toString()
        }
    }
    static isJSON(t) {
        return t.address
    }
    static fromJSON(t) {
        return new this(new z(t.address))
    }
}
class G {
    static fromJSON(t) {
        if (E.isJSON(t)) return E.fromJSON(t);
        if (H.isJSON(t)) return H.fromJSON(t);
        if (q.isJSON(t)) return q.fromJSON(t);
        if (J.isJSON(t)) return J.fromJSON(t);
        throw new Error(`unrecognized json ${JSON.stringify(t)}`)
    }
}
const {
    Transaction: V,
    PublicKey: X,
    Address: Q,
    BN: Y,
    Script: Z,
    encoding: tt
} = e, {
    Output: et,
    Input: nt
} = V, {
    MultiSigScriptHash: st
} = nt, {
    BufferReader: rt
} = tt;
class at extends V {
    constructor(t) {
        super(t), this._outputData = [], Object.defineProperty(this, "to", p(this._to)), Object.defineProperty(this, "from", p(this._from))
    }
    get dataInputs() {
        return this.inputs.map(t => {
            if ("MultiSigScriptHashInput" === t.constructor.name) return E.fromMultiSigScriptHashInput(t);
            if ("PublicKeyHashInput" === t.constructor.name) return H.fromPublicKeyHashInput(t);
            if ("Input" === t.constructor.name) {
                const e = new Z(t._scriptBuffer),
                    n = new C;
                if (n.chunks = e.chunks, n.isPublicKeyHashIn()) return new H(n.toAddress(), 0);
                if (C.isP2shScript(n)) {
                    const t = C.redeemScriptFromP2shScript(n);
                    return E.fromRedeemScript(t)
                }
            }
            throw new Error(`unknown script class ${t.constructor.name}`)
        })
    }
    set dataInputs(t) {
        throw Error("dataTransaction.dataInputs cannot be set directly, use dataTransaction.from or dataTransaction.fromScriptOutput")
    }
    get inputsWithData() {
        return this.inputs.filter((t, e) => "ScriptOutputData" === this.dataInputs[e].constructor.name)
    }
    fromMultiSig(t, e, n) {
        const s = t.map(t => w("txId", "txid", t));
        return super.from(s, e, n)
    }
    _from(t) {
        const e = w("txId", "txid", t);
        return super.from(e)
    }
    fromScriptOutput(t, e) {
        const n = C.outputScriptFromScriptOutputData(e),
            s = new st({
                output: new et({
                    script: new C(t.scriptPubKey),
                    satoshis: Math.round(t.satoshis)
                }),
                prevTxId: t.txId,
                outputIndex: t.vout,
                script: new C
            }, e.publicKeys, 1, null, n);
        return this.addInput(s), this
    }
    get outputData() {
        if (!this._outputData.length) throw new Error("dataTransaction.outputData is not initialized. Call dataTransaction.fetchDataOuptuts() first.");
        return this._outputData
    }
    set outputData(t) {
        throw Error("dataTransaction.dataInputs cannot be set directly, use dataTransaction.toOutputData")
    }
    get outputsWithData() {
        return this.outputs.filter((t, e) => "ScriptOutputData" === this.outputData[e].constructor.name)
    }
    change(t) {
        const e = this.outputs.length;
        return super.change(t), this.outputs.length > e && this._outputData.push(new q(t)), this
    }
    toChangeOutput(t) {
        const e = this.outputs.length;
        return super.change(t.address), this.outputs.length > e && this._outputData.push(t), this
    }
    toPkhOutput(t) {
        return super.to(t.address, t.amount), this._outputData.push(t), this
    }
    toScriptOutput(t) {
        const e = C.outputScriptFromScriptOutputData(t),
            n = C.buildScriptHashOut(e),
            s = new et({
                script: n,
                satoshis: t.amount
            });
        return this.addOutput(s), this._outputData.push(t), this
    }
    toReturnOutput(t) {
        return this.addData(t.data), this._outputData.push(t), this
    }
    _to(t) {
        switch (t.constructor.name) {
            case "ChangeOutputData":
                return this.toChangeOutput(t);
            case "ReturnOutputData":
                return this.toReturnOutput(t);
            case "ScriptOutputData":
                return this.toScriptOutput(t);
            case "PkhOutputData":
                return this.toPkhOutput(t);
            default:
                throw new Error("Unsupported output kind")
        }
    }
    async fetchOutputData() {
        if (this._outputData.length) return this._outputData;
        const t = this.getTxId(),
            e = await _(t);
        return this._outputData = e.map(G.fromJSON), this._outputData
    }
    getTxId() {
        return new rt(this._getHash()).readReverse().toString("hex")
    }
    static async fromTxId(t) {
        const e = await I(t),
            n = new at;
        return await n.fromString(e), n
    }
}
const {
    Mnemonic: it,
    HDPrivateKey: ot,
    PrivateKey: ut,
    PublicKey: ct,
    Address: dt
} = e;
class ht {
    constructor(t) {
        this.mnemonic = t || new it, this.path = "", this.hdPrivateKey = this.mnemonic.toHDPrivateKey(this.path, c.BITCOIN_NETWORK)
    }
    static getRandomMnemonic() {
        return (new it).toString()
    }
    static fromMnemonic(t) {
        return new ht(t)
    }
    getMnemonic() {
        return this.mnemonic
    }
    getPath() {
        return this.path
    }
    derive(t = 0, e = !1) {
        const n = new ht(this.mnemonic);
        return n.path = `${this.path}${this.path.length?"/":""}${t}${e?"'":""}`, n.hdPrivateKey = this.hdPrivateKey.derive(t, e), n
    }
    static getHdPrivateKey() {
        return new ot
    }
    getPrivateKey() {
        return this.hdPrivateKey.privateKey
    }
    getPublicKey() {
        return this.hdPrivateKey.publicKey
    }
    getAddress() {
        return this.address = this.address || this.getPublicKey().toAddress(), this.address
    }
    async getBalance() {
        const t = this.getAddress();
        return b(t.toString())
    }
    async getUtxosFromAddress(t, e) {
        const n = await D(t.toString());
        for (let t = n.length - 1; t > 0; t -= 1) {
            const e = Math.floor(Math.random() * (t + 1)),
                s = n[t];
            n[t] = n[e], n[e] = s
        }
        let s = 0;
        const r = [];
        let a = 0;
        for (; s < e && a < n.length;) r.push(n[a]), s += n[a].satoshis, a += 1;
        if (s < e) throw new Error(`Insufficient balance in address ${t.toString()}`);
        return r
    }
    async getUtxos(t) {
        const e = this.getAddress();
        return this.getUtxosFromAddress(e, t)
    }
    async getTokenUtxos() {
        const t = this.getPublicKey(),
            e = await k(t.toString());
        return Promise.all(e.map(async t => {
            const e = await at.fromTxId(t.txId),
                n = (await e.fetchOutputData())[t.vOut];
            if (n) {
                const s = C.outputScriptFromScriptOutputData(n),
                    r = C.buildScriptHashOut(s),
                    a = e.outputs[t.vOut].satoshis;
                return {
                    txId: t.txId,
                    vout: t.vOut,
                    scriptPubKey: r,
                    amount: Math.round(a / 1e8),
                    satoshis: a,
                    amountSat: a,
                    outputData: n
                }
            }
            return null
        }))
    }
    async sendTransaction(t, e = !1) {
        const {
            txId: n
        } = await O(t);
        if (e) {
            const e = JSON.stringify(t.outputData.map(t => t.toJSON()));
            await N({
                txId: n,
                outputData: e
            })
        }
        return {
            txId: n
        }
    }
    async send(t, e) {
        const n = new at,
            s = e || this.getAddress(),
            r = c.DEFAULT_FEE,
            a = this.getPrivateKey(),
            i = t.reduce((t, e) => t + parseInt(e.amount || 0, 10), 0);
        return (await this.getUtxos(i + r)).forEach(n.from.bind(n)), t.forEach(n.to.bind(n)), n.change(s), n.sign(a), this.sendTransaction(n)
    }
    async sendAll(t) {
        const e = await this.getBalance(),
            n = c.DEFAULT_FEE;
        if (e > n) {
            const s = new H(t, e - n);
            return this.send([s])
        }
        throw new Error("Insufficient funds to send payment.")
    }
}
class pt {
    constructor(t) {
        this.wallet = t || new ht
    }
    static fromMnemonic(t) {
        return new this(new ht(t))
    }
    async put(t) {
        return this.update([], t)
    }
    async get(t) {
        return Promise.all(t.map(async ({
            txId: t,
            outputNumber: e
        }) => {
            const n = await at.fromTxId(t);
            return await n.fetchOutputData(), n.outputData[e]
        }))
    }
    async update(t, e) {
        const n = new at;
        await Promise.all(t.map(async t => {
            const e = await K(t),
                s = await _(e.txId),
                r = E.fromJSON(s[e.vout]);
            n.fromScriptOutput(e, r), await M(e.txId, e.vout)
        })), (await this.wallet.getUtxos(c.DEFAULT_FEE + e.length * c.MIN_NON_DUST_AMOUNT)).forEach(n.from.bind(n)), e.forEach(n.to.bind(n)), n.change(this.wallet.getAddress()), n.sign(this.wallet.getPrivateKey());
        const {
            txId: s
        } = await this.wallet.sendTransaction(n, !0);
        return [...Array(e.length).keys()].map(t => ({
            txId: s,
            outputNumber: t
        }))
    }
}
class lt {
    constructor(t) {
        this.db = t || new pt
    }
    static fromMnemonic(t) {
        return new this(pt.fromMnemonic(t))
    }
    async init(t) {
        const e = Object.getPrototypeOf(async () => {}).constructor;
        Object.entries(t).forEach(([t, n]) => {
            this[t] = new e(`"use strict"; return ${n}`).bind(this)()
        })
    }
    async create(t) {
        const e = new E(t, [this.db.wallet.getPublicKey()]);
        return this.id = (await this.db.put([e]))[0], this.id
    }
    join(t) {
        this.id = t
    }
    async getTokenUtxos() {
        const t = this.db.wallet.getPublicKey(),
            e = await k(t.toString()),
            n = (await Promise.all(e.map(async t => {
                const e = await at.fromTxId(t.txId);
                return await e.fetchOutputData(), Object.assign({
                    transaction: e
                }, t)
            }))).filter(t => t.transaction.outputData[t.vOut]),
            s = await ((t, e) => Promise.all(t.map(t => e(t))).then(e => t.filter(t => e.shift())))(n, (async t => this.isValid(t.transaction.hash)).bind(this));
        return Promise.all(s.map(async t => {
            const e = t.transaction.outputData[t.vOut],
                n = C.outputScriptFromScriptOutputData(e),
                s = C.buildScriptHashOut(n),
                r = t.transaction.outputs[t.vOut].satoshis;
            return {
                txId: t.txId,
                vout: t.vOut,
                scriptPubKey: s,
                amount: Math.round(r / 1e8),
                satoshis: r,
                amountSat: r,
                outputData: e
            }
        }))
    }
    async send(t, e) {
        const n = await this.getTokenUtxos();
        let s = 0;
        const r = n.filter(async e => {
            const n = s < t,
                {
                    txId: r,
                    vout: a,
                    outputData: i
                } = e,
                {
                    balance: o
                } = i.data;
            return s += o ? parseInt(o, 10) : 0, await M(r, a), n
        }).map(t => ({
            txId: t.txId,
            outputNumber: t.vout
        }));
        if (s < t) throw new Error("Insufficient token funds");
        const a = new E({
                balance: t.toString(10)
            }, [e]),
            i = s - t,
            o = this.db.wallet.getPublicKey(),
            u = new E({
                balance: i.toString(10)
            }, [o]);
        return this.db.update(r, [a, u])
    }
    async getBalance() {
        const t = await this.getTokenUtxos();
        return (await Promise.all(t.map(async t => {
            const e = await _(t.txId),
                {
                    publicKeys: n,
                    data: s
                } = e[t.vout],
                r = new E(s, n).getData("balance");
            return r ? parseInt(r, 10) : 0
        }))).reduce((t, e) => t + e, 0)
    }
    async isValid(t) {
        const e = await at.fromTxId(t);
        return await e.fetchOutputData(), this.isIssuance(e) ? this.id.txId === e.getTxId() : !!this.isTransfer(e) && Promise.all(e.inputsWithData.map(async t => this.isValid(t.prevTxId.toString("hex")))).then(t => t.every(t => t))
    }
    isIssuance(t) {
        return 0 === t.inputsWithData.length && 1 === t.outputsWithData.length
    }
    isTransfer(t) {
        return t.inputsWithData.length >= 1
    }
}
const {
    Mnemonic: mt
} = e;
class wt {
    constructor() {
        this.wallet = new ht
    }
    static getRandomMnemonic() {
        return ht.getRandomMnemonic().toString()
    }
    static fromMnemonic(t) {
        const e = new this,
            n = new mt(t);
        return e.wallet = new ht(n), e
    }
    getMnemonic() {
        return this.wallet.getMnemonic().toString()
    }
    getPath() {
        return this.wallet.path
    }
    getPrivateKey() {
        return this.wallet.getPrivateKey().toString()
    }
    getPublicKey() {
        return this.wallet.getPublicKey().toString()
    }
    getAddress(t) {
        const e = t || "legacy";
        if (!["legacy", "bitpay", "cashaddr"].includes(e)) throw new Error("second parameter in wallet.getAddress must be 'legacy', 'bitpay', or 'cashaddr'");
        return this.wallet.getAddress().toString(e)
    }
    async getBalance() {
        return this.wallet.getBalance()
    }
    derive(t = 0, e = !1) {
        const n = new wt,
            s = this.wallet.derive(t, e);
        return n.wallet = s, n
    }
    async send(t, e, n) {
        const s = G.fromJSON({
            amount: t,
            address: e
        });
        return this.wallet.send([s], n)
    }
    async transaction(t, e) {
        const n = t.map(G.fromJSON);
        return this.wallet.send(n, e)
    }
    static fromHdPrivateKey() {
        throw new Error("\nwallet.fromHdPrivateKey is not supported anymore. Use wallet.fromMnemonic instead.\n\nFor example:\nconst mnemonic = Wallet.getRandomMnemonic()\nconst wallet = wallet.fromMnemonic(mnemonic)\n    ")
    }
}
const {
    Mnemonic: gt
} = e;
class ft {
    constructor(t) {
        this.db = new pt(t ? t.wallet : null)
    }
    static fromMnemonic(t) {
        const e = new gt(t),
            n = new this;
        return n.db = pt.fromMnemonic(e), n
    }
    getWallet() {
        const t = this.db.wallet.getMnemonic();
        return wt.fromMnemonic(t.toString())
    }
    toScriptOutputData(t) {
        return E.fromJSON({
            kind: "script",
            publicKeys: t.owners || [this.getWallet().getPublicKey().toString()],
            data: t.data || {},
            amount: t.amount || c.MIN_NON_DUST_AMOUNT
        })
    }
    async putReturn(t) {
        const e = new J(t),
            {
                txId: n
            } = await this.db.wallet.send([e]);
        return {
            txId: n,
            outputNumber: 0
        }
    }
    async put(t, e, n) {
        const s = {
                data: t,
                owners: e,
                amount: n
            },
            r = this.toScriptOutputData(s);
        return (await this.db.put([r]))[0]
    }
    async get(t) {
        const e = w("publicKeys", "owners", (await this.db.get([t]))[0].toJSON());
        return delete e.kind, e
    }
    async update(t, e, n, s = c.MIN_NON_DUST_AMOUNT) {
        const r = {
                data: e,
                owners: n,
                amount: s
            },
            a = this.toScriptOutputData(r);
        return (await this.db.update([t], [a]))[0]
    }
    async transaction(t) {
        const e = t.map(t => t.outputId),
            n = t.map(this.toScriptOutputData.bind(this));
        return this.db.update(e, n)
    }
    getRandomMnemonic() {
        throw new Error("db.getRandomMnemonic does not exist. Use db.getWallet().getRandomMnemonic() instead.")
    }
    getPrivateKey() {
        throw new Error("db.getPrivateKey does not exist. Use db.getWallet().getPrivateKey() instead.")
    }
    getPublicKey() {
        throw new Error("db.getPublicKey does not exist. Use db.getWallet().getPublicKey() instead.")
    }
    getAddress() {
        throw new Error("db.getAddress does not exist. Use db.getWallet().getAddress() instead.")
    }
    static fromHdPrivateKey() {
        throw new Error("\ndb.fromHdPrivateKey is not supported anymore. Use db.fromMnemonic instead.\n\nFor example:\nconst mnemonic = Wallet.getRandomMnemonic()\nconst db = Db.fromMnemonic(mnemonic)\n    ")
    }
}
const {
    PublicKey: yt,
    Mnemonic: St
} = e;
class bt {
    constructor(t) {
        this.token = new lt(t ? t.db : null)
    }
    static fromMnemonic(t) {
        const e = new St(t),
            n = new this;
        return n.token = lt.fromMnemonic(e), n
    }
    getWallet() {
        const t = this.token.db.wallet.getMnemonic();
        return wt.fromMnemonic(t.toString())
    }
    getDb() {
        const t = this.token.db.wallet.getMnemonic();
        return ft.fromMnemonic(t.toString())
    }
    async create(t) {
        return this.token.create(t)
    }
    join(t) {
        return this.token.join(t)
    }
    async send(t, e) {
        const n = yt.fromString(e);
        return this.token.send(t, n)
    }
    async getBalance() {
        return this.token.getBalance()
    }
    getRandomMnemonic() {
        throw new Error("token.getRandomMnemonic does not exist. Use token.getWallet().getRandomMnemonic() instead.")
    }
    getPrivateKey() {
        throw new Error("token.getPrivateKey does not exist. Use token.getWallet().getPrivateKey() instead.")
    }
    getPublicKey() {
        throw new Error("token.getPublicKey does not exist. Use token.getWallet().getPublicKey() instead.")
    }
    getAddress() {
        throw new Error("token.getAddress does not exist. Use token.getWallet().getAddress() instead.")
    }
    static fromHdPrivateKey() {
        throw new Error("\ntoken.fromHdPrivateKey is not supported anymore. Use token.fromMnemonic instead.\n\nFor example:\nconst mnemonic = Wallet.getRandomMnemonic()\nconst token = Token.fromMnemonic(mnemonic)\n    ")
    }
}
exports.Token = bt, exports.Db = ft, exports.Wallet = wt, exports.Source = e;

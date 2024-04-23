const {
  create,
  entries,
  fromEntries,
  freeze,
  keys,
  setPrototypeOf,
  prototype: objectPrototype,
} = Object;
const { isArray } = Array;

const sigilDoc = {
  "!": "escaped string",
  "+": `non-negative bigint`,
  "-": `negative bigint`,
  "#": `manifest constant`,
  "%": `symbol`,
  $: `remotable`,
  "&": `promise`,
};
const sigils = keys(sigilDoc).join("");

const objMap = (
  obj: { [s: string]: any } | ArrayLike<any>,
  f: { (v: any): any; (arg0: any): any }
) => fromEntries(entries(obj).map(([p, v]) => [f(p), f(v)]));

type Marshal = {
  fromCapData: ({ body, slots }: { body: any; slots: any }) => any;
};

const makeMarshal = (_v2s: any, convertSlotToVal = (s: any) => s): Marshal => {
  const fromCapData = ({ body, slots }: { body: any; slots: any }) => {
    const recur = (
      v: string | ArrayLike<unknown> | { [s: string]: unknown } | null
    ): any => {
      switch (typeof v) {
        case "boolean":
        case "number":
          return v;
        case "string":
          if (v === "") return v;
          const sigil = v.slice(0, 1);
          if (!sigils.includes(sigil)) return v;
          switch (sigil) {
            case "!":
              return v.slice(1);
            case "+":
              return BigInt(v.slice(1));
            case "-":
              return -BigInt(v.slice(1));
            case "$": {
              const [ix] = v.slice(1).split(".");
              return convertSlotToVal(slots[Number(ix)]);
            }
            case "#":
              switch (v) {
                case "#undefined":
                  return undefined;
                case "#Infinity":
                  return Infinity;
                case "#NaN":
                  return Infinity;
                case "#tag":
                  return v;
                default:
                  throw RangeError(`Unexpected constant ${v}`);
              }
            case "%":
              // TODO: @@asyncIterator
              return Symbol.for(v.slice(1));
            default:
              throw RangeError(`Unexpected sigil ${sigil}`);
          }
        case "object":
          if (v === null) return v;
          if (isArray(v)) {
            return freeze(v.map(recur));
          }
          return freeze(objMap(v, recur));
        default:
          throw RangeError(`Unexpected value type ${typeof v}`);
      }
    };
    const encoding = JSON.parse(body.replace(/^#/, ""));
    return recur(encoding);
  };

  return Object.freeze({
    fromCapData,
  });
};

const PASS_STYLE = Symbol.for("passStyle");
const Far = (iface: any, methods: any) => {
  const proto = freeze(
    create(objectPrototype, {
      [PASS_STYLE]: { value: "remotable" },
      [Symbol.toStringTag]: { value: iface },
    })
  );
  setPrototypeOf(methods, proto);
  freeze(methods);
  return methods;
};

export { makeMarshal, Far };

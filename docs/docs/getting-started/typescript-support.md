---
title: TypeScript Support
---

**`window.d.ts`**
```javascript
import { Window as KeplrWindow } from "@keplr-wallet/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}
```

The `@keplr-wallet/types` package has the type definition related to Keplr.  
If you're using TypeScript, run `npm install --save-dev @keplr-wallet/types` or `yarn add -D @keplr-wallet/types` to install `@keplr-wallet/types`.  
Then, you can add the `@keplr-wallet/types` window to a global window object and register the Keplr related types.

> Usage of any other packages besides @keplr-wallet/types is not recommended.
> - Any other packages besides @keplr-wallet/types are actively being developed, backward compatibility is not in the scope of support.
> - Since there are active changes being made, documentation is not being updated to the most recent version of the package as of right now. Documentations would be updated as packages get stable.

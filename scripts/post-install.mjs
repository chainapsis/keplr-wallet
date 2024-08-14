/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

import "zx/globals";
import path from "path";

(async () => {
  try {
    const root = path.join(__dirname, "..");

    const p = path.join(root, "node_modules/starknet/dist/index.d.ts");
    if (fs.existsSync(p)) {
      const data = await fs.readFile(p, "utf8");
      // node_modules/starknet/dist/index.d.ts에서 타입 오류가 나는데
      // 원인은 파악 못했다. 원인을 파악해서 해결할 시간이 없기 때문에
      // 일단 이 파일에 대해서만 @ts-nocheck을 추가한다.
      // skipLibCheck은 최후의 수단이기 때문에 먼저 이 방식으로 처리한다.
      if (!data.startsWith("// @ts-nocheck")) {
        await fs.writeFile(p, "// @ts-nocheck\n" + data);
      }
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

/* eslint-enable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */

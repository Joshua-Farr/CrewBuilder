import * as esbuild from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [join(__dirname, "src/index.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: join(__dirname, "lib/index.js"),
  format: "cjs",
  sourcemap: true,
  external: ["firebase-admin", "firebase-functions", "playwright-core"],
  alias: {
    "@": join(__dirname, "../src"),
  },
});

console.log("Functions bundle built.");

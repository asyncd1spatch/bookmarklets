import { existsSync } from "node:fs";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { build, type InlineConfig } from "vite";

const srcDir = "src";
const outDir = "dist";

async function run() {
  console.log("Starting bookmarklet build with Vite...");
  if (existsSync(outDir)) {
    await rm(outDir, { recursive: true, force: true });
  }
  await mkdir(outDir);
  const files = await readdir(srcDir);
  const entryPoints = files
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(srcDir, file));
  if (entryPoints.length === 0) {
    console.log(`No TypeScript files found in '${srcDir}'. Nothing to build.`);
    return;
  }
  const bookmarkletLinks: { name: string; href: string }[] = [];
  for (const entryPoint of entryPoints) {
    try {
      const basename = path.basename(entryPoint, ".ts");

      const config: InlineConfig = {
        configFile: false,
        logLevel: "silent",
        build: {
          write: false,
          minify: "esbuild",
          target: "esnext",
          lib: {
            entry: entryPoint,
            name: "b",
            formats: ["iife"],
            fileName: () => "temp.js",
          },
        },
      };

      const result = await build(config);

      const outputResult = Array.isArray(result) ? result[0] : result;
      if (outputResult && "output" in outputResult) {
        const chunk = outputResult.output[0];

        if (chunk && chunk.type === "chunk") {
          let rawJs = chunk.code;
          rawJs = rawJs.replace(/^var\s+\w+\s*=\s*/, "");
          const cleanedJs = rawJs
            .replace(/"use strict";/, "")
            .trim()
            .replace(/;$/, "");

          const bookmarklet = `javascript:${encodeURIComponent(cleanedJs)}`;
          const outPath = path.join(outDir, `${basename}.bookmarklet.txt`);
          await writeFile(outPath, bookmarklet);
          console.log(`Built ${entryPoint} -> ${outPath}`);

          bookmarkletLinks.push({ name: basename, href: bookmarklet });
        }
      }
    } catch (err) {
      console.error(`Failed to build ${entryPoint}:`, err);
      process.exit(1);
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Bookmarklets</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; background-color: #f4f4f9; }
        h1 { color: #333; }
        p { color: #555; margin-bottom: 2rem; }
        a {
          display: inline-block;
          padding: 10px 15px;
          margin: 5px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        a:hover { background-color: #0056b3; }
      </style>
    </head>
    <body>
      <h1>Your Bookmarklets</h1>
      <p>Drag any of these links to your bookmarks bar.</p>
      <div>
        ${bookmarkletLinks
          .map((link) => `<a href="${link.href}">${link.name}</a>`)
          .join("\n        ")}
      </div>
    </body>
    </html>
  `;

  await writeFile(path.join(outDir, "index.html"), htmlContent);
  await writeFile(path.join(outDir, ".nojekyll"), "");

  console.log(`Created index.html with ${bookmarkletLinks.length} links.`);
}

await run();

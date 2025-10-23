import path from "node:path";

const srcDir = "src";
const outDir = "dist";

const glob = new Bun.Glob(`${srcDir}/*.ts`);

const entryPoints = [];
for await (const file of glob.scan()) {
  entryPoints.push(file);
}

async function build() {
  console.log("Starting bookmarklet build with Bun...");

  const bookmarkletLinks = [];

  for (const entryPoint of entryPoints) {
    try {
      const result = await Bun.build({
        entrypoints: [entryPoint],
        minify: true,
        target: "browser",
      });

      if (result.outputs.length === 0) {
        throw new Error("Bun.build produced no output files.");
      }

      const rawJs = await result.outputs[0].text();

      const cleanedJs = rawJs
        .replace(/^"use strict";/, "")
        .trim()
        .replace(/;$/, "");

      const bookmarklet = `javascript:${encodeURIComponent(cleanedJs)}`;

      const basename = path.basename(entryPoint, ".ts");
      const outPath = path.join(outDir, `${basename}.bookmarklet.txt`);

      await Bun.write(outPath, bookmarklet);
      console.log(`Built ${entryPoint} -> ${outPath}`);

      bookmarkletLinks.push({ name: basename, href: bookmarklet });
    } catch (error) {
      console.error(`Failed to build ${entryPoint}:`, error);
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
        ${
    bookmarkletLinks
      .map((link) => `<a href="${link.href}">${link.name}</a>`)
      .join("\n        ")
  }
      </div>
    </body>
    </html>
  `;

  await Bun.write(path.join(outDir, "index.html"), htmlContent);
  console.log("Created index.html with draggable links.");
  console.log("Build complete.");
}

if (entryPoints.length > 0) {
  build();
} else {
  console.log(`No TypeScript files found in '${srcDir}'. Nothing to build.`);
}

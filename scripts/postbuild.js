const fs = require("fs");
const path = require("path");

const chunksDir = path.resolve(__dirname, "../.next/server/chunks");
const serverDir = path.resolve(__dirname, "../.next/server");

if (fs.existsSync(chunksDir)) {
  const files = fs.readdirSync(chunksDir);
  let count = 0;
  for (const file of files) {
    if (file.endsWith(".js")) {
      const src = path.join(chunksDir, file);
      const dest = path.join(serverDir, file);
      try {
        fs.copyFileSync(src, dest);
        count++;
      } catch (err) {
        console.error(`Failed to copy ${file}:`, err);
      }
    }
  }
  console.log(`[postbuild] Replicated ${count} server chunks to .next/server/`);
}

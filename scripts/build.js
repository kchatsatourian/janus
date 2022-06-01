const archiver = require("archiver");
const fs = require("fs-extra");
const { minify } = require("terser");
const path = require("path");

const browsers = ["chrome", "firefox"];
const flavors = ["debug", "release"];
const map = {
  "description": "description",
  "version": "version"
};

async function clean() {
  console.log("Cleaning build folder...");
  await fs.remove("build/");
}

async function manifest(browser) {
  console.log(`Updating ${browser}/manifest.json...`);
  const package = await fs.readJson("package.json");

  const directory = path.join(browser, "manifest.json");
  await fs.ensureDir(path.dirname(directory));
  const manifest = await fs.readJson(directory);

  for (const [source, destination] of Object.entries(map)) {
    value = package[source];
    if (value === undefined) {
      console.log(`${source} not found in package.json.`);
      continue;
    }
    manifest[destination] = package[source];
  }

  await fs.writeJson(directory, manifest, { spaces: 2 });
}

async function copy(browser) {
  console.log(`Copying files for ${browser}...`);
  const debug = path.join("build", browser, "debug");
  await fs.copy("extension", debug);
  await fs.copy(browser, debug);
}

async function optimize(browser) {
  console.log(`Optimizing files for ${browser}...`);
  const debug = path.join("build", browser, "debug");
  const release = path.join("build", browser, "release");
  await fs.ensureDir(release);

  const files = await fs.readdir(debug);

  for (const file of files) {
    const source = path.join(debug, file);
    const destination = path.join(release, file);

    if (file.endsWith(".html")) {
      await fs.copy(source, destination);
    } else if (file.endsWith(".js")) {
      const content = await fs.readFile(source, "utf8");
      const result = await minify(content);
      await fs.writeFile(destination, result.code);
    } else if (file.endsWith(".json")) {
      const content = await fs.readFile(source, "utf-8");
      const compressed = JSON.stringify(JSON.parse(content));
      await fs.writeFile(destination, compressed, "utf-8");
    } else {
      await fs.copy(source, destination);
    }
  }
}

async function compress(browser) {
  const package = await fs.readJson("package.json");
  const name = package.name;

  for (const flavor of flavors) {
    const source = path.join("build", browser, flavor);
    const destination = path.join("build", `${name}-${browser}-${flavor}.zip`);
    console.log(`Compressing ${destination}...`);
    const output = fs.createWriteStream(destination);
    const archive = archiver("zip");
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      archive.on("error", reject);
      archive.pipe(output);
      archive.directory(source, false);
      archive.finalize();
    });
  }
}

async function build() {
  await clean();

  for (const browser of browsers) {
    await manifest(browser);
    await copy(browser);
    await optimize(browser);
    await compress(browser);
  }

  console.log("Build completed successfully!");
}

build().catch(console.error);

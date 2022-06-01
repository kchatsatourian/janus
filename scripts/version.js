const fs = require("fs-extra");

async function version() {
  const package = await fs.readJson("package.json");
  console.log(package["version"]);
}

version().catch(console.error);

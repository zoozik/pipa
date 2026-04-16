const fs = require("fs");
const { execSync } = require("child_process");

const url =
  "https://github.com/hxehex/russia-mobile-internet-whitelist/raw/refs/heads/main/cidrwhitelist.txt";

(async () => {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => (line.includes("/") ? line.trim() : line.trim() + "/32"));

  const data = {
    version: 3,
    rules: [{ ip_cidr: lines }],
  };

  fs.writeFileSync("ipwhitelist.json", JSON.stringify(data, null, 2));

  execSync(
    `sing-box.exe rule-set compile ipwhitelist.json -o ipwhitelist.srs`,
    {
      stdio: "inherit",
    }
  );
})();

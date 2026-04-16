const fs = require("fs");
const { execSync } = require("child_process");

const cidrwhitelist =
  "https://github.com/hxehex/russia-mobile-internet-whitelist/raw/refs/heads/main/cidrwhitelist.txt";

const whitelist =
  "https://github.com/hxehex/russia-mobile-internet-whitelist/raw/refs/heads/main/whitelist.txt";

(async () => {
  const cidrwhitelistRes = await fetch(cidrwhitelist);
  const cidrwhitelistText = await cidrwhitelistRes.text();

  const cidrwhitelistLines = cidrwhitelistText
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => (line.includes("/") ? line.trim() : line.trim() + "/32"));

  const cidrwhitelistData = {
    version: 3,
    rules: [{ ip_cidr: cidrwhitelistLines }],
  };

  fs.writeFileSync(
    "ipwhitelist.json",
    JSON.stringify(cidrwhitelistData, null, 2)
  );

  execSync(
    `sing-box.exe rule-set compile ipwhitelist.json -o ipwhitelist.srs`,
    {
      stdio: "inherit",
    }
  );

  const whitelistRes = await fetch(whitelist);
  const whitelistText = await whitelistRes.text();

  const whitelistLines = whitelistText
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => (line.includes("/") ? line.trim() : line.trim() + "/32"));

  const whitelistData = {
    version: 3,
    rules: [{ domain_suffix: whitelistLines }],
  };

  fs.writeFileSync("whitelist.json", JSON.stringify(whitelistData, null, 2));

  execSync(`sing-box.exe rule-set compile whitelist.json -o whitelist.srs`, {
    stdio: "inherit",
  });
})();

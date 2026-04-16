const fs = require("fs");
const { execSync } = require("child_process");

const SOURCES = [
  {
    url: "https://github.com/hxehex/russia-mobile-internet-whitelist/raw/refs/heads/main/ipwhitelist.txt",
    name: "ipwhitelist",
    field: "ip_cidr",
    transform: (line) => (line.includes("/") ? line : line + "/32"),
  },
  {
    url: "https://github.com/hxehex/russia-mobile-internet-whitelist/raw/refs/heads/main/cidrwhitelist.txt",
    name: "cidrwhitelist",
    field: "ip_cidr",
    transform: (line) => (line.includes("/") ? line : line + "/32"),
  },
  {
    url: "https://github.com/hxehex/russia-mobile-internet-whitelist/raw/refs/heads/main/whitelist.txt",
    name: "whitelist",
    field: "domain_suffix",
    transform: (line) => line, // без изменений
  },
];

async function loadLines(url, transform) {
  const res = await fetch(url);
  const text = await res.text();

  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(transform);
}

function buildRuleSet(lines, field) {
  return {
    version: 3,
    rules: [{ [field]: lines }],
  };
}

function compile(name) {
  execSync(
    `sing-box.exe rule-set compile ${name}.json -o ${name}.srs`,
    { stdio: "inherit" }
  );
}

(async () => {
  try {
    for (const src of SOURCES) {
      console.log(`Processing: ${src.name}`);

      const lines = await loadLines(src.url, src.transform);
      const json = buildRuleSet(lines, src.field);

      fs.writeFileSync(`${src.name}.json`, JSON.stringify(json, null, 2));
      compile(src.name);
    }

    // git только если есть изменения
    const status = execSync(`git status --porcelain`).toString();

    if (status) {
      execSync(`git add .`, { stdio: "inherit" });

      try {
        execSync(`git commit -m "auto update ${new Date().toISOString()}"`, {
          stdio: "inherit",
        });
      } catch {
        console.log("Nothing to commit");
      }

      execSync(`git push origin main`, { stdio: "inherit" });
      console.log("Git push done");
    } else {
      console.log("No changes");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
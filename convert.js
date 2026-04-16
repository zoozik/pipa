const fs = require("fs");
const { execSync } = require("child_process");

const input = "ipwhitelist.txt";
const jsonFile = "ipwhitelist.json";
const output = "ipwhitelist.srs";

if (!fs.existsSync(input)) {
    console.error("ips.txt not found");
    process.exit(1);
}

// читаем IP
const lines = fs.readFileSync(input, "utf-8")
    .split(/\r?\n/)
    .filter(line => line.trim() !== "")
    .map(line => line.includes("/") ? line.trim() : line.trim() + "/32");

// формируем JSON
const data = {
    version: 1,
    rules: [
        {
            ip_cidr: lines
        }
    ]
};

fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));

console.log("JSON created:", jsonFile);

// компиляция в srs
try {
    execSync(`sing-box.exe rule-set compile ${jsonFile} -o ${output}`, { stdio: "inherit" });
    console.log("Done:", output);
} catch (e) {
    console.error("Error running sing-box");
}
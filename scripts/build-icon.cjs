const path = require('path')
const fs = require('fs')
const pngToIco = require('png-to-ico').default

const srcPath = path.join(__dirname, '..', 'resources', 'icon.png')
const outPath = path.join(__dirname, '..', 'resources', 'icon.ico')

async function main() {
  if (!fs.existsSync(srcPath)) {
    console.warn('resources/icon.png not found, skipping icon.ico build')
    return
  }
  const ico = await pngToIco(srcPath)
  fs.writeFileSync(outPath, ico)
  console.log('Built resources/icon.ico')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

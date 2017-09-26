const fs = require('fs-extra')
const fsc = require('fs-compare').sync
const path = require('path')
const os = require('os')
const watcher = require('chokidar')
const chalk = require('chalk')

const sync = `${os.homedir()}/dev`
const iCloud = `${os.homedir()}/Library/Mobile\ Documents/com~apple~CloudDocs/sink`

console.log(`
  ☁️
  Watching: ${chalk.cyan.underline.bold(sync)}
  Destination: ${chalk.cyan.underline.bold(iCloud)}
`)

watcher
  .watch(sync, {ignored: /node_modules/})
  .on('add', async loc => {
    const match = getChangedFileName(loc)
    const iCloudPath = path.join(iCloud, match)
    const exists = await fs.exists(iCloudPath)

    if (exists) {
      const cloudData = await fs.readFileSync(iCloudPath)
      const localData = await fs.readFileSync(loc)
      // if the files were last modified at the same time, assume they haven't changed
      const modifiedMatch = await fsc.mtime(iCloudPath, loc)

      if (!modifiedMatch) {
        try {
          await moveFile(loc, iCloudPath)
        } catch (err) {
          console.log(err)
        }
      }
    } else {
      // doesn't exist? let's move it.
      try {
        await moveFile(loc, iCloudPath)
      } catch (err) {
        console.log(err)
      }
    }
  })
  .on('change', async loc => {
    const match = getChangedFileName(loc)

    try {
      await moveFile(loc, path.join(iCloud, match))
    } catch (err) {
      console.log(err)
    }
  })
  .on('unlink', async loc => {
    const match = getChangedFileName(loc)
    const iCloudMatch = path.join(iCloud, match)

    try {
      await fs.remove(iCloudMatch)
      console.log(chalk.red(`Delete: ${loc}`))
    } catch (err) {
      console.log(err)
    }
  })

function getChangedFileName (filename) {
  if (filename.match(os.homedir())) {
    return filename.split(os.homedir())[1]
  } else {
    return null
  }
}

async function moveFile (fromPath, toPath) {
// whitespace get's put into terminal :/
log(`
  Date: ${new Date()}
  From: ${chalk.blue(fromPath)}
  To: ${chalk.blue(toPath)}
`)

  return await fs.copySync(fromPath, toPath)
}

function log (message) {
  console.log(chalk.green(message))
}

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

module.exports = function (src) {
  if (!src) return
  const file = path.join(src, 'ascii-art.txt')
  if (!fs.existsSync(file)) return

  const art = fs.readFileSync(file, 'utf8')
  return () => console.log(chalk.white(art))
}

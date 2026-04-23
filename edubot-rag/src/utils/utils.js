import path from 'path'
import { fileURLToPath } from 'url'

// const root = process.cwd()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(path.dirname(path.dirname(__filename)))

const __joiner = (...params) => path.join(__dirname, ...params)

export { __joiner }

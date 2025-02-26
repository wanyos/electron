import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { fileURLToPath } from 'url'
import path from 'path'

// Obtener la ruta del directorio actual usando `import.meta.url`
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dynamically build the path to the .env.development file
const envFile = `../.env.${process.env.NODE_ENV || 'development'}`
const envPath = path.resolve(__dirname, envFile)
dotenv.config({ path: envPath })

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// Función para verificar la conexión
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Database connection is active')
    connection.release()
  } catch (error) {
    console.error('Error checking database connection:', error)
  }
}

// setInterval(checkConnection, 5 * 60 * 1000)
checkConnection()

export const closePool = async () => {
  try {
    await pool.end()
    console.log('Database pool closed')
  } catch (error) {
    console.error('Error closing database pool:', error)
  }
}

// export const getAll = async (table) => {
//   try {
//     const [rows] = await pool.query(`SELECT * FROM ${table}`)
//     // console.log(rows[0])
//     return rows
//   } catch (err) {
//     console.log(err)
//   }
// }

export { pool }

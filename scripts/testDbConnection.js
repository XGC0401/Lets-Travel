import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

function parseEnvContent(content) {
  const env = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) continue

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  const fallbackEnvPath = path.resolve(process.cwd(), '.env.example')

  if (fs.existsSync(envPath)) {
    return parseEnvContent(fs.readFileSync(envPath, 'utf8'))
  }

  if (fs.existsSync(fallbackEnvPath)) {
    return parseEnvContent(fs.readFileSync(fallbackEnvPath, 'utf8'))
  }

  return {}
}

function getConfig() {
  const fileEnv = loadEnvFile()
  const host = process.env.DB_HOST || fileEnv.DB_HOST || 'localhost'
  const port = Number(process.env.DB_PORT || fileEnv.DB_PORT || 5432)
  const user = process.env.DB_USER || fileEnv.DB_USER
  const password = process.env.DB_PASSWORD || fileEnv.DB_PASSWORD
  const database = process.env.DB_NAME || fileEnv.DB_NAME
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    fileEnv.SUPABASE_URL ||
    fileEnv.VITE_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    fileEnv.SUPABASE_SERVICE_ROLE_KEY ||
    fileEnv.SUPABASE_ANON_KEY ||
    fileEnv.VITE_SUPABASE_ANON_KEY ||
    fileEnv.VITE_SUPABASE_PUBLISHABLE_KEY

  return { host, port, user, password, database, supabaseUrl, supabaseKey }
}

async function testTcpConnection(host, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()

    socket.setTimeout(10000)

    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })

    socket.once('timeout', () => {
      socket.destroy()
      reject(new Error(`Connection timeout to ${host}:${port}`))
    })

    socket.once('error', (error) => {
      socket.destroy()
      reject(error)
    })

    socket.connect(port, host)
  })
}

async function testSupabaseRest(supabaseUrl, supabaseKey) {
  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`REST API returned ${response.status} ${response.statusText}`)
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  const { host, port, user, password, database, supabaseUrl, supabaseKey } = getConfig()
  const hasPostgresConfig = Boolean(user && password && database)
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey)

  if (!hasPostgresConfig && !hasSupabaseConfig) {
    console.error('❌ Missing DB config. Use either DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME or SUPABASE_URL + key')
    process.exit(1)
  }

  try {
    if (hasPostgresConfig) {
      console.log(`ℹ️  Testing PostgreSQL TCP connectivity: ${host}:${port}`)
      console.log(`ℹ️  Database: ${database}, User: ${user}`)
      await testTcpConnection(host, port)
      console.log('✅ PostgreSQL host/port is reachable')
    } else {
      console.log(`ℹ️  Testing Supabase REST connectivity: ${supabaseUrl}`)
      await testSupabaseRest(supabaseUrl, supabaseKey)
      console.log('✅ Supabase REST endpoint is reachable')
    }

    console.log('🎉 Database connection test completed')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`❌ Connection test failed: ${message}`)
    process.exit(1)
  }
}

main()

import { spawn } from 'child_process'
import { createHash } from 'crypto'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

import { getDefaultPaths } from './paths'

const TEMP_CONFIG_NAME = 'temp_config.json'
const CONFIG_NAME = 'config.json'

function getConfigDir(): string {
  return dirname(getDefaultPaths().configPath)
}

function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex')
}

function runSingBoxCheck(configPath: string, singBoxPath: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn(singBoxPath, ['check', '-c', configPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stderr = ''
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true })
      } else {
        resolve({ ok: false, error: stderr.trim() || `sing-box check exited with code ${code}` })
      }
    })

    child.on('error', (err) => {
      resolve({ ok: false, error: err.message })
    })
  })
}

export async function fetchAndApplyRemoteConfig(url: string): Promise<{ ok: boolean; error?: string }> {
  const { singBoxPath, configPath } = getDefaultPaths()
  const configDir = getConfigDir()
  const tempPath = join(configDir, TEMP_CONFIG_NAME)

  let body: string
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` }
    }
    body = await res.text()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }

  try {
    writeFileSync(tempPath, body, 'utf-8')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }

  const checkResult = await runSingBoxCheck(tempPath, singBoxPath)
  if (!checkResult.ok) {
    try {
      unlinkSync(tempPath)
    } catch {
      // ignore
    }
    return checkResult
  }

  const newHash = hashContent(body)
  if (existsSync(configPath)) {
    const currentContent = readFileSync(configPath, 'utf-8')
    if (hashContent(currentContent) === newHash) {
      unlinkSync(tempPath)
      return { ok: true }
    }
  }

  try {
    writeFileSync(configPath, body, 'utf-8')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    try {
      unlinkSync(tempPath)
    } catch {
      // ignore
    }
    return { ok: false, error: message }
  }

  try {
    unlinkSync(tempPath)
  } catch {
    // ignore
  }

  return { ok: true }
}

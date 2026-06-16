import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const requestTimeoutMs = 20_000
let browserClient: SupabaseClient | null = null

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs)

  try {
    return await fetch(input, init?.signal ? init : { ...init, signal: controller.signal })
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    browserClient = null
    return null
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      global: {
        fetch: fetchWithTimeout,
      },
      realtime: {
        params: {
          eventsPerSecond: 5,
        },
      },
    })
  }

  return browserClient
}

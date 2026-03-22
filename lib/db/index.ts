import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as relations from './relations'
import * as schema from './schema'

// For server-side usage only
// Use restricted user for application if available, otherwise fall back to regular user
const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Skip database connection during build if URL is placeholder
const skipDatabaseForBuild = 
  process.env.NODE_ENV === 'production' && 
  process.env.DATABASE_URL === '[YOUR_DATABASE_URL]'

if (
  !process.env.DATABASE_URL &&
  !process.env.DATABASE_RESTRICTED_URL &&
  !isTest &&
  !skipDatabaseForBuild
) {
  throw new Error(
    'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
  )
}

// Connection with connection pooling for server environments
// Prefer restricted user for application runtime
let connectionString: string | undefined =
  process.env.DATABASE_RESTRICTED_URL ?? // Prefer restricted user
  process.env.DATABASE_URL ??
  (isTest ? 'postgres://user:pass@localhost:5432/testdb' : undefined)

// Skip database connection during build
if (skipDatabaseForBuild) {
  connectionString = 'postgres://placeholder:placeholder@localhost:5432/placeholder'
}

if (!connectionString) {
  throw new Error(
    'DATABASE_URL or DATABASE_RESTRICTED_URL environment variable is not set'
  )
}

// Log which connection is being used (for debugging)
if (isDevelopment && !skipDatabaseForBuild) {
  console.log(
    '[DB] Using connection:',
    process.env.DATABASE_RESTRICTED_URL
      ? 'Restricted User (RLS Active)'
      : 'Owner User (RLS Bypassed)'
  )
}

// SSL configuration: Use environment variable to control SSL
// DATABASE_SSL_DISABLED=true disables SSL completely (for local/Docker PostgreSQL)
// Default is to enable SSL with certificate verification (for cloud databases like Neon, Supabase)
const sslConfig =
  process.env.DATABASE_SSL_DISABLED === 'true'
    ? false // Disable SSL entirely for local PostgreSQL
    : { rejectUnauthorized: true } // Enable SSL with verification for cloud DBs

// Skip creating actual database connection during build
let client: any
let db: any

if (!skipDatabaseForBuild) {
  client = postgres(connectionString, {
    ssl: sslConfig,
    prepare: false,
    max: 20 // Max 20 connections
  })

  db = drizzle(client, {
    schema: { ...schema, ...relations }
  })
} else {
  // Create mock db for build with proper types
  const mockTx = {
    select: () => ({ 
      from: () => ({ 
        where: () => ({ 
          limit: () => Promise.resolve([]) 
        })
      }) 
    }),
    insert: () => ({ 
      values: () => ({ 
        returning: () => Promise.resolve([]) 
      }) 
    }),
    update: () => ({ 
      set: () => ({ 
        where: () => ({ 
          returning: () => Promise.resolve([]) 
        }) 
      }) 
    }),
    delete: () => ({ 
      where: () => ({ 
        returning: () => Promise.resolve([]) 
      }) 
    }),
    execute: () => Promise.resolve({ rows: [] })
  }
  
  db = {
    ...mockTx,
    execute: () => Promise.resolve({ rows: [] }),
    transaction: (callback: any) => callback(mockTx)
  }
}

// Export db for other modules
export { db }

// Helper type for all tables
export type Schema = typeof schema

// Verify restricted user permissions on startup
if (process.env.DATABASE_RESTRICTED_URL && !isTest) {
  // Only run verification in server environments, not during build
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    ;(async () => {
      try {
        const result = await (db as any).execute(
          sql`SELECT current_user`
        ) as { current_user: string }[]
        const currentUser = result[0]?.current_user

        if (isDevelopment) {
          console.log('[DB] ✓ Connection verified as user:', currentUser)
        }

        // Verify it's the restricted user (app_user)
        if (
          currentUser &&
          !currentUser.includes('app_user') &&
          !currentUser.includes('neondb_owner')
        ) {
          console.warn(
            '[DB] ⚠️ Warning: Expected app_user but connected as:',
            currentUser
          )
        }
      } catch (error) {
        console.error('[DB] ✗ Failed to verify database connection:', error)
        // Log the error but don't terminate the application
        // This allows development to continue even with connection issues
      }
    })()
  }
}

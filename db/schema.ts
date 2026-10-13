import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const storeState = sqliteTable('store_state', { id: text('id').primaryKey(), payload: text('payload').notNull(), revision: integer('revision').notNull().default(0), updatedAt: integer('updated_at').notNull() });
export const adminAccount = sqliteTable('admin_account', { id: text('id').primaryKey(), passwordHash: text('password_hash').notNull(), salt: text('salt').notNull(), mustChange: integer('must_change').notNull().default(1) });
export const adminSession = sqliteTable('admin_session', { tokenHash: text('token_hash').primaryKey(), csrf: text('csrf').notNull(), expiresAt: integer('expires_at').notNull() });
export const loginThrottle = sqliteTable('login_throttle', { key: text('key').primaryKey(), attempts: integer('attempts').notNull().default(0), resetAt: integer('reset_at').notNull() });

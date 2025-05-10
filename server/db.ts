import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/weatherapp';

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle(pool, { schema });
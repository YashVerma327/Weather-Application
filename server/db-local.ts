import * as pg from 'pg';
const { Pool } = pg;

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Updated database name from weather_db to weatherapp
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/weatherapp';

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle(pool, { schema });
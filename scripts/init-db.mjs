import fs from 'node:fs/promises';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.');
  process.exit(1);
}

const schema = await fs.readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
const client = createClient({ url, authToken });

for (const statement of schema.split(';').map(item => item.trim()).filter(Boolean)) {
  await client.execute(`${statement};`);
}

console.log('Database schema is ready.');

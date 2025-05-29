import { Pool } from "pg";
 const connectionString = process.env.DATABASE_CONNECTION_STRING
const pool = new Pool({
  connectionString,
});

export default pool;  
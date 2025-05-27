import { Pool } from "pg";
const pool = new Pool({
  connectionString: "postgresql://postgres:1006@localhost:5432/eoffice_helpdesk",
});

export default pool;
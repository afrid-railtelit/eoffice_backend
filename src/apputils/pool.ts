import { Pool } from "pg";
const pool = new Pool({
  connectionString: "postgresql://postgres:WxUTPzNxALIITlsnVrYWhUiJDqqVjaxu@shuttle.proxy.rlwy.net:52737/railway",
});

export default pool;
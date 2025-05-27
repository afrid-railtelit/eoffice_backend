import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { employeeCode, criticalLevel, issueId, emailId } = await req.json();

    if (!employeeCode || !criticalLevel || !issueId || !emailId) {
      return NextResponse.json(
        {
          data: "BAD_REQUEST",
        },
        {
          status: 400,
        }
      );
    }

    await pool.query(
      `
      WITH numbered AS (
    SELECT TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/eOffice/' ||
           LPAD((SELECT COUNT(*) + 1 FROM tickets)::TEXT, 2, '0') AS docket_number
  )
        INSERT INTO tickets (docket_number,employee_code,issue_id,created_by,critical_level)
        SELECT numbered.docket_number,$1,$2,$3,$4   FROM numbered`,
      [employeeCode, issueId, emailId, criticalLevel?.toUpperCase()]
    );

    return NextResponse.json({
      data: "SUCCESS",
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        data: "SERVER_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}

import { sendTicketEmail } from "@/apputils/appUtils";
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

    const ticketResult = await pool.query(
      `
      WITH numbered AS (
    SELECT TO_CHAR(CURRENT_DATE, 'DDMMYYYY') || '/eOffice/' ||
           LPAD((SELECT COUNT(*) + 1 FROM tickets)::TEXT, 2, '0') AS docket_number
  )
        INSERT INTO tickets (docket_number,employee_code,issue_id,created_by,critical_level,issue_resolution)
        SELECT numbered.docket_number,$1,$2,$3,$4,i.issue_resolution   FROM numbered 
		INNER JOIN  issues i ON i.id = $2
		
		
		
		returning *`,
      [employeeCode, issueId, emailId, criticalLevel?.toUpperCase()]
    );

    const employeeData = await pool.query(
      `
      SELECT * FROM employees WHERE employee_code = $1 LIMIT 1`,
      [employeeCode]
    );

    if (employeeData.rows?.length > 0 && employeeData.rows[0].email) {
      await sendTicketEmail({
        type: "ticketCreated",
        email: employeeData.rows[0].email,
        name: employeeData.rows[0].employee_name,
        subject: `Ticket #${ticketResult.rows[0]?.docket_number} Created - Railtel e-Office Helpdesk`,
        ticketNumber: ticketResult.rows[0]?.docket_number,
      });
    }

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

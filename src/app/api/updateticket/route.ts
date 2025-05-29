import { sendTicketEmail } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { remarks, ticketId, resolve, emailId, issueResolution } =
      await req.json();

    if (resolve) {
      const result = await pool.query(
        `
            UPDATE tickets SET status = 'RESOLVED',resolved_by = $1,updated_at = NOW(),issue_resolution = $3 WHERE id = $2
            RETURNING *
            `,
        [emailId, ticketId, issueResolution]
      );
      const employeeData = await pool.query(
        `
      SELECT * FROM employees WHERE employee_code = $1 LIMIT 1`,
        [result.rows[0].employee_code]
      );
      console.log(employeeData);

      if (employeeData.rows?.length > 0 && employeeData.rows[0].email) {
        await sendTicketEmail({
          type: "ticketResolved",
          email: employeeData.rows[0].email,
          name: employeeData.rows[0].employee_name,
          subject: `Ticket #${result.rows[0]?.docket_number} Created - Railtel e-Office Helpdesk`,
          ticketNumber: result.rows[0].docket_number,
        });
      }

      if (result.rows?.length > 0) {
        return NextResponse.json(
          {
            data: "SUCCESS",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            data: "ERROR",
          },
          {
            status: 200,
          }
        );
      }
    } else {
      await pool.query(
        `
            INSERT INTO ticket_remarks (
ticket_id,email_id,updated_at,remarks
)
VALUES($1,$2,NOW(),$3
)
            RETURNING *
            `,
        [ticketId, emailId, remarks]
      );
      const result1 = await pool.query(
        `
            UPDATE tickets SET status = 'INPROGRESS',updated_at = NOW() WHERE id = $1
            RETURNING *
            `,
        [ticketId]
      );

      if (result1.rows?.length > 0) {
        return NextResponse.json(
          {
            data: "SUCCESS",
          },
          {
            status: 200,
          }
        );
      } else {
        return NextResponse.json(
          {
            data: "ERROR",
          },
          {
            status: 200,
          }
        );
      }
    }
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

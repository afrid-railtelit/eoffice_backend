import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { remarks, ticketId, resolve, emailId } = await req.json();

    if (resolve) {
      const result = await pool.query(
        `
            UPDATE tickets SET status = 'RESOLVED',resolved_by = $1,updated_at = NOW() WHERE id = $2
            RETURNING *
            `,
        [emailId, ticketId]
      );
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
      const result = await pool.query(
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
            UPDATE tickets SET status = 'INPROGRESS',resolved_by = $1,updated_at = NOW() WHERE id = $2
            RETURNING *
            `,
        [emailId, ticketId]
      );
      console.log(result1.rows)
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

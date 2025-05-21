import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { emailId, disabled } = await req.json();
    if (!emailId || disabled === undefined) {
      return NextResponse.json(
        {
          data: "BAD_REQUEST",
        },
        {
          status: 400,
        }
      );
    }

    const result = await pool.query(
      "UPDATE users SET disabled = $1,updated_at = NOW() WHERE email_id = $2",
      [disabled ? "TRUE" : "FALSE", emailId]
    );
    console.log(result?.rowCount);

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

import { encodeString } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { emailId, password } = await req.json();
    if (!emailId || !password) {
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
      `UPDATE users SET password = $1,initial_login = 'FALSE' WHERE email_id = $2`,
      [encodeString(password), emailId]
    );
    if (result.rowCount === 1) {
      return NextResponse.json(
        {
          data: "SUCCESS",
          initialLogin: false,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          data: "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
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

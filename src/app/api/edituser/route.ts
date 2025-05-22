import { sendEmail } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { emailId, disabled, method, userData } = await req.json();
    if (!emailId || method === undefined) {
      return NextResponse.json(
        {
          data: "BAD_REQUEST",
        },
        {
          status: 400,
        }
      );
    }
    let result;
    if (method === "enable") {
      result = await pool.query(
        "UPDATE users SET disabled = $1,updated_at = NOW() WHERE email_id = $2 RETURNING *",
        [disabled ? "TRUE" : "FALSE", emailId]
      );
    } else if (method === "editUser") {
      result = await pool.query(
        "UPDATE users SET email_Id = $1,updated_at = NOW(),mobile_number = $2,first_name = $3,last_name = $4 WHERE email_id = $5",
        [
          userData?.email,
          userData?.mobile,
          userData?.firstName,
          userData?.lastName,
          emailId,
        ]
      );
    }

    if (result?.rowCount === 1) {
      if (method === "enable") {
        sendEmail({
          name:
            result.rows[0]?.first_name +
            " " +
            (result.rows[0].last_name ? result.rows[0].last_name : ""),
          email: emailId,
          enabled: !disabled,
          password:""
        });
      }

      return NextResponse.json({
        data: "SUCCESS",
      });
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

import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function GET(req: Request) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.users WHERE email_id != 'afridrailtelit@gmail.com' ORDER BY updated_at DESC  "
    );
    const users = result.rows.map(({ password, ...rest }) => ({
      firstName: rest?.first_name,
      lastName: rest?.last_name,
      emailId: rest?.email_id,
      mobileNumber: rest?.mobile_number,
      initialLogin: rest?.initial_login,
      disabled: rest?.disabled,
      deleted: rest?.deleted,
      createdAt: rest?.created_at,
      role: rest?.role,
    }));

    return NextResponse.json({
      data: "SUCCESS",
      users,
    });
  } catch (_) {
    return NextResponse.json({ data: "SERVER_ERROR" }, { status: 500 });
  }
}

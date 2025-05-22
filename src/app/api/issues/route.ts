import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT issue_code AS issueCode,issue_description AS issueDescription,issue_resolution AS issueResoltion FROM issues"
    );

    return NextResponse.json(
      {
        data: "SUCCESS",
        issues: result.rows,
      },
      {
        status: 200,
      }
    );
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

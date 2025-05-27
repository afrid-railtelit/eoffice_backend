import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const value = searchParams.get("value");

    const result = await pool.query(
      `SELECT zone AS zone,organisation_unit AS "organisationUnit",employee_code AS "employeeCode",date_of_birth AS "dateOfBirth",designation,id,post,email,mobile,employee_name AS "employeeName"
       FROM employees WHERE employee_code = $1 OR email = $1 LIMIT 1`,
      [value]
    );

    if (result.rows?.length === 0) {
      return NextResponse.json(
        {
          data: "EMPLOYEE_NOT_FOUND",
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          data: "SUCCESS",
          employee: result.rows,
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

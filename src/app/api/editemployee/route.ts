import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      employeeCode,
      employeeDesignation,
      employeeName,
      employeeEmail,
      employeeMobile,
      employeeOrganisationUnit,
      employeeDataOfBirth,
      employeePost,
      division,
      zone,
    } = await req.json();

    const employeeData = await pool.query(
      `
        SELECT * FROM employees WHERE employee_code = $1 LIMIT 1
        `,
      [employeeCode]
    );

    if (employeeData?.rows?.length === 0) {
      return NextResponse.json({
        data: "EMPLOYEE_NOT_FOUND",
      });
    } else {
      await pool.query(
        `
  UPDATE employees 
  SET 
    zone = $1,
    division = $2,
    email = $3,
    mobile = $4,
    designation = $5,
    date_of_birth = $6,
    employee_name = $7,
    employee_code = $8,
    organisation_unit = $9,
    post = $10
  WHERE employee_code = $8
  `,
        [
          zone,
          division,
          employeeEmail,
          employeeMobile,
          employeeDesignation,
          employeeDataOfBirth,
          employeeName,
          employeeCode,
          employeeOrganisationUnit,
          employeePost,
        ]
      );
      return NextResponse.json({
        data: "SUCCESS",
      });
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      data: "SERVER_ERROR",
    });
  }
}

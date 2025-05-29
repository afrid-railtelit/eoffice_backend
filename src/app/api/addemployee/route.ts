/* eslint-disable @typescript-eslint/no-explicit-any */

import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
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
      employees,
    } = await req.json();

    if (employees && employees?.length > 0) {
      const values: any[] = [];
      const placeholders: string[] = [];

      employees.forEach((user: any, i: any) => {
        const offset = i * 10;

        values.push(
          user["Zone"],
          user["Division"],
          user["Email id"],
          user["Mobile number"],
          user["Designation"],
          user["Date of birth"],
          user["Employee name"],
          user["Employee code"],
          user["Organisation unit"],
          user["Post"]
        );

        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
            offset + 5
          }, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${
            offset + 9
          } , $${offset + 10} )`
        );
      });

      if (values.length > 0) {
        const insertQuery = `
            INSERT INTO employees(zone,division,email,mobile,designation,date_of_birth,employee_name,employee_code,organisation_unit,post) VALUES ${placeholders.join(
              ", "
            )}
            ON CONFLICT (employee_code) DO NOTHING `;

        await pool.query(insertQuery, values);
        return NextResponse.json(
          {
            data: "SUCCESS",
          },
          {
            status: 200,
          }
        );
      }
    }

    const checkUser = await pool.query(
      "SELECT 1 FROM employees WHERE employee_code = $1",
      [employeeCode]
    );

    if (checkUser?.rows?.length > 0) {
      return NextResponse.json(
        {
          data: "USER_EXISTS",
        },
        {
          status: 200,
        }
      );
    }

    const result = await pool.query(
      "INSERT INTO  employees(zone,division,email,mobile,designation,date_of_birth,employee_name,employee_code,organisation_unit,post) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
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

    if (result?.rowCount === 1) {
      return NextResponse.json({
        data: "SUCCESS",
      });
    } else {
      return NextResponse.json({
        data: "ERROR",
      });
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

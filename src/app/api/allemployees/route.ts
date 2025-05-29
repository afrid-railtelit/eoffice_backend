/* eslint-disable @typescript-eslint/no-unused-vars */
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pagination, searchValue, zone, division } = await req.json();
    const result = await pool.query(
      `

SELECT 
  COUNT(*) OVER() AS "total",
  zone AS "zone",
  division,designation,
  id ,
  employee_code AS "employeeCode",
  date_of_birth AS "dateOfBirth",
  email,
  mobile ,
  organisation_unit AS "organisationUnit",
  post AS "post",
  employee_name AS "employeeName"
FROM employees

WHERE 
      lower(trim(zone)) = $6 AND
      lower(trim(division)) = $7 AND (
        employee_code = $3 OR
        email ilike $4 OR
        lower(employee_name) ILIKE $5 OR
        mobile ilike $4
      )

offset $1
limit $2

`,
     [
    pagination?.pageIndex * pagination?.pageSize,        
    pagination?.pageSize,                               
    searchValue?.trim(),                                 
    `%${searchValue?.trim()}%`,           
    `%${searchValue?.trim()?.toLowerCase()}%`,           
    zone?.trim()?.toLowerCase(),                         
    division?.trim()?.toLowerCase(),                     
  ]
    );
    const total = result.rows[0]?.total ? result.rows[0]?.total : 0;

    return NextResponse.json({
      data: "SUCCESS",
      totalCount: total,
      employees: result?.rows?.map(({ total, ...rest }, index) => {
        return { ...rest, sNo: index + 1 };
      }),
      
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      data: "SERVER_ERROR",
    });
  }
}

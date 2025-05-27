/* eslint-disable @typescript-eslint/no-unused-vars */
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pagination, searchValue, status, criticalLevel } = await req.json();

    const result = await pool.query(
      `
SELECT COUNT(*) OVER() as "total" , t.id as "ticketId",t.docket_number AS "ticketNumber", t.critical_level AS "criticalLevel",
json_build_object(
'employeeName', e.employee_name,
'employeeMobile',e.mobile,
'employeeCode',e.employee_code,
'employeeDateOfBirth',e.date_of_birth,
'employeeEmail',e.email
) AS "employeeData",
 

json_build_object(
'issueCode',i.issue_code,
'issueDescription',i.issue_description,
'issueId',i.id,
'issueResolution',issue_resolution
) as "issueData",
t.created_by AS "createdBy",
t.created_at as "createdAt",
t.updated_at as "updatedAt",
t.status AS "ticketStatus",
ru.email_id As "resolvedBy",
COALESCE(remarks.remark_list, '[]') AS "remarks"

FROM tickets t 
INNER JOIN issues i ON i.id = t.issue_id::uuid
INNER JOIN users u ON u.email_id = t.created_by 
INNER JOIN employees e ON e.employee_code = t.employee_code
LEFT JOIN LATERAL (
  SELECT json_agg(
    json_build_object(
      'id',tr.id, 
      'remark', tr.remarks,
      'createdAt', tr.created_at,
      'updatedAt', tr.updated_at,
      'createdBy', tr.email_id,
      'ticketId',tr.ticket_id
    ) ORDER BY tr.created_at ASC
  ) AS remark_list
  FROM ticket_remarks tr
  WHERE tr.ticket_id = t.id
) AS remarks ON TRUE

LEFT JOIN users ru on ru.email_id = t.resolved_by
WHERE (e.mobile ilike $3 OR REGEXP_REPLACE(LOWER(TRIM(e.employee_name)), '[^a-z]', '', 'g') ILIKE $4 OR LOWER(TRIM(e.email)) ilike $5) 
AND t.status ilike $6
AND t.critical_level ilike $7
ORDER BY t.created_at DESC
OFFSET $1
LIMIT $2

        `,
      [
        pagination?.pageIndex * pagination?.pageSize,
        pagination?.pageSize,
        `%${searchValue}%`,
        `%${searchValue
          .trim()
          .toLowerCase()
          .replace(/[^a-z]/g, "")}%`,
        `%${searchValue}%`,
        `%${status}%`,
        `%${criticalLevel}%`,
      ]
    );
    const totalCount = result.rows[0]?.total;

    return NextResponse.json({
      data: "SUCCESS",
      tickets: {
        total: totalCount,
        pageIndex: pagination?.pageIndex,
        pageSize: pagination?.pageSize,
        searchValue: searchValue,
        status,
        data: result?.rows?.map(({ total, ...rest }, index) => {
          return {
            ...rest,
            sNo: index + 1,
          };
        }),
      },
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

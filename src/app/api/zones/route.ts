import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const results = await pool.query(
      `
        SELECT zones.code AS "zoneCode",
                zones.name AS "zoneName",
                zones.description AS "zoneDescription",
                COALESCE(
                    json_agg(json_build_object(
                        'divisionCode',divisions.code,
                        'divisionName',divisions.name                    
                    ) ),'[]'
                ) AS  divisions FROM zones 
                 LEFT JOIN divisions ON divisions.zone_id = zones.id
                 GROUP BY zones.code,zones.name,zones.description
        
        `
    );

    return NextResponse.json({
      data: "SUCCESS",
      zones: results.rows,
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

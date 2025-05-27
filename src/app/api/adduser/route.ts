/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  encodeString,
  generateRandomPassword,
  sendEmail,
} from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, mobile, firstName, lastName, users,level } = await req.json();

    if (
      (!/^\S+@\S+$/i.test(email) || firstName?.length < 3 || !firstName) &&
      !users
    ) {
      return NextResponse.json(
        {
          data: "BAD_REQUEST",
        },
        {
          status: 400,
        }
      );
    }

    if (users && users?.length > 0) {
      const values: any[] = [];
      const placeholders: string[] = [];

      users.forEach((user: any, i: any) => {
        const tempPassword = generateRandomPassword(8);
        const offset = i * 10;

        values.push(
          user["First name"],
          user["Last name"],
          user["Email id"],
          user["Mobile number"],
          true, // initial_login
          false, // disabled
          false, // deleted
          encodeString(tempPassword),
          "EMPLOYEE",
          user["Level"]
        );

        placeholders.push(
          `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${
            offset + 5
          }, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9} , $${offset + 10} )`
        );
      });

      if (values.length > 0) {
        const insertQuery = `
            INSERT INTO users (
            first_name, last_name, email_id, mobile_number, initial_login,
            disabled, deleted, password, role,level
            ) VALUES ${placeholders.join(", ")}
            ON CONFLICT (email_id) DO NOTHING `;

        await pool.query(insertQuery, values);
        return NextResponse.json({
          data:"SUCCESS"
        },{
          status:200
        })
      }
    }

    const checkUser = await pool.query(
      "SELECT 1 FROM users WHERE email_id = $1",
      [email]
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

    const tempPassword = generateRandomPassword(8);

    const result = await pool.query(
      "INSERT INTO  users(first_name,last_name,email_id,mobile_number,initial_login,disabled,deleted,password,role,level) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [
        firstName,
        lastName,
        email,
        mobile,
        true,
        false,
        false,
        encodeString(tempPassword),
        "EMPLOYEE",
        level
      ]
    );

    if (result?.rowCount === 1) {
      await sendEmail({
        email,
        name: firstName + " " + lastName,
        password: tempPassword,
      });
      return NextResponse.json({
        data: "SUCCESS",
      });
    } else {
      return NextResponse.json({
        data: "ERROR",
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

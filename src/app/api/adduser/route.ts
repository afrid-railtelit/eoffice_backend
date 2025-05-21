import { encodeString, generateRandomPassword, sendEmail } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // await pool.query("DELETE FROM users WHERE email_id = 'afridayan01@gmail.com' ")

  // return NextResponse.json(
  //       {
  //         data: "BAD_REQUEST",
  //       },
  //       {
  //         status: 400,
  //       }
  //     );

  try {
    const { email, mobile, firstName, lastName } = await req.json();

    if (!/^\S+@\S+$/i.test(email) || firstName?.length < 3 || !firstName) {
      return NextResponse.json(
        {
          data: "BAD_REQUEST",
        },
        {
          status: 400,
        }
      );
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
      "INSERT INTO  users(first_name,last_name,email_id,mobile_number,initial_login,disabled,deleted,password,role) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
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

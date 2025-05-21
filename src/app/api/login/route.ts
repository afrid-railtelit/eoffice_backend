import { decodeString, generateOTP, sendOtpEmail } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { otp, emailId, password } = await req.json();

    if (!emailId || !password) {
      return NextResponse.json(
        {
          data: "BAD_REQUEST",
        },
        {
          status: 400,
        }
      );
    }

    const userData = await pool.query(
      `SELECT email_id as "emailId",first_name as "firstName",last_name as "lastName",password,otp,role FROM users WHERE email_id = $1`,
      [emailId]
    );

    if (userData?.rows?.length === 0) {
      return NextResponse.json(
        {
          data: "USER_NOT_FOUND",
        },
        {
          status: 200,
        }
      );
    }

    if (decodeString(userData?.rows[0]?.password) === password) {
      if (!otp) {
        const tempOtp = generateOTP(6);
        const result = await pool.query(
          "UPDATE users set otp = $1 WHERE email_id = $2",
          [tempOtp, emailId]
        );
        if (result?.rowCount === 1) {
          sendOtpEmail({
            email: userData?.rows[0]?.emailId,
            name: userData?.rows[0]?.firstName + userData?.rows[0]?.lastName,
            otp: tempOtp,
          });
          return NextResponse.json(
            {
              data: "OTP_SENT",
            },
            { status: 200 }
          );
        } else
          return NextResponse.json(
            {
              data: "ERROR",
            },
            {
              status: 500,
            }
          );
      } else {
        if (userData?.rows[0]?.otp?.toString() === otp?.toString()) {
          return NextResponse.json({
            data: "SUCCESS",
            user: userData?.rows[0],
          });
        } else
          return NextResponse.json(
            {
              data: "INVALID_OTP",
            },
            {
              status: 200,
            }
          );
      }
    } else {
      return NextResponse.json(
        {
          data: "WRONG_PASSWORD",
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

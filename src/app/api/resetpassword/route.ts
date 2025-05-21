import { encodeString, generateOTP, sendOtpEmail } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { emailId, password, otp } = await req.json();
    if (!emailId) {
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
      "SELECT * FROM users WHERE email_id = $1",
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

    if (!otp) {
      const tempOtp = generateOTP(6);
      const result = await pool.query(
        "UPDATE users set otp = $1 WHERE email_id = $2",
        [tempOtp, emailId]
      );
      if (result?.rowCount === 1) {
        sendOtpEmail({
          email: userData?.rows[0]?.email_id,
          name: userData?.rows[0]?.first_name + userData?.rows[0]?.last_name,
          otp: tempOtp,
          purpose: "reset-password",
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
        if(password){
          const result = await pool.query(
          "UPDATE users SET  password = $1 WHERE email_id = $2",
          [encodeString(password), emailId]
        );
        if (result?.rowCount === 1) {
          return NextResponse.json(
            {
              data: "SUCCESS",
            },
            {
              status: 200,
            }
          );
        }

        return NextResponse.json(
          {
            data: "ERROR",
          },
          {
            status: 500,
          }
        );
        }
        else{
          return NextResponse.json({
            data:"OTP_SUCCESS"
          },{
            status:200
          })
        }
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
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        data: "SERVER_ERRO",
      },
      {
        status: 500,
      }
    );
  }
}

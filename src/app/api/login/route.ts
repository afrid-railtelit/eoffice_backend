import { decodeString, generateOTP, sendOtpEmail } from "@/apputils/appUtils";
import pool from "@/apputils/pool";
import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: Request) {
  try {
    const headers = Object.fromEntries(req.headers);

    const forwardedFor = headers["x-forwarded-for"];
    const ip = forwardedFor.replace("::ffff:", "") || "Unknown";
    const uaString = headers["user-agent"] || "";
    const parser = new UAParser(uaString);
    const ua = parser.getResult();

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
      `SELECT email_id as "emailId",first_name as "firstName",last_name as "lastName",password,otp,role,disabled,initial_login AS "initialLogin",level FROM users WHERE email_id = $1`,
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
    if (userData?.rows[0]?.disabled === true) {
      return NextResponse.json(
        {
          data: "DISABLED",
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
          const lastLoginDetails = await pool.query(
            `SELECT ip,device_type AS "deviceType",os_name AS "osName",os_version AS "osVersion",browser_name AS "broswerName",email_id AS "emailId",updated_at as "updatedAt" 
             FROM browser_details  WHERE email_id = $1 ORDER BY updated_at DESC LIMIT 1`,
            [emailId]
          );

          await pool.query(
            `INSERT INTO  browser_details (ip,device_type,os_name,os_version,browser_name,email_id) VALUES($1,$2,$3,$4,$5,$6)`,
            [
              ip,
              ua?.device?.type ?? "desktop",
              ua?.os?.name,
              ua?.os?.version,
              ua?.browser?.name,
              emailId,
            ]
          );

          return NextResponse.json({
            data: "SUCCESS",
            user: userData?.rows[0],
            lastLoginDetails: lastLoginDetails?.rows[0],
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

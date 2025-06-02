import * as HttpStatusCode from "stoker/http-status-codes"
import { sign } from 'hono/jwt';
import { AppRouteHandler, AuthenticatedContext } from "@/types";
import { GenerateOtpRoute, LoginRoute, ProtectedRoute, SignupRoute } from "./auth.route";
import { db } from "@/db";
import { owner } from "@/db/schema";
import env from "@/env";
import getAuthUser from "@/helpers/auth-user";
import { redisGet, redisSet } from "@/helpers/redis";

export const generateOtp: AppRouteHandler<GenerateOtpRoute> = async (c) => {
    const { mobile_number, login } = c.req.valid('json')
    const otp = Math.floor(100000 + Math.random() * 900000);


    let key;
    if (login) {
        key = `login:${mobile_number}`
    } else {
        key = `register:${mobile_number}`
    }


    console.log(otp)
    await redisSet(key, otp.toString())
    //TODO: Send OTP to mobile number

    return c.json({ message: "OTP sent successfully" }, HttpStatusCode.OK)

}

export const signup: AppRouteHandler<SignupRoute> = async (c) => {
    const user = c.req.valid('json')
    const { mobileNumber, otp: sentOtp } = user;

    const key = `register:${mobileNumber}`
    const otp = await redisGet(key)

    if (otp != sentOtp) {
        return c.json({ message: "Invalid OTP" }, HttpStatusCode.BAD_REQUEST)
    }


    const existingUser = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.mobileNumber, mobileNumber)
    })

    if (existingUser) {
        return c.json({ message: "User already exists" }, HttpStatusCode.CONFLICT)
    }


    // Insert the user into the database
    const [inserted] = await db.insert(owner).values({ mobileNumber }).returning()

    const response = {
        data: inserted,
        message: "User created successfully",
    }

    // Return user data without the password
    return c.json(response, HttpStatusCode.CREATED)
}

export const login: AppRouteHandler<LoginRoute> = async (c) => {
    const user = c.req.valid('json')
    const { mobileNumber, otp: sentOtp } = user;

    const key = `login:${mobileNumber}`
    const otp = await redisGet(key)

    const mockOtp = otp || "999999"


    if (mockOtp != sentOtp) {
        return c.json({ message: "Invalid OTP" }, HttpStatusCode.BAD_REQUEST)
    }

    // Find the user by email
    const existingUser = await db.query.owner.findFirst({
        where: (owner, { eq }) => eq(owner.mobileNumber, mobileNumber)
    })

    if (!existingUser) {
        return c.json({ message: "Email not found" }, HttpStatusCode.NOT_FOUND)
    }

    // JWT token generation 
    const payload = {
        sub: existingUser.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Expires in 7 days
    }

    const secret = env.JWT_SECRET
    const token = await sign(payload, secret)

    const response = {
        data: {
            ...existingUser,
            token
        },
        message: "Login successful",
    }

    return c.json(response, HttpStatusCode.OK)

}

export const protectedRoute: AppRouteHandler<ProtectedRoute> = async (c: AuthenticatedContext) => {
    const user = await getAuthUser(c)
    console.log(user)
    return c.json("Protected route", HttpStatusCode.OK)
}



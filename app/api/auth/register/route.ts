
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({
                error: "Invalid Credentials"
            }, { status: 400 })
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return NextResponse.json({
                error: "User already registered"
            }, { status: 400 })
        }

        await User.create({ email, password });

        return NextResponse.json({
            message: "User registered Successfully"
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            error: "Failed to registered"
        }, { status: 400 })
    }
}
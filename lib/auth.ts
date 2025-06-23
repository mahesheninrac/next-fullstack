import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(Credentials) {
                if (!Credentials?.email || !Credentials?.password) {
                    throw new Error("Credentials missing")
                }

                try {
                    await connectToDatabase()

                    const user = await User.findOne({ email: Credentials.email });
                    if (!user) {
                        throw new Error("User not found")
                    }

                    const isValid = await bcrypt.compare(Credentials.password, user.password)

                    if (!isValid) {
                        throw new Error("Invalid Credentials")
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email
                    }
                } catch (error) {
                    throw error
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET
}
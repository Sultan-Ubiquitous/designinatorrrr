import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import 'dotenv/config';
import prisma from "./prisma.js";

const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    socialProviders:{
        google:{
            prompt: "select_account+consent",
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
        }
    },
    trustedOrigins: ['http://localhost:3003']
})
export default auth;
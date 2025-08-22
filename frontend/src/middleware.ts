import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(req: NextRequest) {
    const sessionCookie = getSessionCookie(req);
    console.log('Reached here');
    
    if(!sessionCookie){
        return NextResponse.redirect(new URL("/signin", req.url));
    }
}

export const config = {
  matcher: ["/testing", "/isthisworking", "/dashboard"],
};

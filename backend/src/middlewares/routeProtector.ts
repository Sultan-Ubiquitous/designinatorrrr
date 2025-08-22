import { Request, Response, NextFunction } from "express";
import auth from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const isAuthorized = async (req: Request, res: Response, next: NextFunction ) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });

    if(!session?.user.email){
        res.status(401).send('Invalid Credentials');
        return;
    }

     next();
}

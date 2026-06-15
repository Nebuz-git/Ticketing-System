import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request , res: Response , next: NextFunction) => {
    try {
        //get token from header (Authorization)
        const authHeader = req.headers.authorization

        if(!authHeader){
            return res.status(401).json({ message: "No token provided" });
        }

        // format:"Bearer token" (Transformation) 
         const token = authHeader.split(" ")[1];

         if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
          }

          // verify token (verfication)
          const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as {
            userId: string;
            email: string;
            role: "employee" | "support" | "admin";
         }

         //attach user to request ( mapping)
         (req as any).user = decoded
         
         //continue 
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
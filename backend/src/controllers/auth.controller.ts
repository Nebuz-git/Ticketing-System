import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../extensions/prisma"

export const register = async (req: Request , res: Response) => {
    try {
      const { username, email, password, department } = req.body;
        // basic check
        if(!email || !password || !username){
            return res.status(400).json({message: "username, email and password are required"})
        }
        // check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: {email},
        });

        if(existingUser) {
            return res.status(409).json({message: "User already exist"})
        }
        // hash the passowrd
        const hashedPassowrd = await bcrypt.hash(password,10)

        //create user
        const user = await prisma.user.create({
            data: {
              username,
              email,
              password: hashedPassowrd,
              department,
              role: "employee",
            }
        })

        //return response 
        return res.status(201).json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            department: user.department
        })


    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}


export const login = async (req: Request , res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({message: "Email and Password Required"})
        }
        // 2. find user by email
        const user = await prisma.user.findUnique({
          where: { email },
         });

         if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          //compare passwords
          const isMatch = await bcrypt.compare(password, user.password)

          if(!isMatch){
            return res.status(401).json({ message: "Invalid credentials" });
          }
          
          if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET missing");
          }
          const secret = process.env.JWT_SECRET!;
          const expiresIn = process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];


          //create token
          const token = jwt.sign(
            {
              userId: user.id,
              email: user.email,
              role: user.role,
            },
            secret,
            {
              expiresIn,
            }
          );
          //response
        return res.json({
          token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              department: user.department,
          },
          });         
      
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return res.status(500).json({ message: "Server error" });
    }
}
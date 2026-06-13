import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../extensions/prisma"

export const register = async (req: Request , res: Response) => {
    try {
        const { email , password } = req.body
        // basic check
        if(!email || !password){
            return res.status(400).json({message: "email and password required"})
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
                email,
                password: hashedPassowrd
            }
        })

        //return response 
        return res.status(201).json({
            id: user.id,
            email: user.email
        })


    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}


export const login = async (req: Request , res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({messgae: "Email and Password Required"})
        }
        // 2. find user
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

          const secret = process.env.JWT_SECRET!;
          const expiresIn = process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"];
          //create token
          const token = jwt.sign(
            {
              userId: user.id,
              email: user.email,
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
              email: user.email,
          },
          });         
      
    } catch (error) {
        
    }
}
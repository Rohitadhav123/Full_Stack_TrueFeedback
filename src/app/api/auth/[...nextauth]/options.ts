import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";



export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                
                try {
                    // Find user by email or username
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.email },
                            { username: credentials.email }, // assuming you might use email field for username too
                        ]
                    });

                    if (!user) {
                        throw new Error('No user found with this email');
                    }

                    // Check if user is verified (if you have email verification)
                    if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                    }

                    // Compare password
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    
                    if (isPasswordCorrect) {
                        // Return user object (this will be stored in the token)
                        return {
                            _id: user._id,
                            email: user.email,
                            username: user.username,
                            isVerified: user.isVerified,
                        };
                    } else {
                        throw new Error('Incorrect password');
                    }

                } catch (error: any) {
                    throw new Error(error.message || 'Authentication failed');
                }
            }
        })
    ],
    callbacks: {
         async session({ session, token }) {
            if(token)
            {
                session.user._id=token._id
                session.user.isVerified=token.isVerified
                session.user.isAcceptingMessage=token.isAcceptingMessage
                session.user.username=token.username
            }
      return session
    },
    async jwt({ token, user }) {

        if(user)
        {
            token._id=user._id?.toString()
            token.isVerified=user.isVerified
            token. isAcceptingMessage=user.isAcceptingMessage
            token.username=user.username
        }
      return token
    }
    },
    pages:{
        signIn: '/sign-in',
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,

   
    }

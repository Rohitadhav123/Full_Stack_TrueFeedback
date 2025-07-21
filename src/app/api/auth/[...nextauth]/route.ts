import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import { authOptions } from "./options";


const handler =NextAuth(authOptions)


export {handler as Get ,handler as POST}
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from 'next-auth'
import { success } from "zod";

export async function POST(request:Request) {
    await dbConnect()

    const session=getServerSession(authOptions)
    const user:User=session?.user

    if(!session || !session.user)
    {
        return Response.json({
            success:false,
            message:"Not Authenticated"
        },{status:401})
    }

    const userId=user._id
    const {acceptMessages}=await request.json()

    try {
      const updatedUser=  await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessage:acceptMessages
            },
            {
                new:true
            }
        )
        if(!updatedUser)
        {
             return Response.json({
            success:false,
            message:"failed to updated user status to accept messages"
        },{status:500})
        }
         return Response.json({
            success:true,
            message:"Message acceptance updated suessfully"
        },{status:200})
    } catch (error) {
        console.log("failed to update user status to accept message")
         return Response.json({
            success:false,
            message:"Not Authenticated"
        },{status:500})
    }
}
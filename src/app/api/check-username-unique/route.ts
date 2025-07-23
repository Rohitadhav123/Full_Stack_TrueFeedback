import {success, z} from "zod"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { usernameValidation } from "@/schemas/signUpSchema"


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request:Request)
{

    
    await dbConnect()

    try {
        const {searchParams}=new URL(request.url)
        const queryParam={
            username:searchParams.get('username')
        }

        // validate with zod

        const result=UsernameQuerySchema.safeParse(queryParam)
        if(!result.success)
        {
            const usernameErrors=result.error.format().username?._errors || []

            return Response.json({
                success:false,
                message:usernameErrors?.length>0? usernameErrors.join(',')
                :'Invalid querey parameters'
            },{status:400})
        }



        const {username}=result.data
       const exitingVerifiedUser=await UserModel.findOne({username,isVerified:true})
        if(exitingVerifiedUser)
        {
            return Response.json({
                success:false,
                message:"Username is already exist"
            },{status:400})
        }

        return Response.json({
                success:true,
                message:"Username is unique"
            },{status:400})


    } catch (error) {
        console.error("Error checking username",error)
        return Response.json({
            success:false,
            message:"Error checking username"
        },
    {status:500})
    }
}
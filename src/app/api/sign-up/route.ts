import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request:Request)
{
    await dbConnect();


    try {
        const {username,email,password}=await request.json()
        const exitingUserVerifiedByUsername= await UserModel.findOne({
            username,
            isVerified:true
        })
        if(exitingUserVerifiedByUsername){
            return Response.json({
                success:false,
                message:"Username is already taken"
            },{status:400})
        }

      const existingUserByEmail=await  UserModel.findOne({email})

      const VerifiedCode=Math.floor(100000+Math.random()*90000).toString()
      if(existingUserByEmail)
      {
        if(existingUserByEmail.isVerified)
        {
            return Response.json({   
            success:false,
                message:"User alredy exist with this email"
            },{status:400})
        }
        else{
            const hashPassword=await bcrypt.hash(password,10)
            existingUserByEmail.password=hashPassword;
            existingUserByEmail.verifyCode=VerifiedCode
            existingUserByEmail.verifyCodeExpiry=new Date(Date.now()+3600000)
            await existingUserByEmail.save()

        }
      }
      else{
       const hashPassword= await bcrypt.hash(password,10)
       const expiryDate=new Date()
       expiryDate.setHours(expiryDate.getHours()+1)

      const newUser= new UserModel({
         username,
            email,
            password:hashPassword,
            verifyCode:VerifiedCode,
            verifyCodeExpiry:expiryDate,
            isVerified:false,
            isAcceptingMessage: true,
            messages :[]
       })

       await newUser.save()
      }

      // send verification email

     const emailResponse= await sendVerificationEmail(
        email,
        username,
         VerifiedCode
      )

      if(!emailResponse.success)
      {
        return Response.json({   
            success:false,
                message:emailResponse.message
            },{status:500})
      }
      return Response.json({   
            success:true,
                message:"User Register Successfully. please verify email"
            },{status:201})


    } catch (error) {
        console.error('Error registering user',error)
        return Response.json(
            {
                success:false,
                message:"Error registring user"
            },
            {
                status:500
            }
        )
    }
}
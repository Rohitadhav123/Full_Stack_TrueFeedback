import { resend } from "@/lib/resend";



import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponce } from "@/types/ApiResponsce";
export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
):Promise<ApiResponce>{
    try {
        await resend.emails.send({
            // Use environment variable or fallback to resend.dev domain
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: email,
            subject :'Mystry message  | Verification code',
            react:VerificationEmail({username,otp:verifyCode}),
        })
         return{success:true,message: 'verification email end successfully'}
    } catch (emailError) {
        console.error("Error sending verification email",emailError)
        return{success:false,message: 'failed to send verification email'}
    }
}
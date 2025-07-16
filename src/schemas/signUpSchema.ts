import {z} from "zod"

export const usernameValidation= z
.string()
.min(2,"User name must be two characters")
.max(20,"User name no longer than  be 20 characters")
.regex( /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/,"Username must not contain special characheter")



export const singUpSchema=z.object({
    username :usernameValidation,
    email :z.string().email({message:"Invalid email address"}),
    password:z.string().min(6,{message:"Must be at least 6 char"}),
    
        

})
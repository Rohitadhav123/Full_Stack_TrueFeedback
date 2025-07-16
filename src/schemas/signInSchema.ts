import {z} from "zod"


export  const signINSchema =z.object({
    identifier:z.string(),
    password:z.string()
})
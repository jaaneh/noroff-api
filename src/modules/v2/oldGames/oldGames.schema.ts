import { z } from "zod"

export const oldGameSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  released: z.string(),
  image: z.string(),
  genre: z.string().array()
})

export const oldGameParamsSchema = z.object({
  id: z.coerce
    .number({
      invalid_type_error: "ID must be a number"
    })
    .int("ID must be an integer")
    .positive("ID must be a positive integer")
})

export type OldGameSchema = z.infer<typeof oldGameSchema>

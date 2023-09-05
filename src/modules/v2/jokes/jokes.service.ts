import { Joke } from "@prisma-api-v2/client"
import { db, getRandomNumber } from "@/utils"

export async function getJokes(sort: keyof Joke = "id", sortOrder: "asc" | "desc" = "asc", limit = 100, page = 1) {
  const [data, meta] = await db.joke
    .paginate({
      orderBy: {
        [sort]: sortOrder
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getJoke(id: number) {
  const [data, meta] = await db.joke
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function getRandomJoke() {
  const resultLength = await db.joke.count()
  const id = getRandomNumber(1, resultLength)

  const [data, meta] = await db.joke
    .paginate({
      where: { id }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

import { server } from "@/tests/server"
import { db } from "@/utils"

beforeEach(async () => {
  await db.$executeRaw`ALTER SEQUENCE "CatFact_id_seq" RESTART WITH 1;`
  await db.catFact.createMany({
    data: [
      {
        text: "On average, cats spend 2/3 of every day sleeping"
      },
      {
        text: "Unlike dogs, cats do not have a sweet tooth"
      }
    ]
  })
})

afterEach(async () => {
  const catFacts = db.catFact.deleteMany()

  await db.$transaction([catFacts])
  await db.$disconnect()
})

describe("[GET] /v2/cat-facts/:id", () => {
  it("should return single cat fact based on id", async () => {
    const response = await server.inject({
      url: "/api/v2/cat-facts/1",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(200)
    expect(res.data).toBeDefined()
    expect(res.data.id).toBeDefined()
    expect(res.data.text).toBe("On average, cats spend 2/3 of every day sleeping")
    expect(res.meta).toBeDefined()
    expect(res.meta).toStrictEqual({
      isFirstPage: true,
      isLastPage: true,
      currentPage: 1,
      previousPage: null,
      nextPage: null,
      pageCount: 1,
      totalCount: 1
    })
  })

  it("should return 404 if cat fact not found", async () => {
    const response = await server.inject({
      url: "/api/v2/cat-facts/3",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(404)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].message).toBe("No cat fact with such ID")
  })

  it("should throw zod error if id is not a number", async () => {
    const response = await server.inject({
      url: "/api/v2/cat-facts/invalid_id",
      method: "GET"
    })
    const res = await response.json()

    expect(response.statusCode).toBe(400)
    expect(res.data).not.toBeDefined()
    expect(res.meta).not.toBeDefined()
    expect(res.errors).toBeDefined()
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].message).toBe("ID must be a number")
  })
})

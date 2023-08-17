import { createVenueSchema, CreateVenueSchema, updateVenueSchema, UpdateVenueSchema } from "./venues.schema"
import { HolidazeVenue } from "@prisma-api-v2/client"
import { db } from "@/utils"
import { HolidazeVenueIncludes } from "./venues.controller"

const DEFAULT_MEDIA = [
  {
    url: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&fit=crop&h=900&q=80&w=1600",
    alt: "A hotel room with a bed, chair and table"
  }
]

export async function getVenues(
  sort: keyof HolidazeVenue = "name",
  sortOrder: "asc" | "desc" = "desc",
  limit = 100,
  page = 1,
  includes: HolidazeVenueIncludes = {}
) {
  const [data, meta] = await db.holidazeVenue
    .paginate({
      orderBy: {
        [sort]: sortOrder
      },
      include: {
        ...includes,
        meta: true,
        location: true,
        media: true
      }
    })
    .withPages({
      limit,
      page
    })

  return { data, meta }
}

export async function getVenue(id: string, includes: HolidazeVenueIncludes = {}) {
  const [data, meta] = await db.holidazeVenue
    .paginate({
      where: { id },
      include: {
        ...includes,
        meta: true,
        location: true,
        media: true
      }
    })
    .withPages({
      limit: 1
    })

  return { data: data[0], meta }
}

export async function createVenue(
  ownerName: string,
  createData: CreateVenueSchema,
  includes: HolidazeVenueIncludes = {}
) {
  const { meta, location, media, ...rest } = await createVenueSchema.parseAsync(createData)

  const venueMeta = await db.holidazeVenueMeta.create({
    data: { ...meta }
  })

  const venueLocation = await db.holidazeVenueLocation.create({
    data: { ...location }
  })

  const data = await db.holidazeVenue.create({
    data: {
      ...rest,
      media: media ? { createMany: { data: media } } : { createMany: { data: DEFAULT_MEDIA } },
      ownerName,
      metaId: venueMeta.id,
      locationId: venueLocation.id
    },
    include: {
      ...includes,
      meta: true,
      location: true
    }
  })

  return { data }
}

export async function updateVenue(id: string, updateData: UpdateVenueSchema, includes: HolidazeVenueIncludes = {}) {
  const { meta, location, media, ...rest } = await updateVenueSchema.parseAsync(updateData)

  const data = await db.holidazeVenue.update({
    where: { id },
    data: {
      ...rest,
      media: media
        ? { deleteMany: {}, createMany: { data: media } }
        : { deleteMany: {}, createMany: { data: DEFAULT_MEDIA } },
      meta: {
        update: {
          ...meta
        }
      },
      location: {
        update: {
          ...location
        }
      }
    },
    include: {
      ...includes,
      meta: true,
      location: true
    }
  })

  return { data }
}

export async function deleteVenue(id: string) {
  return await db.holidazeVenue.delete({
    where: { id }
  })
}

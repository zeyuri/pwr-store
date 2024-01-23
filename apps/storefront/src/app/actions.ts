import { listRegions } from "@lib/data"

import { Region } from "@medusajs/medusa"

export async function getRegion(countryCode: string) {
  try {
    const regions = await listRegions()

    if (!regions) {
      return null
    }

    const regionMap = new Map<string, Region>()

    regions.forEach((region) => {
      region.countries.forEach((c) => {
        regionMap.set(c.iso_2, region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    return region
  } catch (e: any) {
    console.log(e.toString())
    return null
  }
}

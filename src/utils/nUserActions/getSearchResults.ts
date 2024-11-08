import getSearchHotels from "./getSearchHotels"
import getSearchLocation from "./getSearchLocation"


const getSearchResults = async (
    text: string,
    location?: { lat: number, lng: number }
) => {

  
    const data = await Promise.all(
        [
            getSearchLocation(text, location),
            getSearchHotels(text, location)
        ]
    )

    return {
        locations: data[0],
        hotels: data[1]
    }
}

export default getSearchResults
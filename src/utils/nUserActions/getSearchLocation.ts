import { Client } from "@googlemaps/google-maps-services-js";
import { AxiosError } from "axios";
import Constant from "../../Constant/Constant";


const getSearchLocation = async (
    text: string,
    location?: { lat: number, lng: number }
) => {

    try {

        const query: {
            origin?: [number, number] | undefined,
            input: string,
            key: string,
            components: string[]
        } = {
            input: `${text}`,
            key: process.env.GOOGLE_MAPS_KEY as string,
            components: ["country:in"],
        }

        if (location) {
            query.origin = [location.lat, location.lng]
        }

        const response = await Constant.googleMapsClient.placeAutocomplete({
            params: query
        })

        return response.data.predictions.map(a => {

            let st = a.structured_formatting.secondary_text ? a.structured_formatting.secondary_text.split(",") : []
            if(st[st.length - 1] && st[st.length - 1].toLowerCase() == " india"){
                st = st.slice(0,st.length - 1)
            }
            return {
                name: `${a.structured_formatting.main_text}, ${st.join(",")}`,
                distance: a.distance_meters ? a.distance_meters / 1000 : undefined,
                id: a.place_id,
            }
        })
    } catch (err) {
        console.log((err as AxiosError))
    }

}

export default getSearchLocation
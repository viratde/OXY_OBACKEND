import Constant from "../../Constant/Constant"


const getLatLngFromPlaceId = async (
    placeId:string
) => {

    const response = await Constant.googleMapsClient.placeDetails({
        params:{
            place_id:placeId,
            key:process.env.GOOGLE_MAPS_KEY as string
        }
    })

    return response.data.result.geometry?.location
}


export default getLatLngFromPlaceId
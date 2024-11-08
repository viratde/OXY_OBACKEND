import Hotel from "../src/models/hotels/hotelModel"
import IReview from "../src/types/hotels/review"

const correctReview = async () => {

    const hotels = await Hotel.find().populate("reviews")
    for (let i = 0; i < hotels.length; i++) {
        const sHotel = hotels[i]
        sHotel.noOfReviews = sHotel.reviews.length
        sHotel.rating = sHotel.reviews.length > 0 ? (sHotel.reviews.reduce((acc,cur) => { return acc + (cur as IReview).ratingLevel },0) / sHotel.reviews.length) : 0
        sHotel.nearBy = {}
        sHotel.location = {
            type:"Point",
            coordinates:[sHotel.latitude,sHotel.longitude]
        }
        await sHotel.save()
        console.log(sHotel.noOfReviews,sHotel.rating)
    }

    

}

export default correctReview
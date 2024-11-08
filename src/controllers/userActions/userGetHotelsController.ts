import { Response, Request } from "express";
import Hotel from "../../models/hotels/hotelModel";
import getPricingOfDate from "../../utils/pricing/getPricingOfDate";
import moment from "moment-timezone";
import IHotel from "../../types/hotels/hotel";
import getPricing from "../../utils/pricing/getPricing";
import Location from "../../models/admins/locationSchema";

const userGetHotelsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {

    const hotels = await Hotel.find({
      isHotelListed: true
    }).populate("reviews");

    let date = moment.tz(`${moment(new Date()).format("DD-MM-YYYY")}-00-00-00`, "DD-MM-YYYY-HH-mm-ss", "Asia/Kolkata").format("DD-MM-YYYY")
    const pricings = await getPricing(hotels)

    let data: any[] = hotels.map(hotel => hotel.toObject({
      transform: function (doc, ret) {
        if (!ret.nearBy) {
          ret.nearBy = {}
        }
      }
    }))

    data = data.map((hot: IHotel) => {
      let prices = pricings[hot._id][Object.keys(pricings[hot._id])[0]][date]
      return {
        ...hot,
        minPrice: prices["pax1Price"],
        prices: pricings[hot._id]
      }
    })

    const locations = await Location.find()



    return res
      .status(200)
      .json({
        status: true,
        message: "Hotels Loaded Successfully",
        data: JSON.stringify(
          {
            hotels: data,
            locations: locations.map(a => {
              return {
                latitude: a.latitude,
                longitude: a.longitude,
                distance: a.distance,
                name: a.locationName,
                _id: a._id.toString()
              }
            })
          }
        ),

      });

  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Please try after some time." });
  }

};


export default userGetHotelsController
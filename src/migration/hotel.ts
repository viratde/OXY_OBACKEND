import hotels from "./hotel.json";

import Hotel from "../models/hotels/hotelModel";
import Room from "../models/hotels/roomSchema";
import IRoom from "../types/hotels/room";
import IReview from "../types/hotels/review";
import Review from "../models/hotels/reviewModel";
import mongoose from "mongoose";
import IHotel from "../types/hotels/hotel";

const run = async () => {
  let connection = await mongoose.connect(
    "mongodb://127.0.0.1:27017/OxyTsTestDatabase"
  );
  console.log(
    "Database Connected Successfully at",
    connection.connection.host,
    connection.connection.port
  );
};

run();

async function migrate() {
  for (let i = 0; i < hotels.length; i++) {
    let selectedHotel = hotels[i];
    const allRooms: IRoom[] = [];
    const allReviews: IReview[] = [];

    const migratedData = new Hotel({
      _id: selectedHotel._id.$oid,
      hotelName: selectedHotel.hotelName,
      hotelId: selectedHotel.hotelId,
      phoneNo: `91${selectedHotel.phoneNo}`,
      hotelAddress: selectedHotel.hotelAddress,
      hotelDescription: selectedHotel.hotelDescription,
      latitude: selectedHotel.latitude,
      longitude: selectedHotel.longitude,
      locationUrl: selectedHotel.locationUrl,
      checkIn: selectedHotel.checkIn,
      checkOut: selectedHotel.checkOut,
      refundPercentage: selectedHotel.refundPercentage,
      minPrice: selectedHotel.minPrice,
      maxPrice: selectedHotel.maxPrice,
      timezone: "Asia/Kolkata",
      restrictions: selectedHotel.restrictions,
      housePoliciesDos: selectedHotel.housePoliciesDos,
      housePoliciesDonts: selectedHotel.housePoliciesDonts,
      houseAmenities: selectedHotel.houseAmenities,
      imageData: Object.fromEntries(
        selectedHotel.imageData.map((image) => {
          return [image.type, image.images];
        })
      ),
      roomTypes: Object.fromEntries(
        selectedHotel.roomTypes.map((room) => {
          return [
            room.type,
            { availableRooms: room.availableRooms, features: room.features },
          ];
        })
      ),
      nearBy: { 
        "Restaurants":[]
       },
      hotelStructure: Object.fromEntries(
        selectedHotel.hotelStructure.map((strc) => {
          return [
            `Floor No ${strc.floorNo}`,
            strc.rooms.map((room) => {
              let newRoom = new Room({
                roomNo: room.roomNo,
                roomType: room.roomType,
                features: selectedHotel.roomTypes.find(
                  (type) => type.type == room.roomType
                )!.features,
              });
              allRooms.push(newRoom);
              return newRoom;
            }),
          ];
        })
      ),
      reviews: selectedHotel.reviews.map((review) => {
        let newReview = new Review({
          name: review.name,
          phoneNumber: `91${review.phoneNumber.$numberLong}`,
          bookingId: review.bookingId.toString(),
          ratingLevel: review.ratingLevel,
          ratingNote: review.ratingNote,
          date: review.date.$date,
        });
        return newReview;
      }),
    });
    for (let i = 0; i < allReviews.length; i++) {
      await allReviews[i].save();
    }
    for (let i = 0; i < allRooms.length; i++) {
      await allRooms[i].save();
    }
    await migratedData.save()
  }
}

migrate()
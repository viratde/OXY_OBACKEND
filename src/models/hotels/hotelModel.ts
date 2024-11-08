import mongoose, { Types } from "mongoose";
import IHotel from "../../types/hotels/hotel";
import { roomRepresentSchema } from "./roomSchema";
import OfficialTimeZonesWithOffset from "../../utils/timezones/OfficialTimeZoneOffsets";

const hotelSchema = new mongoose.Schema<IHotel>(
  {
    hotelName: {
      type: String,
      required: true,
    },
    hotelId: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    imageData: {
      type: Object,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    hotelAddress: {
      type: String,
      required: true,
    },
    hotelDescription: {
      type: String,
      required: true,
    },
    locationUrl: {
      type: String,
      required: true,
    },
    restrictions: {
      type: [String],
    },
    refundPercentage: {
      type: Number,
      default: 0,
    },
    checkIn: {
      type: String,
      required: true,
    },
    checkOut: {
      type: String,
      required: true,
    },
    housePoliciesDos: {
      type: [String],
    },
    housePoliciesDonts: {
      type: [String],
    },
    houseAmenities: {
      type: [String],
    },
    nearBy: {
      type: Object,
      required: true,
    },
    roomTypes: {
      type: Object,
      required: true,
      default: {}
    },
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    hotelStructure: {
      type: Object,
      of: [{ type: roomRepresentSchema }],
      default: [],
    },
    reviews: {
      type: [Types.ObjectId],
      ref: "reviews",
      default: [],
    },
    timezone: {
      type: String,
      required: true,
      enum: OfficialTimeZonesWithOffset.map(value => value.name)
    },
    isHotel: {
      type: Boolean,
      default: true,
      required: true,
    },
    isListed: {
      type: Boolean,
      default: true,
      required: true
    },
    isHotelListed: {
      type: Boolean,
      default: false,
      required: true
    },
    noOfReviews: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    location: {
      type: Object,
      required: true
    },
    tid: {
      type: String,
    }
  },
  { timestamps: true }
);

const Hotel = mongoose.model<IHotel>("Hotels", hotelSchema);
export default Hotel;

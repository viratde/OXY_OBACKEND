import IRoom from "./room";
import IReview from "./review";
import { Types } from "mongoose";
import { Document } from "mongoose";
import IPartner from "./partner";

export interface RoomType {
  availableRooms: number;
  features: Array<string>;
}

interface IHotel extends Document {
  hotelName: string;
  hotelId: string;
  phoneNo: string;
  hotelAddress: string;
  hotelDescription: string;
  latitude: number;
  longitude: number;
  locationUrl: string;
  isHotelListed: boolean;
  checkIn: string;
  checkOut: string;
  refundPercentage: number;
  minPrice: number;
  maxPrice: number;
  timezone: string,
  restrictions: Array<string>;
  housePoliciesDos: Array<string>;
  housePoliciesDonts: Array<string>;
  houseAmenities: Array<string>;
  imageData: { [key: string]: Array<string> };
  roomTypes: { [key: string]: RoomType };
  nearBy: { [key: string]: Array<string> };
  hotelStructure: { [key: string]: Array<IRoom> };
  reviews: Array<IReview | Types.ObjectId>;
  noOfReviews: number,
  rating: number
  isHotel: boolean,
  isListed: boolean,
  location: {
    type: string,
    coordinates: number[]
  },
  tid?:string
}

export default IHotel;

import Users from "./users.json"

import Hotel from "../models/hotels/hotelModel";
import Room from "../models/hotels/roomSchema";
import IRoom from "../types/hotels/room";
import IReview from "../types/hotels/review";
import Review from "../models/hotels/reviewModel";
import mongoose from "mongoose";
import IHotel from "../types/hotels/hotel";
import IUser from "../types/users/user";
import User from "../models/users/userModel";

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

async function mihrate(){
    for(let i=0;i<Users.length;i++){
        let sUser = Users[i]
        const aUser = new User(
            {
                name:sUser.name,
                phoneNumber:`91${sUser.phoneNumber}`,
                email:sUser.email,
                dob:sUser.dob,
                fcmToken:sUser.fcmToken
            }
        )
        await aUser.save()
    }
}
mihrate()
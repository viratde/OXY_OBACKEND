import { Request } from "express";
import IHotel, { RoomType } from "../../types/hotels/hotel";
import IRoom from "../../types/hotels/room";
import Room from "../../models/hotels/roomSchema";
import Hotel from "../../models/hotels/hotelModel";

interface roomData {
  roomNo: string;
  roomType: string;
}

const validateHotelReqData = async (
  req: Request,
  id: undefined | string
) => {
  const {
    hotelName,
    hotelId,
    phoneNo,
    hotelAddress,
    hotelDescription,
    latitude,
    longitude,
    locationUrl,
    checkIn,
    checkOut,
    refundPercentage,
    minPrice,
    maxPrice,
    isHotelListed,
    tid
  } = req.body;

  if (!hotelName || hotelName.length < 5) {
    return { status: false, message: "Please enter correct hotel name." };
  }

  if (!hotelId || hotelId.length < 7 || !isNaN(Number(hotelId))) {
    return {
      status: false,
      message:
        "Please enter hotel Id of minimum 7 letters including digits and letters.",
    };
  }

  if (!phoneNo || isNaN(phoneNo) || String(phoneNo).length != 12) {
    return {
      status: false,
      message: "Please enter correct phone number with country code.",
    };
  }

  if (!hotelAddress || hotelAddress.length < 10) {
    return {
      status: false,
      message: "Please enter correct hotel address of minimum 10 letters.",
    };
  }

  if (!hotelDescription || hotelDescription.length < 100) {
    return {
      status: false,
      message: "Please enter correct hotel description of minimum 100 letters.",
    };
  }

  if (isHotelListed == undefined || typeof isHotelListed != "boolean") {
    return {
      status: false,
      message: "Please enter correct listed status",
    };
  }

  if (!latitude || isNaN(latitude)) {
    return {
      status: false,
      message: "Please enter correct hotel latitude",
    };
  }

  if (!longitude || isNaN(longitude)) {
    return {
      status: false,
      message: "Please enter correct hotel longitude",
    };
  }

  if (!locationUrl || !locationUrl.startsWith("https://")) {
    return {
      status: false,
      message: "Please enter correct hotel location url.",
    };
  }

  if (!checkIn || checkIn.length != 5) {
    return {
      status: false,
      message: "Please enter correct check In Time",
    };
  }

  if (!checkOut || checkOut.length != 5) {
    return {
      status: false,
      message: "Please enter correct check Out Time",
    };
  }

  if (!minPrice || isNaN(minPrice)) {
    return {
      status: false,
      message: "Please enter correct minimum price.",
    };
  }

  if (!maxPrice || isNaN(maxPrice)) {
    return {
      status: false,
      message: "Please enter correct maximum price.",
    };
  }

  if (!refundPercentage || isNaN(refundPercentage)) {
    return {
      status: false,
      message: "Please enter correct refund percentage",
    };
  }
  //arra

  const restrictions: Array<string> = req.body.restrictions;
  const housePoliciesDos: Array<string> = req.body.housePoliciesDos;
  const housePoliciesDonts: Array<string> = req.body.housePoliciesDonts;
  const houseAmenities: Array<string> = req.body.houseAmenities;

  if (!restrictions) {
    return {
      status: false,
      message: "Please enter correct restrictions.",
    };
  }
  if (!housePoliciesDos) {
    return {
      status: false,
      message: "Please enter correct House Policies dos.",
    };
  }
  if (!housePoliciesDonts) {
    return {
      status: false,
      message: "Please enter correct House Policies donts.",
    };
  }

  if (!houseAmenities) {
    return {
      status: false,
      message: "Please enter correct House Amenities.",
    };
  }

  const imageData: { [key: string]: Array<string> } = req.body.imageData;

  if (!imageData) {
    return {
      status: false,
      message: "Please enter correct image Data",
    };
  }

  const roomTypes: { [key: string]: RoomType } = req.body.roomTypes;

  if (!roomTypes) {
    return {
      status: false,
      message: "Please enter correct room Types",
    };
  }
  const nearBy: { [key: string]: Array<string> } = req.body.nearBy;

  if (!nearBy) {
    return {
      status: false,
      message: "Please enter correct near bys",
    };
  }



  const hotelStructure: Array<Array<roomData>> = req.body.hotelStructure;

  let floorRooms = hotelStructure.flat();
  let allroomTypes = Object.keys(roomTypes);
  for (let i = 0; i < allroomTypes.length; i++) {
    let typeRooms = floorRooms.filter(
      (room) => room.roomType == allroomTypes[i]
    ).length;

    if (typeRooms < roomTypes[allroomTypes[i]].availableRooms) {
      return {
        status: false,
        message: `Add More ${allroomTypes[i]} Rooms`,
      };
    } else if (typeRooms > roomTypes[allroomTypes[i]].availableRooms) {
      return {
        status: false,
        message: `Remove some ${allroomTypes[i]} Rooms`,
      };
    }
  }

  let allRoomNos = floorRooms.map((room) => room.roomNo);
  if (allRoomNos.length != [...new Set(allRoomNos)].length) {
    return {
      status: false,
      message: `Two rooms cannot have same room number.`,
    };
  }

  let allTypes = [...new Set(floorRooms.map((room) => room.roomType))];
  let allExistTypes = Object.keys(roomTypes);

  for (let i = 0; i < allTypes.length; i++) {
    if (!allExistTypes.includes(allTypes[i])) {
      return {
        status: false,
        message: `${allTypes[i]} rooms does not exist in this hotel.`,
      };
    }
  }
  let structure: { [key: string]: Array<IRoom> } = {};
  for (let i = 0; i < hotelStructure.length; i++) {
    let rooms: Array<IRoom> = [];
    for (let j = 0; j < hotelStructure[i].length; j++) {
      let struct = hotelStructure[i][j];
      let room = new Room({
        roomNo: struct.roomNo,
        roomType: struct.roomType,
        features: roomTypes[struct.roomType].features,
      });
      await room.save()
      rooms.push(room);
    }
    structure[`Floor No${i + 1}`] = rooms;
  }

  let data = {
    hotelName,
    hotelId,
    phoneNo,
    hotelAddress,
    hotelDescription,
    latitude,
    longitude,
    locationUrl,
    checkIn,
    checkOut,
    refundPercentage,
    minPrice,
    maxPrice,
    restrictions,
    housePoliciesDos,
    housePoliciesDonts,
    houseAmenities,
    imageData,
    nearBy,
    hotelStructure: structure,
    roomTypes,
    timezone: "Asia/Kolkata",
    isHotelListed,
    location: {
      type: "Point",
      coordinates: [latitude, longitude]
    },
    tid: tid ? tid.toString() : undefined
  };


  let hotel;
  if (id) {
    hotel = await Hotel.findByIdAndUpdate(id, data, { new: true });
  } else {
    hotel = new Hotel(data);
    await hotel.save();
  }
  return {
    status: true, message: "Ok", data: hotel?.toObject(
      {
        transform: function (doc, ret) {
          if (!ret.nearBy) {
            ret.nearBy = {}
          }
        }
      }
    )
  };
};
export default validateHotelReqData;

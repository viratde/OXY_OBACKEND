import { Request, Response } from "express"
import moment from "moment"
import Hotel from "../../models/hotels/hotelModel"
import createBooking from "../booking/createBooking"
import Bookings from "../../models/bookings/bookingModel"
import codeGenerate from "../common/codeGenerate"
import IAllotedRoom from "../../types/bookings/allotedRoom"
import bookingNotifier from "../../notifiers/bookingNotifiers"
import BookingActions from "../booking/bookingActions"
import calculatePrice from "../price/calculatePrice"
import BookingSource from "../../enums/BookingSource"


const createBookingMessage = async (
    actualData: any,
    from: string
) => {

    try {



        const name = actualData.name
        const hotelId = actualData.hotel
        const rooms = Number(actualData.rooms)
        let guests = Number(actualData.guests)
        const checkInDate = moment(Number(actualData.checkInDate)).tz("Asia/Kolkata")
        const checkOutDate = moment(Number(actualData.checkOutDate)).tz("Asia/Kolkata")


        const hotel = await Hotel.findOne({ _id: hotelId })
        if (!hotel || isNaN(rooms) || isNaN(guests)) {
            return
        }

        let roomType = Object.keys(hotel.roomTypes)[0]
        let roomData: {
            [key: string]: number[]
        } = {}
        roomData[roomType] = new Array(rooms);
        let index = 0
        while (guests > 0) {
            if (roomData[roomType][index]) {
                if (roomData[roomType][index] < 3) {
                    roomData[roomType][index] = roomData[roomType][index] + 1;
                    index++
                } else {
                    roomData[roomType][index] == 1
                }
            } else {
                roomData[roomType][index] = 1
            }
            guests = guests - 1
        }

        const status = await createBooking(
            hotel,
            checkInDate.format("DD-MM-YYYY"),
            checkOutDate.format("DD-MM-YYYY"),
            roomData,
            name,
            from,
            "",
            false
        )

        const noOfRooms = Object.keys(roomData).map(a => {
            return roomData[a].length
        }).reduce((acc, cur) => acc + cur, 0);


        if (!status.data) {
            return
        }

        const price = await calculatePrice(
            hotel,
            roomData,
            status.data.checkInTime,
            status.data.checkOutTime,
        );

        let booking = new Bookings({
            hotelId: hotelId,
            userId: status.data.user._id,
            name: status.data.user.name,
            phoneNumber: status.data.user.phoneNumber,
            checkIn: status.data.checkInTime,
            checkOut: status.data.checkOutTime,
            actualCheckIn: status.data.checkInTime,
            actualCheckOut: status.data.checkOutTime,
            canStayCheckIn: status.data.canStayCheckIn,
            bookedRooms: roomData,
            amount: Number(price) * status.data.day * noOfRooms,
            bookingAmount: Number(price) * status.data.day * noOfRooms,
            isCreatedByManager: true,
            createdBy: "650d4033f6ba8b434faa8560",
            actionCode: codeGenerate(6),
            bookingId: codeGenerate(8),
            allotedRooms: Object.keys(roomData).map((room): IAllotedRoom => {
                return {
                    roomType: room,
                    noOfRooms: roomData[room].length,
                    noOfGuests: roomData[room],
                    startDate: status.data!.checkInTime.toDate(),
                    endDate: status.data!.checkOutTime.toDate(),
                };
            }),
            timezone: status.data.timezone,
            hotelCheckInTime: status.data.hotelCheckInTime,
            hotelCheckOutTime: status.data.hotelCheckOutTime,
            createdAt: status.data.curdate
        });
        booking.bookingSource = BookingSource.Whatsapp
        await booking.save();

        bookingNotifier(booking, BookingActions.Created) //notidying all      
    } catch (err) {
        console.log(err)
    }
}


export default createBookingMessage
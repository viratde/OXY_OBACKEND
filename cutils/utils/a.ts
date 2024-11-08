import Bookings, { CompletedBookings } from "../../src/models/bookings/bookingModel";

async function manage() {


    let offset = 0
    let booking = [649 + offset, 699 + offset, 749 + offset, 799 + offset]
    let cols = [649, 699, 749, 799]
    let cond = {
        hotelId: "64c895a7262fb736760dc575",
        checkIn: {
            $gt: new Date(2023, 11, 10)
        },
        checkOut: {
            $lt: new Date(2023, 11, 12)
        }
        ,
        bookingAmount: {
            $in: booking
        },
        convenienceAmount: 0,
        collections: {
            $elemMatch: {
                $or: [
                    {
                        cash: {
                            $in: cols
                        }
                    },
                    {
                        bank: {
                            $in: cols
                        }
                    },
                    {
                        total: {
                            $in: cols
                        }
                    }
                ]
            }
        },
        hasCheckedIn: true
    }

    const bookings = await Bookings.find(cond)
    const cBookings = await CompletedBookings.find(cond)

    let books = [...bookings, ...cBookings]
    console.log(bookings.length, cBookings.length)
    for (let i = 0; i < books.length; i++) {
        let booking = books[i]
        booking.bookingAmount = booking.bookingAmount + 1
        booking.amount = booking.amount + 1
        booking.collections = booking.collections.map(col => {
            if (col.cash == booking.bookingAmount - 1) {
                return {
                    ...col,
                    cash: booking.bookingAmount,
                    total: booking.bookingAmount
                }
            } else if (col.bank == booking.bookingAmount - 1) {
                return {
                    ...col,
                    bank: booking.bookingAmount,
                    total: booking.bookingAmount
                }
            } else {
                return col
            }
        })

        console.log(booking.collections[0])
        await booking.save()
    }

}



export default manage
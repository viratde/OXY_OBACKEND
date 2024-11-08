import Hotel from "../src/models/hotels/hotelModel"
import { fa, faker } from '@faker-js/faker';

const generateRandomHotels = async (
    nos: number,
    reverse: boolean
) => {

    if (reverse) {
        await Hotel.deleteMany()
    } else {
        const hotel = await Hotel.findOne()

        if (hotel) {

            for (let i = 0; i < nos; i++) {
                await Hotel.create({
                    hotelName: faker.person.fullName(),
                    hotelAddress: faker.location.secondaryAddress(),
                    latitude: faker.location.latitude(),
                    longitude: faker.location.longitude(),
                    hotelId: faker.person.firstName(),
                    phoneNo: faker.phone.number(),
                    hotelDescription: hotel.hotelDescription,
                    locationUrl: "https://maps.google.com",
                    checkIn: "12-00",
                    checkOut: "11-00",
                    refundPercentage: 0,
                    minPrice: 800,
                    maxPrice: 900,
                    restrictions: hotel.restrictions,
                    housePoliciesDos: hotel.housePoliciesDos,
                    housePoliciesDonts: hotel.housePoliciesDonts,
                    houseAmenities: hotel.houseAmenities,
                    imageData: hotel.imageData,
                    nearBy: hotel.nearBy,
                    hotelStructure: hotel.hotelStructure,
                    roomTypes: hotel.roomTypes,
                    timezone: "Asia/Kolkata",
                    isHotelListed: true,
                    location: {
                        type: "Point",
                        coordinates: [faker.location.latitude(), faker.location.longitude()]
                    }
                })
                console.log(i)
            }

        }
    }
}

export default generateRandomHotels
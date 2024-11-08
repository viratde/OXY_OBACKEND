import { Types } from "mongoose"
import Source from "../src/models/expenses/sourceModel"
import Hotel from "../src/models/hotels/hotelModel"

const data = [
    ['OXY RUDRA INN', ['Cash', 'Bank', 'Ota']],
    ['OXY KINGS INN', ['Cash', 'Bank', 'Ota']],
    ['OXY PARADISE HARMU', ['Cash', 'Bank', 'Ota']],
    ['OXY RR RESIDENCY', ['Cash', 'Bank', 'Ota']],
    ['OXY SHIVANI', ['Cash', 'Bank', 'Ota']],
    ['OXY HERITAGE ', ['Cash', 'Bank', 'Ota']],
    ['OXY PRASHANT', ['Cash', 'Bank', 'Ota']],
    ['OXY DELIGHT', ['Cash', 'Bank', 'Ota']],
    ['OXY DREAM INN', ['Cash', 'Bank', 'Ota']],
    ['OXY RITZ', ['Cash', 'Bank', 'Ota']],
    ['OXY QUEEN PALACE', ['Cash', 'Bank', 'Ota']],
    ['OXY SAFARI RESIDENCIA ', ['Cash', 'Bank', 'Ota']],
    ['Oxy Corporations', ['Cash', 'Bank', 'Ota']],
    ['kotak Mahindra Bank', ['Cash', 'Bank', 'Ota']]
]
const myId = "650d4033f6ba8b434faa8560"

const sourceManager = async () => {

    let data =await dataPrinter()

    for (let i = 0; i < data.length; i++) {
        const ent = await Hotel.findOne({ hotelName: data[i][0] })
        if (!ent) {
            console.log("Hotel not found")
            continue
        }
        for (let j = 0; j < data[i][1].length; j++) {
            const source = await Source.findOne({name:data[i][1][j],id:ent._id})
            if(!source){
                await Source.create({
                    name:data[i][1][j],
                    at:new Date(),
                    by:new Types.ObjectId(myId),
                    id:ent._id,
                    value:0
                })
            }
        }
    }
}
const dataPrinter = async () => {
    const ent = await Hotel.find()
    return ent.map(e => {
        return [e.hotelName,["Cash","Bank","Ota"]]
    })
}

export default sourceManager
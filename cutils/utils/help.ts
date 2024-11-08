import moment from "moment-timezone";
import Transction from "../../expense/src/models/entity/transctionModel";
import fs from "fs"

const manageTransaction = async () => {

    console.log(moment.tz("01-01-2024 00:00:00", "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").toDate())
    const transctions = await Transction.deleteMany({
        date: {
            $lt: new Date("2023-12-31T18:30:00.000Z")
        }
    })

    // fs.writeFileSync("./data.json",JSON.stringify(transctions),"utf-8")
    // console.log(tr)
    
}

export default manageTransaction
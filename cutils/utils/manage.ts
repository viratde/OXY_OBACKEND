import moment from "moment-timezone"
import Transction from "../../expense/src/models/entity/transctionModel"
import IEntityTransTypes from "../../expense/src/types/EntityItems/EntityTransTypes"

const manager = async () => {

    await Transction.deleteMany({
        "transction.type":{
            $in:[IEntityTransTypes.OutgoingOthers,IEntityTransTypes.IncomingOthers]
        },
        date:{
            $gt:moment.tz("10-01-2024","DD-MM-YYYY","Asia/Kolkata")
        }
    })

}

export default manager
import mongoose from "mongoose";
import ISource from "../../types/hotels/source";

const sourceSchema = new mongoose.Schema<ISource>({
    id: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    at: {
        type: Date,
        required: true
    },
    value:{
        type:Number,
        default:0,
        required:true
    }
})

const Source = mongoose.model("sources", sourceSchema)

export default Source
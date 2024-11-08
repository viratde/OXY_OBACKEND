import mongoose from "mongoose";
import IPartner from "../../types/hotels/partner";

const partnerSchema = new mongoose.Schema<IPartner>({
    id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    XBR: {
        type: Number,
        default: 0,
        required: true
    },
    OBR: {
        type: Number,
        default: 0,
        required: true
    },
    OECR: {
        type: Number,
        default: 0,
        required: true
    },
    XECR: {
        type: Number,
        default: 0,
        required: true
    },
    CFEE: {
        type: Number,
        default: 0,
        required: true
    },
    GST:{
        type:Number,
        default:0,
        required:true
    },
    at: {
        type: Date,
        required: true
    },
    by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sDate: {
        type: Date,
        required: true
    },
    eDate: {
        type: Date,
        required: true
    },
    timeline: {
        type: String,
        required: true
    },
    isProfitSharing: {
        type: Boolean,
        required: true
    },
    isRelative:{
        type:Boolean,
        required:true,
        default:false
    }
})

const Partner = mongoose.model("partner", partnerSchema)

export default Partner
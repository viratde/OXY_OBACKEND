import { Request, Response } from "express"
import isDateFormat from "../../validations/isDateFormat"
import IPermission from "../../types/managers/permission"
import Hotel from "../../models/hotels/hotelModel"
import { isValidObjectId, Types } from "mongoose"
import Manager from "../../models/managers/managerSchema"


const updateManagerController = async (
    req: Request,
    res: Response
) => {


    try {

        const {
            _id,
            username,
            password,
            name,
            dob,
            phoneNumber,
            email,
            aadhar,
            pan,
            gstNo,
            businessName,
            address,
            did,
            department
        } = req.body

        const permissions: IPermission[] = req.body.permissions

        if (!name || name.length < 5) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct name"
            })
        }

        if (!phoneNumber || phoneNumber.length != 12 || isNaN(Number(phoneNumber))) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct phone number"
            })
        }

        if (!email || !email.includes("@") || !email.includes(".")) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct email"
            })
        }

        if (!username || username.length < 7) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct username"
            })
        }

        if (!password || password.length < 9) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct password"
            })
        }

        if (!dob || !isDateFormat(dob)) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct dob"
            })
        }

        if (!aadhar || aadhar.length != 12 || isNaN(Number(aadhar))) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct aadhar"
            })
        }

        if (pan.length != 0 && pan.length != 10) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct pan"
            })
        }
        console.log(gstNo, gstNo.length)

        if (gstNo.length != 0 && gstNo.length != 15) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct gst"
            })
        }

        if (businessName.length == 0 && businessName.length < 3) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct business name"
            })
        }

        if (address.length < 4) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct address"
            })
        }

        if (did && (did.length != 10 || isNaN(Number(did)))) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct did"
            })
        }

        if (permissions.length == 0) {
            return res.status(400).json({
                status: false,
                message: "Please enter correct permissions"
            })
        }

        const nPermissions: IPermission[] = []

        for (let i = 0; i < permissions.length; i++) {

            const permission = permissions[i]

            const hotel = (await Hotel.findOne({ _id: permission.hotel }))

            if (!permission.hotel || !hotel) {
                return res.status(400).json({
                    status: false,
                    message: "Please choose correct hotels."
                })
            } else {

                nPermissions.push({
                    hotel: new Types.ObjectId(hotel._id),
                    canCancelBooking: Boolean(permission.canCancelBooking),
                    canCheckInBooking: Boolean(permission.canCheckInBooking),
                    canNoShowBooking: Boolean(permission.canNoShowBooking),
                    canAssignRoom: Boolean(permission.canAssignRoom),
                    canUpdatePayment: Boolean(permission.canUpdatePayment),
                    canShiftRoom: Boolean(permission.canShiftRoom),
                    canAddExtraPrice: Boolean(permission.canAddExtraPrice),
                    canCheckOutBooking: Boolean(permission.canCheckOutBooking),
                    canDeleteCollection: Boolean(permission.canDeleteCollection),
                    canCreateBooking: Boolean(permission.canCreateBooking),
                    canViewAnalytics: Boolean(permission.canViewAnalytics),
                    canViewBooking: Boolean(permission.canViewBooking),
                    canViewBookingDetail: Boolean(permission.canViewBookingDetail),
                    canViewPricing: Boolean(permission.canViewPricing),
                    canUpdatePricing: Boolean(permission.canUpdatePricing),

                    canModifyAmount: Boolean(permission.canModifyAmount),
                    canModifyConvenienceFee: Boolean(permission.canModifyConvenienceFee),
                    canDeleteExtraCharge: Boolean(permission.canDeleteExtraCharge),
                    canPutCustomDate: Boolean(permission.canPutCustomDate),
                    isTimeBounded: Boolean(permission.isTimeBounded),

                    canViewCode: Boolean(permission.canViewCode),


                    canAddExpense: Boolean(permission.canAddExpense),
                    canApproveExpense: Boolean(permission.canApproveExpense),
                    canAddPaymentToExpense: Boolean(permission.canAddPaymentToExpense),
                    canViewExpenses: Boolean(permission.canViewExpenses),
                    canRepayExpense: Boolean(permission.canRepayExpense),

                    canViewExpenser: Boolean(permission.canViewExpenser),
                    canAddExpenser: Boolean(permission.canAddExpenser),

                    canViewSources: Boolean(permission.canViewSources),
                    canAddSources: Boolean(permission.canAddSources),

                    canDeleteTransaction: Boolean(permission.canDeleteTransaction),
                    canViewUserAnalytics: Boolean(permission.canViewUserAnalytics),
                    isPropertyOwner: Boolean(permission.isPropertyOwner)
                })

            }

        }

        const manager = isValidObjectId(_id) ? await Manager.findOne({ _id: _id }) : undefined

        if (department && (!department.name || department.name.length < 3)) {
            return res.status(400).json({
                status: true,
                message: "Please enter correct department name."
            })
        }

        if (department && (!department.bookingShort || department.bookingShort.length < 3)) {
            return res.status(400).json({
                status: true,
                message: "Please enter correct department short name."
            })
        }


        if (manager) {
            manager.name = name
            manager.email = email
            manager.phoneNumber = phoneNumber
            manager.emails = [email]
            manager.phoneNumbers = [phoneNumber]
            manager.username = username
            manager.password = password
            manager.dob = dob
            manager.aadhar = Number(aadhar)
            manager.pan = pan
            manager.gstNo = gstNo
            manager.businessName = businessName
            manager.did = did
            manager.address = address
            manager.permissions = nPermissions
            manager.department = Boolean(department) ? { name: department.name, bookingShort: department.bookingShort } : undefined

            await manager.save()

            return res.status(200).json({
                status: true,
                message: "Manager Updated Successfully.",
                data: manager
            })
        } else {
            const manager = await Manager.create({
                name,
                email,
                emails: [email],
                phoneNumber: phoneNumber,
                phoneNumbers: [phoneNumber],
                username,
                password,
                dob,
                aadhar: Number(aadhar),
                pan,
                gstNo,
                businessName,
                address,
                did,
                permissions: nPermissions,
                department:Boolean(department) ? { name: department.name, bookingShort: department.bookingShort } : undefined
            })

            return res.status(200).json({
                status: true,
                message: "Manager Updated Successfully.",
                data: manager
            })
        }



    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Please try after some time."
        })
    }

}

export default updateManagerController
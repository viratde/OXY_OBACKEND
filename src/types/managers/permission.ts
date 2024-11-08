import { Types } from "mongoose";
import IHotel from "../hotels/hotel";

interface IPermission {
  canCancelBooking: boolean;
  canCheckInBooking: boolean;
  canNoShowBooking: boolean;
  canAssignRoom: boolean;
  canUpdatePayment: boolean;
  canShiftRoom: boolean;
  canAddExtraPrice: boolean;
  canCheckOutBooking: boolean;
  canDeleteCollection: boolean;
  canCreateBooking: boolean;
  canViewAnalytics: boolean;
  canViewBooking: boolean;
  canViewBookingDetail: boolean;
  canViewPricing: boolean;
  canUpdatePricing: boolean;

  canModifyAmount: boolean;
  canModifyConvenienceFee: boolean;
  canDeleteExtraCharge: Boolean;
  canPutCustomDate: boolean;
  isTimeBounded: boolean;

  canViewCode: boolean;

  
  canAddExpense:boolean,
  canApproveExpense: boolean;
  canAddPaymentToExpense: boolean;
  canViewExpenses: boolean;
  canRepayExpense:boolean;

  canViewExpenser: boolean;
  canAddExpenser: boolean;

  canViewSources:boolean;
  canAddSources:boolean;
  canDeleteTransaction:boolean;
  
  canViewUserAnalytics:boolean;

  hotel: IHotel | Types.ObjectId;

  isPropertyOwner:boolean;


  // canManageBanksAndPartners: boolean;

  
}

export default IPermission;

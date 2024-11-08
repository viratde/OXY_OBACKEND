const bookingPopulate = [
  {
    path: "assignedRoom.assignedBy",
    model: "managers",
  },
  {
    path: "roomShifts.from.assignedBy",
    model: "managers",
  },
  {
    path: "roomShifts.to.assignedBy",
    model: "managers",
  },
  {
    path: "advancedPaymentData.by",
    model: "managers",
  },
  {
    path: "collections.by",
    model: "managers",
  },
  {
    path: "deletedCollections.by",
    model: "managers",
  },
  {
    path: "deletedCollections.deletedBy",
    model: "managers",
  },
  {
    path: "noShowData.noShownBy",
    model: "managers",
  },
  {
    path: "extraCharges.addedBy",
    model: "managers",
  },
  {
    path: "deletedExtraCharges.addedBy",
    model: "managers",
  },
  {
    path: "deletedExtraCharges.deletedBy",
    model: "managers",
  },
  {
    path: "checkedOutData.by",
    model: "managers",
  },
  {
    path: "checkedInData.by",
    model: "managers",
  },
  {
    path: "cancelledData.cancelledBy",
    model: "managers",
  },
  {
    path: "hotelId",
  },
  {
    path: "userId",
  },
  {
    path: "createdBy",
  },
  {
    path:"amountModifications.by",
    model:"managers"
  }
];

export default bookingPopulate;

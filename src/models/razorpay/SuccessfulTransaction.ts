
import { Schema, model, Document } from 'mongoose';

enum PaymentCardBrand {
  VISA = "VISA",
  MASTER_CARD = "MASTER_CARD",
  DISCOVER = "DISCOVER",
  DINERS = "DINERS",
  AMEX = "AMEX",
  JCB = "JCB",
  UNKNOWN = "UNKNOWN"
}

enum PaymentCardType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  UNKNOWN = "UNKNOWN"
}

enum PaymentMode {
  CARD = "CARD",
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  UPI = "UPI"
}

export enum TransactionStatus {
  AUTHORIZED = "AUTHORIZED",
  REFUND_PENDING = "REFUND_PENDING",
  AUTHORIZED_REFUNDED = "AUTHORIZED_REFUNDED",
  REFUNDED = "REFUNDED",
  VOIDED = "VOIDED",
  VOID_PENDING = "VOID_PENDING",
  FAILED = "FAILED"
}

enum TransactionType {
  CHARGE = "CHARGE",
  REFUND = "REFUND",
  CASH_BACK = "CASH_BACK",
  CASH_OUT = "CASH_OUT"
}

interface PaymentTransactionDocument extends Document {
  amount: number;
  amountAdditional: number;
  amountCashBack: number;
  amountOriginal: number;
  authCode: string;
  batchNumber: string;
  currencyCode: string;
  customerName: string;
  customerReceiptUrl: string;
  deviceSerial: string;
  externalRefNumber: string;
  formattedPan: string;
  invoiceNumber: string;
  mid: string;
  payerName: string;
  paymentCardBrand: PaymentCardBrand;
  paymentCardType: PaymentCardType;
  paymentMode: PaymentMode;
  pgInvoiceNumber: string;
  postingDate: Date;
  rrNumber: string;
  settlementStatus: string;
  stan: string;
  status: TransactionStatus;
  tid: string;
  txnId: string;
  txnType: TransactionType;
  userAgreement: string;
  username: string;
  errorCode?: string;
  errorMessage?: string;
}

const RazorpayTransactionDetailsSchema = new Schema<PaymentTransactionDocument>({
  amount: { type: Number, required: true },
  amountAdditional: { type: Number, required: true },
  amountCashBack: { type: Number, required: true },
  amountOriginal: { type: Number, required: true },
  authCode: { type: String, required: true },
  batchNumber: { type: String },
  currencyCode: { type: String, required: true },
  customerName: { type: String, required: true },
  customerReceiptUrl: { type: String, required: true },
  deviceSerial: { type: String, required: true },
  externalRefNumber: { type: String, required: true },
  formattedPan: { type: String },
  invoiceNumber: { type: String},
  mid: { type: String, required: true },
  payerName: { type: String, required: true },
  paymentCardBrand: { type: String, enum: Object.values(PaymentCardBrand)},
  paymentCardType: { type: String, enum: Object.values(PaymentCardType), required: true },
  paymentMode: { type: String, enum: Object.values(PaymentMode), required: true },
  pgInvoiceNumber: { type: String },
  postingDate: { type: Date, required: true },
  rrNumber: { type: String, required: true },
  settlementStatus: { type: String, required: true },
  stan: { type: String },
  status: { type: String, enum: Object.values(TransactionStatus), required: true },
  tid: { type: String, required: true },
  txnId: { type: String, required: true },
  txnType: { type: String, enum: Object.values(TransactionType), required: true },
  userAgreement: { type: String},
  username: { type: String, required: true },
  errorCode: { type: String },
  errorMessage: { type: String }
});

const RazorpayTransactionDetailsModel = model<PaymentTransactionDocument>('RazorpayTransactionDetailsModel', RazorpayTransactionDetailsSchema);


export default RazorpayTransactionDetailsModel;
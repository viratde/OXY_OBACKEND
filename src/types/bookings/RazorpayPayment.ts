export enum PaymentCardBrand {
    VISA = "VISA",
    MASTER_CARD = "MASTER_CARD",
    DISCOVER = "DISCOVER",
    DINERS = "DINERS",
    AMEX = "AMEX",
    JCB = "JCB",
    UNKNOWN = "UNKNOWN"
}

export enum PaymentCardType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT",
    UNKNOWN = "UNKNOWN"
}

export enum PaymentMode {
    CARD = "CARD",
    CASH = "CASH",
    CHEQUE = "CHEQUE"
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

export enum TransactionType {
    CHARGE = "CHARGE",
    REFUND = "REFUND",
    CASH_BACK = "CASH_BACK",
    CASH_OUT = "CASH_OUT"
}

export interface PaymentTransaction {
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
    paymentCardBrand: PaymentCardBrand; // Enum
    paymentCardType: PaymentCardType;   // Enum
    paymentMode: PaymentMode;           // Enum
    pgInvoiceNumber: string;
    postingDate: number;
    rrNumber: string;
    settlementStatus: string;
    stan: string;
    status: TransactionStatus;          // Enum
    tid: string;
    txnId: string;
    txnType: TransactionType;           // Enum
    userAgreement: string;
    username: string;
    errorCode?: string;
    errorMessage?: string;
}

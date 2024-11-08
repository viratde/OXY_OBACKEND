import crypto from "crypto"

const secretKey = Buffer.from("YouKnowWhatDoesChutiyapaStandFor","utf-8");
const iv = Buffer.from("DINESHPRAJAPATIS","utf-8");

function decryptQrData(encryptedData:string):string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encryptQrData(bookingData:string):string {
    const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encrypted = cipher.update(bookingData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted
}

const Qr = {
    decryptQrData,
    encryptQrData
}
export default Qr
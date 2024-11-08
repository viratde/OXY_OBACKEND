import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(String('jahjahajhgagjsbhjasdbhjhh')).digest('base64').slice(0,32);
const iv = "VIRATOXYZ7107021";

function encryptId(bookingId: string) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(bookingId, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decryptId(encryptedId:string) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedId, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}


const BookingIdEncryptAndDecrypt = {
    encryptId,
    decryptId
}

export default BookingIdEncryptAndDecrypt;
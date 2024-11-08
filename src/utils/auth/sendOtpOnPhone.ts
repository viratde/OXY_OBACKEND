import axios from "axios";


const sendOtpOnPhone = async (otp: number, phoneNumber: string) : Promise<boolean> => {
  try {
    await axios.get(
      `https://www.txtguru.in/imobile/api.php?username=oxyitsolutions&password=67011423&source=OXYCRP&dmobile=${phoneNumber}&dlttempid=1707169182806367628&message=Dear Customer, your OTP for verification on Oxyhotels.com is ${otp} OXYCRP`
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default sendOtpOnPhone;

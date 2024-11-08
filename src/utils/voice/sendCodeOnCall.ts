import axios from "axios";


const sendCodeOnCall = async (otp: number, phoneNumber: string) : Promise<boolean> => {
  try {
    await axios.get(
      `https://www.txtguru.in/imobile/api.php?username=oxyitsolutions_voice&password=97686703&dmobile=${phoneNumber}&message=${otp}`
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default sendCodeOnCall;
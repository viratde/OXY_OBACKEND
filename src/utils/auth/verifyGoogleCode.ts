import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

const verifyGoogleCode = async (token: string)  => {

  const ticket = await client.verifyIdToken({
    idToken:token,
    audience: process.env.GOOGLE_CLIENT_ID as string,
  });
  const payload = ticket.getPayload();
  return payload;

};

export default verifyGoogleCode

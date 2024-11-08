import * as admin from "firebase-admin"
import * as serviceAccount from "./cert.json"

const params = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url
  }

admin.initializeApp({
    credential: admin.credential.cert(params)
});


async function sendMessage(
    data:{ [key: string]: string; },
    token:string
) {
    if (token) {
        admin.messaging().send({ data, token }).then(resp => {
            return
        }).catch(err => {
            return
        })
    } else {
        return
    }
}

async function sendMultipleMessages(
    data:{ [key: string]: string; },
    tokens:Array<string>
    ){
    admin.messaging().sendEachForMulticast({data,tokens}).then(resp => {
        return
    }).catch(err => {
        return
    })
}

const sendFcmMessage= {
    sendMessage,
    sendMultipleMessages
}
export default sendFcmMessage
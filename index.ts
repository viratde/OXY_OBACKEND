import express, { Application, NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import multer from "multer";
import cors from 'cors'
import http from "http"
dotenv.config();

import managerRouter from "./src/routes/managerRoutes";
import adminRouter from "./src/routes/adminRoutes";
import userRouter from "./src/routes/userRoutes";
import userAuthRouter from "./src/routes/userAuthRoutes";
import taskRouter from "./src/routes/taskRoutes";
import whatsappRouter from "./src/routes/whatsappRoutes";
import portfolioRouter from "./src/routes/portfolioRoutes";
import freeJunRouter from "./src/routes/freejunRoutes";
import nUserRoutes from "./src/routes/nUserRoutes";
import razorpayRouter from "./src/routes/razorpay";
import Bookings from "./src/models/bookings/bookingModel";
import RazorpayTransactionDetailsModel from "./src/models/razorpay/SuccessfulTransaction";
import correctBookingCollection from "./rCorrect";
import createOpeningBalance from "./cutils/createOpeningBalance";
import MoneyFlow from "./src/utils/expense/soucesAndPartners/MoneyFlow";


const app: Application = express();

app.use(express.json());
app.use(multer().any());
app.use(cors())

app.set('trust proxy', 1);
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(
    req.ip,
    req.ips,
    req.hostname,
    req.headers.host,
    req.headers.forwarded
  )
  next()
})
app.use("/admin", adminRouter)
app.use("/manager", managerRouter);
app.use("/api", userRouter)
app.use("/auth", userAuthRouter)
app.use("/task", taskRouter)
app.use("/whatsapp", whatsappRouter)
app.use("/portfolio", portfolioRouter)
app.use("/freejun", freeJunRouter)
app.use("/oxy", nUserRoutes)
app.use("/pos", razorpayRouter)


app.use(express.static(`${__dirname}/public`))
app.set("view engine", "ejs")

const server = http.createServer(app)
app.use(cors())

const run = async () => {
  let connection = await mongoose.connect(
    "mongodb://127.0.0.1:27018/OxyTsTestDatabase"
  );
  console.log(
    "Database Connected Successfully at",
    connection.connection.host,
    connection.connection.port
  );
};

app.get("/*", (req: Request, res: Response) => {
  res.sendFile(`${__dirname}/public/index.html`)
})

run();

server.listen(4000, (): void => {
  console.log("Server Started Successfully at port 4000");
});



const findAllNonTracked = async () => {

  const trans = await RazorpayTransactionDetailsModel.find({amount:{$gt:100}}, "txnId")
  console.log(trans[0])
  const bookings = await Bookings.find({
    "collections.transaction.txnId": {
      $in: trans.map((t) => t.txnId)
    }
  }, "collections")

  const cols = bookings.map((b) => b.collections).flat()
    .reduce((acc: string[], cur) => {
      if (cur.transaction) {
        if (acc.includes(cur.transaction.txnId)) {
          return acc
        } {
          return [...acc, cur.transaction.txnId]
        }
      } else {
        return acc
      }
    }, [] as string[])

    console.log(cols.length)

    const allOtherTrans = trans.filter((t) => !cols.includes(t.txnId))
    console.log(allOtherTrans)
}

// findAllNonTracked()
// correctBookingCollection(
//   "241002065158081E127992852",
//   ""
// )

// createOpeningBalance(
//   2530,
//   "66360aed54dcabf9939f7616",
//   "Cash",
//   "01-08-2024"
// )

MoneyFlow.ManageCollection(
  "21-07-2024",
  1,
  [new Types.ObjectId("65b490ca0a9c3a9d0e2cd47b")],
  true
)
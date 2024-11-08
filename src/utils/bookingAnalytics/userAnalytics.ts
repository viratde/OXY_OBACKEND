import moment from "moment-timezone";
import User from "../../models/users/userModel";
import util from "util"
import { UserSourcesShort } from "../../enums/BookingSource";


const userAnalytics = async (
  startDay: string,
  days: number,
  isTable: boolean,
) => {


  let startTime = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata")
  let endTime = moment.tz(`${startDay} 00:00:00`, "DD-MM-YYYY HH:mm:ss", "Asia/Kolkata").add(days, "days")


  let tabularAggregation = [
    {
      $match: {
        createdAt: {
          $gt: startTime.toDate(),
          $lt: endTime.toDate()
        }
      }
    },
    {
      $addFields: {
        date: {
          $dateToString: {
            date: "$createdAt",
            format: "%d-%m-%Y",
            timezone: "Asia/Kolkata"
          }
        }
      }
    },
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "userId",
        let: {
          date: "$createdAt"
        },
        pipeline: [
          {
            $addFields: {
              sDate: {
                $subtract: ["$$date", 86400000]
              },
              eDate: {
                $add: ["$$date", 86400000]
              }
            }
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $gte: ["$createdAt", "$sDate"]
                  },
                  {
                    $lte: ["$createdAt", "$eDate"]
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "hotels",
              localField: "hotelId",
              foreignField: "_id",
              as: "hotelId"
            }
          },
          {
            $unwind: "$hotelId"
          },
          {
            $addFields: {
              hotelId: "$hotelId.hotelName"
            }
          },
          {
            $addFields: {
              fCheckIn: {
                $dateToString: {
                  date: "$checkIn",
                  format: "%d-%b-%Y",
                  timezone: "$timezone"
                }
              },
              fCheckOut: {
                $dateToString: {
                  date: "$checkOut",
                  format: "%d-%b-%Y",
                  timezone: "$timezone"
                }
              }
            }
          },
          {
            $group: {
              _id: "All",
              data: {
                $count: {}
              }
            }
          }
        ],
        as: "bookings"
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          isManager: {
            $cond: {
              if: "$isCreatedByManager",
              then: "OXY",
              else: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: "$bookings"
                      },
                      0
                    ]
                  },
                  then: "USER",
                  else: "BOUNCE"
                }
              }
            }
          }
        },
        users: {
          $count: {}
        }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        books: {
          $push: {
            k: "$_id.isManager",
            v: "$users"
          }
        }
      }
    },
    {
      $addFields: {
        books: {
          $arrayToObject: "$books"
        }
      }
    },
    {
      $group: {
        _id: "All",
        books: {
          $push: {
            k: "$_id",
            v: "$books"
          }
        }
      }
    },
    {
      $project: {
        data: {
          $arrayToObject: "$books"
        }
      }
    }
  ]

  let aggregation = [
    {
      $match: {
        createdAt: {
          $gt: startTime.toDate(),
          $lt: endTime.toDate()
        }
      }
    },
    {
      $addFields: {
        date: {
          $dateToString: {
            date: "$createdAt",
            format: "%d-%m-%Y",
            timezone: "Asia/Kolkata"
          }
        }
      }
    },
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "userId",
        let: {
          date: "$createdAt"
        },
        pipeline: [
          {
            $addFields: {
              sDate: {
                $subtract: ["$$date", 86400000]
              },
              eDate: {
                $add: ["$$date", 86400000]
              }
            }
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $gte: ["$createdAt", "$sDate"]
                  },
                  {
                    $lte: ["$createdAt", "$eDate"]
                  }
                ]
              }
            }
          },
          {
            $lookup: {
              from: "hotels",
              localField: "hotelId",
              foreignField: "_id",
              as: "hotelId"
            }
          },
          {
            $unwind: "$hotelId"
          },
          {
            $addFields: {
              hotelId: "$hotelId.hotelName"
            }
          },
          {
            $addFields: {
              fCheckIn: {
                $dateToString: {
                  date: "$checkIn",
                  format: "%d-%b-%Y",
                  timezone: "$timezone"
                }
              },
              fCheckOut: {
                $dateToString: {
                  date: "$checkOut",
                  format: "%d-%b-%Y",
                  timezone: "$timezone"
                }
              }
            }
          },
          {
            $project: {
              bookingId: 1,
              bookedRooms: 1,
              name: 1,
              phoneNumber: 1,
              amount: 1,
              hotelId: 1,
              fCheckIn: 1,
              fCheckOut: 1,
              hasCheckedOut: 1
            }
          }
        ],
        as: "bookings"
      }
    },
    {
      $addFields: {
        bookings: {
          $map: {
            input: "$bookings",
            as: "book",
            in: {
              bookingId: "$$book.bookingId",
              rooms: {
                $sum: {
                  $map: {
                    input: {
                      $objectToArray:
                        "$$book.bookedRooms"
                    },
                    as: "room",
                    in: {
                      $size: "$$room.v"
                    }
                  }
                }
              },
              name: "$$book.name",
              phoneNumber: "$$book.phoneNumber",
              amount: "$$book.amount",
              hotelName: "$$book.hotelId",
              status: {
                $cond: [
                  "$$book.hasCheckedOut",
                  "Checked Out",
                  "Checked In"
                ]
              },
              stay: {
                $cond: [
                  {
                    $eq: [
                      {
                        $substrBytes: [
                          "$$book.fCheckIn",
                          2,
                          10
                        ]
                      },
                      {
                        $substrBytes: [
                          "$$book.fCheckOut",
                          2,
                          10
                        ]
                      }
                    ]
                  },
                  {
                    $concat: [
                      {
                        $substrBytes: [
                          "$$book.fCheckIn",
                          0,
                          2
                        ]
                      },
                      " - ",
                      {
                        $substrBytes: [
                          "$$book.fCheckOut",
                          0,
                          6
                        ]
                      }
                    ]
                  },
                  {
                    $cond: [
                      {
                        $eq: [
                          {
                            $substrBytes: [
                              "$$book.fCheckIn",
                              6,
                              10
                            ]
                          },
                          {
                            $substrBytes: [
                              "$$book.fCheckOut",
                              6,
                              10
                            ]
                          }
                        ]
                      },
                      {
                        $concat: [
                          {
                            $substrBytes: [
                              "$$book.fCheckIn",
                              0,
                              6
                            ]
                          },
                          " - ",
                          {
                            $substrBytes: [
                              "$$book.fCheckOut",
                              0,
                              6
                            ]
                          }
                        ]
                      },
                      {
                        $concat: [
                          "$$book.fCheckIn",
                          " - ",
                          "$$book.fCheckOut"
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          isManager: {
            $cond: {
              if: "$isCreatedByManager",
              then: "OXY",
              else: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: "$bookings"
                      },
                      0
                    ]
                  },
                  then: "USER",
                  else: "BOUNCE"
                }
              }
            }
          }
        },
        users: {
          $push: {
            name: "$name",
            email: "$email",
            phoneNumber: "$phoneNumber",
            bookings: "$bookings"
          }
        }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        books: {
          $push: {
            k: "$_id.isManager",
            v: "$users"
          }
        }
      }
    },
    {
      $addFields: {
        books: {
          $arrayToObject: "$books"
        }
      }
    },
    {
      $group: {
        _id: "All",
        books: {
          $push: {
            k: "$_id",
            v: "$books"
          }
        }
      }
    },
    {
      $project: {
        data: {
          $arrayToObject: "$books"
        }
      }
    }
  ]

  const data = await User.aggregate(isTable ? tabularAggregation : aggregation)



  let allDays = [startTime.format("DD-MM-YYYY")];

  for (let i = 1; i < days; i++) {
    allDays.push(startTime.clone().add(i, "day").format("DD-MM-YYYY"));
  }

  let rData: {
    [key: string]: {
      [key: string]: number | any[]
    }
  } = {}

  const options = [...UserSourcesShort]

  for (let i = 0; i < allDays.length; i++) {

    let aData: {
      [key: string]: number | any[]
    } = {}

    for (let j = 0; j < options.length; j++) {
      let thatData = undefined
      try {
        thatData = data[0].data[allDays[i]][options[j]]
      } catch (err) {
        // console.log()
      }
      if (thatData) {
        aData[options[j]] = thatData
      } else {
        aData[options[j]] = isTable ? 0 : []
      }
    }
    rData[allDays[i]] = aData
  }

  return rData
}

export default userAnalytics
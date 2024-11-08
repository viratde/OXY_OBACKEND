import moment from "moment";
import "moment-timezone"


const decideDefaultDate = () => {

    const now = moment();

    const noonToday = moment().startOf('day').add(12, 'hours');

    const noonNextDay = moment().add(1, 'day').startOf('day').add(14, 'hours');

    if (now.isBetween(noonToday, noonNextDay)) {
        return now.tz("Asia/Kolkata").format("DD-MM-YYYY");
    } else {
        return moment().subtract(1, 'day').tz("Asia/Kolkata").format("DD-MM-YYYY");
    }

}

export default decideDefaultDate;   
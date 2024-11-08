const isDateFormat = (day: string): boolean => {
  let isDate = !(day.length != 10 || day[2] != "-" || day[5] != "-");
  if (isDate) {
    for (let i = 0; i < day.length; i++) {
      if (i == 2 || i == 5) {
        continue;
      }
      isDate = !isNaN(Number(day[i]));
    }
  }
  return isDate;
};

export default isDateFormat
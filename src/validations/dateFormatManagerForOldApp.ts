const dateManagerForOldApp = (day: string): string | undefined  => {
  let isDate = !(day.length != 10 || day[4] != "-" || day[7] != "-");
  if (isDate) {
    for (let i = 0; i < day.length; i++) {
      if (i == 4 || i == 7) {
        continue;
      }
      isDate = !isNaN(Number(day[i]));
    }
  }

  const fDate = `${day.slice(8)}-${day.slice(5, 7)}-${day.slice(0, 4)}`;
  return isDate ? fDate : undefined;
};

export default dateManagerForOldApp
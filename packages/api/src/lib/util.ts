import dayjs from "dayjs";

const util = {
  bufferToJson: (buffer: Buffer | undefined): JSON =>
    JSON.parse(buffer?.toString() ?? ""),

  sliceIntoChunks: (arr: any[], chunkSize: number) => {
    const res: any[] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  },

  // Checks for format yyyy-mm-dd
  isValidDate: (dateString: string) => {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
  },

  currentDateFormatted: () => dayjs().format("YYYY/MM/DD h:mma")
};

export default util;

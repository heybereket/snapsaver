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
};

export default util;

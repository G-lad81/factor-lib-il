declare module 'jstat' {
  const jStat: {
    normal: {
      cdf(value: number, mean: number, standardDeviation: number): number;
    };
  };
  export default jStat;
}

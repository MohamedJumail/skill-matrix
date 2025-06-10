
const getCurrentQuarterYear = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear();
    return { quarter, year };
  };
  
  export { getCurrentQuarterYear };
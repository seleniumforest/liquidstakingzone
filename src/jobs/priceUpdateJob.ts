import { timeSpans } from "../helpers";
import { priceUpdateJob } from "../integrations/coingecko";

(async () => {
    setInterval(priceUpdateJob, timeSpans.minute * 10);
    await priceUpdateJob();
})();
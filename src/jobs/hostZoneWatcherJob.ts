import { timeSpans } from "../helpers";
import { hostZoneWatcherJob } from "../integrations/hostZones";

(async () => {
    setInterval(hostZoneWatcherJob, timeSpans.hour * 6);
    await hostZoneWatcherJob();
})();
import { TooltipFormatterContextObject } from 'highcharts/highstock';
import moment from 'moment';
import { TimePeriod, TimeSpan, Zone } from '../../app/constants';


export function capitalize(str: string) {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
}

export function getTooltipFormatter(zone: Zone, timeSpan: TimeSpan, isCumulative: boolean) {
    return function (this: TooltipFormatterContextObject) {
        const that = this as any;

        let displayZone = zone!.charAt(0).toUpperCase() + zone!.slice(1);
        let displayAmount = new Intl.NumberFormat()
            .format(isCumulative ? that.points[0].point.cumulativeSum : that.y);

        let displayDate = "";
        let date = moment(that.x);
        displayDate = timeSpan == "M" ? date.format("MMMM YYYY") : date.format("DD MMMM YYYY");

        return `            
            <span style="text-align: center;">${displayDate}</span>
            <br />
            <span>${displayZone} ${displayAmount}</span>
        `;
    }
}

export function getGroupingOptions(timeSpan: TimeSpan): [string, number[]] {
    if (timeSpan === "W")
        return ['week', [1]];

    if (timeSpan === "M")
        return ['month', [1]];

    return ['day', [1]];
}

export function cutData(timePeriod: number, series: any[], dateSelector: any = (el: any) => el[0]) {
    if (!series || timePeriod === -1)
        return series;

    //organize by timePeriod
    let filteredByPeriod = series.filter(el => {
        let date = dateSelector(el);

        let result = moment(date).diff(moment().subtract(timePeriod, 'days'), 'days');
        return result >= 0;
    });

    return filteredByPeriod;

}

export function getChartColor(zone: Zone) {
    switch (zone) {
        case "atom": return "#008BF0";
        case "osmo": return "#6BD9B8";
        case "juno": return "#60F6FF";
        case "stars": return "#5B3A9F";
        case "luna": return "#C0D8DC";
        case "evmos": return "#D96BCE";
        default: return "#008BF0";
    }
}
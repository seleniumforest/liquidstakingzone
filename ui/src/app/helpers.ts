import moment from 'moment';
import { TimeSpan, Zone } from './constants';

export const joinClasses = (...classes: (string | undefined)[]) => classes.join(" ");

export const formatNum = (num: any) =>  new Intl.NumberFormat().format(num);

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

//todo grab from backend
export function getChartColor(zone: Zone) {
    switch (zone) {
        case "cosmos": return "#008BF0";
        case "osmo": return "#8201D8";
        case "juno": return "#FF7B7C";
        case "stars": return "#8BD2A6";
        case "terra": return "#02BD60";
        case "evmos": return "#ED4E33";
        case "inj": return "#343FF5";
        default: return "#008BF0";
    }
}

export function getGroupingOptions(timeSpan: TimeSpan): [string, number[]] {
    if (timeSpan === "W")
        return ['week', [1]];

    if (timeSpan === "M")
        return ['month', [1]];

    return ['day', [1]];
}

export function cutDataByTime(timePeriod: number, series: any[], dateSelector: any = (el: any) => el[0]) {
    if (!series || !Array.isArray(series) || series.length === 0 || timePeriod === -1)
        return series;

    //organize by timePeriod
    let filteredByPeriod = series.filter(el => {
        let date = dateSelector(el);

        let result = moment(date).diff(moment().subtract(timePeriod, 'days'), 'days');
        return result >= 0;
    });

    return [...filteredByPeriod];

}

export function getBorderRadius(ts: TimeSpan, tp: number) {
    if (ts === "D") {
        if (tp === 7)
            return 5;
        if (tp == 30)
            return 3;

        return 1;
    }
    if (ts === "W") {
        if (tp === 7)
            return 7;
        if (tp == 30)
            return 5;
        return 3;
    }
    if (ts === "M") {
        if (tp === 7 || tp == 30)
            return 7;
        if (tp === 90)
            return 5;

        return 3;
    }
}
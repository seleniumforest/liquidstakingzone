import { TooltipFormatterCallbackFunction, TooltipFormatterContextObject } from 'highcharts/highstock';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { baseChartOptions, TimePeriod, TimeSpan, Zone } from '../../app/constants';
import {
    HighchartsProvider, HighchartsChart, Chart, XAxis,
    YAxis, Title, Subtitle, Legend, Tooltip as HSTooltip,
    LineSeries, HighchartsStockChart, ColumnSeries, RangeSelector
} from "react-jsx-highstock"

import { ChartCard } from '../../reusable/chartCard/ChartCard';
import { headersData } from './constants';

export function AssetsExcludingInterest() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<TimePeriod>("MAX");
    let [zone, setZone] = useState<Zone>("atom");
    const { isLoading, error, data } = useQuery(['assetsDeposited', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/assetsDeposited?zone=${zone}`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = data?.map((x: any) => ([Number(x.date), Number(x.amount)]));
    let cuttedData = cutData(timePeriod, chartData);
    chartOpts.plotOptions.column.cumulative = isCumulative;

    let series = <>
        <ColumnSeries
            data={isLoading ? [] : cuttedData}
            color={getChartColor(zone)}
            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
            stickyTracking
            cumulative={isCumulative}
            dataGrouping={{
                enabled: true,
                approximation: "sum",
                groupAll: true,
                forced: true,
                units: getGroupingOptions(timeSpan) ? [getGroupingOptions(timeSpan)] : undefined
            }}
        />
    </>

    return (
        <>
            <ChartCard
                {...headersData.exclInterest}
                chartOpts={chartOpts}
                chartData={isLoading ? [] : cuttedData}
                setZone={setZone}
                zone={zone}
                isCumulative={isCumulative}
                setIsCumulative={setIsCumulative}
                timeSpan={timeSpan}
                setTimeSpan={setTimeSpan}
                timePeriod={timePeriod}
                setTimePeriod={setTimePeriod}
                groupingOptions={getGroupingOptions(timeSpan)}
                zoneColor={getChartColor(zone)}
                tooltipFormatter={getTooltipFormatter(zone, timeSpan, isCumulative)}
                series={series}
            />
        </>
    );
}

export function AssetsRedeemed() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<TimePeriod>("MAX");
    let [zone, setZone] = useState<Zone>("atom");
    const { isLoading, error, data } = useQuery(['assetsRedeemed', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/assetsRedeemed?zone=${zone}`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = data?.map((x: any) => ([Number(x.date), Number(x.amount)]));
    let cuttedData = cutData(timePeriod, chartData);
    let series = <>
        <ColumnSeries
            data={isLoading ? [] : cuttedData}
            color={getChartColor(zone)}
            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
            stickyTracking
            cumulative={isCumulative}
            dataGrouping={{
                enabled: true,
                approximation: "sum",
                groupAll: true,
                forced: true,
                units: getGroupingOptions(timeSpan) ? [getGroupingOptions(timeSpan)] : undefined
            }}
        />
    </>
    return (
        <>
            <ChartCard
                {...headersData.exclInterest}
                chartOpts={chartOpts}
                chartData={isLoading ? [] : cuttedData}
                setZone={setZone}
                zone={zone}
                isCumulative={isCumulative}
                setIsCumulative={setIsCumulative}
                timeSpan={timeSpan}
                setTimeSpan={setTimeSpan}
                timePeriod={timePeriod}
                setTimePeriod={setTimePeriod}
                groupingOptions={getGroupingOptions(timeSpan)}
                zoneColor={getChartColor(zone)}
                tooltipFormatter={getTooltipFormatter(zone, timeSpan, isCumulative)}
                series={series}
            />
        </>
    );
}

export function FeesAndRevenue() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<TimePeriod>("MAX");
    let [zone, setZone] = useState<Zone>("atom");
    const { isLoading, error, data } = useQuery(['protocolRevenue', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/protocolRevenue?zone=${zone}`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let typedData = data?.map((x: any) => ({
        date: Number(x.date),
        fee: Number(x.fee),
        restake: Number(x.restake)
    }))

    const feeSeries: [number, number][] = [];
    const restakeSeries: [number, number][] = [];
    let feeSeriesAcc = 0;
    let restakeSeriesAcc = 0;

    //cumulative sum calculated incorrectly on staked columns
    let cuttedData = cutData(timePeriod, typedData, (el: any) => el.date);
    cuttedData?.forEach((value: any) => {
        if (isCumulative) {
            feeSeriesAcc += value.fee;
            restakeSeriesAcc += value.restake;

            feeSeries.push([value.date, Math.ceil(feeSeriesAcc)]);
            restakeSeries.push([value.date, Math.ceil(restakeSeriesAcc)]);
        } else {
            feeSeries.push([value.date, Math.ceil(value.fee)]);
            restakeSeries.push([value.date, Math.ceil(value.restake)]);
        }
    });

    let series = <>
        <ColumnSeries
            data={isLoading ? [] : restakeSeries}
            color={"#FFE446"}
            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
            stickyTracking
            stacking={"normal"}
            dataGrouping={{
                enabled: true,
                approximation: "sum",
                groupAll: true,
                forced: true,
                units: getGroupingOptions(timeSpan) ? [getGroupingOptions(timeSpan)] : undefined
            }}
        />
        <ColumnSeries
            data={isLoading ? [] : feeSeries}
            color={"#EB7257"}
            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
            stickyTracking
            stacking={"normal"}
            dataGrouping={{
                enabled: true,
                approximation: "sum",
                groupAll: true,
                forced: true,
                units: getGroupingOptions(timeSpan) ? [getGroupingOptions(timeSpan)] : undefined
            }}
        />
    </>;

    return (
        <>
            <ChartCard
                {...headersData.feesAndRevenue}
                hideZonesSelector
                chartOpts={chartOpts}
                setZone={setZone}
                zone={zone}
                isCumulative={isCumulative}
                setIsCumulative={setIsCumulative}
                timeSpan={timeSpan}
                setTimeSpan={setTimeSpan}
                timePeriod={timePeriod}
                setTimePeriod={setTimePeriod}
                groupingOptions={getGroupingOptions(timeSpan)}
                zoneColor={getChartColor(zone)}
                tooltipFormatter={
                    function (this: TooltipFormatterContextObject) {
                        const that = this as any;

                        let restakeSum = new Intl.NumberFormat()
                            .format(that.points[0].y);
                        let feeSum = new Intl.NumberFormat()
                            .format(that.points[1].y);

                        let displayDate = "";
                        let date = moment(that.x);
                        displayDate = timeSpan == "M" ? date.format("MMMM YYYY") : date.format("DD MMMM YYYY");

                        return `  
                            <span style="text-align: center;">${displayDate}</span>
                            <br />
                            <span>Fees: $${restakeSum}</span>
                            <br />
                            <span>Revenue: $${feeSum}</span>
                        `;
                    }}
                series={series}
            />
        </>
    );
}

function getTooltipFormatter(zone: Zone, timeSpan: TimeSpan, isCumulative: boolean) {
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

function getGroupingOptions(timeSpan: TimeSpan): [string, number[]] {
    if (timeSpan === "W")
        return ['week', [1]];

    if (timeSpan === "M")
        return ['month', [1]];

    return ['day', [1]];
}

function cutData(timePeriod: TimePeriod, series: any[], dateSelector: any = (el: any) => el[0]) {
    if (!series || series.length === 0)
        return;

    let days = 0;
    switch (timePeriod) {
        case '7D': days = 7; break;
        case '30D': days = 30; break;
        case '90D': days = 90; break;
        case '180D': days = 180; break;
        case '365D': days = 365; break;
    };

    //organize by timePeriod
    let filteredByPeriod = series.filter(el => {
        if (timePeriod === "MAX" || days === 0)
            return true;

        let date = dateSelector(el);

        let result = moment(date).diff(moment().subtract(days, 'days'), 'days');
        return result >= 0;
    });

    return filteredByPeriod;

}

//todo move to parent component
function getChartColor(zone: Zone) {
    switch (zone) {
        case "atom": return "#008BF0";
        // case "osmo": return "#6BD9B8";
        // case "juno": return "#60F6FF";
        // case "stars": return "#5B3A9F";
        // case "luna": return "#C0D8DC";
        // case "evmos": return "#D96BCE";
        default: return "#008BF0";
    }
}

export const fetchAssets = async (): Promise<Response> => {
    return await fetch(`${process.env.REACT_APP_API_BASEURL}/assetsDeposited?zone=atom`).then(res => res.json());
}
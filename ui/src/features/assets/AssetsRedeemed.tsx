import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import appStyles from './../../App.module.scss';
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { backendUrl, baseChartOptions, TimeSpan, Zone } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries
} from "react-jsx-highstock"

import { headersData } from './constants';
import { cutDataByTime, getBorderRadius, getGroupingOptions } from '../../app/helpers';
import { useQuery } from 'react-query';
import { LoadingError } from '../../reusable/error/error';
import { getChartColor } from '../../app/helpers';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';
import moment from 'moment';

export function AssetsRedeemed() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<number>(90);
    let [zone, setZone] = useState<Zone>("cosmos");

    const { isLoading, error, data } = useQuery(['assetsRedeemed', zone], () =>
        fetch(`${backendUrl}/assetsRedeemed?zone=${zone}`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartData = isLoading ? [] : [...data];
    let cuttedData = cutDataByTime(timePeriod, chartData);

    let chartOpts = { ...baseChartOptions };
    chartOpts.plotOptions.column.cumulative = isCumulative;

    let groupingOptions = getGroupingOptions(timeSpan);
    let units = groupingOptions ? [groupingOptions] : undefined;

    return (
        <div className={appStyles.chartCard}>
            <div className={appStyles.chartCardHeader}>
                <h3>{headersData.redeemedAssets.headerText}</h3>
                <AppTooltip text={headersData.redeemedAssets.tooltipText} />
            </div>
            <div className={appStyles.chartCardOptions}>
                <div>
                    <ZonesSelector setZone={setZone} />
                </div>
                <div className={appStyles.timeSelectorsContainer}>
                    <TimeSpanSelector setTimeSpan={setTimeSpan} selectedValue={timeSpan} />
                    <TimePeriodSelector setTimePeriod={setTimePeriod} selectedValue={timePeriod} />
                </div>
            </div>
            <div className={appStyles.chartCardCumulativeSwitch}>
                <ToggleSwitch
                    checked={isCumulative || false}
                    setChecked={setIsCumulative} />
            </div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            data={isLoading ? [] : cuttedData}
                            color={getChartColor(zone)}
                            borderRadius={getBorderRadius(timeSpan, timePeriod)}
                            stickyTracking
                            cumulative={isCumulative}
                            dataGrouping={{
                                enabled: true,
                                approximation: "sum",
                                groupAll: true,
                                forced: true,
                                units: units
                            }}
                        />
                    </YAxis>
                    <HSTooltip
                        {...chartOpts.tooltip}
                        useHTML
                        formatter={tooltipFormatter(zone, timeSpan, isCumulative)}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}

const tooltipFormatter = (zone: Zone, timeSpan: TimeSpan, isCumulative: boolean) => {
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
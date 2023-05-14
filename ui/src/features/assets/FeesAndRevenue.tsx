import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../../App.module.scss';
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { backendUrl, baseChartOptions, TimeSpan } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries
} from "react-jsx-highstock"

import { headersData } from './constants';
import { cutDataByTime, getBorderRadius, getGroupingOptions } from '../../app/helpers';
import { useQuery } from 'react-query';
import moment from 'moment';
import { formatNum } from '../../app/helpers';
import { LoadingError } from '../../reusable/error/error';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

export function FeesAndRevenue() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<number>(90);
    const { isLoading, error, data } = useQuery(['protocolRevenue'], () =>
        fetch(`${backendUrl}/protocolRevenue`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions };
    let chartData = isLoading ? [] : [...data];

    //cumulative sum calculated incorrectly on staked & grouped columns
    let cuttedData = cutDataByTime(timePeriod, chartData, (el: any) => el.date);
    const feeSeries: [number, number][] = cuttedData?.map(x => [x.date, x.fee])!;
    const restakeSeries: [number, number][] = cuttedData?.map(x => [x.date, x.restake])!;

    let groupingOptions = getGroupingOptions(timeSpan);
    let units = groupingOptions ? [ groupingOptions ] : undefined;

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headersData.feesAndRevenue.headerText}</h3>
                <AppTooltip text={headersData.feesAndRevenue.tooltipText} />
            </div>
            <div className={styles.chartCardOptions}>
                <div></div>
                <div className={styles.timeSelectorsContainer}>
                    <TimeSpanSelector setTimeSpan={setTimeSpan} selectedValue={timeSpan} />
                    <TimePeriodSelector setTimePeriod={setTimePeriod} selectedValue={timePeriod} />
                </div>
            </div>
            <div className={styles.chartCardCumulativeSwitch}>
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
                            data={isLoading ? [] : restakeSeries}
                            color={"#FFE446"}
                            borderRadius={getBorderRadius(timeSpan, timePeriod)}
                            stickyTracking
                            cumulative={isCumulative}
                            stacking={"normal"}
                            dataGrouping={{
                                enabled: true,
                                approximation: "sum",
                                groupAll: true,
                                forced: true,
                                units: units
                            }}
                        />
                        <ColumnSeries
                            data={isLoading ? [] : feeSeries}
                            color={"#EB7257"}
                            borderRadius={getBorderRadius(timeSpan, timePeriod)}
                            stickyTracking
                            stacking={"normal"}
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
                        useHTML
                        formatter={tooltipFormatter(isCumulative, timeSpan)}
                        {...chartOpts.tooltip}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}

const tooltipFormatter = (isCumulative: boolean, timeSpan: TimeSpan) => {
    return function (this: TooltipFormatterContextObject) {
        const that = this as any;

        let restakeSum = formatNum(Math.ceil(isCumulative ? that.points[0].point.cumulativeSum : that.points[0].y));
        let feeSum = formatNum(Math.ceil(isCumulative ? that.points[1].point.cumulativeSum : that.points[1].y));

        let displayDate = "";
        let date = moment(that.x);
        displayDate = timeSpan == "M" ? date.format("MMMM YYYY") : date.format("DD MMMM YYYY");

        return `  
            <span style="text-align: center;">${displayDate}</span>
            <br />
            <span>Fees: $${isCumulative ?
                formatNum(Math.ceil(that.points[0].point.cumulativeSum - that.points[1].point.cumulativeSum)) :
                restakeSum}</span>
            <br />
            <span>Revenue: $${feeSum}</span>
        `;
    };
}
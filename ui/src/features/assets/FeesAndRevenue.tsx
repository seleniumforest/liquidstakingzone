import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './chartCard.module.scss';
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { baseChartOptions, TimeSpan, Zone } from '../../app/constants';
import _ from "lodash";
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries
} from "react-jsx-highstock"

import { headersData } from './constants';
import { cutData, getBorderRadius, getGroupingOptions } from './helpers';
import { useQuery } from 'react-query';
import moment from 'moment';
import { formatNum } from '../../app/helpers';

export function FeesAndRevenue() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<number>(90);
    const { isLoading, error, data } = useQuery(['protocolRevenue'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/protocolRevenue`).then(res => res.json())
    );

    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;
    let typedData = data?.map((x: any) => ({
        date: Number(x.date),
        fee: Number(x.fee),
        restake: Number(x.restake)
    }))

    //cumulative sum calculated incorrectly on staked & grouped columns
    let cuttedData = cutData(timePeriod, typedData, (el: any) => el.date);
    const feeSeries: [number, number][] = cuttedData?.map(x => [x.date, x.fee])!;
    const restakeSeries: [number, number][] = cuttedData?.map(x => [x.date, x.restake])!;

    let {
        headerText,
        tooltipText
    } = headersData.feesAndRevenue;

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headerText}</h3>
                <Tooltip id="my-tooltip"
                    noArrow
                    style={{
                        backgroundColor: "white",
                        color: "black",
                        border: "3px solid black",
                        borderRadius: "6px",
                        fontFamily: 'Space Grotesk',
                        fontSize: "14px",
                        lineHeight: "18px",
                        textAlign: "center",
                        padding: "10px",
                        maxWidth: "200px",
                        zIndex: 10
                    }} />
                <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={tooltipText}
                    className={styles.tooltipQuestionMark}
                    data-tooltip-place="bottom"
                >
                    ?
                </a>
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
                    <XAxis {...chartOpts.xAxis}
                        tickmarkPlacement={"between"}
                        minTickInterval={30 * 24 * 3600 * 1000}
                        tickAmount={5}>
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
                                units: getGroupingOptions(timeSpan) ? [getGroupingOptions(timeSpan)] : undefined
                            }}
                        />
                        <ColumnSeries
                            data={isLoading ? [] : feeSeries}
                            color={"#EB7257"}
                            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
                            stickyTracking
                            stacking={"normal"}
                            cumulative={isCumulative}
                            dataGrouping={{
                                enabled: true,
                                approximation: "sum",
                                groupAll: true,
                                forced: true,
                                units: getGroupingOptions(timeSpan) ? [getGroupingOptions(timeSpan)] : undefined
                            }}
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={
                            function (this: TooltipFormatterContextObject) {
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
                            }}
                        backgroundColor={"rgba(255,255,255, 1)"}
                        borderColor={"#000000"}
                        borderWidth={1}
                        borderRadius={15}
                        shadow={false}
                        style={{
                            fontSize: "14px",
                            fontFamily: "Space Grotesk"
                        }}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}
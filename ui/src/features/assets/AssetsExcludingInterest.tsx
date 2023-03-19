import React, { useState } from 'react';
import Highcharts, { } from 'highcharts/highstock';
import styles from './chartCard.module.scss';
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { baseChartOptions, TimePeriod, TimeSpan, Zone } from '../../app/constants';
import _ from "lodash";
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries
} from "react-jsx-highstock"

import { headersData } from './constants';
import { cutData, getChartColor, getGroupingOptions, getTooltipFormatter } from './helpers';
import { useQuery } from 'react-query';

export function AssetsExcludingInterest() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<number>(-1);
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

    let {
        headerText,
        tooltipText
    } = headersData.exclInterest;

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
                        maxWidth: "200px"
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
                <div>
                    <ZonesSelector setZone={setZone} />
                </div>
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
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={getTooltipFormatter(zone, timeSpan, isCumulative) || undefined}
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
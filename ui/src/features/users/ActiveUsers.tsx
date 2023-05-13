import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../assets/chartCard.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { backendUrl, baseChartOptions } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries, LineSeries
} from "react-jsx-highstock"

import { cutDataByTime } from '../../app/helpers';
import { useQuery } from 'react-query';
import { headersData } from './constants';
import moment from 'moment';
import { LoadingError } from '../../reusable/error/error';

export function ActiveUsers() {
    let [timePeriod, setTimePeriod] = useState<number>(90);

    const { isLoading, error, data } = useQuery(['activeUsers'], () =>
        fetch(`${backendUrl}/activeUsers`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = isLoading ? [] : [ ...data ];

    let ma = caculateMovingAverage(chartData?.map((x: any) => x[1]), 30);
    let maData = chartData?.map((x: any, i: number) => ([x[0], ma[i]]));

    let cuttedUsersData = cutDataByTime(timePeriod, chartData);
    let cuttedMaData = cutDataByTime(timePeriod, maData);

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headersData.activeUsers.headerText}</h3>
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
                    data-tooltip-content={headersData.activeUsers.tooltipText}
                    className={styles.tooltipQuestionMark}
                    data-tooltip-place="bottom"
                >
                    ?
                </a>
            </div>
            <div className={styles.chartCardOptions}>
                <div>
                </div>
                <div className={styles.timeSelectorsContainer}>
                    <TimePeriodSelector setTimePeriod={setTimePeriod} selectedValue={timePeriod} />
                </div>
            </div>
            <div className={styles.chartCardCumulativeSwitch}>
            </div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}
                        tickmarkPlacement={"between"}
                        minTickInterval={30 * 24 * 3600 * 1000}
                        tickAmount={5}
                        crosshair>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            data={isLoading ? [] : cuttedUsersData}
                            color={"#27AE60"}
                            borderRadius={(timePeriod > 90 || timePeriod === -1) ? 0 : (timePeriod >= 30 ? 2 : 5)}
                            stickyTracking
                        />
                        <LineSeries
                            data={isLoading ? [] : cuttedMaData}
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={function (this: TooltipFormatterContextObject) {
                            const that = this as any;
                            
                            let daily = that.points[0].y;
                            let monthly = Math.ceil(that.points[1].y);

                            return `            
                                <span style="text-align: center;">${moment(that.x).format("DD MMMM YYYY")}</span>
                                <br />
                                <span>Daily: ${daily}</span>
                                <br />
                                <span>Monthly: ${monthly}</span>
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

const calculateItemsSum = (data: any, start: any, stop: any) => {
    let sum = 0;
    for (let j = start; j < stop; ++j) {
        sum += data[j];
    }
    return sum;
};

const caculateMovingAverage = (data: any, window: any) => {
    const steps = data.length - window;
    const result = [];
    for (let i = 0; i < steps; ++i) {
        const sum = calculateItemsSum(data, i, i + window);
        result.push(sum / window);
    }

    return [...Array.from(Array(window)).map(x => 0), ...result];
};

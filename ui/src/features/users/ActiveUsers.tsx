import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../assets/../../App.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
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
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

export function ActiveUsers() {
    let [timePeriod, setTimePeriod] = useState<number>(90);

    const { isLoading, error, data } = useQuery(['activeUsers'], () =>
        fetch(`${backendUrl}/activeUsers`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions };
    let chartData = isLoading ? [] : [ ...data ];

    let ma = caculateMovingAverage(chartData?.map((x: any) => x[1]), 30);
    let maData = chartData?.map((x: any, i: number) => ([x[0], ma[i]]));

    let cuttedUsersData = cutDataByTime(timePeriod, chartData);
    let cuttedMaData = cutDataByTime(timePeriod, maData);

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headersData.activeUsers.headerText}</h3>
                <AppTooltip text={headersData.activeUsers.tooltipText} />
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
                    <XAxis {...chartOpts.xAxis} crosshair>
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
                        formatter={tooltipFormatter}
                        {...chartOpts.tooltip}
                    />
                </HighchartsStockChart>
            </HighchartsProvider>
        </div >
    );
}

function tooltipFormatter(this: TooltipFormatterContextObject) {
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

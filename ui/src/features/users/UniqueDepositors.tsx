import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../assets/../../App.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { baseChartOptions } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, AreaSeries
} from "react-jsx-highstock"
import { cutDataByTime } from '../../app/helpers';
import { useQuery } from 'react-query';
import { headersData } from './constants';
import moment from 'moment';
import { LoadingError } from '../../reusable/error/error';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

export function UniqueDepositors() {
    let [timePeriod, setTimePeriod] = useState<number>(-1);

    const { isLoading, error, data } = useQuery(['uniqueDepositors'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/uniqueDepositors`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions } as any;
    let chartData = isLoading ? [] : [ ...data ];

    let cuttedData = cutDataByTime(timePeriod, chartData);

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headersData.uniqueDeps.headerText}</h3>
                <AppTooltip text={headersData.uniqueDeps.tooltipText} />
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
                        <AreaSeries
                            data={cuttedData}
                            color={"#ACD6FD"}
                            borderRadius={5}
                            stickyTracking
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

    return `            
        <span style="text-align: center;">${moment(that.x).format("DD MMMM YYYY")}</span>
        <br />
        <span>Depositors: ${that.points[0].y}</span>
    `;
}
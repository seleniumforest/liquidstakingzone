import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../assets/chartCard.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
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
                    data-tooltip-content={headersData.uniqueDeps.tooltipText}
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
                        <AreaSeries
                            data={cuttedData}
                            color={"#ACD6FD"}
                            borderRadius={5}
                            stickyTracking
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={function (this: TooltipFormatterContextObject) {
                            const that = this as any;

                            return `            
                                <span style="text-align: center;">${moment(that.x).format("DD MMMM YYYY")}</span>
                                <br />
                                <span>Depositors: ${that.points[0].y}</span>
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
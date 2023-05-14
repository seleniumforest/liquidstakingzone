import React, { useState } from 'react';
import Highcharts, { } from 'highcharts/highstock';
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
import { cutDataByTime, getBorderRadius, getGroupingOptions, getTooltipFormatter } from '../../app/helpers';
import { useQuery } from 'react-query';
import { LoadingError } from '../../reusable/error/error';
import { getChartColor } from '../../app/helpers';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

export function AssetsExcludingInterest() {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<number>(90);
    let [zone, setZone] = useState<Zone>("cosmos");

    const { isLoading, error, data } = useQuery(['assetsDeposited', zone], () =>
        fetch(`${backendUrl}/assetsDeposited?zone=${zone}`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartData = isLoading ? [] : [ ...data ];
    let cuttedData = cutDataByTime(timePeriod, chartData);

    let chartOpts = { ...baseChartOptions } as any;
    chartOpts.plotOptions.column.cumulative = isCumulative;

    return (
        <div className={appStyles.chartCard}>
            <div className={appStyles.chartCardHeader}>
                <h3>{headersData.exclInterest.headerText}</h3>
                <AppTooltip text={headersData.exclInterest.tooltipText} />
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
                    <XAxis {...chartOpts.xAxis}
                        tickmarkPlacement={"between"}
                        minTickInterval={30 * 24 * 3600 * 1000}
                        tickAmount={5}>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            data={cuttedData}
                            color={getChartColor(zone)}
                            borderRadius={getBorderRadius(timeSpan, timePeriod)}
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
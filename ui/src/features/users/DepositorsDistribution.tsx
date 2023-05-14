import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../assets/../../App.module.scss';
import { backendUrl, baseChartOptions, Zone } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries
} from "react-jsx-highstock"
import { useQuery } from 'react-query';
import { headersData } from './constants';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { LoadingError } from '../../reusable/error/error';
import { getChartColor } from '../../app/helpers';
import { AppTooltip } from '../../reusable/appTooltip/AppTooltip';

export function DepositorsDistribution() {
    let [zone, setZone] = useState<Zone>("cosmos");

    const { isLoading, error, data } = useQuery(['depositorsVolume', zone], () =>
        fetch(`${backendUrl}/depositorsVolume?zone=${zone}`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions };
    let categories = isLoading ? [] : data.map((x: any) => `${humanize(x.range[0])}-${humanize(x.range[1])}`);
    let chartData = isLoading ? [] : [...data].map(x => x.count);

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{headersData.depaTotalVolume.headerText}</h3>
                <AppTooltip text={headersData.depaTotalVolume.tooltipText} />
            </div>
            <div className={styles.chartCardOptions}>
                <div>
                    <ZonesSelector setZone={setZone} />
                </div>
            </div>
            <div className={styles.chartCardCumulativeSwitch}>
            </div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}
                        categories={categories}
                        crosshair>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            color={getChartColor(zone)}
                            stickyTracking
                            data={chartData}
                            borderRadius={5}
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
        <span style="text-align: center;">${that.x} USD depositors</span>
        <br />
        <span>Depositors: ${that.points[0].y}</span>
    `;
}

function humanize(num: number) {
    switch (num) {
        case 1000: return "1k";
        case 10000: return "10k";
        case 100000: return "100k";
        case 1000000: return "1M";
        case 10000000: return "10M";
        default: return num;
    }
}
import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './../assets/chartCard.module.scss';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { baseChartOptions, Zone } from '../../app/constants';
import _, { capitalize } from "lodash";
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, ColumnSeries} from "react-jsx-highstock"

import { useQuery } from 'react-query';
import { headersData } from './constants';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { getChartColor } from '../assets/helpers';

export function DepositorsDistribution() {
    let chartColor = "#D96BCE";
    let [zone, setZone] = useState<Zone>("atom");
    const { isLoading, error, data } = useQuery(['depositorsVolume', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/depositorsVolume?zone=${zone}`).then(res => res.json())
    );

    //if (isLoading) return <>'Loading...'</>;
    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;

    let {
        headerText,
        tooltipText
    } = headersData.depaTotalVolume;

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
            </div>
            <div className={styles.chartCardCumulativeSwitch}>
            </div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}
                        categories={isLoading ? [] : data.map((x: any) => `${humanize(x.range[0])}-${humanize(x.range[1])}`)}
                        crosshair>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            color={getChartColor(zone)}
                            stickyTracking
                            data={isLoading ? [] : data.map((x: any) => +x.count)}
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={function (this: TooltipFormatterContextObject) {
                            const that = this as any;
                            return `            
                                <span style="text-align: center;">${that.x} ${capitalize(zone)} depositors</span>
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

function humanize(num: number) {
    switch(num) {
        case 1000: return "1k";
        case 10000: return "10k";
        case 100000: return "100k";
        case 1000000: return "1M";
        case 10000000: return "10M";
        default: return num;
    }
}
import React, { useState } from 'react';
import Highcharts, { TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './chartCard.module.scss';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { baseChartOptions, Zone } from '../../app/constants';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    HighchartsStockChart, LineSeries
} from "react-jsx-highstock"

import { headersData } from './constants';
import { capitalize, cutData, getChartColor } from './helpers';
import { useQuery } from 'react-query';
import moment from 'moment';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';

export function RedemptionRate() {
    let [zone, setZone] = useState<Zone>("cosmos");
    let [timePeriod, setTimePeriod] = useState<number>(90);
    const { isLoading, error, data } = useQuery(['redemptionRates', zone], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/redemptionRates?zone=${zone}`)
            .then(res => res.json())
    );

    if (error) return <>'Error...'</>;

    let chartOpts = { ...baseChartOptions } as any;

    let cuttedData = cutData(timePeriod, data, (el: any) => el.date);

    let rateSeries = cuttedData?.map((x: any) => ([x.date, x.rate]));
    let priceSeries = cuttedData?.map((x: any) => ([x.date, x.price]));

    let {
        headerText,
        tooltipText
    } = headersData.redemptionRate;

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
                <div>
                    <ZonesSelector setZone={setZone} />
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
                        tickAmount={5}>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <LineSeries
                            data={rateSeries}
                            color={getChartColor(zone)}
                        />
                        <LineSeries
                            data={priceSeries}
                            color={"black"}
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={
                            function (this: TooltipFormatterContextObject) {
                                let that = this as any;
                         
                                let rate = that.points[0].y.toFixed(4);
                                let price = that.points[1].y.toFixed(4);

                                return `
                                    <span style="text-align: center;">${moment(this.x).format("DD MMMM YYYY")}</span>
                                    <br>
                                    <span>Redemption rate: ${rate}</span>
                                    <br>
                                    <span>${capitalize(zone)}/st${capitalize(zone)} market price: ${price}</span>
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
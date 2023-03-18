import React, { useEffect, useRef, useState } from 'react';

import Highcharts, { isNumber, TooltipFormatterCallbackFunction, TooltipFormatterContextObject } from 'highcharts/highstock';
import styles from './chartCard.module.scss';
import appStyles from "../../App.module.scss";
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import HighchartsReact from 'highcharts-react-official'
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { MultipleZonesSelector } from '../multipleZonesSelector/MultipleZonesSelector';
import { baseChartOptions, TimePeriod, TimeSpan, Zone } from '../../app/constants';
import moment from 'moment';
import _ from "lodash";
import {
    HighchartsProvider, HighchartsChart, Chart, XAxis,
    YAxis, Title, Subtitle, Legend, Tooltip as HSTooltip,
    LineSeries, HighchartsStockChart, ColumnSeries, RangeSelector
} from "react-jsx-highstock"

export function ChartCard(props: ChartCardProps) {
    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<TimePeriod>("MAX");
    let chartOpts = { ...(props.chartOpts || baseChartOptions) };

    let composedData = props.chartData && cutData(timePeriod, props.chartData);

    let formatter: TooltipFormatterCallbackFunction = function () {
        const that = this as any;
        let displayDate = "";
        let displayZone = props.zone!.charAt(0).toUpperCase() + props.zone!.slice(1);
        let date = moment(that.x);
        displayDate = timeSpan == "M" ? date.format("MMMM YYYY") : date.format("DD MMMM YYYY");

        return `            
            <span style="text-align: center;">${displayDate}</span>
            <br />
            <span>${displayZone} ${new Intl.NumberFormat().format(that.y)}</span>
        `;
    };

    return (
        <div className={styles.chartCard}>
            <div className={styles.chartCardHeader}>
                <h3>{props.headerText}</h3>
                {props.tooltipText &&
                    <>
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
                            data-tooltip-content={props.tooltipText}
                            className={styles.tooltipQuestionMark}
                            data-tooltip-place="bottom"
                        >
                            ?
                        </a>
                    </>
                }
            </div>
            <div className={styles.chartCardOptions}>
                <div>
                    {!props.hideZonesSelector && <ZonesSelector setZone={props.setZone} />}
                    {props.multipleZones && <MultipleZonesSelector />}
                </div>
                <div className={styles.timeSelectorsContainer}>
                    {!props.hideTimeSpanSelector && <TimeSpanSelector setTimeSpan={setTimeSpan} selectedValue={timeSpan} />}
                    {!props.hideTimePeriodSelector && <TimePeriodSelector setTimePeriod={setTimePeriod} selectedValue={timePeriod} />}
                </div>
            </div>
            {!props.hideIsCumulativeToggle &&
                <div className={styles.chartCardCumulativeSwitch}>
                    <ToggleSwitch
                        checked={isCumulative}
                        setChecked={setIsCumulative} />
                </div>
            }
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart plotOptions={{
                    column: {
                        borderRadius: 5,
                        pointPadding: 0,
                        borderWidth: 0
                    }
                }}>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis}
                        tickmarkPlacement={"between"}
                        minTickInterval={30 * 24 * 3600 * 1000}
                        tickAmount={5}>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            data={composedData}
                            color={getChartColor(props.zone || "atom")}
                            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
                            stickyTracking
                            cumulative={isCumulative}
                            dataGrouping={{
                                enabled: true,
                                approximation: "sum",
                                groupAll: true,
                                forced: true,
                                units: [getGroupingOptions(timeSpan)]
                            }}
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={formatter}
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
    )
}

function getGroupingOptions(timeSpan: TimeSpan): [string, number[]] {
    if (timeSpan === "W")
        return ['week', [1]];

    if (timeSpan === "M")
        return ['month', [1]];

    return ['day', [1]];
}

function cutData(timePeriod: TimePeriod, series?: [date: number, value: number][]) {
    if (!series)
        return;

    //organize by timePeriod
    let filteredByPeriod = series.filter(el => {
        if (timePeriod === "MAX")
            return true;

        let days = 0;
        switch (timePeriod) {
            case '7D': days = 7; break;
            case '30D': days = 30; break;
            case '90D': days = 90; break;
            case '180D': days = 180; break;
            case '365D': days = 365; break;
        };
        if (days === 0)
            return true;

        let result = moment(el[0]).diff(moment().subtract(days, 'days'), 'days');
        return result >= 0;
    });

    return filteredByPeriod;

}

//todo move to parent component
function getChartColor(zone: Zone) {
    switch (zone) {
        case "atom": return "#008BF0";
        // case "osmo": return "#6BD9B8";
        // case "juno": return "#60F6FF";
        // case "stars": return "#5B3A9F";
        // case "luna": return "#C0D8DC";
        // case "evmos": return "#D96BCE";
        default: return "#008BF0";
    }
}

interface ChartCardProps {
    hideZonesSelector?: boolean,
    hideTimeSpanSelector?: boolean,
    hideTimePeriodSelector?: boolean,
    hideIsCumulativeToggle?: boolean,
    multipleZones?: boolean,
    headerText: string,
    tooltipText?: string,
    chartOpts?: any,
    chartData?: any,
    zone?: Zone,
    setZone?: any
}
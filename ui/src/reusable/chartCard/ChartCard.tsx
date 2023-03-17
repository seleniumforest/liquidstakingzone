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


function getChartColor(zone: Zone) {
    switch (zone) {
        case "atom": return "#008BF0";
        default: return "#008BF0";
    }
}

export function ChartCard(props: ChartCardProps) {
    let windowSize = useWindowSize();

    useEffect(() => {
        let chart = chartComponentRef.current?.chart;
        if (chart) chart.reflow();
    }, [windowSize])

    let [isCumulative, setIsCumulative] = useState(false);
    let [timeSpan, setTimeSpan] = useState<TimeSpan>("D");
    let [timePeriod, setTimePeriod] = useState<TimePeriod>("MAX");
    let chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    let chartOpts = { ...(props.chartOpts || baseChartOptions) };

    let composedData = composeData(timeSpan, timePeriod, isCumulative, props.chartData);
    // chartOpts.series[0].data = timeSpan === "M" ? composedData?.map(x => x[1]) : composedData;
    // chartOpts.series[0].userOptions = {
    //     zone: props.zone
    // }
    // chartComponentRef.current?.chart.xAxis[0].update({
    //     type: timeSpan === "M" ? "category" : "datetime",
    //     categories: timeSpan === "M" ? composedData?.map(x => {
    //         let month = moment().month(moment(x[0]).month()).format("MMM");
    //         let year = moment(x[0]).year();
    //         return `${month} ${year}`
    //     }) : undefined
    // });

    let a: TooltipFormatterCallbackFunction = function () {
        const that = this as any;
        let displayDate = "";
        console.log(that);

        let displayZone = props.zone!.charAt(0).toUpperCase() + props.zone!.slice(1);

        if (isNumber(that.x)) {
            let date = moment(that.x).format("DD MMMM YYYY");
            displayDate = date;
        }
        else {
            displayDate = that.x;
        }

        return `            
        <span style="text-align: center;">${displayDate}</span>
        <br />
        <span>${displayZone} ${new Intl.NumberFormat().format(that.y)}</span>
    `;
    }
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
            {/* <HighchartsReact
                containerProps={{ style: { width: "100%" } }}
                allowChartUpdate
                highcharts={Highcharts}
                options={chartOpts}
                ref={chartComponentRef} */}
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsStockChart plotOptions={{
                    column: {
                        borderRadius: 5,
                        pointPadding: 0,
                        borderWidth: 0
                    }
                }}>
                    <Chart {...chartOpts.chart} />
                    <XAxis {...chartOpts.xAxis} tickmarkPlacement={"on"} categories={
                        timeSpan === "M" ? composedData?.map(x => {
                            let month = moment().month(moment(x[0]).month()).format("MMM");
                            let year = moment(x[0]).year();
                            return `${month} ${year}`
                        }) : undefined
                    }>
                    </XAxis>
                    <YAxis {...chartOpts.yAxis} opposite={false}>
                        <ColumnSeries
                            data={timeSpan === "M" ? composedData?.map(x => x[1]) : composedData}
                            color={getChartColor(props.zone || "atom")} 
                            borderRadius={timeSpan === "M" ? 5 : (timeSpan === "W" ? 3 : 1)}
                            stickyTracking
                        />
                    </YAxis>
                    <HSTooltip
                        useHTML
                        formatter={a}
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

function composeData(timeSpan: TimeSpan, timePeriod: TimePeriod, isCumulative: boolean, series?: [date: number, value: number][]) {
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

    //organize by timeSpan
    let filteredByTimespan: [date: number, value: number][] = [];
    let func = (x: [number, number]) => (moment(x[0]).dayOfYear() + " " + moment(x[0]).year());
    switch (timeSpan) {
        case 'W': func = (x: [number, number]) => (moment(x[0]).week() + " " + moment(x[0]).year()); break;
        case 'M': func = (x: [number, number]) => (moment(x[0]).month() + " " + moment(x[0]).year()); break;
    };
    //group by day or week
    filteredByTimespan = _.values(_.groupBy(filteredByPeriod, func)).map(x => {
        //sum for end of period
        let sum = x.reduce((prev, cur) => cur[1] + prev, 0);
        //return last day and sum
        return [x[x.length - 1][0], sum];
    });

    //organize by isCumulative
    let result: [number, number][] = [];
    let acc = 0;
    filteredByTimespan?.forEach((x: [number, number]) => {
        if (isCumulative) {
            acc += x[1];
            result.push([x[0], acc]);
        }
        else {
            result.push(x);
        }
    });

    return result;
}

export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
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
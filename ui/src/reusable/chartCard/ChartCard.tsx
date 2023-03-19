export function qwe(){}
// import React, { useEffect, useRef, useState } from 'react';

// import Highcharts, { chart, isNumber, TooltipFormatterCallbackFunction, TooltipFormatterContextObject } from 'highcharts/highstock';
// import styles from './chartCard.module.scss';
// import appStyles from "../../App.module.scss";
// import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
// import HighchartsReact from 'highcharts-react-official'
// import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
// import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
// import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
// import 'react-tooltip/dist/react-tooltip.css'
// import { Tooltip } from 'react-tooltip'
// import { MultipleZonesSelector } from '../multipleZonesSelector/MultipleZonesSelector';
// import { baseChartOptions, TimePeriod, TimeSpan, Zone } from '../../app/constants';
// import moment from 'moment';
// import _ from "lodash";
// import {
//     HighchartsProvider, HighchartsChart, Chart, XAxis,
//     YAxis, Title, Subtitle, Legend, Tooltip as HSTooltip,
//     LineSeries, HighchartsStockChart, ColumnSeries, RangeSelector
// } from "react-jsx-highstock"

// export function ChartCard(props: ChartCardProps) {
//     let chartOpts = { ...(props.chartOpts || baseChartOptions) };

//     return (
//         <div className={styles.chartCard}>
//             <div className={styles.chartCardHeader}>
//                 <h3>{props.headerText}</h3>
//                 {props.tooltipText &&
//                     <>
//                         <Tooltip id="my-tooltip"
//                             noArrow
//                             style={{
//                                 backgroundColor: "white",
//                                 color: "black",
//                                 border: "3px solid black",
//                                 borderRadius: "6px",
//                                 fontFamily: 'Space Grotesk',
//                                 fontSize: "14px",
//                                 lineHeight: "18px",
//                                 textAlign: "center",
//                                 padding: "10px",
//                                 maxWidth: "200px"
//                             }} />
//                         <a
//                             data-tooltip-id="my-tooltip"
//                             data-tooltip-content={props.tooltipText}
//                             className={styles.tooltipQuestionMark}
//                             data-tooltip-place="bottom"
//                         >
//                             ?
//                         </a>
//                     </>
//                 }
//             </div>
//             <div className={styles.chartCardOptions}>
//                 <div>
//                     {!props.hideZonesSelector && <ZonesSelector setZone={props.setZone} />}
//                     {props.multipleZones && <MultipleZonesSelector />}
//                 </div>
//                 <div className={styles.timeSelectorsContainer}>
//                     {!props.hideTimeSpanSelector && props.timeSpan &&
//                         <TimeSpanSelector setTimeSpan={props.setTimeSpan} selectedValue={props.timeSpan} />}
//                     {!props.hideTimePeriodSelector && 
//                         <TimePeriodSelector setTimePeriod={props.setTimePeriod} selectedValue={props.timePeriod} />}
//                 </div>
//             </div>
//             {!props.hideIsCumulativeToggle &&
//                 <div className={styles.chartCardCumulativeSwitch}>
//                     <ToggleSwitch
//                         checked={props.isCumulative || false}
//                         setChecked={props.setIsCumulative} />
//                 </div>
//             }
//             <HighchartsProvider Highcharts={Highcharts}>
//                 <HighchartsStockChart>
//                     <Chart {...chartOpts.chart} />
//                     <XAxis {...chartOpts.xAxis}
//                         tickmarkPlacement={"between"}
//                         minTickInterval={30 * 24 * 3600 * 1000}
//                         tickAmount={5}>
//                     </XAxis>
//                     <YAxis {...chartOpts.yAxis} opposite={false}>
//                             {props.series}
//                     </YAxis>
//                     <HSTooltip
//                         useHTML
//                         formatter={props.tooltipFormatter || undefined}
//                         backgroundColor={"rgba(255,255,255, 1)"}
//                         borderColor={"#000000"}
//                         borderWidth={1}
//                         borderRadius={15}
//                         shadow={false}
//                         style={{
//                             fontSize: "14px",
//                             fontFamily: "Space Grotesk"
//                         }}
//                     />
//                 </HighchartsStockChart>
//             </HighchartsProvider>
//         </div >
//     )
// }

// interface ChartCardProps {
//     hideZonesSelector?: boolean,
//     hideTimeSpanSelector?: boolean,
//     hideTimePeriodSelector?: boolean,
//     hideIsCumulativeToggle?: boolean,
//     multipleZones?: boolean,
//     headerText: string,
//     tooltipText?: string,
//     chartOpts?: any,
//     chartData?: any,

//     zone?: Zone,
//     setZone?: any,
//     timePeriod?: TimePeriod,
//     setTimePeriod?: any,
//     timeSpan?: TimeSpan,
//     setTimeSpan?: any,
//     isCumulative?: boolean,
//     setIsCumulative?: any,

//     groupingOptions?: [string, number[]],

//     zoneColor?: string,

//     tooltipFormatter?: any,
//     series?: any
// }
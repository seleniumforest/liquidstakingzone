import React, { useEffect, useRef, useState } from 'react';

import Highcharts from 'highcharts'
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

export function ChartCard(props: ChartCardProps) {
    let windowSize = useWindowSize();

    useEffect(() => {
        let chart = chartComponentRef.current?.chart;
        if (chart) chart.reflow();
    }, [windowSize])

    let [checked, setChecked] = useState(false);
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    const chartData = {
        chart: {
            backgroundColor: 'transparent',
            type: 'column',
            borderColor: 'transparent',
            height: "50%"
        },
        yAxis: {
            gridLineColor: 'transparent',
            title: {
                text: null
            }
        },
        legend: { enabled: false },
        title: false,
        subtitle: false,
        credits: {
            enabled: false
        },
        series: [{
            marker: {
                enabled: false,
            },
            color: "#18C7FF",
            data: [0.4, 0.41, 0.45, 0.42, 0.43, 0.5, 0.2, 0.3],
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, "#18C7FF"],
                    [1, "#ffffff"]
                ]
            }
        }]
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
                    {!props.hideZonesSelector && <ZonesSelector />}
                    {props.multipleZones && <MultipleZonesSelector />}
                </div>
                <div className={styles.timeSelectorsContainer}>
                    {!props.hideTimeSpanSelector && <TimeSpanSelector />}
                    {!props.hideTimePeriodSelector && <TimePeriodSelector />}
                </div>
            </div>
            {!props.hideIsCumulativeToggle &&
                <div className={styles.chartCardCumulativeSwitch}>
                    <ToggleSwitch
                        checked={checked}
                        setChecked={setChecked} />
                </div>
            }
            <HighchartsReact
                containerProps={{ style: { width: "100%" } }}
                highcharts={Highcharts}
                options={chartData}
                ref={chartComponentRef}
            />
        </div>
    )
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
    tooltipText?: string
}
import React, { useRef, useState } from 'react';

import Highcharts, { Options } from 'highcharts'
import styles from './assets.module.scss';
import appStyles from "../../App.module.scss";
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { AppButton } from '../../reusable/appButton/AppButton';
import HighchartsReact from 'highcharts-react-official'
import { joinClasses } from '../../app/helpers';
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import Switch from "react-switch";
import { MultipleZonesSelector } from '../../reusable/multipleZonesSelector/MultipleZonesSelector';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';

export function Assets() {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

    const chartData = {
        chart: {
            backgroundColor: 'transparent',
            type: 'area',
            borderColor: 'transparent',
            height: "50%"
        },
        yAxis: {
            visible: false,
        },
        plotOptions: {

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
        <div className={appStyles.appBlock}>
            <div className={styles.assetsDeposited}>
                <ChartCard header={headers.exclInterest} />
                <div>2</div>
            </div>
            <div className={styles.otherCharts}>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div>6</div>
            </div>
        </div>
    );
}

const headers = {
    exclInterest: "Assets Deposited Excluding Interest"
}

function ChartCard(props: ChartCardProps) {
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
            <h3 className={styles.chartCardHeader}>{props.header}</h3>
            <div className={styles.chartCardOptions}>
                <ZonesSelector />
                <TimeSpanSelector />
                <TimePeriodSelector />
            </div>
            <div className={styles.chartCardCumulativeSwitch}>
                <ToggleSwitch
                    checked={checked}
                    setChecked={setChecked} />
            </div>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartData}
                ref={chartComponentRef}
            />
        </div>
    )
}

interface ChartCardProps {
    header: string
}
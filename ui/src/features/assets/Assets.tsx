import React, { useRef, useState } from 'react';

import Highcharts from 'highcharts'
import styles from './assets.module.scss';
import appStyles from "../../App.module.scss";
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import HighchartsReact from 'highcharts-react-official'
import { ToggleSwitch } from '../../reusable/toggleSwitch/ToggleSwitch';
import { ZonesSelector } from '../../reusable/zoneSelector/ZonesSelector';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { makeStyles } from '@mui/styles';
import 'react-tooltip/dist/react-tooltip.css'
import { Tooltip } from 'react-tooltip'
import { maxWidth } from '@mui/system';

export function Assets() {
    return (
        <div className={appStyles.appBlock}>
            <div className={styles.assetsDeposited}>
                <ChartCard {...headersData.exclInterest} />
                <div>2</div>
            </div>
            <div className={styles.otherCharts}>
                <ChartCard {...headersData.redeemedAssets} />
                <ChartCard {...headersData.feesAndRevenue} />
                <ChartCard {...headersData.tvlByChains} />
                <ChartCard {...headersData.redemptionRate} />
            </div>
        </div>
    );
}

const headersData = {
    exclInterest: {
        headerText: "Assets Deposited Excluding Interest",
        tooltipText: "The amount of coins that have already been created, minus any coins that have been burned (removed from circulation). It is comparable to outstanding shares in the stock market."
    },
    redeemedAssets: {
        headerText: "Redeemed assets",
        tooltipText: "Tooltip for Redeemed assets"
    },
    feesAndRevenue: {
        headerText: "Fees and Revenue",
        tooltipText: "Tooltop for Fees and Revenue"
    },
    tvlByChains: {
        headerText: "TVL by chains",
        tooltipText: "Tooltip for TVL by chains"
    },
    redemptionRate: {
        headerText: "Redemption Rate & stToken Prices",
        tooltipText: "Tooltip for Redemption Rate & stToken Prices"
    }
}

const useStyles = makeStyles((theme) => ({
    tooltip: {
        backgroundColor: "white !important",
        color: "black !important",
        border: "3px solid black !important",
        borderRadius: "6px !important",
        fontFamily: 'Space Grotesk !important',
        fontSize: "14px !important",
        lineHeight: "18px !important",
        textAlign: "center",
        padding: "10px"
    }
}));

function ChartCard(props: ChartCardProps) {
    let [checked, setChecked] = useState(false);
    let st = useStyles();

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
                            data-tooltip-place="bottom"
                        >
                            ?
                        </a>
                    </>
                }
            </div>
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
    headerText: string
    tooltipText?: string
}
import React, { useEffect, useRef } from 'react';

import Highcharts, { Options } from 'highcharts'
import styles from './generalData.module.scss';
import appStyles from "../../App.module.scss";
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { AppButton } from '../../reusable/appButton/AppButton';
import HighchartsReact from 'highcharts-react-official'
import { joinClasses } from '../../app/helpers';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import { useWindowSize } from '../../reusable/chartCard/ChartCard';

export function GeneralData() {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    const windowSize = useWindowSize();
    useEffect(() => {
        chartComponentRef.current?.chart?.reflow();
    }, [windowSize])

    const chartData = {
        chart: {
            backgroundColor: 'transparent',
            type: 'area',
            borderColor: 'transparent',
            height: "270px"
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
        <div className={styles.blocksLine}>
            <div className={joinClasses(styles.generalData, appStyles.appBlock)}>
                <div className={styles.stats}>
                    <div className={styles.strideLogo}></div>
                    <div className={styles.supportedZonesLabel}>Supported zones</div>
                    <div className={styles.supportedZonesIcons}>
                        <img alt='cosmos' src='/img/cosmos-logo.svg' />
                        <img alt='juno' src='/img/juno-logo.png' />
                        <img alt='osmo' src='/img/osmo-logo.svg' />
                        <img alt='stars' src='/img/stargaze-logo.png' />
                        <img alt='luna' src='/img/luna-logo.png' />
                        <img alt='evmos' src='/img/evmos-logo.svg' />
                    </div>
                    <div className={styles.mcapAndVolumeBox}>
                        <table>
                        <tr>
                                <td>Total value locked</td>
                                <td>$0.29m</td>
                            </tr>
                            <tr>
                                <td>Market Cap</td>
                                <td>$</td>
                            </tr>
                            <tr>
                                <td>24h Vol</td>
                                <td>$28 623</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div className={styles.priceChart}>
                    <TimePeriodSelector className={styles.strdPriceTimespanSelector} />
                    <HighchartsReact
                        style={{ width: "100%" }}
                        highcharts={Highcharts}
                        options={chartData}
                        ref={chartComponentRef}
                        allowChartUpdate
                    />

                </div>
            </div>
            <div className={joinClasses(styles.stakeNow, appStyles.appBlock)}>
                <div className={styles.aboutData}>
                    <div className={styles.stride}>Stride</div>
                    <div className={styles.strideDesc}>
                        Stride is a liquid staking protocol that unlocks the liquidity for staked assets in the IBC ecosystem.
                    </div>
                    <AppButton text="Stake Now" />
                    <div className={styles.social}>
                        <img alt='website' src='/img/chrome-icon-black.png' />
                        <img alt='twitter' src='/img/twitter-icon-pink.png' />
                        <img alt='discord' src='/img/discord-icon-black.png' />
                        <img alt='github' src='/img/github-icon-black.png' />
                        <img alt='medium' src='/img/medium-icon-black.png' />
                    </div>
                </div>
            </div>
        </div>
    );
}

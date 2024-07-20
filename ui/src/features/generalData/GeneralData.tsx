import React, { useState } from 'react';

import Highcharts, { TooltipFormatterContextObject } from 'highcharts'
import styles from './generalData.module.scss';
import appStyles from "../../App.module.scss";
import { AppButton } from '../../reusable/appButton/AppButton';
import { formatNum, joinClasses } from '../../app/helpers';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    AreaSeries, HighchartsChart
} from "react-jsx-highstock"
import { backendUrl, baseChartOptions } from '../../app/constants';
import moment from 'moment';
import { useQuery } from 'react-query';
import { cutDataByTime } from '../../app/helpers';
import { LoadingError } from '../../reusable/error/error';

export function GeneralData() {
    let [timePeriod, setTimePeriod] = useState<number>(90);

    const { isLoading, error, data } = useQuery(['generalData'], () =>
        fetch(`${backendUrl}/generalData`).then(res => res.json())
    );

    if (error) return <LoadingError />;

    let chartOpts = { ...baseChartOptions };
    let chartData = isLoading ? [] : [...data.prices];
    let cuttedData = cutDataByTime(timePeriod, chartData);

    return (
        <div className={styles.blocksLine}>
            <div className={joinClasses(styles.generalData, appStyles.appBlock)}>
                <div className={styles.stats}>
                    <div className={styles.strideLogo}></div>
                    <div className={styles.supportedZonesLabel}>Supported zones</div>
                    <div className={styles.supportedZonesIcons}>
                        <a href="https://cosmos.network/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/cosmos-logo.png' />
                        </a>
                        <a href="https://www.junonetwork.io/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/juno-logo.png' />
                        </a>
                        <a href="https://osmosis.zone/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/osmo-logo.svg' />
                        </a>
                        <a href="https://www.stargaze.zone/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/stars-logo.png' />
                        </a>
                        <a href="https://www.terra.money/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/terra-logo.png' />
                        </a>
                        <a href="https://evmos.org/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/evmos-logo.png' />
                        </a>
                        <a href="https://injective.com/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/inj-logo.png' />
                        </a>
                        <br></br>
                        <a href="https://umee.cc/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/umee-logo.png' />
                        </a>
                        <a href="https://comdex.one/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/comdex-logo.png' />
                        </a>
                        <a href="https://dydx.exchange/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/dydx-logo.png' />
                        </a>
                        <a href="https://islamiccoin.net/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/haqq-logo.png' />
                        </a>
                        <a href="https://www.saga.xyz/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/saga-logo.png' />
                        </a>
                        <a href="https://www.sommelier.finance/" target="_blank" rel="noreferrer">
                            <img alt='website' src='/img/somm-logo.png' />
                        </a>
                    </div>
                    {!isLoading &&
                        <div className={styles.mcapAndVolumeBox}>
                            <table>
                                <thead>
                                    <tr>
                                        <td>Total value locked</td>
                                        <td>{`$${formatNum(Math.ceil(data.tvl))}`}</td>
                                    </tr>
                                    <tr>
                                        <td>Market Cap</td>
                                        <td>{`$${formatNum(data.marketCap)}`}</td>
                                    </tr>
                                    <tr>
                                        <td>24h Vol</td>
                                        <td>{`$${formatNum(data.vol)}`}</td>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    }
                </div>
                <div className={styles.priceChart}>
                    <div className={styles.strdPriceLabel}>
                        STRD Price
                    </div>
                    <TimePeriodSelector className={styles.strdPriceTimespanSelector} setTimePeriod={setTimePeriod} selectedValue={timePeriod} />
                    <div style={{ width: "100%" }}>
                        <HighchartsProvider Highcharts={Highcharts}>
                            <HighchartsChart {...baseChartOptions.chart}>
                                <Chart {...chartOpts.chart} />
                                <XAxis {...baseChartOptions.xAxis} type='datetime' />
                                <YAxis visible={false}>
                                    <AreaSeries
                                        data={cuttedData}
                                        color={"#18C7FF"}
                                        stickyTracking
                                    />
                                </YAxis>
                                <HSTooltip
                                    useHTML
                                    formatter={tooltipFormatter}
                                    {...chartOpts.tooltip}
                                />
                            </HighchartsChart>
                        </HighchartsProvider>
                    </div>
                </div>
            </div>
            <div className={joinClasses(styles.stakeNow, appStyles.appBlock)}>
                <div className={styles.aboutData}>
                    <div className={styles.stride}>Stride</div>
                    <div className={styles.strideDesc}>
                        Stride is a liquid staking protocol that unlocks the liquidity for staked assets in the IBC ecosystem.
                    </div>
                    <a href="https://app.stride.zone/" target="_blank" rel="noreferrer" className={appStyles.appButtonLink}>
                        <button className={appStyles.appButton}>Stake Now</button>
                    </a>
                    <div className={styles.social}>
                        <a href="https://stride.zone/" target="_blank" rel="noreferrer">
                            <img alt='website'
                                onMouseOver={(el: any) => el.target.src = '/img/chrome-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/chrome-logo-black.png'}
                                src='/img/chrome-logo-black.png' />
                        </a>
                        <a href="https://twitter.com/stride_zone" target="_blank" rel="noreferrer">
                            <img alt='twitter'
                                onMouseOver={(el: any) => el.target.src = '/img/twitter-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/twitter-logo-black.png'}
                                src='/img/twitter-logo-black.png' />
                        </a>
                        <a href="https://discord.gg/stride-988945059783278602" target="_blank" rel="noreferrer">
                            <img alt='discord'
                                onMouseOver={(el: any) => el.target.src = '/img/discord-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/discord-logo-black.png'}
                                src='/img/discord-logo-black.png' />
                        </a>
                        <a href="https://github.com/Stride-Labs/stride/" target="_blank" rel="noreferrer">
                            <img alt='github'
                                onMouseOver={(el: any) => el.target.src = '/img/github-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/github-logo-black.png'}
                                src='/img/github-logo-black.png' />
                        </a>
                        <a href="https://stride.zone/blog" target="_blank" rel="noreferrer">
                            <img alt='medium'
                                onMouseOver={(el: any) => el.target.src = '/img/medium-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/medium-logo-black.png'}
                                src='/img/medium-logo-black.png' />
                        </a>
                    </div>
                </div>
            </div>
        </div >
    );
}

function tooltipFormatter(this: TooltipFormatterContextObject) {
    let displayDate = "";
    let date = moment(this.x);
    displayDate = date.format("DD MMMM YYYY");

    return `            
    <span style="text-align: center;">${displayDate}</span>
    <br />
    <span>STRD Price ${this.y?.toFixed(2)}</span>
`;
}
import React, { useState } from 'react';

import Highcharts, { TooltipFormatterContextObject } from 'highcharts'
import styles from './generalData.module.scss';
import appStyles from "../../App.module.scss";
import { AppButton } from '../../reusable/appButton/AppButton';
import { joinClasses } from '../../app/helpers';
import { TimePeriodSelector } from '../../reusable/timePeriodSelector/TimePeriodSelector';
import {
    HighchartsProvider, Chart, XAxis,
    YAxis, Tooltip as HSTooltip,
    AreaSeries, HighchartsChart
} from "react-jsx-highstock"
import { baseChartOptions } from '../../app/constants';
import moment from 'moment';
import { useQuery } from 'react-query';
import { cutData } from '../assets/helpers';

export function GeneralData() {
    let chartOpts = { ...baseChartOptions };

    const { isLoading, error, data } = useQuery(['generalData'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/generalData`).then(res => res.json())
    );

    let [timePeriod, setTimePeriod] = useState<number>(90);

    let cuttedData = isLoading ? [] : cutData(timePeriod, data?.prices ? [...data?.prices] : []);

    return (
        <div className={styles.blocksLine}>
            <div className={joinClasses(styles.generalData, appStyles.appBlock)}>
                <div className={styles.stats}>
                    <div className={styles.strideLogo}></div>
                    <div className={styles.supportedZonesLabel}>Supported zones</div>
                    <div className={styles.supportedZonesIcons}>
                        <a href="https://cosmos.network/" target="_blank">
                            <img alt='website' src='/img/atom-logo.png' />
                        </a>
                        <a href="https://www.junonetwork.io/" target="_blank">
                            <img alt='website' src='/img/juno-logo.png' />
                        </a>
                        <a href="https://osmosis.zone/" target="_blank">
                            <img alt='website' src='/img/osmo-logo.svg' />
                        </a>
                        <a href="https://www.stargaze.zone/" target="_blank">
                            <img alt='website' src='/img/stars-logo.png' />
                        </a>
                        <a href="https://www.terra.money/" target="_blank">
                            <img alt='website' src='/img/luna-logo.png' />
                        </a>
                        <a href="https://evmos.org/" target="_blank">
                            <img alt='website' src='/img/evmos-logo.png' />
                        </a>
                    </div>
                    {!isLoading &&
                        <div className={styles.mcapAndVolumeBox}>
                            <table>
                                <thead>
                                    <tr>
                                        <td>Total value locked</td>
                                        <td>{`$${new Intl.NumberFormat().format(Math.ceil(data.tvl))}`}</td>
                                    </tr>
                                    <tr>
                                        <td>Market Cap</td>
                                        <td>{`$${new Intl.NumberFormat().format(data.marketCap)}`}</td>
                                    </tr>
                                    <tr>
                                        <td>24h Vol</td>
                                        <td>{`$${new Intl.NumberFormat().format(data.vol)}`}</td>
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
                                        data={isLoading ? [] : cuttedData}
                                        color={"#18C7FF"}
                                        stickyTracking
                                    />
                                </YAxis>
                                <HSTooltip
                                    useHTML
                                    formatter={function (this: TooltipFormatterContextObject) {
                                        let displayDate = "";
                                        let date = moment(this.x);
                                        displayDate = date.format("DD MMMM YYYY");

                                        return `            
                                        <span style="text-align: center;">${displayDate}</span>
                                        <br />
                                        <span>STRD Price ${this.y?.toFixed(2)}</span>
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
                    <a href="https://app.stride.zone/" target="_blank" className={appStyles.appButtonLink}>
                        <button className={appStyles.appButton}>Stake Now</button>
                    </a>
                    <div className={styles.social}>
                        <a href="https://stride.zone/" target="_blank">
                            <img alt='website'
                                onMouseOver={(el: any) => el.target.src = '/img/chrome-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/chrome-logo-black.png'}
                                src='/img/chrome-logo-black.png' />
                        </a>
                        <a href="https://twitter.com/stride_zone" target="_blank">
                            <img alt='twitter'
                                onMouseOver={(el: any) => el.target.src = '/img/twitter-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/twitter-logo-black.png'}
                                src='/img/twitter-logo-black.png' />
                        </a>
                        <a href="https://discord.gg/stride-988945059783278602" target="_blank">
                            <img alt='discord'
                                onMouseOver={(el: any) => el.target.src = '/img/discord-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/discord-logo-black.png'}
                                src='/img/discord-logo-black.png' />
                        </a>
                        <a href="https://github.com/Stride-Labs/stride/" target="_blank">
                            <img alt='github'
                                onMouseOver={(el: any) => el.target.src = '/img/github-logo-pink.png'}
                                onMouseOut={(el: any) => el.target.src = '/img/github-logo-black.png'}
                                src='/img/github-logo-black.png' />
                        </a>
                        <a href="https://stride.zone/blog" target="_blank">
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

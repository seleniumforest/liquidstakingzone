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

    let [timePeriod, setTimePeriod] = useState<number>(-1);

    let cuttedData = isLoading ? [] : cutData(timePeriod, [...data?.prices]);

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
                    {!isLoading &&
                        <div className={styles.mcapAndVolumeBox}>
                            <table>
                                <thead>
                                    <tr>
                                        <td>Total value locked</td>
                                        <td>{`$${(data.tvl / 1e6).toFixed(2)}M`}</td>
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
                    <div style={{width:"100%"}}>
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
                                        <span>Price ${this.y?.toFixed(2)}</span>
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

import React from 'react';

import styles from './generalData.module.scss';
import appStyles from "../../App.module.scss";
import { TimeSpanSelector } from '../../reusable/timeSpanSelector/TimeSpanSelector';
import { AppButton } from '../../reusable/appButton/AppButton';

export function GeneralData() {
    return (
        <div className={styles.blocksLine}>
            <div className={styles.generalData + " " + appStyles.appBlock}>
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
                    <div className={styles.totalValueLockedLabel}>Total value locked</div>
                    <div className={styles.totalValueLockedValueLabel}>$0.29m</div>
                    <div className={styles.mcapAndVolumeBox}>
                        <table>
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
                    <TimeSpanSelector />
                </div>
            </div>
            <div className={styles.stakeNow + " " + appStyles.appBlock}>
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

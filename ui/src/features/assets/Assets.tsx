import React, { ReactElement, useEffect } from 'react';

import styles from './assets.module.scss';
import appStyles from "../../App.module.scss";

import { ChartCard } from '../../reusable/chartCard/ChartCard';
import { joinClasses } from '../../app/helpers';
import { headersData } from './constants';
import { AssetsExcludingInterest, AssetsRedeemed, FeesAndRevenue } from './Charts';

export function Assets() {
    let data: DepositDiffProps = {
        depostiedNow: 123456,
        depostiedYesterday: 123456,
        diff: 0.5,
        icon: <img src='/img/statom-logo.png' />
    }

    return (
        <>
            <div className={appStyles.appBlockLabelContainer}>
                <div className={appStyles.appBlockLabel}>
                    Assets
                </div>
            </div>
            <div className={joinClasses(styles.assetsBlueBlock, appStyles.appBlock)}>
                <div className={styles.assetsDeposited}>
                    <AssetsExcludingInterest />
                    <div className={styles.whiteCardContainer}>
                        <div className={styles.whiteCard}>
                            <h3>Total Assets Deposited Incl. Interest</h3>
                            <div className={styles.diffContainer}>
                                <DepositDiff {...data} />
                                <DepositDiff {...data} diff={-0.1} />
                                <DepositDiff {...data} />
                                <DepositDiff {...data} />
                                <DepositDiff {...data} />
                                <DepositDiff {...data} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.otherCharts}>
                    <AssetsRedeemed />
                    <FeesAndRevenue />
                    <ChartCard {...headersData.tvlByChains} multipleZones hideZonesSelector />
                    <ChartCard {...headersData.redemptionRate} />
                </div>
            </div>
        </>
    );
}

function DepositDiff(props: DepositDiffProps) {
    let diffClass = props.diff > 0 ? styles.green : styles.red;
    let arrow = props.diff > 0 ? "↑" : "↓";

    return (
        <div className={styles.depositDiff}>
            <div className={styles.today}>
                {props.depostiedNow}
                {props.icon}
            </div>
            <div className={joinClasses(styles.diff, diffClass)}>{arrow} {props.diff}%</div>
            <div className={styles.yesterday}>{`Was ${props.depostiedYesterday} last day`}</div>
        </div>
    )
}

interface DepositDiffProps {
    depostiedNow: number
    depostiedYesterday: number
    diff: number
    icon: ReactElement
}
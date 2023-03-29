import React, { ReactElement } from 'react';

import styles from './assets.module.scss';
import appStyles from "../../App.module.scss";

import { fromBaseUnit, joinClasses } from '../../app/helpers';
import { AssetsExcludingInterest } from './AssetsExcludingInterest';
import { AssetsRedeemed } from './AssetsRedeemed';
import { FeesAndRevenue } from './FeesAndRevenue';
import { TvlByChains } from './TvlByChains';
import { RedemptionRate } from './RedemptionRate';
import { useQuery } from 'react-query';
import { Zone } from '../../app/constants';

export function Assets() {
    const { isLoading, error, data } = useQuery(['assetsOnStakingWallets'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/assetsOnStakingWallets`).then(res => res.json())
    );

    let cardData = data?.map((x: any) => ({
        zone: x.zone,
        depositedNow: Number(fromBaseUnit(x.latestAssets[0][1], x.zone, 0)),
        depositedYesterday: Number(fromBaseUnit(x.pastDayAssets[0][1], x.zone, 0)),
        icon: <img src={`/img/st${x.zone}-logo.png`} />
    })).sort((a: any, b: any) => getZoneOrder(a.zone) > getZoneOrder(b.zone) ? 1 : -1);

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
                                {cardData?.map((cd: any) => <DepositDiff key={cd.zone} {...cd} />)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.otherCharts}>
                    <AssetsRedeemed />
                    <FeesAndRevenue />
                    <TvlByChains />
                    <RedemptionRate />
                </div>
            </div>
        </>
    );
}

function getZoneOrder(zone: Zone) {
    switch(zone){
        case "atom" : return 1;
        case "osmo": return 2;
        case "juno" : return 3;
        case "luna": return 5;
        case "stars": return 4;
        case "evmos": return 6;
    }
}

function DepositDiff(props: DepositDiffProps) {
    let diff = (props.depositedNow / props.depositedYesterday - 1) * 100;
    let diffClass = diff > 0 ? styles.green : styles.red;
    let arrow = diff > 0 ? "↑" : "↓";

    return (
        <div className={styles.depositDiff}>
            <div className={styles.today}>
                {new Intl.NumberFormat().format(props.depositedNow)}
                {props.icon}
            </div>
            <div className={joinClasses(styles.diff, diffClass)}>{arrow} {diff.toFixed(2)}%</div>
            <div className={styles.yesterday}>{`Was ${new Intl.NumberFormat().format(props.depositedYesterday)} last day`}</div>
        </div>
    )
}

interface DepositDiffProps {
    depositedNow: number
    depositedYesterday: number
    diff: number
    icon: ReactElement
}
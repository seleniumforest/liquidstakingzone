import React, { ReactElement } from 'react';

import styles from './assets.module.scss';

import { joinClasses } from '../../app/helpers';
import { useQuery } from 'react-query';
import { LoadingError } from '../../reusable/error/error';
import { backendUrl } from '../../app/constants';

export function AssetsOnStakingWallets() {
    const { error, data } = useQuery(['assetsOnStakingWallets'], () =>
        fetch(`${backendUrl}/assetsOnStakingWallets`).then(res => res.json())
    );

    let cardData = data?.map((x: any) => ({
        zone: x.zone,
        depositedNow: Math.round(+x.latestAssets),
        depositedYesterday: Math.round(+x.pastDayAssets),
        icon: <img alt={`st${x.zone}-logo`} src={`/img/st${x.zone}-logo.png`} />
    }));

    return (
        <div className={styles.whiteCardContainer}>
            <div className={styles.whiteCard}>
                <h3>Total Assets Deposited Incl. Interest</h3>
                {
                    cardData &&
                    <div className={styles.diffContainer}>
                        {cardData?.map((cd: any) => <DepositDiff key={cd.zone} {...cd} />)}
                    </div>
                }
                {
                    error &&
                    <LoadingError />
                }
            </div>
        </div>
    )
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
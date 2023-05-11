import React from 'react';

import styles from './assets.module.scss';
import appStyles from "../../App.module.scss";

import { joinClasses } from '../../app/helpers';
import { AssetsExcludingInterest } from './AssetsExcludingInterest';
import { AssetsRedeemed } from './AssetsRedeemed';
import { FeesAndRevenue } from './FeesAndRevenue';
import { TvlByChains } from './TvlByChains';
import { RedemptionRate } from './RedemptionRate';
import { AppError } from '../../reusable/error/error';
import { ErrorBoundary } from 'react-error-boundary';
import { AssetsOnStakingWallets } from './AssetsInclInterest';

export function Assets() {
    return (
        <>
            <div className={appStyles.appBlockLabelContainer}>
                <div className={appStyles.appBlockLabel}>
                    Assets
                </div>
            </div>
            <div className={joinClasses(styles.assetsBlueBlock, appStyles.appBlock)}>
                <div className={styles.assetsDeposited}>
                    <ErrorBoundary fallback={<AppError />}>
                        <AssetsExcludingInterest />
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<AppError />}>
                        <AssetsOnStakingWallets />
                    </ErrorBoundary>
                </div>
                <div className={styles.otherCharts}>
                    <ErrorBoundary fallback={<AppError />}>
                        <AssetsRedeemed />
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<AppError />}>
                        <FeesAndRevenue />
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<AppError />}>
                        <TvlByChains />
                    </ErrorBoundary>
                    <ErrorBoundary fallback={<AppError />}>
                        <RedemptionRate />
                    </ErrorBoundary>
                </div>
            </div>
        </>
    );
}
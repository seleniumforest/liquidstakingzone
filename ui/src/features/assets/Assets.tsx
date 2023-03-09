import React, {  } from 'react';

import styles from './assets.module.scss';
import appStyles from "../../App.module.scss";
import { ChartCard } from '../../reusable/chartCard/ChartCard';

export function Assets() {
    return (
        <>
        <div className={appStyles.appBlockLabelContainer}>
            <div className={appStyles.appBlockLabel}>
            Assets
            </div>
        </div>
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
        </>
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
import React, { } from 'react';

import styles from './users.module.scss';
import appStyles from "../../App.module.scss";
import { ChartCard } from '../../reusable/chartCard/ChartCard';

export function Users() {
    return (
        <>
            <div className={appStyles.appBlockLabelContainer}>
                <div className={appStyles.appBlockLabel}>
                    Users
                </div>
            </div>
            <div className={appStyles.appBlock}>
                <div className={styles.userCharts}>
                    <ChartCard {...headersData.activeUsers} hideTimeSpanSelector hideIsCumulativeToggle hideZonesSelector />
                    <ChartCard {...headersData.uniqueDeps} hideTimeSpanSelector hideIsCumulativeToggle hideZonesSelector />
                    <ChartCard {...headersData.depaTotalVolume} hideTimeSpanSelector hideIsCumulativeToggle hideTimePeriodSelector />
                    <div className={styles.yellowCardContainer}>
                        <div className={styles.yellowCard}>
                            <h4>Community</h4>
                            <h2>Dive in and join us!</h2>
                            <div>Stride token holders determine the future of the protocol, working together to build world-class liquid staking. Join our community on Discord and follow us on Twitter.</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

const headersData = {
    activeUsers: {
        headerText: "Daily & Monthly Active users",
        tooltipText: "The amount of coins that have already been created, minus any coins that have been burned (removed from circulation). It is comparable to outstanding shares in the stock market.",
    },
    uniqueDeps: {
        headerText: "Unique depositors cumulative",
        tooltipText: "Tooltip for Unique depositors cumulative"
    },
    depaTotalVolume: {
        headerText: "Depositors total volume distribution",
        tooltipText: "Tooltop for Depositors total volume distribution"
    }
}
import React, {  } from 'react';

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
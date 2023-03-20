import React, { } from 'react';

import styles from './users.module.scss';
import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';
import { ActiveUsers } from './ActiveUsers';
import { UniqueDepositors } from './UniqueDepositors';
import { DepositorsDistribution } from './DepositorsDistribution';

export function Users() {
    return (
        <>
            <div className={appStyles.appBlockLabelContainer}>
                <div className={appStyles.appBlockLabel}>
                    Users
                </div>
            </div>
            <div className={joinClasses(appStyles.appBlock, styles.usersBlueBlock)}>
                <div className={styles.userCharts}>
                    <ActiveUsers />
                    <UniqueDepositors />
                    <DepositorsDistribution />
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
import React, { } from 'react';

import styles from './events.module.scss';
import appStyles from "../../App.module.scss";

export function Events() {
    return (
        <>
            <div className={appStyles.appBlockLabelContainer}>
                <div className={appStyles.appBlockLabel}>
                    Events
                </div>
            </div>
            <div className={appStyles.appBlock}>
                <div className={styles.eventsContainer}>
                    <div className={styles.events}>
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Hash</th>
                                    <th scope="col">Time</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Assets</th>
                                    <th scope="col">Token in</th>
                                    <th scope="col">Token out</th>
                                    <th scope="col">Value</th>
                                    <th scope="col" style={{ width: "150px" }}>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>758JKJFA758JKJFA</td>
                                    <td>25/12/2023 00:00:00</td>
                                    <td className={styles.deposit}>Deposit</td>
                                    <td className={styles.assetIcons}>
                                        <img src='/img/cosmos-logo.svg' alt='atom logo' />
                                        <img src='/img/statom-logo.png' alt='statom logo' className={styles.secondImg} />
                                    </td>
                                    <td>1000 ATOM</td>
                                    <td>993.21 stATOM</td>
                                    <td>$123</td>
                                    <td>cosmos1asd...zxc</td>
                                </tr>
                                <tr>
                                    <td>758JKJFA758JKJFA</td>
                                    <td>25/12/2023 00:00:00</td>
                                    <td className={styles.redeem}>Redeem</td>
                                    <td className={styles.assetIcons}>
                                        <img src='/img/cosmos-logo.svg' alt='atom logo' />
                                        <img src='/img/statom-logo.png' alt='statom logo' className={styles.secondImg} />
                                    </td>
                                    <td>1000 ATOM</td>
                                    <td>993.21 stATOM</td>
                                    <td>$123</td>
                                    <td>cosmos1asd...zxc</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
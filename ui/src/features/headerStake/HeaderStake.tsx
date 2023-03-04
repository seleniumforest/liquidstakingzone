import React from 'react';

import styles from './headerStake.module.scss';
import appStyles from "../../App.module.scss";

export function HeaderStake() {
    return (
        <div className={styles.headerStake}>
            <div className={styles.headerStakeContent}>
                <div className={styles.helpQuantNodeLabel}>❤️ Helping QuantNode By Staking ❤️</div>
                <div className={styles.validatorStats}>
                    <table>
                        <thead className={styles.validatorStatsHeader}>
                            <tr>
                                <th scope="col">Validator</th>
                                <th scope="col">Voting Power</th>
                                <th scope="col">24H Changes</th>
                                <th scope="col">Comission</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody className={styles.validatorStatsContent}>
                            <tr>
                                <td>
                                    <div className={styles.validatorCellContent}>
                                        <div className={styles.validatorCellContentLogo}>
                                        </div>
                                        <div>
                                            <label>QuantNode</label>
                                            <br></br>
                                            <a href="https://quantnode.tech/">https://quantnode.tech/</a>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    206,800 STRD
                                    <br></br>
                                    0.17%
                                </td>
                                <td>0.1%</td>
                                <td>10%</td>
                                <td>
                                    <button className={appStyles.appButton}>
                                        Delegate
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

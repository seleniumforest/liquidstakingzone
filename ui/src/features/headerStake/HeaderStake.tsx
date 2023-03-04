import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

import styles from './headerStake.module.scss';
import appStyles from "../../App.module.scss";

export function HeaderStake() {
    return (
        <div className={styles.headerStake}>
            <div className={styles.headerStakeContent}>
                <div className={styles.helpQuantNodeLabel}>❤️ Helping QuantNode By Staking ❤️</div>
                <div className={styles.validatorStats}>
                    <TableContainer>
                        <Table>
                            <TableHead className={styles.validatorStatsHeader}>
                                <TableRow>
                                    <TableCell>Validator</TableCell>
                                    <TableCell>Voting Power</TableCell>
                                    <TableCell>24H Changes</TableCell>
                                    <TableCell>Comission</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className={styles.validatorStatsContent}>
                                <TableRow>
                                    <TableCell>
                                        <div className={styles.validatorCellContent}>
                                            <div className={styles.validatorCellContentLogo}>
                                            </div>
                                            <div className={styles.validatorCellContentInfo}>
                                                <label>QuantNode</label>
                                                <br></br>
                                                <a href='https://quantnode.tech/'>https://quantnode.tech/</a>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        206,800 STRD
                                        <br></br>
                                        0.17%
                                    </TableCell>
                                    <TableCell>0.1%</TableCell>
                                    <TableCell>10%</TableCell>
                                    <TableCell>
                                        <Button className={appStyles.appButton}>Delegate</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    );
}

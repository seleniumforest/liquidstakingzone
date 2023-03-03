import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';
import styles from './headerStake.module.scss';

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
                                    <TableCell>Validator</TableCell>
                                    <TableCell>Voting Power</TableCell>
                                    <TableCell>24H Changes</TableCell>
                                    <TableCell>Comission</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    );
}

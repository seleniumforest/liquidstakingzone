import React, { } from 'react';

import styles from './events.module.scss';
import appStyles from "../../App.module.scss";
import { useQuery } from 'react-query';
import { Zone } from '../../app/constants';
import moment from 'moment';
import { capitalize } from 'lodash';

export function Events() {
    const { isLoading, error, data } = useQuery(['latestEvents'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/latestEvents`).then(res => res.json())
    );

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
                                {data?.map((d: any) => (<tr key={d.txhash}>
                                    <td><a target="_blank" href={`https://www.mintscan.io/stride/txs/${d.txhash}`}>{d.txhash.slice(0, 10)}</a></td>
                                    <td>{moment(+d.date * 1000).format("DD/MM/YYYY HH:mm:SS")}</td>
                                    <td className={d.action === "stake" ? styles.deposit : styles.redeem}>{d.action === "stake" ? "Deposit" : "Redeem"}</td>
                                    <td className={styles.assetIcons}>
                                        {d.action === "stake" ?
                                            <>
                                                <img src={`/img/${d.zone}-logo.png`} alt={`${d.zone} logo`} />
                                                <img src={`/img/st${d.zone}-logo.png`} alt={`st${d.zone} logo`} className={styles.secondImg} />
                                            </> :
                                            <>
                                                <img src={`/img/st${d.zone}-logo.png`} alt={`st${d.zone} logo`} />
                                                <img src={`/img/${d.zone}-logo.png`} alt={`${d.zone} logo`} className={styles.secondImg} />
                                            </>
                                        }
                                    </td>
                                    <td>{d.tokenIn.toFixed(2)} {d.action === "redeem" && "st"}{capitalize(d.zone)}</td>
                                    <td>{d.tokenOut.toFixed(2)} {d.action === "stake" && "st"}{capitalize(d.zone)}</td>
                                    <td>${d.value}</td>
                                    <td><a target="_blank" href={`https://www.mintscan.io/stride/account/${d.creator}`}>
                                        {`${d.creator.slice(0, 10)}...${d.creator.slice(d.creator.length - 5, d.creator.length)}`}
                                    </a></td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
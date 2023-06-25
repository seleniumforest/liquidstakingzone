import React, { } from 'react';

import styles from './events.module.scss';
import appStyles from "../../App.module.scss";
import { useQuery } from 'react-query';
import moment from 'moment';
import { capitalize, joinClasses } from '../../app/helpers';
import { useZonesInfo } from '../../app/hooks';
import { LoadingError } from '../../reusable/error/error';

export function Events() {
    const { data, error } = useQuery(['latestEvents'], () =>
        fetch(`${process.env.REACT_APP_API_BASEURL}/latestEvents`).then(res => res.json())
    );
    const { data: zonesInfo } = useZonesInfo();

    if (error) return <LoadingError />;

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
                                    <th scope="col" className={styles.hideOnMobile}>Hash</th>
                                    <th scope="col" className={styles.hideOnMobile}>Time</th>
                                    <th scope="col">Type</th>
                                    <th scope="col" className={styles.hideOnMobile}>Assets</th>
                                    <th scope="col">Token in</th>
                                    <th scope="col" className={styles.hideOnMobile}>Token out</th>
                                    <th scope="col">Value</th>
                                    <th scope="col" style={{ width: "150px" }}>Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.map((d: any) => {
                                    let zoneInfo = zonesInfo?.find(x => x.zone === d.zone);
                                    let ticker = zoneInfo?.ticker || d.zone;

                                    return (<tr key={d.txhash}>
                                        <td className={styles.hideOnMobile}><a target="_blank" rel="noreferrer" href={`https://www.mintscan.io/stride/txs/${d.txhash}`}>{d.txhash.slice(0, 10)}</a></td>
                                        <td className={styles.hideOnMobile}>{moment(+d.date).format("DD/MM/YYYY HH:mm:SS")}</td>
                                        <td className={d.action === "stake" ? styles.deposit : styles.redeem}>{d.action === "stake" ? "Deposit" : "Redeem"}</td>
                                        <td className={joinClasses(styles.assetIcons, styles.hideOnMobile)}>
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
                                        <td>{d.tokenIn.toFixed(2)} {d.action === "redeem" && "st"}{capitalize(ticker)}</td>
                                        <td className={styles.hideOnMobile}>{d.tokenOut.toFixed(2)} {d.action === "stake" && "st"}{capitalize(ticker)}</td>
                                        <td>${d.value.toFixed(0)}</td>
                                        <td><a target="_blank" rel="noreferrer" href={`https://www.mintscan.io/stride/account/${d.creator}`}>
                                            {`${d.creator.slice(0, 9)}...${d.creator.slice(d.creator.length - 3, d.creator.length)}`}
                                        </a></td>
                                    </tr>)
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
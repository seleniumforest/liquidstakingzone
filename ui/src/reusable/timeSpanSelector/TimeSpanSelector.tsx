import React from 'react';

import styles from './timeSpanSelector.module.scss';
import appStyles from "../../App.module.scss";

export function TimeSpanSelector() {
    let defaultButtons = ["7D", "30D", "90D", "180D", "365D", "MAX"]

    return (
        <div className={styles.timeSpanSelector}>
            {defaultButtons.map(btn => TimeSpanButton({ label: btn}))}
        </div>
    );
}

function TimeSpanButton({ label }: { label: string }) {
    return (
        <button>{label}</button>
    )
}
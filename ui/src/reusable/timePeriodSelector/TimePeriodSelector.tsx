import React from 'react';

import styles from './timePeriodSelector.module.scss';
import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';

export function TimePeriodSelector({ className } : { className?: string }) {
    let defaultButtons = ["7D", "30D", "90D", "180D", "365D", "MAX"]

    return (
        <div className={joinClasses(appStyles.timeSpanSelector, className)}>
            {defaultButtons.map(btn => TimeSpanButton({ label: btn}))}
        </div>
    );
}

function TimeSpanButton({ label }: { label: string }) {
    return (
        <button>{label}</button>
    )
}
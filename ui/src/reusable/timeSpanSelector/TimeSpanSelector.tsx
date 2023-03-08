import React from 'react';

import styles from './timeSpanSelector.module.scss';
import appStyles from "../../App.module.scss";
import { joinClasses } from '../../app/helpers';

export function TimeSpanSelector({ className } : { className?: string }) {
    let defaultButtons = ["D", "W", "M"]

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
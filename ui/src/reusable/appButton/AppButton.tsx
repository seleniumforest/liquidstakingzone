import React from 'react';

import styles from './appButton.module.scss'

export function AppButton(props: AppButtonProps) {
    return (
        <button className={styles.appButton + " " + props.className}>{props.text}</button>
    );
}

type AppButtonProps = {
    text: String,
    className?: String
}
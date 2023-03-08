import React, { Dispatch, SetStateAction, useState } from 'react';

import appStyles from "../../App.module.scss";
import Switch from "react-switch";

export function ToggleSwitch({ checked, setChecked }: { checked: boolean, setChecked: Dispatch<SetStateAction<boolean>> }) {
    return (
        <div className={appStyles.appSwitch}>
            <div className={appStyles.appSwitchLabel}>Show as Cumulative</div>
            <Switch
                className={appStyles.appSwitchComponent}
                onChange={() => setChecked(!checked)}
                checked={checked}
                height={20} width={40}
                offHandleColor="#E91179"
                offColor="#ffffff"
                onColor="#E91179"
                onHandleColor="#ffffff"
                handleDiameter={0}
                checkedIcon={false}
                uncheckedIcon={false}
                borderRadius={6} />

        </div>
    )
}
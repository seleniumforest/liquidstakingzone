import React from 'react';
import styles from './App.module.scss';
import { Assets } from './features/assets/Assets';
import { GeneralData } from './features/generalData/GeneralData';
import { HeaderStake } from './features/headerStake/HeaderStake';

function App() {
    return (
        <div className={styles.app}>
            <div className={styles.content}>
                <div className={styles.blocks}>
                    <HeaderStake />
                    <GeneralData />
                    <Assets />
                </div>
            </div>
        </div>
    );
}

export default App;

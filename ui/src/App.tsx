import React from 'react';
import styles from './App.module.scss';
import { Assets } from './features/assets/Assets';
import { GeneralData } from './features/generalData/GeneralData';
import { HeaderStake } from './features/headerStake/HeaderStake';
import { Users } from './features/users/Users';

function App() {
    return (
        <div className={styles.app}>
            <div className={styles.content}>
                <div className={styles.blocks}>
                    <HeaderStake />
                    <GeneralData />
                    <Assets />
                    <Users />
                </div>
            </div>
        </div>
    );
}

export default App;

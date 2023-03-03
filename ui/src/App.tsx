import React from 'react';
import styles from './App.module.scss';
import { HeaderStake } from './features/headerStake/HeaderStake';

function App() {
    return (
        <div className={styles.app}>
            <div className={styles.content}>
                <div className={styles.blocks}>
                    <HeaderStake />
                </div>
            </div>
        </div>
    );
}

export default App;

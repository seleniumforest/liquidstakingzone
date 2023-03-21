import React from 'react';
import styles from './App.module.scss';
import { Assets } from './features/assets/Assets';
import { Events } from './features/events/Events';
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
                    <Events />
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default App;


function Footer() {
    return (
        <div className={styles.footer}>
            © 2023, ❤️ Proudly built by
            <a href="https://twitter.com/LetsCodeWeb3" target="_blank">
                <img src='/img/letscode-logo.png' alt={`Let's Code`} />
            </a>
            X
            <a href="https://quantnode.tech/" target="_blank">
                <img src='/img/quantnode-logo.png' alt={` `} />
            </a>
            QUANTNODE ❤️
        </div>
    );
}

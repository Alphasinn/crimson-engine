import React from 'react';
import styles from './exchange.module.scss';

export const SanguineExchangeView: React.FC = () => {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sanguine Exchange</h2>
          <p className={styles.subtitle}>Barter with the denizens of the night. (Under Construction)</p>
        </div>
        
        <div className={styles.placeholderGrid}>
          <div className={styles.placeholderCard}>
            <h3>Blood Merchant</h3>
            <p>Exchange shards for basic equipment and consumables.</p>
          </div>
          <div className={styles.placeholderCard}>
            <h3>Soul Broker</h3>
            <p>Trade boss essences for arcane relics.</p>
          </div>
        </div>
      </div>
    );
};

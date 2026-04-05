import React, { useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { MERCHANTS } from '../../data/merchants';
import { ITEM_MAP } from '../../data/items';
import type { EquipmentItem } from '../../engine/types';
import iconShard from '../../assets/icons/blood_magic.png';
import styles from './exchange.module.scss';

import { SanguineMasteryPanel } from '../mastery/SanguineMasteryPanel';

export const SanguineExchangeView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'blood_merchant' | 'soul_broker' | 'sanguine_mastery'>('blood_merchant');
    const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({
        melee: 'T1',
        archery: 'T1',
        sorcery: 'T1'
    });
    const { bloodShards, buyItem } = usePlayerStore();

    const merchant = MERCHANTS[activeTab as keyof typeof MERCHANTS];

    const tiers = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];

    const handleBuy = (itemId: string, price: number) => {
        const success = buyItem(itemId, price);
        if (success) {
            console.log(`Purchased ${itemId}`);
        }
    };

    const handleTierChange = (category: string, tier: string) => {
        setSelectedTiers(prev => ({ ...prev, [category]: tier }));
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h2 className={styles.title}>Sanguine Exchange</h2>
                <p className={styles.subtitle}>
                    {activeTab === 'sanguine_mastery' 
                        ? 'Awaken your dormant vampiric bloodlines.' 
                        : (merchant?.description || 'Trade with the denizens of the night.')}
                </p>
            </div>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'blood_merchant' ? styles.active : ''}`}
                    onClick={() => setActiveTab('blood_merchant')}
                >
                    BLOOD MERCHANT
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'soul_broker' ? styles.active : ''}`}
                    onClick={() => setActiveTab('soul_broker')}
                >
                    SOUL BROKER
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'sanguine_mastery' ? styles.active : ''}`}
                    onClick={() => setActiveTab('sanguine_mastery')}
                >
                    SANGUINE MASTERY
                </button>
            </div>

            {activeTab === 'sanguine_mastery' ? (
                <SanguineMasteryPanel />
            ) : merchant && merchant.inventory.length > 0 ? (
                <div className={styles.merchantContainer}>
                    {['melee', 'archery', 'sorcery'].map(style => {
                        const styleInventory = merchant.inventory.filter(item => {
                            const template = ITEM_MAP.get(item.id);
                            return template && 'slot' in template && (template as EquipmentItem).style === style;
                        });

                        if (styleInventory.length === 0) return null;

                        const currentTier = selectedTiers[style];
                        const tierItems = styleInventory.filter(item => {
                            const template = ITEM_MAP.get(item.id);
                            return template && (template as EquipmentItem).tier === currentTier;
                        });

                        return (
                            <div key={style} className={styles.styleSection}>
                                <h3 className={styles.sectionTitle}>{style.toUpperCase()}</h3>
                                
                                <div className={styles.tierTabs}>
                                    {tiers.map(tier => (
                                        <button 
                                            key={tier}
                                            className={`${styles.tierTab} ${currentTier === tier ? styles.active : ''}`}
                                            onClick={() => handleTierChange(style, tier)}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>

                                {tierItems.length > 0 ? (
                                    <div className={styles.merchantGrid}>
                                        {tierItems.map((item) => {
                                            const stats = ITEM_MAP.get(item.id) as EquipmentItem | undefined;
                                            if (!stats || !('slot' in stats)) return null;
                                            const canAfford = bloodShards >= item.price;
                                            const isWeapon = stats.slot === 'weapon';

                                            return (
                                                <div key={item.id} className={styles.itemCard}>
                                                    <div className={styles.itemHeader}>
                                                        <h3 className={styles.itemName}>{stats.name}</h3>
                                                        <span className={styles.itemTier}>{stats.tier}</span>
                                                    </div>

                                                    <div className={styles.itemIconContainer}>
                                                        {stats.icon ? (
                                                            <img src={stats.icon} alt={stats.name} className={styles.itemIcon} />
                                                        ) : (
                                                            <span className={styles.placeholderIcon}>No Visual</span>
                                                        )}
                                                    </div>

                                                    <div className={styles.itemStats}>
                                                        {isWeapon ? (
                                                            <>
                                                                <div style={{color: '#d4af37', textTransform: 'capitalize', fontSize: '0.75rem', marginBottom: '4px'}}>{stats.subStyle} Weapon</div>
                                                                <div>Power: +{stats.powerModifier}</div>
                                                                <div>Accuracy: +{stats.accuracyBonus}</div>
                                                                {stats.attackIntervalFlat !== 0 && (
                                                                    <div>Interval: {stats.attackIntervalFlat! > 0 ? `-${stats.attackIntervalFlat}s` : `+${Math.abs(stats.attackIntervalFlat!)}s`}</div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {stats.drPercent! > 0 && <div>DR: {(stats.drPercent! * 100).toFixed(1)}%</div>}
                                                                {stats.flatArmor! > 0 && <div>Armor: +{stats.flatArmor}</div>}
                                                                {stats.evasionBonus! > 0 && <div>Evasion: +{stats.evasionBonus}</div>}
                                                                {!stats.drPercent && !stats.flatArmor && !stats.evasionBonus && (
                                                                     <div style={{fontStyle: 'italic', opacity: 0.5}}>No defensive stats</div>
                                                                )}
                                                            </>
                                                        )}
                                                        {stats.specialTrait && <div className={styles.specialTraitLine}>{stats.specialTrait}</div>}
                                                    </div>

                                                    <div className={styles.itemPrice}>
                                                        <img src={iconShard} alt="" className={styles.currencyIcon} />
                                                        <span className={styles.priceValue}>{item.price}</span>
                                                    </div>

                                                    <button 
                                                        className={styles.buyBtn}
                                                        onClick={() => handleBuy(item.id, item.price)}
                                                        disabled={!canAfford}
                                                    >
                                                        {canAfford ? 'PURCHASE' : 'INSUFFICIENT SHARDS'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{padding: '20px', color: '#666', fontStyle: 'italic'}}>
                                        No items available for this tier...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{textAlign: 'center', padding: '100px', color: '#9a8fa0'}}>
                    The Merchant is currently out of stock...
                </div>
            )}
            
            {activeTab === 'soul_broker' && merchant.inventory.length === 0 && (
                <div style={{textAlign: 'center', padding: '40px', color: '#9a8fa0'}}>
                    The Broker is currently awaiting fresh essences...
                </div>
            )}
        </div>
    );
};

import React from 'react';
import type { Agent, Entity, Market } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { 
    Boxes, Home, MapPin, Hammer, Users, Gavel, Factory, CircleDollarSign
} from './IconComponents';

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
    <div className="bg-slate-850 p-4 rounded-lg border border-slate-700 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-3">
            {icon} {title}
        </h3>
        <div className="flex-grow space-y-2">{children}</div>
    </div>
);

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700/50">
        <span className="flex items-center gap-2 text-slate-400">{icon}{label}</span>
        <span className="font-semibold text-right text-slate-200">{value}</span>
    </div>
);

interface EntityCardProps {
    entity: Entity;
    allAgents: Agent[];
    markets: Market[];
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, allAgents, markets }) => {
    const t = useTranslations();

    const owner = entity.ownerId ? allAgents.find(a => a.id === entity.ownerId) : null;
    const ownerName = owner ? owner.name : t('entityCard_unowned');

    return (
        <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 pb-4">
            <div className="text-center bg-slate-850 p-4 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-sky-300">{entity.name}</h2>
                <p className="text-sm text-slate-400 italic mt-1">{entity.description}</p>
            </div>

            <Card title={t('entityCard_title')} icon={<Boxes className="w-5 h-5 text-sky-400"/>}>
                <DetailItem label={t('entityCard_owner')} value={ownerName} icon={<Users className="w-4 h-4"/>}/>
                <DetailItem label={t('entityCard_position')} value={`(${entity.x}, ${entity.y})`} icon={<MapPin className="w-4 h-4"/>}/>
            </Card>

            {entity.isResource && (
                <Card title={t('entityCard_resourceDetails')} icon={<Hammer className="w-5 h-5 text-sky-400"/>}>
                    <DetailItem label={t('entityCard_resourceType')} value={entity.resourceType || 'N/A'}/>
                    <DetailItem label={t('entityCard_quantity')} value={entity.quantity === Infinity ? 'Infinite' : String(entity.quantity || 0)}/>
                </Card>
            )}

            {entity.isJail && (
                <Card title={t('entityCard_jailDetails')} icon={<Gavel className="w-5 h-5 text-sky-400"/>}>
                    <h4 className="text-md font-semibold text-slate-200 mb-2">{t('entityCard_inmates')}</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {entity.inmates && entity.inmates.length > 0 ? (
                            entity.inmates.map(inmateId => {
                                const inmate = allAgents.find(a => a.id === inmateId);
                                return <div key={inmateId} className="text-sm p-2 bg-slate-700/50 rounded-md">{inmate ? inmate.name : inmateId}</div>;
                            })
                        ) : (
                            <p className="text-sm text-slate-400">{t('entityCard_noInmates')}</p>
                        )}
                    </div>
                </Card>
            )}

            {entity.isMarketplace && (
                <Card title={t('entityCard_marketDetails')} icon={<CircleDollarSign className="w-5 h-5 text-sky-400"/>}>
                    <h4 className="text-md font-semibold text-slate-200 mb-2">{t('entityCard_listings')}</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {markets[0]?.listings && markets[0].listings.length > 0 ? (
                           markets[0].listings.map(offer => {
                               const seller = allAgents.find(a => a.id === offer.fromAgentId);
                               return (
                                   <div key={offer.offerId} className="text-xs p-2 bg-slate-700/50 rounded-md flex justify-between items-center">
                                       <span>{offer.quantity}x {t(`item_${offer.item}` as any)}</span>
                                       <span className="text-slate-400">by {seller ? seller.name : 'Unknown'}</span>
                                   </div>
                               );
                           })
                        ) : (
                            <p className="text-sm text-slate-400">{t('entityCard_noListings')}</p>
                        )}
                    </div>
                </Card>
            )}

            {entity.isFactory && entity.factoryDetails && (
                <Card title={t('entityCard_factoryDetails')} icon={<Factory className="w-5 h-5 text-sky-400"/>}>
                    <DetailItem label={t('entityCard_product')} value={t(`item_${entity.factoryDetails.product}` as any)} />
                    <h4 className="text-md font-semibold text-slate-200 pt-2">{t('entityCard_employees')}</h4>
                     <div className="space-y-1 max-h-48 overflow-y-auto">
                        {entity.factoryDetails.employees && entity.factoryDetails.employees.length > 0 ? (
                            entity.factoryDetails.employees.map(empId => {
                                const employee = allAgents.find(a => a.id === empId);
                                return <div key={empId} className="text-sm p-2 bg-slate-700/50 rounded-md">{employee ? employee.name : empId}</div>;
                            })
                        ) : (
                            <p className="text-sm text-slate-400">{t('entityCard_noEmployees')}</p>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
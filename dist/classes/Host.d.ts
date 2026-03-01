import { Authflow } from 'prismarine-auth';
import { XboxRTA } from 'xbox-rta';
import { BedrockPortal } from '..';
import { Person } from '../types/peoplehub';
import Rest from '../rest';
export default class Host {
    portal: BedrockPortal;
    authflow: Authflow;
    rest: Rest;
    rta: XboxRTA | null;
    profile: Person | null;
    connectionId: string | null;
    subscriptionId: string;
    presenceInterval: NodeJS.Timeout | null;
    constructor(portal: BedrockPortal, authflow: Authflow);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private onSubscribe;
}

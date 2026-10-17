import eyrieImage from '../faction-images/eyrie.png';
import corvidImage from '../faction-images/corvid.png';
import allianceImage from '../faction-images/alliance.png';
import cultImage from '../faction-images/cult.png';
import duchyImage from '../faction-images/duchy.png';
import riverfolkImage from '../faction-images/riverfolk.png';
import marquiseImage from '../faction-images/marquise.png';
import vagabondImage from '../faction-images/vagabond.png';
import vagabond2Image from '../faction-images/vagabond2.png';
import hundredsImage from '../faction-images/hundreds.png';
import keepersImage from '../faction-images/keepers.png';
import lilypadImage from '../faction-images/lilypad.png';
import twilightImage from '../faction-images/twilight.png';
import knavesImage from '../faction-images/knaves.png';
import { IS_AVAILABLE, IS_NOT_AVAILABLE } from '../constants';

/** Static faction catalog: identity, art, and base reach. Status is applied at init. */
export const FACTION_CATALOG = {
    marquise: {
        name: 'marquise',
        label: 'Marquise',
        image: marquiseImage,
        reach: 10,
        defaultStatus: IS_AVAILABLE,
    },
    eyrie: {
        name: 'eyrie',
        label: 'Eyrie',
        image: eyrieImage,
        reach: 7,
        defaultStatus: IS_AVAILABLE,
    },
    alliance: {
        name: 'alliance',
        label: 'Alliance',
        image: allianceImage,
        reach: 3,
        defaultStatus: IS_AVAILABLE,
    },
    vagabond1: {
        name: 'vagabond1',
        label: 'Vagabond',
        image: vagabondImage,
        reach: 5,
        defaultStatus: IS_NOT_AVAILABLE,
    },
    riverfolk: {
        name: 'riverfolk',
        label: 'Riverfolk',
        image: riverfolkImage,
        reach: 5,
        defaultStatus: IS_NOT_AVAILABLE,
    },
    cult: {
        name: 'cult',
        label: 'Cult',
        image: cultImage,
        reach: 2,
        defaultStatus: IS_NOT_AVAILABLE,
    },
    corvid: {
        name: 'corvid',
        label: 'Corvid',
        image: corvidImage,
        reach: 3,
        defaultStatus: IS_AVAILABLE,
    },
    duchy: {
        name: 'duchy',
        label: 'Duchy',
        image: duchyImage,
        reach: 8,
        defaultStatus: IS_AVAILABLE,
    },
    vagabond2: {
        name: 'vagabond2',
        label: 'Vagabond 2',
        image: vagabond2Image,
        reach: 2,
        defaultStatus: IS_NOT_AVAILABLE,
    },
    hundreds: {
        name: 'hundreds',
        label: 'Hundreds',
        image: hundredsImage,
        reach: 9,
        defaultStatus: IS_AVAILABLE,
    },
    keepers: {
        name: 'keepers',
        label: 'Keepers',
        image: keepersImage,
        reach: 8,
        defaultStatus: IS_AVAILABLE,
    },
    lilypad: {
        name: 'lilypad',
        label: 'Lilypad',
        image: lilypadImage,
        reach: 7,
        defaultStatus: IS_AVAILABLE,
    },
    twilight: {
        name: 'twilight',
        label: 'Twilight',
        image: twilightImage,
        reach: 4,
        defaultStatus: IS_AVAILABLE,
    },
    knaves: {
        name: 'knaves',
        label: 'Knaves',
        image: knavesImage,
        reach: 4,
        defaultStatus: IS_AVAILABLE,
    },
};

/** Build a mutable factions map with status set to each faction's default. */
export function createInitialFactions() {
    const factions = {};
    for (const key of Object.keys(FACTION_CATALOG)) {
        const { defaultStatus, ...rest } = FACTION_CATALOG[key];
        factions[key] = { ...rest, status: defaultStatus };
    }
    return factions;
}

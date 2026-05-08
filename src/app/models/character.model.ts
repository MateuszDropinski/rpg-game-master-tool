export type CharacterType = {
  id: string;
  label: string;
  imageUrl: string;
};

export const CHARACTER_NODE_TYPE = 'character';

export type CharacterNodeData = {
  /** Displayed name on the node — also satisfies ng-diagram's palette `BasePaletteItemData.label`. */
  label: string;
  characterClass: string;
};

export const CHARACTER_TYPES: CharacterType[] = [
  { id: 'barbarian', label: 'Barbarian', imageUrl: 'barbarian.png' },
  { id: 'cleric',    label: 'Cleric',    imageUrl: 'cleric.png'    },
  { id: 'dragon',    label: 'Dragon',    imageUrl: 'dragon.png'    },
  { id: 'hunter',    label: 'Hunter',    imageUrl: 'hunter.png'    },
  { id: 'paladin',   label: 'Paladin',   imageUrl: 'paladin.png'   },
  { id: 'rogue',     label: 'Rogue',     imageUrl: 'rogue.png'     },
  { id: 'warrior',   label: 'Warrior',   imageUrl: 'warrior.png'   },
  { id: 'wizard',    label: 'Wizard',    imageUrl: 'wizzard.png'   },
];

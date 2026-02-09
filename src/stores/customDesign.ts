import { create } from 'zustand';

export type CustomPosition = 'front' | 'back' | 'leftArm' | 'rightArm';

export interface DesignPosition {
  x: number;
  y: number;
}

export interface CustomPart {
  applied: boolean;
  image_url: string | null;
  text: string;
  position: DesignPosition;
  scale: number;
}

export interface CustomDesignState {
  front: CustomPart;
  back: CustomPart;
  leftArm: CustomPart;
  rightArm: CustomPart;
  activePosition: CustomPosition;
  setActivePosition: (position: CustomPosition) => void;
  togglePart: (position: CustomPosition) => void;
  setPartImageUrl: (position: CustomPosition, url: string | null) => void;
  setPartText: (position: CustomPosition, text: string) => void;
  setPartPosition: (position: CustomPosition, pos: DesignPosition) => void;
  setPartScale: (position: CustomPosition, scale: number) => void;
  resetPart: (position: CustomPosition) => void;
  resetAll: () => void;
  getAppliedParts: () => CustomPosition[];
  getCustomPrice: () => number;
}

const initialPart: CustomPart = {
  applied: false,
  image_url: null,
  text: '',
  position: { x: 0, y: 0 },
  scale: 1,
};

const CUSTOM_PRICE_PER_PART = 25000; // IDR 25,000 per part

export const useCustomDesignStore = create<CustomDesignState>((set, get) => ({
  front: { ...initialPart },
  back: { ...initialPart },
  leftArm: { ...initialPart },
  rightArm: { ...initialPart },
  activePosition: 'front',

  setActivePosition: (position) => {
    set({ activePosition: position });
  },

  togglePart: (position) => {
    set((state) => ({
      [position]: {
        ...(!state[position].applied ? state[position] : initialPart),
        applied: !state[position].applied,
      },
    }));
  },

  setPartImageUrl: (position, url) => {
    set((state) => ({
      [position]: {
        ...state[position],
        image_url: url,
        text: url ? '' : state[position].text,
        applied: Boolean(url) || (url ? false : state[position].text.trim().length > 0),
      },
    }));
  },

  setPartText: (position, text) => {
    set((state) => ({
      [position]: {
        ...state[position],
        text,
        image_url: text.trim().length > 0 ? null : state[position].image_url,
        applied: text.trim().length > 0 || (text.trim().length > 0 ? false : state[position].image_url !== null),
      },
    }));
  },

  setPartPosition: (position, pos) => {
    set((state) => ({
      [position]: {
        ...state[position],
        position: pos,
      },
    }));
  },

  setPartScale: (position, scale) => {
    set((state) => ({
      [position]: {
        ...state[position],
        scale: Math.max(0.5, Math.min(2, scale)),
      },
    }));
  },

  resetPart: (position) => {
    set({ [position]: { ...initialPart } });
  },

  resetAll: () => {
    set({
      front: { ...initialPart },
      back: { ...initialPart },
      leftArm: { ...initialPart },
      rightArm: { ...initialPart },
      activePosition: 'front',
    });
  },

  getAppliedParts: () => {
    const state = get();
    const positions: CustomPosition[] = ['front', 'back', 'leftArm', 'rightArm'];
    return positions.filter((pos) => state[pos].applied && (Boolean(state[pos].image_url) || state[pos].text.trim().length > 0));
  },

  getCustomPrice: () => {
    const appliedParts = get().getAppliedParts();
    return appliedParts.length * CUSTOM_PRICE_PER_PART;
  },
}));

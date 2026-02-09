export type DesignPreset = {
  id: string;
  name: string;
  url: string; // public/ path or absolute URL
};

// NOTE: These are local placeholder SVGs. You can replace the files in
// `public/design-presets/` with your real PNG/SVG assets (same filenames)
// without changing any code.
export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'si-geulis-red',
    name: 'SI GEULIS (Red)',
    url: '/design-presets/SIGEULIS.png',
  },
  {
    id: 'frame-red',
    name: 'Frame (Red)',
    url: '/design-presets/Artboard%203.png',
  },
  {
    id: 'astro-mask',
    name: 'Astro Mask',
    url: '/design-presets/Artboard%205.png',
  },
  {
    id: 'si-kaser-blue',
    name: 'SI KASER (Blue)',
    url: '/design-presets/sikasep.png',
  },
];

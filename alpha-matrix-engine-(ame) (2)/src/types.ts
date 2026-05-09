export interface Entity {
  id: string;
  name: string;
  type: 'Mesh' | 'Light' | 'Camera' | 'Particle' | 'Volume';
  visible: boolean;
  locked: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface Layer {
  id: string;
  name: string;
  active: boolean;
  type: 'Geometry' | 'Texture' | 'Lighting' | 'Physics' | 'AI';
}

export interface Asset {
  id: string;
  name: string;
  type: 'Model' | 'Texture' | 'Material' | 'Script' | 'Audio';
  size: string;
  path: string;
}

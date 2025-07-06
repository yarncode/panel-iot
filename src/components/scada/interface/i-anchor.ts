export interface IAnchor {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface IAnchorAbstract {
  x: number; // x coordinate percent width (0-100)
  y: number; // y coordinate percent height (0-100)
}

export interface IAnchorSizeElement {
  width: number; // Parent width in pixels
  height: number; // Parent height in pixels
}

export interface IAnchorCoordinate {
  x: number; // X coordinate in pixels
  y: number; // Y coordinate in pixels
}
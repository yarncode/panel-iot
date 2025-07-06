import * as d3 from 'd3';
import { v4 } from 'uuid'
import type { IAnchor, IAnchorAbstract, IAnchorCoordinate, IAnchorSizeElement } from '@/components/scada/interface/i-anchor'

interface IAnchorStore {
  anchors: IAnchor[];
  add(anchor: IAnchor): void;
  find(type: string, x: number, y: number): IAnchor | undefined;
  remove(id: string): void;
  removeByType(type: string): void;
}

export const anchorStore: IAnchorStore = {
  anchors: [],
  add(anchor: IAnchor): void {
    this.anchors.push(anchor);
  },
  find(type: string, x: number, y: number): IAnchor | undefined {
    return d3.quadtree<IAnchor>().x(d => d.x).y(d => d.y).addAll(this.anchors.filter(anchor => anchor.type != type)).find(x, y);
  },
  remove(id: string): void {
    this.anchors = this.anchors.filter(anchor => anchor.id !== id);
  },
  removeByType(type: string): void {
    this.anchors = this.anchors.filter(anchor => anchor.type !== type);
  }
}

export const getDistance = (type: string, x: number, y: number): { anchor: IAnchor, src: IAnchorCoordinate, dest: number } | undefined => {
  const nearest = anchorStore.find(type, x, y)
  return nearest ? { dest: Math.sqrt(Math.pow(x - nearest.x, 2) + Math.pow(y - nearest.y, 2)), anchor: nearest, src: { x, y } } : undefined;
}

export const convertAbstractToAnchor = (type: string, anchorAbstract: IAnchorAbstract, elment: IAnchorSizeElement, coordinate: IAnchorCoordinate): IAnchor => {
  const x = coordinate.x + (anchorAbstract.x / 100) * elment.width;
  const y = coordinate.y + (anchorAbstract.y / 100) * elment.height;

  return {
    id: v4(), // Generate a unique ID based on the current timestamp
    type,
    x,
    y
  };
}

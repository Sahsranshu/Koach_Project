import { Schema, ArraySchema, MapSchema, type } from '@colyseus/schema';
import { Vector3 } from '@babylonjs/core';

// Basic Player interface for client-side use
export interface Player {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  z: number;
  shape: number[];
  height: number;
  isActive: boolean;
  lastUpdated: number;
}

// Server-side Player schema
export class PlayerSchema extends Schema {
  @type("string") name: string = "";
  @type("string") color: string = "#ffffff";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type(["number"]) shape: ArraySchema<number> = new ArraySchema<number>();
  @type("number") height: number = 1;
  @type("boolean") isActive: boolean = true;
  @type("number") lastUpdated: number = Date.now();
}

// Server-side Game State schema
export class GameStateSchema extends Schema {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
}

// Client-side Game State interface
export interface GameState {
  players: { [key: string]: Player };
}

// Shape types enumeration
export enum ShapeType {
  SQUARE = 'square',
  TRIANGLE = 'triangle',
  CIRCLE = 'circle',
  STAR = 'star',
  RECTANGLE = 'rectangle'
}

// Movement interface
export interface Movement {
  x: number;
  y: number;
  z: number;
  playerId: string;
  timestamp: number;
}

// Shape interface
export interface Shape {
  type: ShapeType;
  points: number[];
  height: number;
  color: string;
  position: Vector3;
}

// Player Action interface
export interface PlayerAction {
  type: 'draw' | 'extrude' | 'move' | 'setName' | 'setColor' | 'clearScene';
  playerId: string;
  data: any;
  timestamp: number;
}

// Player Update interface
export interface PlayerUpdate {
  id: string;
  type: 'shape' | 'position' | 'color' | 'name' | 'height';
  value: any;
  timestamp: number;
}

// Error Response interface
export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// Game Room State interface
export interface GameRoomState {
  roomId: string;
  players: Map<string, Player>;
  lastUpdate: number;
  maxPlayers: number;
}

// Constants
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 10,
  MIN_HEIGHT: 0.1,
  MAX_HEIGHT: 10,
  MOVEMENT_SPEED: 0.1,
  MAX_SHAPE_POINTS: 100,
  UPDATE_RATE: 60, // updates per second
  CANVAS_SIZE: {
    width: 400,
    height: 400
  }
};

// Validation functions
export const Validators = {
  isValidShape: (points: number[]): boolean => {
    return points.length >= 6 && points.length <= GAME_CONSTANTS.MAX_SHAPE_POINTS * 2;
  },

  isValidHeight: (height: number): boolean => {
    return height >= GAME_CONSTANTS.MIN_HEIGHT && height <= GAME_CONSTANTS.MAX_HEIGHT;
  },

  isValidColor: (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  },

  isValidPosition: (x: number, y: number, z: number): boolean => {
    return !isNaN(x) && !isNaN(y) && !isNaN(z) &&
           Math.abs(x) <= 100 && Math.abs(y) <= 100 && Math.abs(z) <= 100;
  },

  isValidName: (name: string): boolean => {
    return name.length >= 1 && name.length <= 20 && /^[a-zA-Z0-9_\- ]+$/.test(name);
  }
};

// Utility functions
export const GameUtils = {
  calculateBoundingBox: (points: number[]): { min: Vector3, max: Vector3 } => {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    for (let i = 0; i < points.length; i += 2) {
      minX = Math.min(minX, points[i]);
      maxX = Math.max(maxX, points[i]);
      minZ = Math.min(minZ, points[i + 1]);
      maxZ = Math.max(maxZ, points[i + 1]);
    }

    return {
      min: new Vector3(minX, 0, minZ),
      max: new Vector3(maxX, 0, maxZ)
    };
  },

  centerShape: (points: number[]): number[] => {
    const bbox = GameUtils.calculateBoundingBox(points);
    const center = bbox.min.add(bbox.max).scale(0.5);
    const centeredPoints: number[] = [];

    for (let i = 0; i < points.length; i += 2) {
      centeredPoints.push(points[i] - center.x);
      centeredPoints.push(points[i + 1] - center.z);
    }

    return centeredPoints;
  },

  normalizeShape: (points: number[], targetSize: number = 1): number[] => {
    const bbox = GameUtils.calculateBoundingBox(points);
    const size = Math.max(
      bbox.max.x - bbox.min.x,
      bbox.max.z - bbox.min.z
    );
    const scale = targetSize / size;

    return points.map(p => p * scale);
  }
};

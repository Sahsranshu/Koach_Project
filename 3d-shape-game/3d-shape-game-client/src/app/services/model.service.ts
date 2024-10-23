
import { Injectable } from '@angular/core';
import * as BABYLON from '@babylonjs/core';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private models: { [key: string]: BABYLON.Mesh } = {};

  constructor() {
    console.log('[ModelService] Service initialized');
  }

  createModel(id: string, shape: number[], height: number, scene: BABYLON.Scene): BABYLON.Mesh {
    console.log(`[ModelService] Creating model for ID: ${id}`, { shape, height });
    
    try {
      const babylonShape = this.createShape(shape);
      console.log('[ModelService] Shape vectors created:', babylonShape);

      const extrudeSettings = {
        shape: babylonShape,
        path: [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(0, height, 0)
        ],
        cap: BABYLON.Mesh.CAP_ALL,
        updatable: true
      };
      console.log('[ModelService] Extrude settings:', extrudeSettings);

      const mesh = BABYLON.MeshBuilder.ExtrudeShape(id, extrudeSettings, scene);
      console.log(`[ModelService] Mesh created for ID: ${id}`);

      this.models[id] = mesh;
      return mesh;
    } catch (error) {
      console.error('[ModelService] Error creating model:', error);
      throw error;
    }
  }

  updateModel(id: string, shape: number[], height: number, scene: BABYLON.Scene): BABYLON.Mesh {
    console.log(`[ModelService] Updating model for ID: ${id}`, { shape, height });
    
    try {
      const existingMesh = this.models[id];
      if (existingMesh) {
        console.log(`[ModelService] Found existing mesh for ID: ${id}`);
        existingMesh.dispose();
      }

      return this.createModel(id, shape, height, scene);
    } catch (error) {
      console.error('[ModelService] Error updating model:', error);
      throw error;
    }
  }

  private createShape(points: number[]): BABYLON.Vector3[] {
    console.log('[ModelService] Converting points to shape vectors');
    
    try {
      const shape = points.reduce((acc: BABYLON.Vector3[], point, index) => {
        if (index % 2 === 0) {
          acc.push(new BABYLON.Vector3(
            points[index] / 100 - 0.5,
            0,
            points[index + 1] / 100 - 0.5
          ));
        }
        return acc;
      }, []);

      console.log('[ModelService] Shape vectors created successfully');
      return shape;
    } catch (error) {
      console.error('[ModelService] Error creating shape vectors:', error);
      throw error;
    }
  }

  disposeModel(id: string) {
    console.log(`[ModelService] Disposing model for ID: ${id}`);
    
    try {
      const mesh = this.models[id];
      if (mesh) {
        mesh.dispose();
        delete this.models[id];
        console.log(`[ModelService] Model ${id} disposed successfully`);
      } else {
        console.warn(`[ModelService] No model found for ID: ${id}`);
      }
    } catch (error) {
      console.error('[ModelService] Error disposing model:', error);
      throw error;
    }
  }
}

import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import * as BABYLON from '@babylonjs/core';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.component.html',
  styleUrls: ['./drawing.component.css']
})
export class DrawingComponent implements AfterViewInit {
  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('renderCanvas', { static: true }) renderCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private scene!: BABYLON.Scene;
  private engine!: BABYLON.Engine;
  private mesh?: BABYLON.Mesh;

  extrusionHeight: number = 1;
  selectedShape: string = '';

  predefinedShapes = {
    square: [0, 0, 100, 0, 100, 100, 0, 100],
    triangle: [50, 0, 100, 100, 0, 100],
    circle: this.generateCirclePoints(),
    star: this.generateStarPoints(),
    rectangle: [0, 0, 150, 0, 150, 75, 0, 75]
  };

  constructor(private gameService: GameService) {}

  ngAfterViewInit() {
    this.ctx = this.drawingCanvas.nativeElement.getContext('2d')!;
    this.initScene();
  }

  private initScene() {
    this.engine = new BABYLON.Engine(this.renderCanvas.nativeElement, true);
    this.scene = new BABYLON.Scene(this.engine);
    
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), this.scene);
    camera.attachControl(this.renderCanvas.nativeElement, true);
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
    
    // Add a ground plane for reference
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, this.scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    groundMaterial.wireframe = true;
    ground.material = groundMaterial;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  selectShape(shape: string) {
    this.selectedShape = shape;
    this.drawShape(this.predefinedShapes[shape as keyof typeof this.predefinedShapes]);
    this.create3DShape(this.predefinedShapes[shape as keyof typeof this.predefinedShapes], this.extrusionHeight);
  }

  private drawShape(points: number[]) {
    this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    this.ctx.beginPath();
    this.ctx.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
      this.ctx.lineTo(points[i], points[i + 1]);
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }

  extrude() {
    if (this.mesh) {
      this.mesh.scaling.y = this.extrusionHeight;
    }
    this.gameService.extrude(this.extrusionHeight);
  }

  renderFinal() {
    if (this.mesh) {
      this.mesh.isVisible = true;
    }
  }

  private create3DShape(points: number[], height: number) {
    if (this.mesh) {
      this.mesh.dispose();
    }

    const shape = points.reduce((acc: BABYLON.Vector3[], point, index) => {
      if (index % 2 === 0) {
        acc.push(new BABYLON.Vector3(point / 100 - 0.75, 0, points[index + 1] / 100 - 0.75));
      }
      return acc;
    }, []);

    const extrude = [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, height, 0)
    ];

    this.mesh = BABYLON.MeshBuilder.ExtrudeShape("shape", {
      shape: shape,
      path: extrude,
      cap: BABYLON.Mesh.CAP_ALL,
      updatable: true
    }, this.scene);

    const material = new BABYLON.StandardMaterial("shapeMaterial", this.scene);
    material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1);
    this.mesh.material = material;

    this.mesh.isVisible = true; // Make the mesh visible immediately
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    if (this.mesh) {
      this.mesh.dispose();
      this.mesh = undefined;
    }
    this.selectedShape = '';
  }

  private generateCirclePoints(radius: number = 50, center: [number, number] = [50, 50], numPoints: number = 32): number[] {
    const points: number[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      points.push(center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle));
    }
    return points;
  }

  private generateStarPoints(outerRadius: number = 50, innerRadius: number = 25, numPoints: number = 5): number[] {
    const points: number[] = [];
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i / (numPoints * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      points.push(50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle));
    }
    return points;
  }
}
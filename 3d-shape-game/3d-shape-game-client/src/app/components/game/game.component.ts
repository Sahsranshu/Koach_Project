import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as BABYLON from '@babylonjs/core';
import { GameService } from '../../services/game.service';
import { ModelService } from '../../services/model.service';
import { Player } from '../../models/game-state.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('renderCanvas', { static: true }) renderCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas', { static: true }) previewCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: ElementRef<HTMLCanvasElement>;
  
  private engine!: BABYLON.Engine;
  private mainScene!: BABYLON.Scene;
  private previewScene!: BABYLON.Scene;
  private mainCamera!: BABYLON.ArcRotateCamera;
  private previewCamera!: BABYLON.ArcRotateCamera;
  private mainMesh?: BABYLON.Mesh;
  private previewMesh?: BABYLON.Mesh;
  private playerMeshes: Map<string, BABYLON.Mesh> = new Map();
  
  public selectedShape: string = '';
  public extrusionHeight: number = 1;
  public playerName: string = '';
  public playerColor: string = '#ffffff';
  public currentPlayerName: string = '';
  
  private moveSpeed: number = 0.1;
  private players: Player[] = [];
  private subscription: Subscription;
  private drawingCtx!: CanvasRenderingContext2D;

  constructor(
    public gameService: GameService,
    private modelService: ModelService
  ) {
    this.subscription = new Subscription();
    console.log('[GameComponent] Constructor initialized');
  }

  ngOnInit() {
    console.log('[GameComponent] Initializing');
    this.gameService.joinGame();
    this.setupSubscriptions();
  }

  private setupSubscriptions() {
    console.log('[GameComponent] Setting up subscriptions');
    this.subscription.add(
      this.gameService.players.subscribe(players => {
        console.log('[GameComponent] Players updated:', players);
        this.players = players;
        this.updateScene();
      })
    );

    this.subscription.add(
      this.gameService.gameState.subscribe(state => {
        if (state) {
          console.log('[GameComponent] Game state updated:', state);
          this.updatePlayersInScene(state.players);
        }
      })
    );
  }

  ngAfterViewInit() {
    console.log('[GameComponent] After view init');
    this.initializeScenes();
    this.initDrawingCanvas();
  }

  private initializeScenes() {
    console.log('[GameComponent] Initializing scenes');
    
    // Set canvas sizes
    this.renderCanvas.nativeElement.width = this.renderCanvas.nativeElement.clientWidth;
    this.renderCanvas.nativeElement.height = this.renderCanvas.nativeElement.clientHeight;
    this.previewCanvas.nativeElement.width = this.previewCanvas.nativeElement.clientWidth;
    this.previewCanvas.nativeElement.height = this.previewCanvas.nativeElement.clientHeight;
    
    // Initialize engine
    this.engine = new BABYLON.Engine(this.renderCanvas.nativeElement, true);

    // Initialize main scene
    this.initMainScene();
    
    // Initialize preview scene
    this.initPreviewScene();

    // Set up render loop
    this.engine.runRenderLoop(() => {
      this.mainScene.render();
      this.previewScene.render();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.renderCanvas.nativeElement.width = this.renderCanvas.nativeElement.clientWidth;
      this.renderCanvas.nativeElement.height = this.renderCanvas.nativeElement.clientHeight;
      this.previewCanvas.nativeElement.width = this.previewCanvas.nativeElement.clientWidth;
      this.previewCanvas.nativeElement.height = this.previewCanvas.nativeElement.clientHeight;
      this.engine.resize();
    });
  }

  private initMainScene() {
    console.log('[GameComponent] Initializing main scene');
    this.mainScene = new BABYLON.Scene(this.engine);
    
    this.mainCamera = new BABYLON.ArcRotateCamera(
      "mainCamera",
      -Math.PI / 2,
      Math.PI / 2.5,
      15,
      BABYLON.Vector3.Zero(),
      this.mainScene
    );
    this.mainCamera.attachControl(this.renderCanvas.nativeElement, true);
    
    const light = new BABYLON.HemisphericLight(
      "mainLight",
      new BABYLON.Vector3(0, 1, 0),
      this.mainScene
    );
    
    const ground = BABYLON.MeshBuilder.CreateGround(
      "mainGround",
      { width: 20, height: 20 },
      this.mainScene
    );
    const groundMaterial = new BABYLON.StandardMaterial("mainGroundMat", this.mainScene);
    groundMaterial.wireframe = true;
    ground.material = groundMaterial;
  }

  private initPreviewScene() {
    console.log('[GameComponent] Initializing preview scene');
    this.previewScene = new BABYLON.Scene(this.engine);
    
    this.previewCamera = new BABYLON.ArcRotateCamera(
      "previewCamera",
      -Math.PI / 2,
      Math.PI / 2.5,
      5,
      BABYLON.Vector3.Zero(),
      this.previewScene
    );
    this.previewCamera.attachControl(this.previewCanvas.nativeElement, true);
    
    const light = new BABYLON.HemisphericLight(
      "previewLight",
      new BABYLON.Vector3(0, 1, 0),
      this.previewScene
    );
    
    const ground = BABYLON.MeshBuilder.CreateGround(
      "previewGround",
      { width: 5, height: 5 },
      this.previewScene
    );
    const groundMaterial = new BABYLON.StandardMaterial("previewGroundMat", this.previewScene);
    groundMaterial.wireframe = true;
    ground.material = groundMaterial;
  }

  private initDrawingCanvas() {
    console.log('[GameComponent] Initializing drawing canvas');
    const ctx = this.drawingCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.drawingCtx = ctx;
      this.drawingCtx.strokeStyle = '#000000';
      this.drawingCtx.lineWidth = 2;
      
      // Set white background
      this.drawingCtx.fillStyle = '#ffffff';
      this.drawingCtx.fillRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    }
  }

  public onSelectShape(shape: string) {
    console.log('[GameComponent] Shape selected:', shape);
    this.selectedShape = shape;
    const points = this.getShapePoints(shape);
    this.drawShape(points);
    this.createShape(points);
  }

  private createShape(points: number[]) {
    console.log('[GameComponent] Creating shape with points:', points);
    try {
      const shape = this.convertToVector3Array(points);
      const extrudePath = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, this.extrusionHeight, 0)
      ];

      if (this.mainMesh) {
        this.mainMesh.dispose();
      }

      this.mainMesh = this.createExtrudedMesh("mainShape", shape, extrudePath, this.mainScene);
      
      if (this.previewMesh) {
        this.previewMesh.dispose();
      }

      this.previewMesh = this.createExtrudedMesh("previewShape", shape, extrudePath, this.previewScene);
      
      this.gameService.draw(points);
    } catch (error) {
      console.error('[GameComponent] Error creating shape:', error);
    }
  }

  private createExtrudedMesh(
    name: string,
    shape: BABYLON.Vector3[],
    path: BABYLON.Vector3[],
    scene: BABYLON.Scene
  ): BABYLON.Mesh {
    const mesh = BABYLON.MeshBuilder.ExtrudeShape(name, {
      shape: shape,
      path: path,
      cap: BABYLON.Mesh.CAP_ALL,
      updatable: true
    }, scene);

    const material = new BABYLON.StandardMaterial(name + "Material", scene);
    material.diffuseColor = BABYLON.Color3.FromHexString(this.playerColor);
    mesh.material = material;

    return mesh;
  }

  private convertToVector3Array(points: number[]): BABYLON.Vector3[] {
    const vectors: BABYLON.Vector3[] = [];
    for (let i = 0; i < points.length; i += 2) {
      vectors.push(new BABYLON.Vector3(
        points[i] / 100 - 0.5,
        0,
        points[i + 1] / 100 - 0.5
      ));
    }
    return vectors;
  }

  public onMove(direction: 'left' | 'right' | 'forward' | 'backward'): void {
    console.log('[GameComponent] Moving shape in direction:', direction);
    
    if (this.mainMesh) {
      let x = 0, y = 0, z = 0;
      
      switch (direction) {
        case 'left':
          x = -this.moveSpeed;
          break;
        case 'right':
          x = this.moveSpeed;
          break;
        case 'forward':
          z = this.moveSpeed;
          break;
        case 'backward':
          z = -this.moveSpeed;
          break;
      }

      this.mainMesh.position.x += x;
      this.mainMesh.position.z += z;
      
      if (this.previewMesh) {
        this.previewMesh.position.x = this.mainMesh.position.x;
        this.previewMesh.position.z = this.mainMesh.position.z;
      }

      this.gameService.move(
        this.mainMesh.position.x,
        this.mainMesh.position.y,
        this.mainMesh.position.z
      );

      console.log('[GameComponent] Shape moved to position:', {
        x: this.mainMesh.position.x,
        y: this.mainMesh.position.y,
        z: this.mainMesh.position.z
      });
    }
  }

  public onExtrude() {
    console.log('[GameComponent] Extruding shape with height:', this.extrusionHeight);
    this.gameService.extrude(this.extrusionHeight);
    if (this.mainMesh) {
      this.mainMesh.scaling.y = this.extrusionHeight;
    }
    if (this.previewMesh) {
      this.previewMesh.scaling.y = this.extrusionHeight;
    }
  }

  public onSetName() {
    console.log('[GameComponent] Setting player name:', this.playerName);
    this.gameService.setName(this.playerName);
  }

  public onSetColor() {
    console.log('[GameComponent] Setting player color:', this.playerColor);
    this.gameService.setColor(this.playerColor);
  }

  private updateScene() {
    console.log('[GameComponent] Updating scene');
    // Add any additional scene update logic here
  }

  private updatePlayersInScene(players: { [key: string]: Player }) {
    console.log('[GameComponent] Updating players in scene:', players);
    Object.entries(players).forEach(([id, player]) => {
      if (id !== this.gameService.getCurrentPlayerId()) {
        this.updatePlayerMesh(id, player);
      }
    });

    // Remove meshes for disconnected players
    this.playerMeshes.forEach((mesh, id) => {
      if (!players[id]) {
        mesh.dispose();
        this.playerMeshes.delete(id);
      }
    });
  }

  private updatePlayerMesh(id: string, player: Player) {
    let mesh = this.playerMeshes.get(id);
    
    if (!mesh && player.shape && player.shape.length > 0) {
      const shape = this.convertToVector3Array(player.shape);
      const extrudePath = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, player.height, 0)
      ];
      
      mesh = this.createExtrudedMesh(`player_${id}`, shape, extrudePath, this.mainScene);
      this.playerMeshes.set(id, mesh);
    }

    if (mesh) {
      mesh.position.x = player.x;
      mesh.position.y = player.y;
      mesh.position.z = player.z;
      mesh.scaling.y = player.height;

      const material = mesh.material as BABYLON.StandardMaterial;
      if (material) {
        material.diffuseColor = BABYLON.Color3.FromHexString(player.color);
      }
    }
  }

  private getShapePoints(shape: string): number[] {
    const center = { x: 50, y: 50 };
    const size = 40;

    switch (shape) {
      case 'square':
        return [
          center.x - size, center.y - size,
          center.x + size, center.y - size,
          center.x + size, center.y + size,
          center.x - size, center.y + size
        ];
      case 'triangle':
        return [
          center.x, center.y - size,
          center.x + size, center.y + size,
          center.x - size, center.y + size
        ];
      case 'circle':
        return this.generateCirclePoints(center, size);
      case 'star':
        return this.generateStarPoints(center, size);
      case 'rectangle':
        return [
          center.x - size * 1.5, center.y - size,
          center.x + size * 1.5, center.y - size,
          center.x + size * 1.5, center.y + size,
          center.x - size * 1.5, center.y + size
        ];
      default:
        return [];
    }
  }

  private generateCirclePoints(center: { x: number, y: number }, radius: number): number[] {
    const points: number[] = [];
    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle)
      );
    }
    return points;
  }

  private generateStarPoints(center: { x: number, y: number }, size: number): number[] {
    const points: number[] = [];
    const outerRadius = size;
    const innerRadius = size * 0.5;
    const spikes = 5;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      points.push(
        center.x + radius * Math.cos(angle),
        center.y + radius * Math.sin(angle)
      );
    }
    return points;
  }

  private drawShape(points: number[]) {
    console.log('[GameComponent] Drawing shape on 2D canvas');
    if (this.drawingCtx) {
      // Clear canvas
      this.drawingCtx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
      
      // Reset background
      this.drawingCtx.fillStyle = '#ffffff';
      this.drawingCtx.fillRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
      
      // Draw shape
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        this.drawingCtx.lineTo(points[i], points[i + 1]);
      }
      this.drawingCtx.closePath();
      
      // Set stroke style
      this.drawingCtx.strokeStyle = '#000000';
      this.drawingCtx.lineWidth = 2;
      this.drawingCtx.stroke();
      
      // Fill shape with a light color
      this.drawingCtx.fillStyle = '#e0e0e0';
      this.drawingCtx.fill();
    }
  }

  public onClearScene() {
    console.log('[GameComponent] Clearing scene');
    if (this.mainMesh) {
      this.mainMesh.dispose();
      this.mainMesh = undefined;
    }
    if (this.previewMesh) {
      this.previewMesh.dispose();
      this.previewMesh = undefined;
    }
    // Clear drawing canvas
    if (this.drawingCtx) {
      this.drawingCtx.clearRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
      this.drawingCtx.fillStyle = '#ffffff';
      this.drawingCtx.fillRect(0, 0, this.drawingCanvas.nativeElement.width, this.drawingCanvas.nativeElement.height);
    }
    this.selectedShape = '';
    this.gameService.clearScene();
  }

  ngOnDestroy() {
    console.log('[GameComponent] Component destroying');
    this.subscription.unsubscribe();
    
    // Clean up meshes
    if (this.mainMesh) {
      this.mainMesh.dispose();
    }
    if (this.previewMesh) {
      this.previewMesh.dispose();
    }
    this.playerMeshes.forEach(mesh => mesh.dispose());
    this.playerMeshes.clear();
    
    // Dispose of scenes and engine
    if (this.mainScene) {
      this.mainScene.dispose();
    }
    if (this.previewScene) {
      this.previewScene.dispose();
    }
    if (this.engine) {
      this.engine.dispose();
    }
  }
}
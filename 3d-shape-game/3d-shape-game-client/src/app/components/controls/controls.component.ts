import { Component } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css']
})
export class ControlsComponent {
  extrusionHeight: number = 1;
  moveX: number = 0;
  moveY: number = 0;
  moveZ: number = 0;
  playerName: string = '';
  playerColor: string = '#ffffff';
  feedback: string = '';

  constructor(private gameService: GameService) {
    console.log('[ControlsComponent] Initializing');
    this.gameService.feedback.subscribe(message => {
      this.feedback = message;
    });
  }

  extrude() {
    console.log('[ControlsComponent] Extruding shape...');
    this.gameService.extrude(this.extrusionHeight);
  }

  move() {
    console.log('[ControlsComponent] Moving shape', {
      x: this.moveX,
      y: this.moveY,
      z: this.moveZ
    });
    
    this.gameService.move(this.moveX, this.moveY, this.moveZ);
    this.moveX = this.moveY = this.moveZ = 0; // Reset after move
  }

  setName() {
    if (this.playerName.trim()) {
      console.log('[ControlsComponent] Setting player name...');
      this.gameService.setName(this.playerName.trim());
    }
  }

  setColor() {
    console.log('[ControlsComponent] Setting player color...');
    this.gameService.setColor(this.playerColor);
  }
}
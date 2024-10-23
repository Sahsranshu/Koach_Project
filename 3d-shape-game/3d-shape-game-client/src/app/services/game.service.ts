// game.service.ts 
import { Injectable } from '@angular/core';
import { Client, Room } from 'colyseus.js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { GameState, Player } from '../models/game-state.model';
import { Vector3 } from '@babylonjs/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private client: Client;
  private room: Room | null = null;
  public gameState = new BehaviorSubject<GameState | null>(null);
  public players = new BehaviorSubject<Player[]>([]);
  public feedback = new BehaviorSubject<string>('');

  constructor() {
    console.log('[GameService] Initializing service');
    this.client = new Client(environment.serverUrl);
    console.log('[GameService] Colyseus client created with server URL:', environment.serverUrl);
  }

  async joinGame(): Promise<void> {
    console.log('[GameService] Attempting to join game room');
    
    try {
      this.room = await this.client.joinOrCreate('game_room');
      console.log("[GameService] Joined room successfully:", this.room.id);
      
      this.setupRoomHandlers();
    } catch (error) {
      console.error("[GameService] Could not join room:", error);
      this.feedback.next('Failed to join game room');
      throw error;
    }
  }

  private setupRoomHandlers() {
    if (!this.room) {
      console.error('[GameService] Cannot setup handlers: room is null');
      return;
    }

    this.room.onStateChange((state: GameState) => {
      console.log("[GameService] State changed:", state);
      this.gameState.next(state);
      this.updatePlayerList(state);
    });

    this.room.onError((code, message) => {
      console.error(`[GameService] Room error ${code}:`, message);
      this.feedback.next(`Error: ${message}`);
    });

    this.room.onLeave((code) => {
      console.log(`[GameService] Left room with code:`, code);
      this.room = null;
      this.feedback.next('Disconnected from game room');
    });
  }

  draw(points: number[]): void {
    console.log('[GameService] Attempting to send draw message', { points });
    
    if (this.checkConnection()) {
      try {
        this.room!.send('draw', { points });
        console.log('[GameService] Draw message sent successfully');
        this.feedback.next('Shape drawn');
      } catch (error) {
        console.error('[GameService] Error sending draw message:', error);
        this.feedback.next('Failed to send draw command');
      }
    }
  }

  extrude(height: number): void {
    console.log('[GameService] Attempting to send extrude message', { height });
    
    if (this.checkConnection()) {
      try {
        this.room!.send('extrude', { height });
        console.log('[GameService] Extrude message sent successfully');
        this.feedback.next(`Extruding shape to height ${height}`);
      } catch (error) {
        console.error('[GameService] Error sending extrude message:', error);
        this.feedback.next('Failed to send extrude command');
      }
    }
  }

  move(x: number, y: number, z: number): void {
    console.log('[GameService] Attempting to move shape', { x, y, z });
    
    if (this.checkConnection()) {
      try {
        this.room!.send('move', { x, y, z });
        console.log('[GameService] Move command sent successfully');
        this.feedback.next(`Moved to position (${x}, ${y}, ${z})`);
      } catch (error) {
        console.error('[GameService] Error sending move command:', error);
        this.feedback.next('Failed to move shape');
      }
    }
  }

  // Add the clearScene method
  clearScene(): void {
    console.log('[GameService] Attempting to clear scene');
    
    if (this.checkConnection()) {
      try {
        this.room!.send('clearScene');
        console.log('[GameService] Clear scene message sent successfully');
        this.feedback.next('Scene cleared');
      } catch (error) {
        console.error('[GameService] Error clearing scene:', error);
        this.feedback.next('Failed to clear scene');
      }
    }
  }

  updatePosition(position: Vector3): void {
    console.log('[GameService] Attempting to update position', { position });
    
    if (this.checkConnection()) {
      try {
        this.room!.send('move', {
          x: position.x,
          y: position.y,
          z: position.z
        });
        console.log('[GameService] Position update sent successfully');
        this.feedback.next('Position updated');
      } catch (error) {
        console.error('[GameService] Error sending position update:', error);
        this.feedback.next('Failed to update position');
      }
    }
  }

  setName(name: string): void {
    console.log('[GameService] Attempting to set name', { name });
    
    if (this.checkConnection()) {
      try {
        this.room!.send('setName', { name });
        console.log('[GameService] Name set successfully');
        this.feedback.next(`Name set to ${name}`);
      } catch (error) {
        console.error('[GameService] Error setting name:', error);
        this.feedback.next('Failed to set name');
      }
    }
  }

  setColor(color: string): void {
    console.log('[GameService] Attempting to set color', { color });
    
    if (this.checkConnection()) {
      try {
        this.room!.send('setColor', { color });
        console.log('[GameService] Color set successfully');
        this.feedback.next(`Color set to ${color}`);
      } catch (error) {
        console.error('[GameService] Error setting color:', error);
        this.feedback.next('Failed to set color');
      }
    }
  }

  getCurrentPlayerId(): string | undefined {
    return this.room?.sessionId;
  }

  private checkConnection(): boolean {
    if (!this.room || !this.room.connection.isOpen) {
      console.error('[GameService] No connection to game room');
      this.feedback.next('Not connected to game room');
      return false;
    }
    return true;
  }

  private updatePlayerList(state: GameState) {
    console.log('[GameService] Updating player list from state');
    
    try {
      if (state && state.players) {
        const playerList = Object.entries(state.players).map(([id, player]) => ({
          ...player,
          id
        }));
        console.log('[GameService] Player list updated:', playerList);
        this.players.next(playerList);
      } else {
        console.warn('[GameService] Invalid game state received:', state);
        this.players.next([]);
      }
    } catch (error) {
      console.error('[GameService] Error updating player list:', error);
      this.players.next([]);
    }
  }

  destroy() {
    console.log('[GameService] Destroying service');
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }
}
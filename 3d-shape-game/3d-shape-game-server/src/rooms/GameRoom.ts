import { Room, Client } from "colyseus";
import { GameState, Player } from "./schema/GameState";

export class GameRoom extends Room<GameState> {
  private playerActions = {
    draw: this.handleDraw.bind(this),
    extrude: this.handleExtrude.bind(this),
    move: this.handleMove.bind(this),
    setName: this.handleSetName.bind(this),
    setColor: this.handleSetColor.bind(this)
  };

  onCreate (options: any) {
    console.log("[GameRoom] Room created with options:", options);
    this.setState(new GameState());

    // Set up message handlers
    Object.entries(this.playerActions).forEach(([action, handler]) => {
      this.onMessage(action, (client, message) => {
        console.log(`[GameRoom] Received ${action} message from ${client.sessionId}:`, message);
        handler(client, message);
      });
    });

    // Set up custom room-level logic
    this.setSimulationInterval(() => this.update());
  }

  onJoin (client: Client, options: any) {
    console.log(`[GameRoom] Client ${client.sessionId} joined with options:`, options);
    const newPlayer = new Player();
    this.state.players.set(client.sessionId, newPlayer);
    this.broadcast("playerJoined", { id: client.sessionId });
  }

  onLeave (client: Client, consented: boolean) {
    console.log(`[GameRoom] Client ${client.sessionId} left. Consented: ${consented}`);
    this.state.players.delete(client.sessionId);
    this.broadcast("playerLeft", { id: client.sessionId });
  }

  onDispose() {
    console.log("[GameRoom] Room disposed. Cleaning up...");
    // Perform any necessary cleanup here
  }

  private update() {
    // Implement any continuous game logic here
    // This method is called at your defined simulation interval
  }

  private handleDraw(client: Client, message: any) {
    const player = this.getPlayer(client.sessionId);
    if (player && Array.isArray(message.points) && message.points.length >= 6) {
      player.shape = message.points;
      this.broadcastPlayerUpdate(client.sessionId, "shape");
    } else {
      this.sendErrorToClient(client, "Invalid draw data");
    }
  }

  private handleExtrude(client: Client, message: any) {
    const player = this.getPlayer(client.sessionId);
    if (player && typeof message.height === 'number') {
      player.height = Math.max(0.1, Math.min(10, message.height)); // Clamp between 0.1 and 10
      this.broadcastPlayerUpdate(client.sessionId, "height");
    } else {
      this.sendErrorToClient(client, "Invalid extrude data");
    }
  }

  private handleMove(client: Client, message: any) {
    const player = this.getPlayer(client.sessionId);
    if (player && this.isValidPosition(message)) {
      player.x = message.x;
      player.y = message.y;
      player.z = message.z;
      this.broadcastPlayerUpdate(client.sessionId, "position");
    } else {
      this.sendErrorToClient(client, "Invalid move data");
    }
  }

  private handleSetName(client: Client, message: any) {
    const player = this.getPlayer(client.sessionId);
    if (player && typeof message.name === 'string' && message.name.trim()) {
      player.name = message.name.trim().substring(0, 20); // Limit name to 20 characters
      this.broadcastPlayerUpdate(client.sessionId, "name");
    } else {
      this.sendErrorToClient(client, "Invalid name data");
    }
  }

  private handleSetColor(client: Client, message: any) {
    const player = this.getPlayer(client.sessionId);
    if (player && typeof message.color === 'string' && /^#[0-9A-F]{6}$/i.test(message.color)) {
      player.color = message.color;
      this.broadcastPlayerUpdate(client.sessionId, "color");
    } else {
      this.sendErrorToClient(client, "Invalid color data");
    }
  }

  private getPlayer(sessionId: string): Player | undefined {
    return this.state.players.get(sessionId);
  }

  private broadcastPlayerUpdate(playerId: string, updateType: string) {
    this.broadcast("playerUpdated", { id: playerId, type: updateType });
  }

  private sendErrorToClient(client: Client, message: string) {
    console.error(`[GameRoom] Error for client ${client.sessionId}: ${message}`);
    client.send("error", { message });
  }

  private isValidPosition(pos: any): boolean {
    return typeof pos.x === 'number' && 
           typeof pos.y === 'number' && 
           typeof pos.z === 'number' &&
           Math.abs(pos.x) <= 100 && 
           Math.abs(pos.y) <= 100 && 
           Math.abs(pos.z) <= 100; // Limit position to a 200x200x200 cube
  }
}
//claude ai code
// server/src/rooms/schema/GameState.ts


import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string = "";
  @type("string") color: string = "#ffffff";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") z: number = 0;
  @type(["number"]) shape = new ArraySchema<number>();
  @type("number") height: number = 1;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}


// chatgpt code


// import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";

// export class Player extends Schema {
//   @type("string") name: string = "";
//   @type("string") color: string = "#ffffff";
//   @type("number") x: number = 0;
//   @type("number") y: number = 0;
//   @type("number") z: number = 0;
//   @type(["number"]) shape = new ArraySchema<number>();
//   @type("number") height: number = 1;
// }

// export class GameState extends Schema {
//   @type({ map: Player }) players = new MapSchema<Player>();
// }

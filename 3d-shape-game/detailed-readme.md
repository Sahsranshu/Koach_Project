# 3D Shape Game

A multiplayer game built with BabylonJS and ColyseusJS where players can create 2D shapes, extrude them into 3D objects, and interact in a shared space.

## Table of Contents
1. [Backend](#backend)
   - [Technology Stack](#technology-stack)
   - [File Structure](#file-structure)
   - [Setup and Running](#setup-and-running)
   - [Code Breakdown](#code-breakdown)
2. [Frontend](#frontend)
   - [Technology Stack](#frontend-technology-stack)
   - [File Structure](#frontend-file-structure)
   - [Setup and Running](#frontend-setup-and-running)
   - [Code Breakdown](#frontend-code-breakdown)
3. [Usage](#usage)
4. [Current Limitations](#current-limitations)
5. [Future Improvements](#future-improvements)

## Backend

### Technology Stack
- Node.js
- TypeScript
- Colyseus (for real-time multiplayer functionality)
- Express (for serving the game)

### File Structure
```
server/
├── src/
│   ├── index.ts
│   ├── rooms/
│   │   ├── GameRoom.ts
│   │   └── schema/
│   │       └── GameState.ts
├── package.json
└── tsconfig.json
```

### Setup and Running
1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

The server will start running on `http://localhost:3000`.

### Code Breakdown

#### `index.ts`
This file sets up the Colyseus server and defines the game room.

#### `GameRoom.ts`
This file contains the logic for the game room, including handling player actions like drawing, extruding, and moving shapes.

#### `GameState.ts`
This file defines the structure of the game state, including player information and shape data.

## Frontend

### Frontend Technology Stack
- Angular
- TypeScript
- BabylonJS (for 3D rendering)
- Colyseus.js (client library for connecting to Colyseus server)

### Frontend File Structure
```
client/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── game/
│   │   │   │   ├── game.component.ts
│   │   │   │   ├── game.component.html
│   │   │   │   └── game.component.css
│   │   │   ├── drawing/
│   │   │   │   ├── drawing.component.ts
│   │   │   │   ├── drawing.component.html
│   │   │   │   └── drawing.component.css
│   │   │   └── controls/
│   │   │       ├── controls.component.ts
│   │   │       ├── controls.component.html
│   │   │       └── controls.component.css
│   │   ├── services/
│   │   │   └── game.service.ts
│   │   ├── models/
│   │   │   └── game-state.model.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   └── app.module.ts
│   ├── environments/
│   │   └── environment.ts
│   └── index.html
├── angular.json
└── package.json
```

### Frontend Setup and Running
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   ng serve
   ```

The application will be available at `http://localhost:4200`.

### Frontend Code Breakdown

#### `game.component.ts`
This is the main component that handles the 3D rendering using BabylonJS. It creates the 3D scene, manages the camera, and renders the shapes.

#### `drawing.component.ts`
This component provides the 2D drawing functionality, allowing users to create shapes that can be extruded into 3D.

#### `controls.component.ts`
This component contains the UI controls for extruding shapes and moving objects.

#### `game.service.ts`
This service manages the connection to the Colyseus server and handles sending/receiving game actions.

## Usage

1. Open the application in a web browser.
2. Use the drawing tools to create a 2D shape.
3. Click the "Extrude" button to turn the 2D shape into a 3D object.
4. Use the movement controls to position your 3D object in the shared space.
5. Observe as other players' shapes appear and move in real-time.

## Current Limitations

As of now, the following features are implemented:
- Drawing 2D shapes
- Turning 2D shapes into 3D objects

The following features are not yet fully implemented:
- Moving 3D objects around the shared space
- Seeing other players' shapes and movements in real-time

## Future Improvements

1. Implement movement of 3D objects in the shared space.
2. Add real-time synchronization of other players' shapes and movements.
3. Improve the user interface for a more intuitive experience.
4. Add more shape options and customization features.
5. Implement collision detection between objects.
6. Add chat functionality for players to communicate.

---

This project is still under development. Contributions and suggestions are welcome!

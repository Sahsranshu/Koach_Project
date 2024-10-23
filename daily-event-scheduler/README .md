
# Daily Event Scheduler

## Overview
The Daily Event Scheduler is a full-stack web application designed for users to manage and visualize their daily events within a 24-hour timeframe. It prevents overlapping events and provides an intuitive visual representation of the schedule.

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

---

### Backend

#### Technology Stack
- **Go 1.16+**: A powerful, compiled language known for simplicity and speed.
- **Go's Standard Library**: Using `net/http` for handling HTTP requests and `encoding/json` for JSON processing, which eliminates the need for additional dependencies.

#### File Structure
```
backend/
├── cmd/
│   └── main.go
├── internal/
│   └── scheduler/
│       └── scheduler.go
└── go.mod
```

#### Setup and Running
1. Install Go 1.16 or later from [Golang's official website](https://golang.org/dl/).
2. Clone the repository and navigate to the backend folder:
   ```
   cd backend
   ```
3. Start the backend server:
   ```
   go run cmd/main.go
   ```
   The server will be running at `http://localhost:8080`.

#### Code Breakdown
1. **Main File (`main.go`)**: This file initializes the HTTP server, sets up routes, and handles incoming API requests.
   ```go
   func main() {
       http.HandleFunc("/events", handleEvents)
       log.Fatal(http.ListenAndServe(":8080", nil))
   }
   ```
   - **Key Logic**: The server listens on port 8080, and requests to `/events` are routed to the `handleEvents` function.

2. **Scheduler Logic (`scheduler.go`)**: Contains the core event scheduling logic, including overlap checking.
   ```go
   type Event struct {
       StartTime int `json:"start_time"`
       EndTime   int `json:"end_time"`
   }
   ```
   - **Concurrency Control**: A mutex (`sync.Mutex`) ensures that only one request can modify the event list at any given time, preventing data conflicts.

3. **Dependencies**:
   - **`net/http`**: Provides essential functions to run the HTTP server.
   - **`sync.Mutex`**: Ensures thread-safe operations for event scheduling in a concurrent environment.

---

### Frontend

#### Technology Stack
- **Angular 12+**: A frontend framework for building single-page applications (SPAs).
- **Angular Material**: A UI component library that ensures the design is modern and responsive.

#### File Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── event.model.ts
│   │   ├── scheduler.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   ├── index.html
│   ├── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

#### Setup and Running
1. Install Node.js and Angular CLI:
   ```
   npm install -g @angular/cli
   ```
2. Navigate to the frontend folder:
   ```
   cd frontend
   npm install
   ng serve
   ```
3. The app will be available at `http://localhost:4200`.

#### Frontend Code Breakdown
1. **Event Model (`event.model.ts`)**: Defines the structure of an event in the frontend, which mirrors the backend event structure.
   ```typescript
   export interface Event {
     start_time: number;
     end_time: number;
   }
   ```

2. **Service for API Calls (`scheduler.service.ts`)**: Manages communication with the backend API.
   ```typescript
   @Injectable({
     providedIn: 'root'
   })
   export class SchedulerService {
     private apiUrl = 'http://localhost:8080/events';
     constructor(private http: HttpClient) {}
   }
   ```
   - **Purpose**: This service isolates the logic for adding events and fetching event data from the backend.

3. **Visual Timeline (`app.component.html`)**: Displays the event schedule in a timeline format using dynamic styles based on event start and end times.

---

### Usage
1. Start the backend and frontend servers.
2. Open a web browser and navigate to `http://localhost:4200`.
3. Use the form to add events by specifying start and end times (hours between 0-23).
4. The events will be displayed in a visual timeline format, preventing overlap automatically.

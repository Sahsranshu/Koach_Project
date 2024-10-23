// File: cmd/main.go

package main

import (
	"daily-event-scheduler/internal/scheduler"
	"encoding/json"
	"log"
	"net/http"
)

var sch *scheduler.Scheduler

func main() {
	sch = scheduler.NewScheduler()
	sch.InitializeWithExamples()

	http.HandleFunc("/events", handleEvents)
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleEvents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	switch r.Method {
	case "GET":
		json.NewEncoder(w).Encode(sch.GetEvents())
	case "POST":
		var event scheduler.Event
		if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if sch.AddEvent(event) {
			w.WriteHeader(http.StatusCreated)
		} else {
			http.Error(w, "Invalid event or overlap detected", http.StatusBadRequest)
		}
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
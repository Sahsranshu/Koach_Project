// File: internal/scheduler/scheduler.go

package scheduler

import (
	"sort"
	"sync"
)

type Event struct {
	StartTime int `json:"start_time"`
	EndTime   int `json:"end_time"`
}

type Scheduler struct {
	events []Event
	mutex  sync.Mutex
}

func NewScheduler() *Scheduler {
	return &Scheduler{
		events: make([]Event, 0),
	}
}

func (s *Scheduler) AddEvent(event Event) bool {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if event.StartTime < 0 || event.EndTime > 23 || event.StartTime >= event.EndTime {
		return false
	}

	for _, e := range s.events {
		if event.StartTime < e.EndTime && e.StartTime < event.EndTime {
			return false
		}
	}

	s.events = append(s.events, event)
	sort.Slice(s.events, func(i, j int) bool {
		return s.events[i].StartTime < s.events[j].StartTime
	})

	return true
}

func (s *Scheduler) GetEvents() []Event {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.events
}

func (s *Scheduler) InitializeWithExamples() {
	s.AddEvent(Event{StartTime: 2, EndTime: 5})
	s.AddEvent(Event{StartTime: 7, EndTime: 9})
}
package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/pukuri/expenses/backend/internal/store"
)

type CreateEventPayload struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
	Date        string `json:"date" validate:"required"`
}

type CreateEventExpensePayload struct {
	Amount      int64  `json:"amount" validate:"required"`
	Description string `json:"description" validate:"required"`
}

func (app *application) createEventHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateEventPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	event := &store.Event{
		Name:        payload.Name,
		Description: payload.Description,
		Date:        payload.Date,
	}

	ctx := r.Context()
	if err := app.store.Events.Create(ctx, event); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, event); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getEventHandler(w http.ResponseWriter, r *http.Request) {
	event := getEventFromCtx(r)

	if err := app.jsonResponse(w, http.StatusOK, event); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) indexEventsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	events, err := app.store.Events.GetAll(ctx)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, events); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getEventExpensesHandler(w http.ResponseWriter, r *http.Request) {
	event := getEventFromCtx(r)

	ctx := r.Context()
	expenses, err := app.store.Events.GetEventExpenses(ctx, event.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, expenses); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) createEventExpenseHandler(w http.ResponseWriter, r *http.Request) {
	event := getEventFromCtx(r)

	var payload CreateEventExpensePayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	expense := &store.EventExpense{
		EventID:     event.ID,
		Amount:      payload.Amount,
		Description: payload.Description,
	}

	ctx := r.Context()
	if err := app.store.Events.CreateExpense(ctx, expense); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, expense); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) deleteEventHandler(w http.ResponseWriter, r *http.Request) {
	event := getEventFromCtx(r)

	ctx := r.Context()
	if err := app.store.Events.Delete(ctx, event.ID); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (app *application) eventContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idParam := chi.URLParam(r, "eventID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}
		ctx := r.Context()

		event, err := app.store.Events.GetByID(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFound(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, eventCtx, event)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getEventFromCtx(r *http.Request) *store.Event {
	event, _ := r.Context().Value(eventCtx).(*store.Event)
	return event
}
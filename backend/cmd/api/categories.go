package main

import (
	"net/http"

	"github.com/pukuri/expenses/backend/internal/store"
)

type CreateCategoryPayload struct {
	Name  string `json:"name" validate:"required"`
	Color string `json:"color" validate:"required"`
}

func (app *application) createCategoryHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateCategoryPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	category := &store.Category{
		Name:  payload.Name,
		Color: payload.Color,
	}

	ctx := r.Context()
	if err := app.store.Categories.Create(ctx, category); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, category); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) indexCategoryHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	categories, err := app.store.Categories.Index(ctx)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, categories); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

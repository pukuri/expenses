package main

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/pukuri/expenses/internal/store"
)

type transactionKey string

const transactionCtx transactionKey = "transaction"

type CreateTransactionPayload struct {
	CategoryID     *int64 `json:"category_id"`
	Amount         int64  `json:"amount" validate:"required"`
	RunningBalance *int64 `json:"running_balance"`
	Description    string `json:"description" validate:"required"`
}

func (app *application) createTransactionHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateTransactionPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	var categoryID sql.NullInt64
	if *payload.CategoryID != 0 {
		categoryID = sql.NullInt64{Int64: *payload.CategoryID, Valid: true}
	} else {
		categoryID = sql.NullInt64{Valid: false}
	}

	var runningBalance int64
	if payload.RunningBalance != nil {
		runningBalance = *payload.RunningBalance
	} else {
		lastTransaction, err := app.store.Transactions.GetLast(r.Context())
		if err != nil {
			if errors.Is(err, store.ErrNotFound) {
				runningBalance = 0 - payload.Amount
			} else {
				app.internalServerError(w, r, err)
				return
			}
		} else {
			runningBalance = lastTransaction.RunningBalance - payload.Amount
		}
	}

	transaction := &store.Transaction{
		CategoryID:     categoryID,
		Amount:         payload.Amount,
		RunningBalance: runningBalance,
		Description:    payload.Description,
	}

	ctx := r.Context()
	if err := app.store.Transactions.Create(ctx, transaction); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, transaction); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getTransactionHandler(w http.ResponseWriter, r *http.Request) {
	transaction := getTransactionFromCtx(r)

	if err := app.jsonResponse(w, http.StatusOK, transaction); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) indexTransactionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	transactions, err := app.store.Transactions.Index(ctx)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, transactions); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) deleteTransactionHandler(w http.ResponseWriter, r *http.Request) {
	transaction := getTransactionFromCtx(r)

	ctx := r.Context()
	if err := app.store.Transactions.Delete(ctx, transaction.ID); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type UpdateTransactionPayload struct {
	Amount         *int64         `json:"amount" validate:"omitempty"`
	RunningBalance *int64         `json:"running_balance" validate:"omitempty"`
	Description    *string        `json:"description" validate:"omitempty"`
	CategoryID     *NullableInt64 `json:"category_id" validate:"omitempty"`
}

func (app *application) updateTransactionHandler(w http.ResponseWriter, r *http.Request) {
	transaction := getTransactionFromCtx(r)

	var payload UpdateTransactionPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if payload.Amount != nil {
		transaction.Amount = *payload.Amount
	}
	if payload.RunningBalance != nil {
		transaction.RunningBalance = *payload.RunningBalance
	}
	if payload.Description != nil {
		transaction.Description = *payload.Description
	}
	if payload.CategoryID != nil {
		transaction.CategoryID = payload.CategoryID.NullInt64
	}

	if err := app.store.Transactions.Update(r.Context(), transaction); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, transaction); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) transactionContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idParam := chi.URLParam(r, "transactionID")
		id, err := strconv.ParseInt(idParam, 10, 64)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}
		ctx := r.Context()

		transaction, err := app.store.Transactions.GetById(ctx, id)
		if err != nil {
			switch {
			case errors.Is(err, store.ErrNotFound):
				app.notFound(w, r, err)
			default:
				app.internalServerError(w, r, err)
			}
			return
		}

		ctx = context.WithValue(ctx, transactionCtx, transaction)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getTransactionFromCtx(r *http.Request) *store.Transaction {
	transaction, _ := r.Context().Value(transactionCtx).(*store.Transaction)
	return transaction
}

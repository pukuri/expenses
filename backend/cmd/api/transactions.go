package main

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/pukuri/expenses/backend/internal/store"
)

type CreateTransactionPayload struct {
	CategoryID     *int64 `json:"category_id"`
	Amount         int64  `json:"amount" validate:"required"`
	RunningBalance *int64 `json:"running_balance"`
	Description    string `json:"description" validate:"required"`
	Date           string `json:"date" validate:"required"`
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
		Date:           payload.Date,
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

func (app *application) getExpensesByMonthHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	date := r.URL.Query().Get("date")
	amount, err := app.store.Transactions.GetExpensesByMonth(ctx, date)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	type wrapper struct {
		Amount any `json:"amount"`
	}

	if err := app.jsonResponse(w, http.StatusOK, &wrapper{Amount: amount}); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

type ExpensesByMonthsResponse struct {
	Month  string `json:"month"`
	Amount int64  `json:"amount"`
}

func (app *application) getExpensesByMonthsHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	date := r.URL.Query().Get("date")

	var returnValue []ExpensesByMonthsResponse
	dates := getBackdate(date)

	for _, monthDate := range dates {
		amount, err := app.store.Transactions.GetExpensesByMonth(ctx, monthDate)
		if err != nil {
			app.internalServerError(w, r, err)
			return
		}

		response := ExpensesByMonthsResponse{
			Month:  monthDate,
			Amount: amount,
		}
		returnValue = append(returnValue, response)
	}

	// sort ascending for frontend purpose
	for i, j := 0, len(returnValue)-1; i < j; i, j = i+1, j-1 {
		returnValue[i], returnValue[j] = returnValue[j], returnValue[i]
	}

	if err := app.jsonResponse(w, http.StatusOK, returnValue); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getExpensesByMonthCategoryHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	date := r.URL.Query().Get("date")
	transactions, err := app.store.Transactions.GetExpensesByMonthCategory(ctx, date)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, transactions); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) getBalanceByDateHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	date := r.URL.Query().Get("date")
	amount, err := app.store.Transactions.GetBalanceByDate(ctx, date)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	type wrapper struct {
		Amount any `json:"amount"`
	}

	if err := app.jsonResponse(w, http.StatusOK, &wrapper{Amount: amount}); err != nil {
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

func getBackdate(date string) []string {
	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return []string{}
	}

	var dates []string

	for i := 0; i < 14; i++ {
		targetYear := parsedDate.Year()
		targetMonth := int(parsedDate.Month()) - i

		// Handle year rollover
		for targetMonth <= 0 {
			targetMonth += 12
			targetYear--
		}

		originalDay := parsedDate.Day()

		firstDayOfNextMonth := time.Date(targetYear, time.Month(targetMonth+1), 1, 0, 0, 0, 0, time.UTC)
		lastDayOfTargetMonth := firstDayOfNextMonth.AddDate(0, 0, -1).Day()

		// Use the original day, but cap it to the last day of the target month
		targetDay := originalDay
		if targetDay > lastDayOfTargetMonth {
			targetDay = lastDayOfTargetMonth
		}

		targetDate := time.Date(targetYear, time.Month(targetMonth), targetDay, 0, 0, 0, 0, time.UTC)
		formattedDate := targetDate.Format("2006-01-02")
		dates = append(dates, formattedDate)
	}

	return dates
}

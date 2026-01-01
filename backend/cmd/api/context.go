package main

import (
	"net/http"

	"github.com/pukuri/expenses/backend/internal/store"
)

type contextKey string

const (
	authenticatedUser contextKey = "authenticatedUser"
	transactionCtx    contextKey = "transaction"
)

// func getAuthenticatedUserFromCtx(r *http.Request) *store.User {
// 	user, _ := r.Context().Value(authenticatedUser).(*store.User)
// 	return user
// }

func getTransactionFromCtx(r *http.Request) *store.Transaction {
	transaction, _ := r.Context().Value(transactionCtx).(*store.Transaction)
	return transaction
}

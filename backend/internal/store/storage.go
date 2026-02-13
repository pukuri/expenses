package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

var (
	ErrNotFound          = errors.New("resource not found")
	QueryTimeoutDuration = time.Second * 5
)

type Storage struct {
	Transactions interface {
		GetById(context.Context, int64) (*Transaction, error)
		GetLast(context.Context) (*Transaction, error)
		GetExpensesByMonth(context.Context, string) (int64, error)
		GetExpensesByMonthRange(context.Context, string) (int64, error)
		GetExpensesByMonthCategory(context.Context, string) ([]CategoryReturnValue, error)
		GetExpensesLast30Days(context.Context) ([]AmountDaily, error)
		GetBalanceByDate(context.Context, string) (int64, error)
		Index(context.Context) ([]TransactionGet, error)
		Create(context.Context, *Transaction) error
		Delete(context.Context, int64) error
		UpdateWithCascade(context.Context, *Transaction, int64) error
	}
	Categories interface {
		Create(context.Context, *Category) error
		Index(context.Context) ([]Category, error)
	}
	Users interface {
		Upsert(context.Context, *User) error
		GetById(context.Context, int64) (*User, error)
	}
	Events interface {
		Create(context.Context, *Event) error
		GetAll(context.Context) ([]EventSummary, error)
		GetByID(context.Context, int64) (*Event, error)
		GetEventExpenses(context.Context, int64) ([]EventExpense, error)
		CreateExpense(context.Context, *EventExpense) error
		Delete(context.Context, int64) error
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Transactions: &TransactionStore{db},
		Categories:   &CategoryStore{db},
		Users:        &UserStore{db},
		Events:       &EventStore{db},
	}
}

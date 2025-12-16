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
		Index(context.Context) ([]Transaction, error)
		Create(context.Context, *Transaction) error
		Delete(context.Context, int64) error
		Update(context.Context, *Transaction) error
	}
	Categories interface {
		Create(context.Context, *Category) error
		Index(context.Context) ([]Category, error)
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Transactions: &TransactionStore{db},
		Categories:   &CategoryStore{db},
	}
}

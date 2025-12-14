package store

import (
	"context"
	"database/sql"
	"errors"
)

var (
	ErrNotFound = errors.New("resource not found")
)

type Storage struct {
	Transactions interface {
		GetById(context.Context, int64) (*Transaction, error)
		Index(context.Context) ([]Transaction, error)
		Create(context.Context, *Transaction) error
		Delete(context.Context, int64) error
		Update(context.Context, *Transaction) error
	}
	Categories interface {
		Create(context.Context, *Category) error
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Transactions: &TransactionStore{db},
		Categories:   &CategoryStore{db},
	}
}

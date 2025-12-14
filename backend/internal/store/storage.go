package store

import (
	"context"
	"database/sql"
)

type Storage struct {
	Transactions interface {
		Create(context.Context, *Transaction) error
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

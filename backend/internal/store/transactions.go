package store

import (
	"context"
	"database/sql"
)

type Transaction struct {
	ID             int64  `json:"id"`
	CategoryID     int64  `json:"category_id"`
	Amount         int64  `json:"amount"`
	RunningBalance int64  `json:"running_balance"`
	Description    string `json:"description"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

type TransactionStore struct {
	db *sql.DB
}

func (s *TransactionStore) Create(ctx context.Context, transaction *Transaction) error {
	query := `
		INSERT INTO transactions (category_id, amount, running_balance, description)	
		VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(
		ctx,
		query,
		transaction.CategoryID,
		transaction.Amount,
		transaction.RunningBalance,
		transaction.Description,
	).Scan(
		&transaction.ID,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		return err
	}

	return nil
}

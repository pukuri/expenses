package store

import (
	"context"
	"database/sql"
	"errors"
)

type Transaction struct {
	ID             int64         `json:"id"`
	CategoryID     sql.NullInt64 `json:"category_id"`
	Amount         int64         `json:"amount"`
	RunningBalance int64         `json:"running_balance"`
	Description    string        `json:"description"`
	CreatedAt      string        `json:"created_at"`
	UpdatedAt      string        `json:"updated_at"`
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

func (s *TransactionStore) Index(ctx context.Context) ([]Transaction, error) {
	query := `
		SELECT id, category_id, amount, running_balance, description, created_at, updated_at
		FROM transactions
	`

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	var transactions []Transaction

	for rows.Next() {
		var transaction Transaction
		if err := rows.Scan(
			&transaction.ID,
			&transaction.CategoryID,
			&transaction.Amount,
			&transaction.RunningBalance,
			&transaction.Description,
			&transaction.CreatedAt,
			&transaction.UpdatedAt,
		); err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return transactions, nil
}

func (s *TransactionStore) GetById(ctx context.Context, id int64) (*Transaction, error) {
	query := `
		SELECT id, category_id, amount, running_balance, description, created_at, updated_at
		FROM transactions
		WHERE id = $1
	`

	var transaction Transaction
	err := s.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&transaction.ID,
		&transaction.CategoryID,
		&transaction.Amount,
		&transaction.RunningBalance,
		&transaction.Description,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &transaction, nil
}

func (s *TransactionStore) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM transactions WHERE id = $1`

	res, err := s.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *TransactionStore) Update(ctx context.Context, transaction *Transaction) error {
	query := `
		UPDATE transactions
		SET amount = $1, running_balance = $2, description = $3, category_id = $4
		WHERE id = $5
	`

	_, err := s.db.ExecContext(ctx, query, transaction.Amount, transaction.RunningBalance, transaction.Description, transaction.CategoryID, transaction.ID)
	if err != nil {
		return err
	}

	return nil
}

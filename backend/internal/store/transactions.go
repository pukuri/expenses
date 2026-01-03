package store

import (
	"context"
	"database/sql"
	"errors"
)

type TransactionGet struct {
	ID             int64          `json:"id"`
	Amount         int64          `json:"amount"`
	RunningBalance int64          `json:"running_balance"`
	Description    string         `json:"description"`
	CategoryName   sql.NullString `json:"category_name,omitempty"`
	CategoryColor  sql.NullString `json:"category_color,omitempty"`
	Date           string         `json:"date"`
}
type Transaction struct {
	ID             int64         `json:"id"`
	Amount         int64         `json:"amount"`
	RunningBalance int64         `json:"running_balance"`
	Description    string        `json:"description"`
	Date           string        `json:"date"`
	CreatedAt      string        `json:"created_at"`
	UpdatedAt      string        `json:"updated_at"`
	CategoryID     sql.NullInt64 `json:"category_id,omitempty"`
}

type TransactionStore struct {
	db *sql.DB
}

func (s *TransactionStore) Create(ctx context.Context, transaction *Transaction) error {
	query := `
		INSERT INTO transactions (category_id, amount, running_balance, description, date)	
		VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		transaction.CategoryID,
		transaction.Amount,
		transaction.RunningBalance,
		transaction.Description,
		transaction.Date,
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

func (s *TransactionStore) Index(ctx context.Context) ([]TransactionGet, error) {
	query := `
		SELECT t.id, c.name, c.color, t.amount, t.running_balance, t.description, t.date
		FROM transactions t
		LEFT JOIN categories c
			ON t.category_id = c.id
		ORDER BY id DESC
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	var transactions []TransactionGet

	for rows.Next() {
		var transaction TransactionGet
		if err := rows.Scan(
			&transaction.ID,
			&transaction.CategoryName,
			&transaction.CategoryColor,
			&transaction.Amount,
			&transaction.RunningBalance,
			&transaction.Description,
			&transaction.Date,
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
		SELECT id, category_id, amount, running_balance, description, created_at, updated_at, date
		FROM transactions
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

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
		&transaction.Date,
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

func (s *TransactionStore) GetLast(ctx context.Context) (*Transaction, error) {
	query := `
		SELECT id, category_id, amount, running_balance, description, created_at, updated_at, date
		FROM transactions
		ORDER BY id DESC
		LIMIT 1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var transaction Transaction
	err := s.db.QueryRowContext(
		ctx,
		query,
	).Scan(
		&transaction.ID,
		&transaction.CategoryID,
		&transaction.Amount,
		&transaction.RunningBalance,
		&transaction.Description,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
		&transaction.Date,
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

func (s *TransactionStore) GetExpensesByMonth(ctx context.Context, date string) (int64, error) {
	query := `
		SELECT COALESCE(SUM(t.amount), 0)
		FROM transactions t
		JOIN categories c
			ON c.id = t.category_id	
		WHERE t.date >= date_trunc('month', $1::date)
			AND t.date < date_trunc('month', $1::date) + INTERVAL '1 month'
			AND c.name <> 'Gajian'
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var returnValue int64
	err := s.db.QueryRowContext(
		ctx,
		query,
		date,
	).Scan(
		&returnValue,
	)
	if err != nil {
		return 0, err
	}

	return returnValue, nil
}

type CategoryReturnValue struct {
	Amount int64  `json:"amount"`
	Name   string `json:"name"`
	Color  string `json:"color"`
	ID     int64  `json:"id"`
}

func (s *TransactionStore) GetExpensesByMonthCategory(ctx context.Context, date string) ([]CategoryReturnValue, error) {
	query := `
		SELECT COALESCE(SUM(t.amount), 0) as amount, c.name as name, c.color as color, c.id as id
		FROM transactions t
		JOIN categories c
			ON t.category_id = c.id
		WHERE t.date <= date_trunc('month', $1::date)
			AND t.date > date_trunc('month', $1::date) - INTERVAL '30 days'
		GROUP BY 2,3,4
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, date)
	if err != nil {
		return nil, err
	}

	var transactions []CategoryReturnValue

	for rows.Next() {
		var transaction CategoryReturnValue
		err := rows.Scan(
			&transaction.Amount,
			&transaction.Name,
			&transaction.Color,
			&transaction.ID,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}

func (s *TransactionStore) GetBalanceByDate(ctx context.Context, date string) (int64, error) {
	query := `
		SELECT COALESCE(running_balance, 0)
		FROM transactions
		WHERE date <= $1::date
		ORDER BY date DESC
		LIMIT 1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var returnValue int64
	err := s.db.QueryRowContext(
		ctx,
		query,
		date,
	).Scan(
		&returnValue,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return 0, nil
		default:
			return 0, err
		}
	}

	return returnValue, nil
}

func (s *TransactionStore) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM transactions WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

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

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(
		ctx,
		query,
		transaction.Amount,
		transaction.RunningBalance,
		transaction.Description,
		transaction.CategoryID,
		transaction.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

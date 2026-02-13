package store

import (
	"context"
	"database/sql"
	"errors"
)

type Event struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Date        string `json:"date"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type EventSummary struct {
	ID            int64 `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	Date          string `json:"date"`
	TotalExpenses int64 `json:"totalExpenses"`
}

type EventExpense struct {
	ID          int64  `json:"id"`
	EventID     int64  `json:"eventId"`
	Amount      int64  `json:"amount"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type EventStore struct {
	db *sql.DB
}

func (s *EventStore) Create(ctx context.Context, event *Event) error {
	query := `
		INSERT INTO events (name, description, date)
		VALUES ($1::text, $2::text, $3::date) RETURNING id, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		event.Name,
		event.Description,
		event.Date,
	).Scan(
		&event.ID,
		&event.CreatedAt,
		&event.UpdatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *EventStore) GetAll(ctx context.Context) ([]EventSummary, error) {
	query := `
		SELECT 
			e.id, 
			e.name, 
			e.description, 
			e.date,
			COALESCE(SUM(ee.amount), 0) as total_expenses
		FROM events e
		LEFT JOIN event_expenses ee ON e.id = ee.event_id
		GROUP BY e.id, e.name, e.description, e.date
		ORDER BY e.date DESC
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	var events []EventSummary
	for rows.Next() {
		var event EventSummary
		if err := rows.Scan(
			&event.ID,
			&event.Name,
			&event.Description,
			&event.Date,
			&event.TotalExpenses,
		); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func (s *EventStore) GetByID(ctx context.Context, id int64) (*Event, error) {
	query := `
		SELECT id, name, description, date, created_at, updated_at
		FROM events
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var event Event
	err := s.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&event.ID,
		&event.Name,
		&event.Description,
		&event.Date,
		&event.CreatedAt,
		&event.UpdatedAt,
	)

	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &event, nil
}

func (s *EventStore) GetEventExpenses(ctx context.Context, eventID int64) ([]EventExpense, error) {
	query := `
		SELECT id, event_id, amount, description, created_at, updated_at
		FROM event_expenses
		WHERE event_id = $1
		ORDER BY id DESC
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, eventID)
	if err != nil {
		return nil, err
	}

	var expenses []EventExpense
	for rows.Next() {
		var expense EventExpense
		if err := rows.Scan(
			&expense.ID,
			&expense.EventID,
			&expense.Amount,
			&expense.Description,
			&expense.CreatedAt,
			&expense.UpdatedAt,
		); err != nil {
			return nil, err
		}
		expenses = append(expenses, expense)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return expenses, nil
}

func (s *EventStore) CreateExpense(ctx context.Context, expense *EventExpense) error {
	query := `
		INSERT INTO event_expenses (event_id, amount, description)
		VALUES ($1::bigint, $2::bigint, $3::text) RETURNING id, created_at, updated_at
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		expense.EventID,
		expense.Amount,
		expense.Description,
	).Scan(
		&expense.ID,
		&expense.CreatedAt,
		&expense.UpdatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *EventStore) Delete(ctx context.Context, id int64) error {
	query := `DELETE FROM events WHERE id = $1`

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
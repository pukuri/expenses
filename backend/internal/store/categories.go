package store

import (
	"context"
	"database/sql"
)

type Category struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	CreatedAt string `json:"created_at"`
}

type CategoryStore struct {
	db *sql.DB
}

func (s *CategoryStore) Create(ctx context.Context, category *Category) error {
	query := `
		INSERT INTO categories (name, color)
		VALUES ($1, $2) RETURNING id, created_at
	`

	err := s.db.QueryRowContext(
		ctx,
		query,
		category.Name,
		category.Color,
	).Scan(
		&category.ID,
		&category.CreatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}

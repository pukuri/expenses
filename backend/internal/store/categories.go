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

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

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

func (s *CategoryStore) Index(ctx context.Context) ([]Category, error) {
	query := `
		SELECT id, name, color, created_at
		FROM categories
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	var categories []Category

	for rows.Next() {
		var category Category
		if err := rows.Scan(
			&category.ID,
			&category.Name,
			&category.Color,
			&category.CreatedAt,
		); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}

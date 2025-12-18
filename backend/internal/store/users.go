package store

import (
	"context"
	"database/sql"
	"errors"
)

type User struct {
	ID        int64  `json:"id"`
	GoogleID  string `json:"google_id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Picture   string `json:"picture"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type UserStore struct {
	db *sql.DB
}

func (s *UserStore) Upsert(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (google_id, email, name, picture)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (google_id) DO UPDATE SET name = $3, picture = $4
		RETURNING id
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		user.GoogleID,
		user.Email,
		user.Name,
		user.Picture,
	).Scan(
		&user.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

func (s *UserStore) GetById(ctx context.Context, id int64) (*User, error) {
	query := `
		SELECT id, email, name, picture
		FROM users
		WHERE id = $1
	`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	var user User
	err := s.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Picture,
	)
	if err != nil {
		switch {
		case errors.Is(err, sql.ErrNoRows):
			return nil, ErrNotFound
		default:
			return nil, err
		}
	}

	return &user, nil
}

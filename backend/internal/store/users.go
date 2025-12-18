package store

import (
	"context"
	"database/sql"
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

package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/pukuri/expenses/backend/config"
)

func New(cfg *config.Config) (*sql.DB, error) {
	var dsn string
	if cfg.Env == "production" {
		dsn = fmt.Sprintf("host=/cloudsql/%s user=%s password=%s dbname=%s sslmode=disable", cfg.DB.InstanceConnectionName, cfg.DB.User, cfg.DB.Password, cfg.DB.Name)
	} else {
		dsn = cfg.DB.Addr
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(cfg.DB.MaxOpenConns)
	db.SetMaxIdleConns(cfg.DB.MaxIdleConns)
	duration, err := time.ParseDuration(cfg.DB.MaxIdleTime)
	if err != nil {
		return nil, err
	}
	db.SetConnMaxIdleTime(duration)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}

	return db, nil
}

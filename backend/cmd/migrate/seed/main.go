package main

import (
	"log"

	"github.com/pukuri/expenses/config"
	"github.com/pukuri/expenses/internal/db"
	"github.com/pukuri/expenses/internal/store"

	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("cannot load config:", err)
	}

	conn, err := db.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	defer conn.Close()

	store := store.NewStorage(conn)
	db.Seed(store)
}

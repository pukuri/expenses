package main

import (
	"fmt"
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

	fmt.Printf("DB_USER='%s'\n", cfg.DB.User)
	fmt.Printf("DB_PASSWORD='%s'\n", cfg.DB.Password)
	fmt.Printf("DB_NAME='%s'\n", cfg.DB.Name)
	fmt.Printf("INSTANCE_CONNECTION_NAME='%s'\n", cfg.DB.InstanceConnectionName)

	conn, err := db.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	defer conn.Close()

	store := store.NewStorage(conn)
	db.Seed(store)
}

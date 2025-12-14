package main

import (
	"log"

	_ "github.com/lib/pq"
	"github.com/pukuri/expenses/config"
	"github.com/pukuri/expenses/internal/db"
	"github.com/pukuri/expenses/internal/store"
)

const version = "0.0.1"

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := db.New(cfg.DB.Addr, cfg.DB.MaxOpenConns, cfg.DB.MaxIdleConns, cfg.DB.MaxIdleTime)
	if err != nil {
		log.Panic(err)
	}
	defer db.Close()
	log.Println("database connection pool established")

	app := &application{
		config: cfg,
		store:  store.NewStorage(db),
	}

	mux := app.mount()
	log.Fatal(app.run(mux))
}

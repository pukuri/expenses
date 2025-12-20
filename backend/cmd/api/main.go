package main

import (
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"github.com/pukuri/expenses/config"
	"github.com/pukuri/expenses/internal/db"
	"github.com/pukuri/expenses/internal/store"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const version = "0.0.1"

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := db.New(cfg)
	if err != nil {
		fmt.Printf("DB_USER='%s'\n", cfg.DB.User)
		fmt.Printf("DB_PASSWORD='%s'\n", cfg.DB.Password)
		fmt.Printf("DB_NAME='%s'\n", cfg.DB.Name)
		fmt.Printf("INSTANCE_CONNECTION_NAME='%s'\n", cfg.DB.InstanceConnectionName)

		fmt.Printf("SQL.OPEN ERROR: %v\n", err)
		return
	}
	defer db.Close()
	log.Println("database connection pool established")

	oauthConfig := &oauth2.Config{
		ClientID:     cfg.Google.ClientID,
		ClientSecret: cfg.Google.ClientSecret,
		RedirectURL:  cfg.Google.RedirectUri,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	app := &application{
		config:      cfg,
		store:       store.NewStorage(db),
		oauthConfig: oauthConfig,
	}

	mux := app.mount()
	log.Fatal(app.run(mux))
}

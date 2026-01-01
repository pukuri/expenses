package main

import (
	"log"

	_ "github.com/lib/pq"
	"github.com/pukuri/expenses/backend/config"
	"github.com/pukuri/expenses/backend/internal/db"
	"github.com/pukuri/expenses/backend/internal/store"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const version = "1.0.0"

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := db.New(cfg)
	if err != nil {
		log.Panic(err)
	}
	defer db.Close()
	log.Println("database connection pool established")

	oauthConfig := &oauth2.Config{
		ClientID:     cfg.Google.ClientID,
		ClientSecret: cfg.Google.ClientSecret,
		RedirectURL:  cfg.Google.RedirectUri + "/api/auth/google/callback",
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

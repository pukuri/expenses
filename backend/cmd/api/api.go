package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/pukuri/expenses/config"
	"github.com/pukuri/expenses/internal/store"
)

type application struct {
	config *config.Config
	store  store.Storage
}

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://*", "https://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(middleware.Timeout(10 * time.Second))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		r.Route("/transactions", func(r chi.Router) {
			r.Post("/", app.createTransactionHandler)
			r.Get("/", app.indexTransactionHandler)

			r.Route("/{transactionID}", func(r chi.Router) {
				r.Use(app.transactionContextMiddleware)

				r.Get("/", app.getTransactionHandler)
				r.Delete("/", app.deleteTransactionHandler)
				r.Patch("/", app.updateTransactionHandler)
			})
		})

		r.Route("/categories", func(r chi.Router) {
			r.Post("/", app.createCategoryHandler)
			r.Get("/", app.indexCategoryHandler)
		})
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.Addr,
		Handler:      mux,
		WriteTimeout: time.Second * 5,
		ReadTimeout:  time.Second * 3,
		IdleTimeout:  time.Second * 10,
	}

	log.Printf("server has started at %s", app.config.Addr)

	return srv.ListenAndServe()
}

package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/pukuri/expenses/backend/config"
	"github.com/pukuri/expenses/backend/internal/store"
	"golang.org/x/oauth2"
)

type application struct {
	config      *config.Config
	store       store.Storage
	oauthConfig *oauth2.Config
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

	r.Route("/api", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Get("/google", app.googleAuth)
			r.Get("/google/callback", app.googleCallback)
			r.Post("/logout", app.googleLogout)
			r.Get("/logged_user", app.googleLoggedUser)
		})

		r.Get("/health", app.healthCheckHandler)

		r.Route("/v1", func(r chi.Router) {
			r.Use(app.authenticationMiddleware)

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

			r.Get("/expenses_by_month", app.getExpensesByMonthHandler)
			r.Get("/expenses_by_months", app.getExpensesByMonthsHandler)
			r.Get("/expenses_by_month_category", app.getExpensesByMonthCategoryHandler)
			r.Get("/expenses_last_30_days", app.getExpensesLast30DaysHandler)
			r.Get("/balance_by_date", app.getBalanceByDateHandler)

			r.Route("/categories", func(r chi.Router) {
				r.Post("/", app.createCategoryHandler)
				r.Get("/", app.indexCategoryHandler)
			})
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

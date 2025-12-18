package main

import (
	"context"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
)

func (app *application) authentication(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("auth_token")
		if err != nil {
			app.forbidden(w, r, err)
			return
		}

		secret := []byte(app.config.JwtSecret)
		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			return secret, nil
		})
		if err != nil || !token.Valid {
			app.forbidden(w, r, err)
			return
		}

		claims := token.Claims.(jwt.MapClaims)
		userId := int64(claims["user_id"].(float64))

		ctx := r.Context()
		user, err := app.store.Users.GetById(ctx, userId)
		if err != nil {
			app.forbidden(w, r, err)
			return
		}

		ctx = context.WithValue(r.Context(), authenticatedUser, user)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}

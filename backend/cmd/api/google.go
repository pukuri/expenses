package main

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pukuri/expenses/backend/internal/store"
)

type UserOauthPayload struct {
	GoogleID string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Picture  string `json:"picture"`
}

func (app *application) googleAuth(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	url := app.oauthConfig.AuthCodeURL(state)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (app *application) googleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")

	ctx := context.Background()
	token, err := app.oauthConfig.Exchange(ctx, code)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	client := app.oauthConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}
	defer resp.Body.Close()

	var payload UserOauthPayload
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if payload.GoogleID != app.config.AllowedGoogleID {
		app.forbidden(w, r, err)
		return
	}

	user := &store.User{
		GoogleID: payload.GoogleID,
		Email:    payload.Email,
		Name:     payload.Name,
		Picture:  payload.Picture,
	}

	if err := app.store.Users.Upsert(ctx, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	//generate JWT
	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}).SignedString([]byte(app.config.JwtSecret))
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    tokenString,
		Path:     "/",
		MaxAge:   86400,
		HttpOnly: true,
		Secure:   false,
	})

	http.Redirect(w, r, app.config.FrontendURL+"/dashboard", http.StatusTemporaryRedirect)
}

func (app *application) googleLogout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1, // Delete immediately
		HttpOnly: true,
		Secure:   false,
	})

	http.Redirect(w, r, app.config.FrontendURL, http.StatusSeeOther)
}

func (app *application) googleLoggedUser(w http.ResponseWriter, r *http.Request) {
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

	if err := app.jsonResponse(w, http.StatusOK, user); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

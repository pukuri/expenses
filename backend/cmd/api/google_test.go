package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pukuri/expenses/backend/config"
	"github.com/pukuri/expenses/backend/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"golang.org/x/oauth2"
)

type MockUserStore struct {
	user *store.User
	err  error
}

func (m *MockUserStore) Upsert(ctx context.Context, user *store.User) error {
	if m.err != nil {
		return m.err
	}
	if user.ID == 0 {
		user.ID = 1
	}
	return nil
}

func (m *MockUserStore) GetById(ctx context.Context, id int64) (*store.User, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.user, nil
}

type GoogleTestSuite struct {
	suite.Suite
	app *application
}

func (suite *GoogleTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr:            "0.0.0.0",
		Env:             "test",
		AllowedGoogleID: "test-google-id-123",
		JwtSecret:       "test-jwt-secret-key",
		FrontendURL:     "http://localhost:3000",
	}

	oauthConfig := &oauth2.Config{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURL:  "http://localhost:8080/auth/google/callback",
		Scopes:       []string{"profile", "email"},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://accounts.google.com/o/oauth2/auth",
			TokenURL: "https://oauth2.googleapis.com/token",
		},
	}

	suite.app = &application{
		config:      cfg,
		store:       store.NewStorage(nil),
		oauthConfig: oauthConfig,
	}
}

func (suite *GoogleTestSuite) TestGoogleAuth_Success() {
	req, err := http.NewRequest(http.MethodGet, "/auth/google?state=test-state", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.googleAuth(rr, req)

	assert.Equal(suite.T(), http.StatusTemporaryRedirect, rr.Code)

	location := rr.Header().Get("Location")
	assert.NotEmpty(suite.T(), location)
	assert.Contains(suite.T(), location, "accounts.google.com")
	assert.Contains(suite.T(), location, "state=test-state")
}

func (suite *GoogleTestSuite) TestGoogleAuth_EmptyState() {
	req, err := http.NewRequest(http.MethodGet, "/auth/google", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.googleAuth(rr, req)

	assert.Equal(suite.T(), http.StatusTemporaryRedirect, rr.Code)

	location := rr.Header().Get("Location")
	assert.NotEmpty(suite.T(), location)
	assert.Contains(suite.T(), location, "accounts.google.com")
}

func (suite *GoogleTestSuite) TestGoogleCallback_MissingCode() {
	req, err := http.NewRequest(http.MethodGet, "/auth/google/callback", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.googleCallback(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)
}

func (suite *GoogleTestSuite) TestGoogleLogout_Success() {
	req, err := http.NewRequest(http.MethodPost, "/auth/logout", nil)
	assert.NoError(suite.T(), err)

	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: "existing-token",
		Path:  "/",
	})

	rr := httptest.NewRecorder()
	suite.app.googleLogout(rr, req)

	assert.Equal(suite.T(), http.StatusSeeOther, rr.Code)

	location := rr.Header().Get("Location")
	assert.Equal(suite.T(), suite.app.config.FrontendURL, location)

	cookies := rr.Result().Cookies()
	found := false
	for _, cookie := range cookies {
		if cookie.Name == "auth_token" {
			found = true
			assert.Empty(suite.T(), cookie.Value)
			assert.Equal(suite.T(), -1, cookie.MaxAge)
			break
		}
	}
	assert.True(suite.T(), found, "auth_token cookie should be present and cleared")
}

func (suite *GoogleTestSuite) TestGoogleLoggedUser_Success() {
	mockUserStore := &MockUserStore{
		user: &store.User{
			ID:       1,
			GoogleID: suite.app.config.AllowedGoogleID,
			Email:    "test@example.com",
			Name:     "Test User",
			Picture:  "https://example.com/picture.jpg",
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Users: mockUserStore,
	}
	defer func() { suite.app.store = originalStore }()

	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(suite.app.config.JwtSecret))
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodGet, "/auth/me", nil)
	assert.NoError(suite.T(), err)

	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: tokenString,
		Path:  "/",
	})

	rr := httptest.NewRecorder()
	suite.app.googleLoggedUser(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response struct {
		Data store.User `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "test@example.com", response.Data.Email)
	assert.Equal(suite.T(), "Test User", response.Data.Name)
}

func (suite *GoogleTestSuite) TestGoogleLoggedUser_MissingCookie() {
	req, err := http.NewRequest(http.MethodGet, "/auth/me", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.googleLoggedUser(rr, req)

	assert.Equal(suite.T(), http.StatusForbidden, rr.Code)
}

func (suite *GoogleTestSuite) TestGoogleLoggedUser_InvalidToken() {
	req, err := http.NewRequest(http.MethodGet, "/auth/me", nil)
	assert.NoError(suite.T(), err)

	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: "invalid-token",
		Path:  "/",
	})

	rr := httptest.NewRecorder()
	suite.app.googleLoggedUser(rr, req)

	assert.Equal(suite.T(), http.StatusForbidden, rr.Code)
}

func (suite *GoogleTestSuite) TestGoogleLoggedUser_ExpiredToken() {
	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(-time.Hour).Unix(), // Expired 1 hour ago
	}).SignedString([]byte(suite.app.config.JwtSecret))
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodGet, "/auth/me", nil)
	assert.NoError(suite.T(), err)

	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: tokenString,
		Path:  "/",
	})

	rr := httptest.NewRecorder()
	suite.app.googleLoggedUser(rr, req)

	assert.Equal(suite.T(), http.StatusForbidden, rr.Code)
}

func (suite *GoogleTestSuite) TestGoogleLoggedUser_UserNotFound() {
	mockUserStore := &MockUserStore{
		user: nil,
		err:  errors.New("user not found"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Users: mockUserStore,
	}
	defer func() { suite.app.store = originalStore }()

	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(suite.app.config.JwtSecret))
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodGet, "/auth/me", nil)
	assert.NoError(suite.T(), err)

	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: tokenString,
		Path:  "/",
	})

	rr := httptest.NewRecorder()
	suite.app.googleLoggedUser(rr, req)

	assert.Equal(suite.T(), http.StatusForbidden, rr.Code)
}

func (suite *GoogleTestSuite) TestGoogleLoggedUser_WrongSecretKey() {
	tokenString, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(1),
		"exp":     time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte("wrong-secret-key"))
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodGet, "/auth/me", nil)
	assert.NoError(suite.T(), err)

	req.AddCookie(&http.Cookie{
		Name:  "auth_token",
		Value: tokenString,
		Path:  "/",
	})

	rr := httptest.NewRecorder()
	suite.app.googleLoggedUser(rr, req)

	assert.Equal(suite.T(), http.StatusForbidden, rr.Code)
}

func TestGoogleTestSuite(t *testing.T) {
	suite.Run(t, new(GoogleTestSuite))
}

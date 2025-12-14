package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/pukuri/expenses/config"
	"github.com/pukuri/expenses/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type HealthCheckTestSuite struct {
	suite.Suite
	app *application
}

func (suite *HealthCheckTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr: ":8080",
	}
	suite.app = &application{config: cfg, store: store.NewStorage(nil)}
}

func (suite *HealthCheckTestSuite) TestHealthCheckHandler() {
	req, err := http.NewRequest("GET", "/v1/health", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(suite.app.healthCheckHandler)

	handler.ServeHTTP(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)
	assert.Equal(suite.T(), "still alive", rr.Body.String())
}

func TestHealthCheckTestSuite(t *testing.T) {
	suite.Run(t, new(HealthCheckTestSuite))
}

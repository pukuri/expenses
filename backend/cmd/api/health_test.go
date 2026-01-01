package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/pukuri/expenses/backend/config"
	"github.com/pukuri/expenses/backend/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type HealthCheckTestSuite struct {
	suite.Suite
	app *application
}

func (suite *HealthCheckTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr: "0.0.0.0",
		Env:  "test",
	}
	suite.app = &application{config: cfg, store: store.NewStorage(nil)}
}

func (suite *HealthCheckTestSuite) TestHealthCheckHandler() {
	req, err := http.NewRequest("GET", "/api/health", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(suite.app.healthCheckHandler)

	handler.ServeHTTP(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data map[string]string `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	assert.Equal(suite.T(), "okay", response.Data["status"])
	assert.Equal(suite.T(), "test", response.Data["env"])
	assert.Equal(suite.T(), version, response.Data["version"])
}

func TestHealthCheckTestSuite(t *testing.T) {
	suite.Run(t, new(HealthCheckTestSuite))
}

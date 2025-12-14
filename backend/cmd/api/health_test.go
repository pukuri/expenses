package main

import (
	"encoding/json"
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
		Env:  "test",
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

	var response map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	assert.Equal(suite.T(), "okay", response["status"])
	assert.Equal(suite.T(), "test", response["env"])
	assert.Equal(suite.T(), version, response["version"])
}

func TestHealthCheckTestSuite(t *testing.T) {
	suite.Run(t, new(HealthCheckTestSuite))
}

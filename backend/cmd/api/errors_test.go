package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/pukuri/expenses/backend/config"
	"github.com/pukuri/expenses/backend/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type ErrorsTestSuite struct {
	suite.Suite
	app *application
}

func (suite *ErrorsTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr: "0.0.0.0",
		Env:  "test",
	}
	suite.app = &application{config: cfg, store: store.NewStorage(nil)}
}

func (suite *ErrorsTestSuite) TestInternalServerError_Success() {
	rr := httptest.NewRecorder()
	testError := errors.New("test internal server error")

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(suite.T(), err)

	suite.app.internalServerError(rr, req, testError)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	errorMessage, _ := response["error"]
	assert.Equal(suite.T(), "the server encountered a problem", errorMessage)
}

func (suite *ErrorsTestSuite) TestBadRequest_Success() {
	rr := httptest.NewRecorder()
	testError := errors.New("test bad request error")

	req, err := http.NewRequest(http.MethodPost, "/test-endpoint", nil)
	assert.NoError(suite.T(), err)

	suite.app.badRequest(rr, req, testError)

	assert.Equal(suite.T(), http.StatusBadRequest, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	errorMessage, _ := response["error"]
	assert.Equal(suite.T(), testError.Error(), errorMessage)
}

func (suite *ErrorsTestSuite) TestNotFound_Success() {
	rr := httptest.NewRecorder()
	testError := errors.New("test not found error")

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(suite.T(), err)

	suite.app.notFound(rr, req, testError)

	assert.Equal(suite.T(), http.StatusNotFound, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	errorMessage, _ := response["error"]
	assert.Equal(suite.T(), "resource not found", errorMessage)
}

func (suite *ErrorsTestSuite) TestForbidden_Success() {
	rr := httptest.NewRecorder()
	testError := errors.New("test not found error")

	req, err := http.NewRequest(http.MethodGet, "/test-endpoint", nil)
	assert.NoError(suite.T(), err)

	suite.app.forbidden(rr, req, testError)

	assert.Equal(suite.T(), http.StatusForbidden, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	errorMessage, _ := response["error"]
	assert.Equal(suite.T(), "access denied, only authorized account allowed.", errorMessage)
}

func TestErrorsTestSuite(t *testing.T) {
	suite.Run(t, new(ErrorsTestSuite))
}

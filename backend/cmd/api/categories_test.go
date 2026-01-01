package main

import (
	"bytes"
	"context"
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

type MockCategoryStore struct {
	categories []store.Category
	err        error
}

func (m *MockCategoryStore) Create(ctx context.Context, category *store.Category) error {
	return m.err
}

func (m *MockCategoryStore) Index(ctx context.Context) ([]store.Category, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.categories, nil
}

type CategoriesTestSuite struct {
	suite.Suite
	app *application
}

func (suite *CategoriesTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr: "0.0.0.0",
		Env:  "test",
	}
	suite.app = &application{config: cfg, store: store.NewStorage(nil)}
}

func (suite *CategoriesTestSuite) TestIndexCategoryHandler_Success() {
	mockStore := &MockCategoryStore{
		categories: []store.Category{
			{ID: 1, Name: "Food", Color: "#FF5733", CreatedAt: "2023-01-01T10:00:00Z"},
			{ID: 2, Name: "Transport", Color: "#33FF57", CreatedAt: "2023-01-02T10:00:00Z"},
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Categories: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/categories", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.indexCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response struct {
		Data []store.Category `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), response.Data, 2)
	assert.Equal(suite.T(), "Food", response.Data[0].Name)
	assert.Equal(suite.T(), "Transport", response.Data[1].Name)
}

func (suite *CategoriesTestSuite) TestIndexCategoryHandler_EmptyCategories() {
	mockStore := &MockCategoryStore{
		categories: []store.Category{},
		err:        nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Categories: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/categories", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.indexCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data []store.Category `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Empty(suite.T(), response.Data)
}

func (suite *CategoriesTestSuite) TestIndexCategoryHandler_StoreError() {
	mockStore := &MockCategoryStore{
		categories: nil,
		err:        errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Categories: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/categories", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.indexCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func (suite *CategoriesTestSuite) TestCreateCategoryHandler_Success() {
	mockStore := &MockCategoryStore{
		categories: []store.Category{},
		err:        nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Categories: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	requestBody := CreateCategoryPayload{
		Name:  "Food",
		Color: "#FF5733",
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPost, "/categories", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	suite.app.createCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusCreated, rr.Code)

	var response struct {
		Data store.Category `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Food", response.Data.Name)
	assert.Equal(suite.T(), "#FF5733", response.Data.Color)
}

func (suite *CategoriesTestSuite) TestCreateCategoryHandler_InvalidInput() {
	mockStore := &MockCategoryStore{
		categories: []store.Category{},
		err:        nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Categories: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	requestBody := map[string]string{
		"Name": "Food",
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPost, "/categories", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	suite.app.createCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusBadRequest, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Key: 'CreateCategoryPayload.Color' Error:Field validation for 'Color' failed on the 'required' tag", response["error"])
}

func (suite *CategoriesTestSuite) TestCreateCategoryHandler_StoreError() {
	mockStore := &MockCategoryStore{
		categories: nil,
		err:        errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Categories: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	requestBody := CreateCategoryPayload{
		Name:  "Food",
		Color: "#FF5733",
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPost, "/categories", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	suite.app.createCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func TestCategoriesTestSuite(t *testing.T) {
	suite.Run(t, new(CategoriesTestSuite))
}

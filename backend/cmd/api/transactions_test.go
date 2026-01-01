package main

import (
	"bytes"
	"context"
	"database/sql"
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

type MockTransactionStore struct {
	transactions            []store.TransactionGet
	transaction             *store.Transaction
	err                     error
	expensesByMonth         int64
	balanceByDate           int64
	expensesByMonthCategory []store.CategoryReturnValue
}

func (m *MockTransactionStore) Create(ctx context.Context, transaction *store.Transaction) error {
	return m.err
}

func (m *MockTransactionStore) Index(ctx context.Context) ([]store.TransactionGet, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.transactions, nil
}

func (m *MockTransactionStore) GetById(ctx context.Context, id int64) (*store.Transaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.transaction, nil
}

func (m *MockTransactionStore) GetLast(ctx context.Context) (*store.Transaction, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.transaction, nil
}

func (m *MockTransactionStore) GetExpensesByMonth(ctx context.Context, date string) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	return m.expensesByMonth, nil
}

func (m *MockTransactionStore) GetExpensesByMonthCategory(ctx context.Context, date string) ([]store.CategoryReturnValue, error) {
	if m.err != nil {
		return nil, m.err
	}

	return m.expensesByMonthCategory, nil
}

func (m *MockTransactionStore) GetBalanceByDate(ctx context.Context, date string) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	return m.balanceByDate, nil
}

func (m *MockTransactionStore) Delete(ctx context.Context, id int64) error {
	return m.err
}

func (m *MockTransactionStore) Update(ctx context.Context, transaction *store.Transaction) error {
	return m.err
}

type TransactionsTestSuite struct {
	suite.Suite
	app *application
}

func (suite *TransactionsTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr: "0.0.0.0",
		Env:  "test",
	}
	suite.app = &application{config: cfg, store: store.NewStorage(nil)}
}

func (suite *TransactionsTestSuite) TestIndexTransactionHandler_Success() {
	mockStore := &MockTransactionStore{
		transactions: []store.TransactionGet{
			{ID: 1, Amount: 1000, RunningBalance: 2000, Description: "Ayam Goreng", Date: "2023-01-01T10:00:00Z", CategoryName: sql.NullString{String: "Food", Valid: true}, CategoryColor: sql.NullString{String: "#FF5733", Valid: true}},
			{ID: 2, Amount: 500, RunningBalance: 2500, Description: "Ayam Bakar", Date: "2023-01-01T10:00:00Z", CategoryName: sql.NullString{String: "Food", Valid: true}, CategoryColor: sql.NullString{String: "#FF5733", Valid: true}},
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/transactions", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.indexTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response struct {
		Data []store.TransactionGet `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), response.Data, 2)
	assert.Equal(suite.T(), "Ayam Goreng", response.Data[0].Description)
	assert.Equal(suite.T(), "Ayam Bakar", response.Data[1].Description)
}

func (suite *TransactionsTestSuite) TestIndexTransactionHandler_EmptyTransactions() {
	mockStore := &MockTransactionStore{
		transactions: []store.TransactionGet{},
		err:          nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/transactions", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.indexTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data []store.TransactionGet `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Empty(suite.T(), response.Data)
}

func (suite *TransactionsTestSuite) TestIndexTransactionHandler_StoreError() {
	mockStore := &MockTransactionStore{
		transactions: nil,
		err:          errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/transactions", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.indexTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func (suite *TransactionsTestSuite) TestCreateTransactionHandler_Success() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{
			ID:             1,
			Amount:         1000,
			RunningBalance: 10000,
			Description:    "Lunch",
			Date:           "2023-01-01T10:00:00Z",
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	categoryID := int64(1)
	requestBody := CreateTransactionPayload{
		CategoryID:  &categoryID,
		Amount:      1000,
		Description: "Lunch",
		Date:        "2023-01-01T10:00:00Z",
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPost, "/transactions", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	suite.app.createTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusCreated, rr.Code)

	var response struct {
		Data store.Transaction `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Lunch", response.Data.Description)
	assert.Equal(suite.T(), int64(1000), response.Data.Amount)
}

func (suite *TransactionsTestSuite) TestCreateTransactionHandler_InvalidInput() {
	mockStore := &MockTransactionStore{
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	requestBody := map[string]interface{}{
		"amount": 1000,
		// Missing required description and date
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPost, "/transactions", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	suite.app.createTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusBadRequest, rr.Code)
}

func (suite *TransactionsTestSuite) TestCreateTransactionHandler_StoreError() {
	mockStore := &MockTransactionStore{
		err: errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	categoryID := int64(1)
	requestBody := CreateTransactionPayload{
		CategoryID:  &categoryID,
		Amount:      1000,
		Description: "Lunch",
		Date:        "2023-01-01T10:00:00Z",
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPost, "/transactions", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()
	suite.app.createTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func (suite *TransactionsTestSuite) TestGetExpensesByMonthHandler_Success() {
	mockStore := &MockTransactionStore{
		expensesByMonth: 5000,
		err:             nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/expenses-by-month?date=2023-01-01", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getExpensesByMonthHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data struct {
			Amount int64 `json:"amount"`
		} `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(5000), response.Data.Amount)
}

func (suite *TransactionsTestSuite) TestGetExpensesByMonthHandler_StoreError() {
	mockStore := &MockTransactionStore{
		expensesByMonth: 0,
		err:             errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/expenses-by-month?date=2023-01-01", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getExpensesByMonthHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func (suite *TransactionsTestSuite) TestGetBalanceByDateHandler_Success() {
	mockStore := &MockTransactionStore{
		balanceByDate: 10000,
		err:           nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/balance-by-date?date=2023-01-01", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getBalanceByDateHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data struct {
			Amount int64 `json:"amount"`
		} `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(10000), response.Data.Amount)
}

func (suite *TransactionsTestSuite) TestGetTransactionHandler_Success() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{
			ID:             1,
			Amount:         1000,
			RunningBalance: 2000,
			Description:    "Test Transaction",
			Date:           "2023-01-01T10:00:00Z",
			CategoryID:     sql.NullInt64{Int64: 1, Valid: true},
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/transactions/1", nil)
	assert.NoError(suite.T(), err)

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, mockStore.transaction))

	rr := httptest.NewRecorder()
	suite.app.getTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data store.Transaction `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Test Transaction", response.Data.Description)
	assert.Equal(suite.T(), int64(1000), response.Data.Amount)
}

func (suite *TransactionsTestSuite) TestGetExpensesByMonthCategoryHandler_Success() {
	mockStore := &MockTransactionStore{
		expensesByMonthCategory: []store.CategoryReturnValue{
			{Amount: 1500, Name: "Food", Color: "#FF5733", ID: 1},
			{Amount: 800, Name: "Transport", Color: "#33FF57", ID: 2},
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/expenses-by-month-category?date=2023-01-01", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getExpensesByMonthCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data []store.CategoryReturnValue `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), response.Data, 2)
	assert.Equal(suite.T(), "Food", response.Data[0].Name)
	assert.Equal(suite.T(), int64(1500), response.Data[0].Amount)
}

func (suite *TransactionsTestSuite) TestGetExpensesByMonthCategoryHandler_StoreError() {
	mockStore := &MockTransactionStore{
		err: errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/expenses-by-month-category?date=2023-01-01", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getExpensesByMonthCategoryHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func (suite *TransactionsTestSuite) TestDeleteTransactionHandler_Success() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{
			ID:             1,
			Amount:         1000,
			RunningBalance: 2000,
			Description:    "Transaction to delete",
			Date:           "2023-01-01T10:00:00Z",
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodDelete, "/transactions/1", nil)
	assert.NoError(suite.T(), err)

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, mockStore.transaction))

	rr := httptest.NewRecorder()
	suite.app.deleteTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusNoContent, rr.Code)
	assert.Empty(suite.T(), rr.Body.String())
}

func (suite *TransactionsTestSuite) TestDeleteTransactionHandler_StoreError() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{ID: 1},
		err:         errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodDelete, "/transactions/1", nil)
	assert.NoError(suite.T(), err)

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, mockStore.transaction))

	rr := httptest.NewRecorder()
	suite.app.deleteTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func (suite *TransactionsTestSuite) TestUpdateTransactionHandler_Success() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{
			ID:             1,
			Amount:         1500,
			RunningBalance: 2500,
			Description:    "Updated Transaction",
			Date:           "2023-01-01T10:00:00Z",
			CategoryID:     sql.NullInt64{Int64: 2, Valid: true},
		},
		err: nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	newAmount := int64(1500)
	newDescription := "Updated Transaction"
	requestBody := UpdateTransactionPayload{
		Amount:      &newAmount,
		Description: &newDescription,
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPut, "/transactions/1", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, mockStore.transaction))

	rr := httptest.NewRecorder()
	suite.app.updateTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data store.Transaction `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "Updated Transaction", response.Data.Description)
	assert.Equal(suite.T(), int64(1500), response.Data.Amount)
}

func (suite *TransactionsTestSuite) TestUpdateTransactionHandler_InvalidInput() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{ID: 1},
		err:         nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodPut, "/transactions/1", bytes.NewReader([]byte("invalid json")))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, mockStore.transaction))

	rr := httptest.NewRecorder()
	suite.app.updateTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusBadRequest, rr.Code)
}

func (suite *TransactionsTestSuite) TestUpdateTransactionHandler_StoreError() {
	mockStore := &MockTransactionStore{
		transaction: &store.Transaction{ID: 1},
		err:         errors.New("database error"),
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	newAmount := int64(1500)
	requestBody := UpdateTransactionPayload{
		Amount: &newAmount,
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPut, "/transactions/1", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, mockStore.transaction))

	rr := httptest.NewRecorder()
	suite.app.updateTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusInternalServerError, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "the server encountered a problem", response["error"])
}

func TestTransactionsTestSuite(t *testing.T) {
	suite.Run(t, new(TransactionsTestSuite))
}

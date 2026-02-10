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
	transactionList         []*store.Transaction // For tracking multiple transactions in cascading tests
	err                     error
	expensesByMonth         int64
	expensesByMonthRange    int64
	balanceByDate           int64
	expensesByMonthCategory []store.CategoryReturnValue
	expensesLast30Days      []store.AmountDaily
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

func (m *MockTransactionStore) GetExpensesByMonthRange(ctx context.Context, date string) (int64, error) {
	if m.err != nil {
		return 0, m.err
	}
	return m.expensesByMonthRange, nil
}

func (m *MockTransactionStore) GetExpensesByMonthCategory(ctx context.Context, date string) ([]store.CategoryReturnValue, error) {
	if m.err != nil {
		return nil, m.err
	}

	return m.expensesByMonthCategory, nil
}

func (m *MockTransactionStore) GetExpensesLast30Days(ctx context.Context) ([]store.AmountDaily, error) {
	if m.err != nil {
		return nil, m.err
	}

	return m.expensesLast30Days, nil
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

func (m *MockTransactionStore) UpdateWithCascade(ctx context.Context, transaction *store.Transaction, oldAmount int64) error {
	if m.err != nil {
		return m.err
	}

	// Update the main transaction
	for i, t := range m.transactionList {
		if t.ID == transaction.ID {
			m.transactionList[i] = transaction
			break
		}
	}

	// Update subsequent transactions if amount changed
	if oldAmount != transaction.Amount {
		amountDiff := transaction.Amount - oldAmount
		for _, t := range m.transactionList {
			if t.ID > transaction.ID {
				t.RunningBalance = t.RunningBalance - amountDiff
			}
		}
	}

	return nil
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

func (suite *TransactionsTestSuite) TestGetExpensesByMonthsHandler_Success() {
	mockStore := &MockTransactionStore{
		expensesByMonthRange: 2500,
		err:                  nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/expenses-by-months?date=2026-01-01", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getExpensesByMonthsHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data []ExpensesByMonthsResponse `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	assert.Len(suite.T(), response.Data, 14)

	assert.Equal(suite.T(), "2024-12-01", response.Data[0].Date)
	assert.Equal(suite.T(), "2025-01-01", response.Data[1].Date)
	assert.Equal(suite.T(), "2025-02-01", response.Data[2].Date)
	assert.Equal(suite.T(), "2026-01-01", response.Data[13].Date)

	for _, entry := range response.Data {
		assert.Equal(suite.T(), int64(2500), entry.Amount)
	}
}

func (suite *TransactionsTestSuite) TestGetExpensesByMonthsHandler_EdgeCase() {
	mockStore := &MockTransactionStore{
		expensesByMonthRange: 1500,
		err:                  nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	req, err := http.NewRequest(http.MethodGet, "/expenses-by-months?date=2025-12-31", nil)
	assert.NoError(suite.T(), err)

	rr := httptest.NewRecorder()
	suite.app.getExpensesByMonthsHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data []ExpensesByMonthsResponse `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	assert.Len(suite.T(), response.Data, 14)

	assert.Equal(suite.T(), "2024-11-30", response.Data[0].Date)
	// Check that February is handled correctly (should be 28th in non-leap year 2025)
	assert.Equal(suite.T(), "2025-02-28", response.Data[3].Date)
	assert.Equal(suite.T(), "2025-11-30", response.Data[12].Date)
	assert.Equal(suite.T(), "2025-12-31", response.Data[13].Date)

	for _, entry := range response.Data {
		assert.Equal(suite.T(), int64(1500), entry.Amount)
	}
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

func (suite *TransactionsTestSuite) TestUpdateTransactionHandler_CascadingUpdate() {
	// Setup multiple transactions to test cascading behavior
	transaction1 := &store.Transaction{
		ID:             1,
		Amount:         1000,
		RunningBalance: 5000,
		Description:    "First Transaction",
		Date:           "2023-01-01T10:00:00Z",
	}
	transaction2 := &store.Transaction{
		ID:             2,
		Amount:         500,
		RunningBalance: 4500,
		Description:    "Second Transaction",
		Date:           "2023-01-02T10:00:00Z",
	}
	transaction3 := &store.Transaction{
		ID:             3,
		Amount:         300,
		RunningBalance: 4200,
		Description:    "Third Transaction",
		Date:           "2023-01-03T10:00:00Z",
	}

	mockStore := &MockTransactionStore{
		transaction:     transaction1, // This is the transaction we'll update
		transactionList: []*store.Transaction{transaction1, transaction2, transaction3},
		err:             nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	// Update transaction 1's amount from 1000 to 1500 (+500)
	newAmount := int64(1500)
	newDescription := "Updated First Transaction"
	requestBody := UpdateTransactionPayload{
		Amount:      &newAmount,
		Description: &newDescription,
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPut, "/transactions/1", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, transaction1))

	rr := httptest.NewRecorder()
	suite.app.updateTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	// Verify the cascading effect
	// Transaction 1: Amount changed from 1000 to 1500, running balance should change from 5000 to 4500
	assert.Equal(suite.T(), int64(1500), mockStore.transactionList[0].Amount)
	assert.Equal(suite.T(), int64(4500), mockStore.transactionList[0].RunningBalance)
	assert.Equal(suite.T(), "Updated First Transaction", mockStore.transactionList[0].Description)

	// Transaction 2: Amount stays 500, but running balance should decrease by 500 (from 4500 to 4000)
	assert.Equal(suite.T(), int64(500), mockStore.transactionList[1].Amount)
	assert.Equal(suite.T(), int64(4000), mockStore.transactionList[1].RunningBalance)

	// Transaction 3: Amount stays 300, but running balance should decrease by 500 (from 4200 to 3700)
	assert.Equal(suite.T(), int64(300), mockStore.transactionList[2].Amount)
	assert.Equal(suite.T(), int64(3700), mockStore.transactionList[2].RunningBalance)
}

func (suite *TransactionsTestSuite) TestUpdateTransactionHandler_CascadingUpdate_NoAmountChange() {
	// Test that no cascading occurs when only description is changed
	transaction1 := &store.Transaction{
		ID:             1,
		Amount:         1000,
		RunningBalance: 5000,
		Description:    "First Transaction",
		Date:           "2023-01-01T10:00:00Z",
	}
	transaction2 := &store.Transaction{
		ID:             2,
		Amount:         500,
		RunningBalance: 4500,
		Description:    "Second Transaction",
		Date:           "2023-01-02T10:00:00Z",
	}

	mockStore := &MockTransactionStore{
		transaction:     transaction1,
		transactionList: []*store.Transaction{transaction1, transaction2},
		err:             nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	// Update only the description, not the amount
	newDescription := "Updated Description Only"
	requestBody := UpdateTransactionPayload{
		Description: &newDescription,
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPut, "/transactions/1", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, transaction1))

	rr := httptest.NewRecorder()
	suite.app.updateTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	// Transaction 1: Only description should change, amount and running balance remain the same
	assert.Equal(suite.T(), int64(1000), mockStore.transactionList[0].Amount)
	assert.Equal(suite.T(), int64(5000), mockStore.transactionList[0].RunningBalance)
	assert.Equal(suite.T(), "Updated Description Only", mockStore.transactionList[0].Description)

	// Transaction 2: Should remain completely unchanged
	assert.Equal(suite.T(), int64(500), mockStore.transactionList[1].Amount)
	assert.Equal(suite.T(), int64(4500), mockStore.transactionList[1].RunningBalance)
	assert.Equal(suite.T(), "Second Transaction", mockStore.transactionList[1].Description)
}

func (suite *TransactionsTestSuite) TestUpdateTransactionHandler_CascadingUpdate_LastTransaction() {
	// Test that updating the last transaction doesn't affect others
	transaction1 := &store.Transaction{
		ID:             1,
		Amount:         1000,
		RunningBalance: 5000,
		Description:    "First Transaction",
		Date:           "2023-01-01T10:00:00Z",
	}
	transaction2 := &store.Transaction{
		ID:             2,
		Amount:         500,
		RunningBalance: 4500,
		Description:    "Second Transaction",
		Date:           "2023-01-02T10:00:00Z",
	}

	mockStore := &MockTransactionStore{
		transaction:     transaction2, // Update the last transaction
		transactionList: []*store.Transaction{transaction1, transaction2},
		err:             nil,
	}

	originalStore := suite.app.store
	suite.app.store = store.Storage{
		Transactions: mockStore,
	}
	defer func() { suite.app.store = originalStore }()

	// Update transaction 2's amount from 500 to 800 (+300)
	newAmount := int64(800)
	requestBody := UpdateTransactionPayload{
		Amount: &newAmount,
	}
	jsonBody, err := json.Marshal(requestBody)
	assert.NoError(suite.T(), err)

	req, err := http.NewRequest(http.MethodPut, "/transactions/2", bytes.NewReader(jsonBody))
	assert.NoError(suite.T(), err)
	req.Header.Set("Content-Type", "application/json")

	req = req.WithContext(context.WithValue(req.Context(), transactionCtx, transaction2))

	rr := httptest.NewRecorder()
	suite.app.updateTransactionHandler(rr, req)

	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	// Transaction 1: Should remain completely unchanged (no transactions after it)
	assert.Equal(suite.T(), int64(1000), mockStore.transactionList[0].Amount)
	assert.Equal(suite.T(), int64(5000), mockStore.transactionList[0].RunningBalance)

	// Transaction 2: Amount should change, running balance should change from 4500 to 4200
	assert.Equal(suite.T(), int64(800), mockStore.transactionList[1].Amount)
	assert.Equal(suite.T(), int64(4200), mockStore.transactionList[1].RunningBalance)
}

func TestTransactionsTestSuite(t *testing.T) {
	suite.Run(t, new(TransactionsTestSuite))
}

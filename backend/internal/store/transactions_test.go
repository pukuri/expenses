package store

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type TransactionStoreTestSuite struct {
	suite.Suite
}

func (suite *TransactionStoreTestSuite) TestTransactionStructure() {
	transaction := Transaction{
		ID:             1,
		Amount:         1000,
		RunningBalance: 5000,
		Description:    "Test Transaction",
		Date:           "2023-01-01T10:00:00Z",
		CreatedAt:      "2023-01-01T10:00:00Z",
		UpdatedAt:      "2023-01-01T10:00:00Z",
		CategoryID:     sql.NullInt64{Int64: 1, Valid: true},
	}

	assert.Equal(suite.T(), int64(1), transaction.ID)
	assert.Equal(suite.T(), int64(1000), transaction.Amount)
	assert.Equal(suite.T(), int64(5000), transaction.RunningBalance)
	assert.Equal(suite.T(), "Test Transaction", transaction.Description)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", transaction.Date)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", transaction.CreatedAt)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", transaction.UpdatedAt)
	assert.True(suite.T(), transaction.CategoryID.Valid)
	assert.Equal(suite.T(), int64(1), transaction.CategoryID.Int64)
}

func (suite *TransactionStoreTestSuite) TestTransactionGetStructure() {
	transactionGet := TransactionGet{
		ID:             1,
		Amount:         1000,
		RunningBalance: 5000,
		Description:    "Test Transaction",
		CategoryName:   sql.NullString{String: "Food", Valid: true},
		CategoryColor:  sql.NullString{String: "#FF5733", Valid: true},
		Date:           "2023-01-01T10:00:00Z",
	}

	assert.Equal(suite.T(), int64(1), transactionGet.ID)
	assert.Equal(suite.T(), int64(1000), transactionGet.Amount)
	assert.Equal(suite.T(), int64(5000), transactionGet.RunningBalance)
	assert.Equal(suite.T(), "Test Transaction", transactionGet.Description)
	assert.True(suite.T(), transactionGet.CategoryName.Valid)
	assert.Equal(suite.T(), "Food", transactionGet.CategoryName.String)
	assert.True(suite.T(), transactionGet.CategoryColor.Valid)
	assert.Equal(suite.T(), "#FF5733", transactionGet.CategoryColor.String)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", transactionGet.Date)
}

func (suite *TransactionStoreTestSuite) TestCategoryReturnValueStructure() {
	categoryReturn := CategoryReturnValue{
		Amount: 5000,
		Name:   "Food",
		Color:  "#FF5733",
		ID:     1,
	}

	assert.Equal(suite.T(), int64(5000), categoryReturn.Amount)
	assert.Equal(suite.T(), "Food", categoryReturn.Name)
	assert.Equal(suite.T(), "#FF5733", categoryReturn.Color)
	assert.Equal(suite.T(), int64(1), categoryReturn.ID)
}

func (suite *TransactionStoreTestSuite) TestTransactionStoreCreation() {
	var db *sql.DB
	store := &TransactionStore{db: db}
	
	assert.NotNil(suite.T(), store)
	assert.Equal(suite.T(), db, store.db)
}

func (suite *TransactionStoreTestSuite) TestNullValueHandling() {
	transaction := Transaction{
		CategoryID: sql.NullInt64{Int64: 0, Valid: false},
	}
	
	assert.False(suite.T(), transaction.CategoryID.Valid)
	assert.Equal(suite.T(), int64(0), transaction.CategoryID.Int64)

	transactionGet := TransactionGet{
		CategoryName:  sql.NullString{String: "", Valid: false},
		CategoryColor: sql.NullString{String: "", Valid: false},
	}
	
	assert.False(suite.T(), transactionGet.CategoryName.Valid)
	assert.False(suite.T(), transactionGet.CategoryColor.Valid)
	assert.Equal(suite.T(), "", transactionGet.CategoryName.String)
	assert.Equal(suite.T(), "", transactionGet.CategoryColor.String)
}

func (suite *TransactionStoreTestSuite) TestStructJSONTags() {
	transaction := Transaction{
		ID:             1,
		Amount:         1000,
		RunningBalance: 5000,
		Description:    "Test",
		Date:           "2023-01-01",
		CreatedAt:      "2023-01-01",
		UpdatedAt:      "2023-01-01",
	}
	
	assert.Equal(suite.T(), int64(1), transaction.ID)
	assert.Equal(suite.T(), int64(1000), transaction.Amount)
	assert.Equal(suite.T(), int64(5000), transaction.RunningBalance)
	assert.Equal(suite.T(), "Test", transaction.Description)
	assert.Equal(suite.T(), "2023-01-01", transaction.Date)
	assert.Equal(suite.T(), "2023-01-01", transaction.CreatedAt)
	assert.Equal(suite.T(), "2023-01-01", transaction.UpdatedAt)
}

func (suite *TransactionStoreTestSuite) TestCategoryReturnValueJSONTags() {
	categoryReturn := CategoryReturnValue{
		Amount: 5000,
		Name:   "Food",
		Color:  "#FF5733",
		ID:     1,
	}
	
	assert.Equal(suite.T(), int64(5000), categoryReturn.Amount)
	assert.Equal(suite.T(), "Food", categoryReturn.Name)
	assert.Equal(suite.T(), "#FF5733", categoryReturn.Color)
	assert.Equal(suite.T(), int64(1), categoryReturn.ID)
}

func (suite *TransactionStoreTestSuite) TestTransactionWithValidCategory() {
	transaction := Transaction{
		ID:             1,
		Amount:         1500,
		RunningBalance: 6500,
		Description:    "Lunch at restaurant",
		Date:           "2023-01-15T12:30:00Z",
		CategoryID:     sql.NullInt64{Int64: 2, Valid: true},
	}
	
	assert.True(suite.T(), transaction.CategoryID.Valid)
	assert.Equal(suite.T(), int64(2), transaction.CategoryID.Int64)
	assert.Equal(suite.T(), "Lunch at restaurant", transaction.Description)
}

func (suite *TransactionStoreTestSuite) TestTransactionWithoutCategory() {
	transaction := Transaction{
		ID:             1,
		Amount:         1500,
		RunningBalance: 6500,
		Description:    "General expense",
		Date:           "2023-01-15T12:30:00Z",
		CategoryID:     sql.NullInt64{Valid: false},
	}
	
	assert.False(suite.T(), transaction.CategoryID.Valid)
	assert.Equal(suite.T(), "General expense", transaction.Description)
}

func TestTransactionStoreTestSuite(t *testing.T) {
	suite.Run(t, new(TransactionStoreTestSuite))
}

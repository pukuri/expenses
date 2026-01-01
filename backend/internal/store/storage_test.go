package store

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type StorageTestSuite struct {
	suite.Suite
}

func (suite *StorageTestSuite) TestNewStorage() {
	var db *sql.DB
	
	storage := NewStorage(db)
	
	assert.NotNil(suite.T(), storage.Transactions)
	assert.NotNil(suite.T(), storage.Categories)
	assert.NotNil(suite.T(), storage.Users)
	
	_, ok := storage.Transactions.(*TransactionStore)
	assert.True(suite.T(), ok, "Transactions should be of type *TransactionStore")
	
	_, ok = storage.Categories.(*CategoryStore)
	assert.True(suite.T(), ok, "Categories should be of type *CategoryStore")
	
	_, ok = storage.Users.(*UserStore)
	assert.True(suite.T(), ok, "Users should be of type *UserStore")
}

func (suite *StorageTestSuite) TestErrorConstants() {
	assert.Equal(suite.T(), "resource not found", ErrNotFound.Error())
	assert.NotZero(suite.T(), QueryTimeoutDuration)
}

func TestStorageTestSuite(t *testing.T) {
	suite.Run(t, new(StorageTestSuite))
}

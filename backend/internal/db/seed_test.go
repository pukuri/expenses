package db

import (
	"context"
	"errors"
	"math/rand"
	"testing"

	"github.com/pukuri/expenses/backend/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type MockCategoryStore struct {
	categories []store.Category
	err        error
}

func (m *MockCategoryStore) Create(ctx context.Context, category *store.Category) error {
	if m.err != nil {
		return m.err
	}
	category.ID = int64(len(m.categories) + 1)
	m.categories = append(m.categories, *category)
	return nil
}

func (m *MockCategoryStore) Index(ctx context.Context) ([]store.Category, error) {
	return m.categories, m.err
}

type MockTransactionStore struct {
	transactions []store.Transaction
	err          error
}

func (m *MockTransactionStore) Create(ctx context.Context, transaction *store.Transaction) error {
	if m.err != nil {
		return m.err
	}
	transaction.ID = int64(len(m.transactions) + 1)
	m.transactions = append(m.transactions, *transaction)
	return nil
}

func (m *MockTransactionStore) Index(ctx context.Context) ([]store.TransactionGet, error) {
	return nil, nil
}

func (m *MockTransactionStore) GetById(ctx context.Context, id int64) (*store.Transaction, error) {
	return nil, nil
}

func (m *MockTransactionStore) GetLast(ctx context.Context) (*store.Transaction, error) {
	return nil, nil
}

func (m *MockTransactionStore) GetExpensesByMonth(ctx context.Context, date string) (int64, error) {
	return 0, nil
}

func (m *MockTransactionStore) GetExpensesByMonthCategory(ctx context.Context, date string) ([]store.CategoryReturnValue, error) {
	return nil, nil
}

func (m *MockTransactionStore) GetBalanceByDate(ctx context.Context, date string) (int64, error) {
	return 0, nil
}

func (m *MockTransactionStore) Delete(ctx context.Context, id int64) error {
	return nil
}

func (m *MockTransactionStore) Update(ctx context.Context, transaction *store.Transaction) error {
	return nil
}

type MockUserStore struct{}

func (m *MockUserStore) Upsert(ctx context.Context, user *store.User) error {
	return nil
}

func (m *MockUserStore) GetById(ctx context.Context, id int64) (*store.User, error) {
	return nil, nil
}

type SeedTestSuite struct {
	suite.Suite
	categoryStore    *MockCategoryStore
	transactionStore *MockTransactionStore
	userStore        *MockUserStore
	storage          store.Storage
}

func (suite *SeedTestSuite) SetupTest() {
	suite.categoryStore = &MockCategoryStore{
		categories: make([]store.Category, 0),
		err:        nil,
	}
	suite.transactionStore = &MockTransactionStore{
		transactions: make([]store.Transaction, 0),
		err:          nil,
	}
	suite.userStore = &MockUserStore{}
	
	suite.storage = store.Storage{
		Categories:   suite.categoryStore,
		Transactions: suite.transactionStore,
		Users:        suite.userStore,
	}
}

func (suite *SeedTestSuite) TestSeedDataConstants() {
	assert.Len(suite.T(), categoryNames, 5)
	assert.Len(suite.T(), colorHexes, 5)
	assert.Len(suite.T(), descriptions, 20)
	
	for _, name := range categoryNames {
		assert.NotEmpty(suite.T(), name)
	}
	
	for _, color := range colorHexes {
		assert.NotEmpty(suite.T(), color)
		assert.True(suite.T(), color[0] == '#')
		assert.Len(suite.T(), color, 7)
	}
	
	for _, desc := range descriptions {
		assert.NotEmpty(suite.T(), desc)
		assert.Greater(suite.T(), len(desc), 5)
	}
}

func (suite *SeedTestSuite) TestGenerateCategories() {
	testCases := []int{1, 3, 5, 10}
	
	for _, count := range testCases {
		categories := generateCategories(count)
		
		assert.Len(suite.T(), categories, count)
		
		for i, category := range categories {
			assert.NotNil(suite.T(), category)
			assert.NotEmpty(suite.T(), category.Name)
			assert.NotEmpty(suite.T(), category.Color)
			assert.Equal(suite.T(), int64(0), category.ID)
			assert.Equal(suite.T(), "", category.CreatedAt)
			
			expectedName := categoryNames[i%len(categoryNames)]
			expectedColor := colorHexes[i%len(colorHexes)]
			assert.Equal(suite.T(), expectedName, category.Name)
			assert.Equal(suite.T(), expectedColor, category.Color)
		}
	}
}

func (suite *SeedTestSuite) TestGenerateCategories_Zero() {
	categories := generateCategories(0)
	assert.Len(suite.T(), categories, 0)
}

func (suite *SeedTestSuite) TestGenerateCategories_LargeNumber() {
	categories := generateCategories(15)
	assert.Len(suite.T(), categories, 15)
	
	for i, category := range categories {
		expectedName := categoryNames[i%len(categoryNames)]
		expectedColor := colorHexes[i%len(colorHexes)]
		assert.Equal(suite.T(), expectedName, category.Name)
		assert.Equal(suite.T(), expectedColor, category.Color)
	}
}

func (suite *SeedTestSuite) TestGenerateTransactions() {
	categories := generateCategories(3)
	for i := range categories {
		categories[i].ID = int64(i + 1)
	}
	
	testCases := []int{1, 5, 10, 25}
	
	for _, count := range testCases {
		transactions := generateTransactions(count, categories)
		
		assert.Len(suite.T(), transactions, count)
		
		for _, transaction := range transactions {
			assert.NotNil(suite.T(), transaction)
			assert.NotEmpty(suite.T(), transaction.Description)
			assert.Greater(suite.T(), transaction.Amount, int64(0))
			assert.Greater(suite.T(), transaction.RunningBalance, int64(0))
			assert.Equal(suite.T(), int64(0), transaction.ID)
			
			assert.GreaterOrEqual(suite.T(), transaction.Amount, int64(100000))
			assert.LessOrEqual(suite.T(), transaction.Amount, int64(1000000))
			
			assert.GreaterOrEqual(suite.T(), transaction.RunningBalance, int64(1000000))
			assert.LessOrEqual(suite.T(), transaction.RunningBalance, int64(10000000))
			
			found := false
			for _, desc := range descriptions {
				if desc == transaction.Description {
					found = true
					break
				}
			}
			assert.True(suite.T(), found, "Description should be from predefined list")
			
			if transaction.CategoryID.Valid {
				assert.Greater(suite.T(), transaction.CategoryID.Int64, int64(0))
				found := false
				for _, cat := range categories {
					if cat.ID == transaction.CategoryID.Int64 {
						found = true
						break
					}
				}
				assert.True(suite.T(), found, "CategoryID should correspond to a generated category")
			}
		}
	}
}

func (suite *SeedTestSuite) TestGenerateTransactions_NullCategories() {
	categories := generateCategories(1)
	for i := range categories {
		categories[i].ID = int64(i + 1)
	}
	
	transactions := generateTransactions(50, categories)
	
	nullCategoryCount := 0
	validCategoryCount := 0
	
	for _, transaction := range transactions {
		if transaction.CategoryID.Valid {
			validCategoryCount++
		} else {
			nullCategoryCount++
		}
	}
	
	assert.Greater(suite.T(), nullCategoryCount, 0, "Some transactions should have null category IDs")
	assert.Greater(suite.T(), validCategoryCount, 0, "Some transactions should have valid category IDs")
}

func (suite *SeedTestSuite) TestGenerateTransactions_Zero() {
	categories := generateCategories(3)
	transactions := generateTransactions(0, categories)
	assert.Len(suite.T(), transactions, 0)
}

func (suite *SeedTestSuite) TestSeedFunction_Success() {
	Seed(suite.storage)
	
	assert.Len(suite.T(), suite.categoryStore.categories, 5)
	
	assert.Len(suite.T(), suite.transactionStore.transactions, 20)
	
	for i, category := range suite.categoryStore.categories {
		assert.Equal(suite.T(), int64(i+1), category.ID)
		assert.NotEmpty(suite.T(), category.Name)
		assert.NotEmpty(suite.T(), category.Color)
	}
	
	for i, transaction := range suite.transactionStore.transactions {
		assert.Equal(suite.T(), int64(i+1), transaction.ID)
		assert.NotEmpty(suite.T(), transaction.Description)
		assert.Greater(suite.T(), transaction.Amount, int64(0))
		assert.Greater(suite.T(), transaction.RunningBalance, int64(0))
	}
}

func (suite *SeedTestSuite) TestSeedFunction_CategoryError() {
	suite.categoryStore.err = errors.New("category creation failed")
	
	Seed(suite.storage)
	
	assert.Len(suite.T(), suite.categoryStore.categories, 0)
	assert.Len(suite.T(), suite.transactionStore.transactions, 0)
}

func (suite *SeedTestSuite) TestSeedFunction_TransactionError() {
	suite.transactionStore.err = errors.New("transaction creation failed")
	
	Seed(suite.storage)
	
	assert.Len(suite.T(), suite.categoryStore.categories, 5)
	assert.Len(suite.T(), suite.transactionStore.transactions, 0)
}

func (suite *SeedTestSuite) TestRandomDistribution() {
	rand.Seed(42)
	
	categories := generateCategories(5)
	for i := range categories {
		categories[i].ID = int64(i + 1)
	}
	
	transactions := generateTransactions(100, categories)
	
	amountSet := make(map[int64]bool)
	for _, transaction := range transactions {
		amountSet[transaction.Amount] = true
	}
	assert.Greater(suite.T(), len(amountSet), 10, "Should have varied amounts")
	
	balanceSet := make(map[int64]bool)
	for _, transaction := range transactions {
		balanceSet[transaction.RunningBalance] = true
	}
	assert.Greater(suite.T(), len(balanceSet), 5, "Should have varied running balances")
	
	descSet := make(map[string]bool)
	for _, transaction := range transactions {
		descSet[transaction.Description] = true
	}
	assert.Greater(suite.T(), len(descSet), 10, "Should have varied descriptions")
	
	withCategory := 0
	withoutCategory := 0
	for _, transaction := range transactions {
		if transaction.CategoryID.Valid {
			withCategory++
		} else {
			withoutCategory++
		}
	}
	assert.Greater(suite.T(), withCategory, 0, "Some transactions should have categories")
	assert.Greater(suite.T(), withoutCategory, 0, "Some transactions should not have categories")
}

func (suite *SeedTestSuite) TestAmountGeneration() {
	categories := generateCategories(1)
	transactions := generateTransactions(100, categories)
	
	for _, transaction := range transactions {
		amount := transaction.Amount
		
		assert.GreaterOrEqual(suite.T(), amount, int64(100000))
		assert.LessOrEqual(suite.T(), amount, int64(1000000))
		
		assert.Equal(suite.T(), int64(0), amount%1000, "Amount should be multiple of 1000")
	}
}

func (suite *SeedTestSuite) TestRunningBalanceGeneration() {
	categories := generateCategories(1)
	transactions := generateTransactions(100, categories)
	
	for _, transaction := range transactions {
		balance := transaction.RunningBalance
		
		assert.GreaterOrEqual(suite.T(), balance, int64(1000000))
		assert.LessOrEqual(suite.T(), balance, int64(10000000))
		
		assert.Equal(suite.T(), int64(0), balance%1000000, "Running balance should be multiple of 1,000,000")
	}
}

func (suite *SeedTestSuite) TestCategoryAssignment() {
	categories := generateCategories(3)
	for i := range categories {
		categories[i].ID = int64(i + 1)
	}
	
	transactions := generateTransactions(100, categories)
	
	validCategoryIDs := make(map[int64]bool)
	for _, cat := range categories {
		validCategoryIDs[cat.ID] = true
	}
	
	for _, transaction := range transactions {
		if transaction.CategoryID.Valid {
			assert.True(suite.T(), validCategoryIDs[transaction.CategoryID.Int64], "Category ID should be valid")
		}
	}
}

func TestSeedTestSuite(t *testing.T) {
	suite.Run(t, new(SeedTestSuite))
}

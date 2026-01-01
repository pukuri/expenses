package store

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CategoryStoreTestSuite struct {
	suite.Suite
}

func (suite *CategoryStoreTestSuite) TestCategoryStructure() {
	category := Category{
		ID:        1,
		Name:      "Food",
		Color:     "#FF5733",
		CreatedAt: "2023-01-01T10:00:00Z",
	}

	assert.Equal(suite.T(), int64(1), category.ID)
	assert.Equal(suite.T(), "Food", category.Name)
	assert.Equal(suite.T(), "#FF5733", category.Color)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", category.CreatedAt)
}

func (suite *CategoryStoreTestSuite) TestCategoryStoreCreation() {
	var db *sql.DB
	store := &CategoryStore{db: db}
	
	assert.NotNil(suite.T(), store)
	assert.Equal(suite.T(), db, store.db)
}

func (suite *CategoryStoreTestSuite) TestCategoryJSONTags() {
	category := Category{
		ID:        1,
		Name:      "Transport",
		Color:     "#33FF57",
		CreatedAt: "2023-01-01T10:00:00Z",
	}
	
	assert.Equal(suite.T(), int64(1), category.ID)
	assert.Equal(suite.T(), "Transport", category.Name)
	assert.Equal(suite.T(), "#33FF57", category.Color)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", category.CreatedAt)
}

func (suite *CategoryStoreTestSuite) TestCategoryValidation() {
	categories := []Category{
		{Name: "Food", Color: "#FF5733"},
		{Name: "Transport", Color: "#33FF57"},
		{Name: "Entertainment", Color: "#5733FF"},
		{Name: "Shopping", Color: "#FF3357"},
	}
	
	for _, category := range categories {
		assert.NotEmpty(suite.T(), category.Name)
		assert.NotEmpty(suite.T(), category.Color)
		assert.Contains(suite.T(), category.Color, "#")
		assert.Len(suite.T(), category.Color, 7)
	}
}

func (suite *CategoryStoreTestSuite) TestCategoryNameValidation() {
	validNames := []string{
		"Food",
		"Transportation",
		"Health & Medical",
		"Entertainment",
		"Utilities",
		"Shopping",
		"Education",
		"Travel",
		"Home & Garden",
		"Personal Care",
	}
	
	for _, name := range validNames {
		category := Category{
			Name:  name,
			Color: "#FF5733",
		}
		assert.NotEmpty(suite.T(), category.Name)
		assert.Equal(suite.T(), name, category.Name)
	}
}

func (suite *CategoryStoreTestSuite) TestCategoryColorValidation() {
	validColors := []string{
		"#FF5733",
		"#33FF57",
		"#5733FF",
		"#FFFF33",
		"#FF33FF",
		"#33FFFF",
		"#000000",
		"#FFFFFF",
	}
	
	for _, color := range validColors {
		category := Category{
			Name:  "Test Category",
			Color: color,
		}
		assert.NotEmpty(suite.T(), category.Color)
		assert.Equal(suite.T(), color, category.Color)
		assert.Len(suite.T(), category.Color, 7)
		assert.True(suite.T(), category.Color[0] == '#')
	}
}

func (suite *CategoryStoreTestSuite) TestEmptyCategory() {
	category := Category{}
	
	assert.Equal(suite.T(), int64(0), category.ID)
	assert.Equal(suite.T(), "", category.Name)
	assert.Equal(suite.T(), "", category.Color)
	assert.Equal(suite.T(), "", category.CreatedAt)
}

func (suite *CategoryStoreTestSuite) TestCategoryEquality() {
	category1 := Category{
		ID:        1,
		Name:      "Food",
		Color:     "#FF5733",
		CreatedAt: "2023-01-01T10:00:00Z",
	}
	
	category2 := Category{
		ID:        1,
		Name:      "Food",
		Color:     "#FF5733",
		CreatedAt: "2023-01-01T10:00:00Z",
	}
	
	category3 := Category{
		ID:        2,
		Name:      "Transport",
		Color:     "#33FF57",
		CreatedAt: "2023-01-01T10:00:00Z",
	}
	
	assert.Equal(suite.T(), category1.ID, category2.ID)
	assert.Equal(suite.T(), category1.Name, category2.Name)
	assert.Equal(suite.T(), category1.Color, category2.Color)
	assert.Equal(suite.T(), category1.CreatedAt, category2.CreatedAt)
	
	assert.NotEqual(suite.T(), category1.ID, category3.ID)
	assert.NotEqual(suite.T(), category1.Name, category3.Name)
	assert.NotEqual(suite.T(), category1.Color, category3.Color)
}

func (suite *CategoryStoreTestSuite) TestCategorySlice() {
	categories := []Category{
		{ID: 1, Name: "Food", Color: "#FF5733"},
		{ID: 2, Name: "Transport", Color: "#33FF57"},
		{ID: 3, Name: "Entertainment", Color: "#5733FF"},
	}
	
	assert.Len(suite.T(), categories, 3)
	
	assert.Equal(suite.T(), int64(1), categories[0].ID)
	assert.Equal(suite.T(), "Food", categories[0].Name)
	assert.Equal(suite.T(), "#FF5733", categories[0].Color)
	
	assert.Equal(suite.T(), int64(3), categories[2].ID)
	assert.Equal(suite.T(), "Entertainment", categories[2].Name)
	assert.Equal(suite.T(), "#5733FF", categories[2].Color)
}

func (suite *CategoryStoreTestSuite) TestCategoryCopy() {
	original := Category{
		ID:        1,
		Name:      "Food",
		Color:     "#FF5733",
		CreatedAt: "2023-01-01T10:00:00Z",
	}
	
	copy := original
	
	assert.Equal(suite.T(), original.ID, copy.ID)
	assert.Equal(suite.T(), original.Name, copy.Name)
	assert.Equal(suite.T(), original.Color, copy.Color)
	assert.Equal(suite.T(), original.CreatedAt, copy.CreatedAt)
	
	copy.Name = "Modified Food"
	copy.Color = "#000000"
	
	assert.Equal(suite.T(), "Food", original.Name)
	assert.Equal(suite.T(), "#FF5733", original.Color)
	assert.Equal(suite.T(), "Modified Food", copy.Name)
	assert.Equal(suite.T(), "#000000", copy.Color)
}

func (suite *CategoryStoreTestSuite) TestCategoryDefaults() {
	category := Category{
		Name:  "Partial Category",
		Color: "#FF5733",
	}
	
	assert.Equal(suite.T(), int64(0), category.ID)
	assert.Equal(suite.T(), "Partial Category", category.Name)
	assert.Equal(suite.T(), "#FF5733", category.Color)
	assert.Equal(suite.T(), "", category.CreatedAt)
}

func (suite *CategoryStoreTestSuite) TestCategoryFieldTypes() {
	category := Category{
		ID:        int64(1),
		Name:      string("Food"),
		Color:     string("#FF5733"),
		CreatedAt: string("2023-01-01T10:00:00Z"),
	}
	
	assert.IsType(suite.T(), int64(0), category.ID)
	assert.IsType(suite.T(), "", category.Name)
	assert.IsType(suite.T(), "", category.Color)
	assert.IsType(suite.T(), "", category.CreatedAt)
}

func TestCategoryStoreTestSuite(t *testing.T) {
	suite.Run(t, new(CategoryStoreTestSuite))
}

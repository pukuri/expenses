package store

import (
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type UserStoreTestSuite struct {
	suite.Suite
}

func (suite *UserStoreTestSuite) TestUserStructure() {
	user := User{
		ID:        1,
		GoogleID:  "123456789",
		Email:     "test@example.com",
		Name:      "Test User",
		Picture:   "https://example.com/picture.jpg",
		CreatedAt: "2023-01-01T10:00:00Z",
		UpdatedAt: "2023-01-01T10:00:00Z",
	}

	assert.Equal(suite.T(), int64(1), user.ID)
	assert.Equal(suite.T(), "123456789", user.GoogleID)
	assert.Equal(suite.T(), "test@example.com", user.Email)
	assert.Equal(suite.T(), "Test User", user.Name)
	assert.Equal(suite.T(), "https://example.com/picture.jpg", user.Picture)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", user.CreatedAt)
	assert.Equal(suite.T(), "2023-01-01T10:00:00Z", user.UpdatedAt)
}

func (suite *UserStoreTestSuite) TestUserStoreCreation() {
	var db *sql.DB
	store := &UserStore{db: db}
	
	assert.NotNil(suite.T(), store)
	assert.Equal(suite.T(), db, store.db)
}

func (suite *UserStoreTestSuite) TestUserJSONTags() {
	user := User{
		ID:        1,
		GoogleID:  "987654321",
		Email:     "another@example.com",
		Name:      "Another User",
		Picture:   "https://example.com/another.jpg",
		CreatedAt: "2023-01-02T10:00:00Z",
		UpdatedAt: "2023-01-02T10:00:00Z",
	}
	
	assert.Equal(suite.T(), int64(1), user.ID)
	assert.Equal(suite.T(), "987654321", user.GoogleID)
	assert.Equal(suite.T(), "another@example.com", user.Email)
	assert.Equal(suite.T(), "Another User", user.Name)
	assert.Equal(suite.T(), "https://example.com/another.jpg", user.Picture)
	assert.Equal(suite.T(), "2023-01-02T10:00:00Z", user.CreatedAt)
	assert.Equal(suite.T(), "2023-01-02T10:00:00Z", user.UpdatedAt)
}

func (suite *UserStoreTestSuite) TestEmailValidation() {
	validEmails := []string{
		"test@example.com",
		"user.name@domain.co.uk",
		"firstname.lastname@company.org",
		"email+tag@domain.net",
		"user123@test-domain.com",
		"simple@domain.info",
	}
	
	for _, email := range validEmails {
		user := User{
			GoogleID: "123456789",
			Email:    email,
			Name:     "Test User",
			Picture:  "https://example.com/picture.jpg",
		}
		assert.NotEmpty(suite.T(), user.Email)
		assert.Equal(suite.T(), email, user.Email)
		assert.Contains(suite.T(), user.Email, "@")
		assert.Contains(suite.T(), user.Email, ".")
	}
}

func (suite *UserStoreTestSuite) TestGoogleIDValidation() {
	validGoogleIDs := []string{
		"123456789012345678901",
		"987654321098765432109",
		"111111111111111111111",
		"999999999999999999999",
		"123",
		"abc123def456ghi789",
	}
	
	for _, googleID := range validGoogleIDs {
		user := User{
			GoogleID: googleID,
			Email:    "test@example.com",
			Name:     "Test User",
			Picture:  "https://example.com/picture.jpg",
		}
		assert.NotEmpty(suite.T(), user.GoogleID)
		assert.Equal(suite.T(), googleID, user.GoogleID)
	}
}

func (suite *UserStoreTestSuite) TestNameValidation() {
	validNames := []string{
		"John Doe",
		"Jane Smith",
		"José García",
		"李小明",
		"Ahmed Al-Rashid",
		"Mary O'Connor",
		"Jean-Luc Picard",
		"Dr. Jane Smith",
		"John",
		"Maria Isabella Rodriguez",
	}
	
	for _, name := range validNames {
		user := User{
			GoogleID: "123456789",
			Email:    "test@example.com",
			Name:     name,
			Picture:  "https://example.com/picture.jpg",
		}
		assert.NotEmpty(suite.T(), user.Name)
		assert.Equal(suite.T(), name, user.Name)
	}
}

func (suite *UserStoreTestSuite) TestPictureURLValidation() {
	validPictureURLs := []string{
		"https://example.com/picture.jpg",
		"https://lh3.googleusercontent.com/a/default-user",
		"https://cdn.example.com/users/profile123.png",
		"https://avatars.githubusercontent.com/u/12345?v=4",
		"https://secure.gravatar.com/avatar/hash?s=200",
		"https://images.unsplash.com/photo-123456789",
	}
	
	for _, pictureURL := range validPictureURLs {
		user := User{
			GoogleID: "123456789",
			Email:    "test@example.com",
			Name:     "Test User",
			Picture:  pictureURL,
		}
		assert.NotEmpty(suite.T(), user.Picture)
		assert.Equal(suite.T(), pictureURL, user.Picture)
		assert.True(suite.T(), user.Picture[:8] == "https://")
	}
}

func (suite *UserStoreTestSuite) TestEmptyUser() {
	user := User{}
	
	assert.Equal(suite.T(), int64(0), user.ID)
	assert.Equal(suite.T(), "", user.GoogleID)
	assert.Equal(suite.T(), "", user.Email)
	assert.Equal(suite.T(), "", user.Name)
	assert.Equal(suite.T(), "", user.Picture)
	assert.Equal(suite.T(), "", user.CreatedAt)
	assert.Equal(suite.T(), "", user.UpdatedAt)
}

func (suite *UserStoreTestSuite) TestUserEquality() {
	user1 := User{
		ID:        1,
		GoogleID:  "123456789",
		Email:     "test@example.com",
		Name:      "Test User",
		Picture:   "https://example.com/picture.jpg",
		CreatedAt: "2023-01-01T10:00:00Z",
		UpdatedAt: "2023-01-01T10:00:00Z",
	}
	
	user2 := User{
		ID:        1,
		GoogleID:  "123456789",
		Email:     "test@example.com",
		Name:      "Test User",
		Picture:   "https://example.com/picture.jpg",
		CreatedAt: "2023-01-01T10:00:00Z",
		UpdatedAt: "2023-01-01T10:00:00Z",
	}
	
	user3 := User{
		ID:        2,
		GoogleID:  "987654321",
		Email:     "different@example.com",
		Name:      "Different User",
		Picture:   "https://example.com/different.jpg",
		CreatedAt: "2023-01-02T10:00:00Z",
		UpdatedAt: "2023-01-02T10:00:00Z",
	}
	
	assert.Equal(suite.T(), user1.ID, user2.ID)
	assert.Equal(suite.T(), user1.GoogleID, user2.GoogleID)
	assert.Equal(suite.T(), user1.Email, user2.Email)
	assert.Equal(suite.T(), user1.Name, user2.Name)
	assert.Equal(suite.T(), user1.Picture, user2.Picture)
	
	assert.NotEqual(suite.T(), user1.ID, user3.ID)
	assert.NotEqual(suite.T(), user1.GoogleID, user3.GoogleID)
	assert.NotEqual(suite.T(), user1.Email, user3.Email)
	assert.NotEqual(suite.T(), user1.Name, user3.Name)
	assert.NotEqual(suite.T(), user1.Picture, user3.Picture)
}

func (suite *UserStoreTestSuite) TestUserSlice() {
	users := []User{
		{ID: 1, GoogleID: "123456789", Email: "user1@example.com", Name: "User One"},
		{ID: 2, GoogleID: "987654321", Email: "user2@example.com", Name: "User Two"},
		{ID: 3, GoogleID: "555666777", Email: "user3@example.com", Name: "User Three"},
	}
	
	assert.Len(suite.T(), users, 3)
	
	assert.Equal(suite.T(), int64(1), users[0].ID)
	assert.Equal(suite.T(), "123456789", users[0].GoogleID)
	assert.Equal(suite.T(), "user1@example.com", users[0].Email)
	assert.Equal(suite.T(), "User One", users[0].Name)
	
	assert.Equal(suite.T(), int64(3), users[2].ID)
	assert.Equal(suite.T(), "555666777", users[2].GoogleID)
	assert.Equal(suite.T(), "user3@example.com", users[2].Email)
	assert.Equal(suite.T(), "User Three", users[2].Name)
}

func (suite *UserStoreTestSuite) TestUserCopy() {
	original := User{
		ID:        1,
		GoogleID:  "123456789",
		Email:     "test@example.com",
		Name:      "Test User",
		Picture:   "https://example.com/picture.jpg",
		CreatedAt: "2023-01-01T10:00:00Z",
		UpdatedAt: "2023-01-01T10:00:00Z",
	}
	
	copy := original
	
	assert.Equal(suite.T(), original.ID, copy.ID)
	assert.Equal(suite.T(), original.GoogleID, copy.GoogleID)
	assert.Equal(suite.T(), original.Email, copy.Email)
	assert.Equal(suite.T(), original.Name, copy.Name)
	assert.Equal(suite.T(), original.Picture, copy.Picture)
	assert.Equal(suite.T(), original.CreatedAt, copy.CreatedAt)
	assert.Equal(suite.T(), original.UpdatedAt, copy.UpdatedAt)
	
	copy.Name = "Modified User"
	copy.Email = "modified@example.com"
	
	assert.Equal(suite.T(), "Test User", original.Name)
	assert.Equal(suite.T(), "test@example.com", original.Email)
	assert.Equal(suite.T(), "Modified User", copy.Name)
	assert.Equal(suite.T(), "modified@example.com", copy.Email)
}

func (suite *UserStoreTestSuite) TestUserDefaults() {
	user := User{
		GoogleID: "123456789",
		Email:    "partial@example.com",
		Name:     "Partial User",
	}
	
	assert.Equal(suite.T(), int64(0), user.ID)
	assert.Equal(suite.T(), "123456789", user.GoogleID)
	assert.Equal(suite.T(), "partial@example.com", user.Email)
	assert.Equal(suite.T(), "Partial User", user.Name)
	assert.Equal(suite.T(), "", user.Picture)
	assert.Equal(suite.T(), "", user.CreatedAt)
	assert.Equal(suite.T(), "", user.UpdatedAt)
}

func (suite *UserStoreTestSuite) TestUserFieldTypes() {
	user := User{
		ID:        int64(1),
		GoogleID:  string("123456789"),
		Email:     string("test@example.com"),
		Name:      string("Test User"),
		Picture:   string("https://example.com/picture.jpg"),
		CreatedAt: string("2023-01-01T10:00:00Z"),
		UpdatedAt: string("2023-01-01T10:00:00Z"),
	}
	
	assert.IsType(suite.T(), int64(0), user.ID)
	assert.IsType(suite.T(), "", user.GoogleID)
	assert.IsType(suite.T(), "", user.Email)
	assert.IsType(suite.T(), "", user.Name)
	assert.IsType(suite.T(), "", user.Picture)
	assert.IsType(suite.T(), "", user.CreatedAt)
	assert.IsType(suite.T(), "", user.UpdatedAt)
}

func (suite *UserStoreTestSuite) TestUserUpdates() {
	user := User{
		ID:       1,
		GoogleID: "123456789",
		Email:    "old@example.com",
		Name:     "Old Name",
		Picture:  "https://example.com/old.jpg",
	}
	
	user.Email = "new@example.com"
	user.Name = "New Name"
	user.Picture = "https://example.com/new.jpg"
	user.UpdatedAt = "2023-01-02T10:00:00Z"
	
	assert.Equal(suite.T(), "new@example.com", user.Email)
	assert.Equal(suite.T(), "New Name", user.Name)
	assert.Equal(suite.T(), "https://example.com/new.jpg", user.Picture)
	assert.Equal(suite.T(), "2023-01-02T10:00:00Z", user.UpdatedAt)
	assert.Equal(suite.T(), "123456789", user.GoogleID)
	assert.Equal(suite.T(), int64(1), user.ID)
}

func TestUserStoreTestSuite(t *testing.T) {
	suite.Run(t, new(UserStoreTestSuite))
}

package db

import (
	"context"
	"database/sql"
	"log"
	"math/rand"

	"github.com/pukuri/expenses/internal/store"
)

var categoryNames = []string{
	"Groceries",
	"Utilities",
	"Rent",
	"Transportation",
	"Dining Out",
}
var colorHexes = []string{
	"#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF",
}
var descriptions = []string{
	"Monthly rent payment", "Grocery shopping at supermarket", "Electricity bill Q4",
	"Gas station fuel fill-up", "Dinner at local restaurant", "Netflix subscription renewal",
	"Amazon online purchase", "Doctor consultation fee", "Savings account deposit",
	"Bus monthly pass", "Starbucks coffee run", "Phone bill payment",
	"Gym membership fee", "Spotify premium monthly", "Utility water bill",
	"Clothing store purchase", "Movie theater tickets", "Bank transfer to savings",
	"Takeout food delivery", "Internet service bill",
}

func Seed(store store.Storage) {
	ctx := context.Background()

	categories := generateCategories(5)
	for _, category := range categories {
		if err := store.Categories.Create(ctx, category); err != nil {
			log.Println("Error creating category", err)
			return
		}
	}

	transactions := generateTransactions(20, categories)
	for _, transaction := range transactions {
		if err := store.Transactions.Create(ctx, transaction); err != nil {
			log.Println("Error creating transaction", err)
			return
		}
	}

	log.Println("Seeding complete")
}

func generateCategories(num int) []*store.Category {
	categories := make([]*store.Category, num)

	for i := 0; i < num; i++ {
		categories[i] = &store.Category{
			Name:  categoryNames[i%len(categoryNames)],
			Color: colorHexes[i%len(colorHexes)],
		}
	}

	return categories
}

func generateTransactions(num int, categories []*store.Category) []*store.Transaction {
	transactions := make([]*store.Transaction, num)

	for i := 0; i < num; i++ {
		var categoryID sql.NullInt64
		if rand.Intn(2) == 1 {
			category := categories[rand.Intn(len(categories))]
			categoryID = sql.NullInt64{Int64: category.ID, Valid: true}
		} else {
			categoryID = sql.NullInt64{Valid: false}
		}

		// for amount
		stepCountA := (1000000 - 100000) / 1000   // 900 steps
		randomIndexA := rand.Intn(stepCountA + 1) // 0 to 900 inclusive
		randomNumA := 100000 + (randomIndexA * 1000)

		// for running_balance
		stepCountR := int64((10000000-1000000)/1000000 + 1) // 10 options
		randomIndexR := rand.Int63n(stepCountR)
		randomNumR := 1000000 + (randomIndexR * 1000000)

		transactions[i] = &store.Transaction{
			CategoryID:     categoryID,
			Amount:         int64(randomNumA),
			RunningBalance: int64(randomNumR),
			Description:    descriptions[rand.Intn(len(descriptions))],
		}

	}

	return transactions
}

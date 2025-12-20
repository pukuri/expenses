package main

import (
	"fmt"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	// Print BEFORE HTTP server
	fmt.Fprintf(os.Stderr, "=== STARTUP SUCCESS ===\n")
	fmt.Fprintf(os.Stderr, "DB_PASS_LEN=%d\n", len(os.Getenv("DB_PASSWORD")))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ALIVE - PASS_LEN=%d\n", len(os.Getenv("DB_PASSWORD")))
	})

	fmt.Fprintf(os.Stderr, "HTTP server starting...\n")
	http.ListenAndServe(":8080", nil)
	// cfg, err := config.Load()
	// if err != nil {
	// 	// fmt.Fatal("cannot load config:", err)
	// 	fmt.Printf("cannot load config:", err)
	// 	return
	// }

	// conn, err := db.New(cfg)
	// if err != nil {
	// 	fmt.Printf("DB_USER='%s'\n", cfg.DB.User)
	// 	fmt.Printf("DB_PASSWORD='%s'\n", cfg.DB.Password)
	// 	fmt.Printf("DB_NAME='%s'\n", cfg.DB.Name)
	// 	fmt.Printf("INSTANCE_CONNECTION_NAME='%s'\n", cfg.DB.InstanceConnectionName)

	// 	fmt.Printf("SQL.OPEN ERROR: %v\n", err)
	// 	return
	// }

	// defer conn.Close()

	// store := store.NewStorage(conn)
	// db.Seed(store)
}

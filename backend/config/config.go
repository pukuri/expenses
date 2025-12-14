package config

import (
	"log"

	"github.com/caarlos0/env/v6"
	"github.com/joho/godotenv"
)

type Config struct {
	Addr string `env:"ADDR" envDefault:":8080"`
}

func Load() (*Config, error) {
	// It's a good practice to log that we are loading the .env file
	log.Println("Loading .env file")
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

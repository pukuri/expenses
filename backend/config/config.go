package config

import (
	"log"

	"github.com/caarlos0/env/v6"
	"github.com/joho/godotenv"
)

type DBConfig struct {
	Addr         string `env:"DB_ADDR"`
	MaxOpenConns int    `env:"DB_MAX_OPEN_CONNS" envDefault:"25"`
	MaxIdleConns int    `env:"DB_MAX_IDLE_CONNS" envDefault:"25"`
	MaxIdleTime  string `env:"DB_MAX_IDLE_TIME"  envDefault:"15m"`
}

type Config struct {
	Addr string `env:"ADDR" envDefault:":8080"`
	DB   DBConfig
	Env  string `env:"ENV" envDefault:"development"`
}

func Load() (*Config, error) {
	log.Println("Loading .env file")

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

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

type GoogleConfig struct {
	ClientID     string `env:"GOAUTH_CLIENT_ID"`
	ClientSecret string `env:"GOAUTH_CLIENT_SECRET"`
	RedirectUri  string `env:"GOOGLE_REDIRECT_URI"`
}

type Config struct {
	Addr            string `env:"ADDR" envDefault:"0.0.0.0:8080"`
	DB              DBConfig
	Env             string `env:"ENV" envDefault:"development"`
	Google          GoogleConfig
	JwtSecret       string `env:"JWT_SECRET"`
	AllowedGoogleID string `env:"ALLOWED_GOOGLE_ID"`
	FrontendURL     string `env:"FRONTEND_URL"`
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

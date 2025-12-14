package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadConfig(t *testing.T) {
	// Create a temporary .env file
	content := []byte("ADDR=:8081")
	tmpfile, err := os.Create(".env")
	assert.NoError(t, err)
	defer os.Remove(tmpfile.Name()) // clean up

	_, err = tmpfile.Write(content)
	assert.NoError(t, err)
	err = tmpfile.Close()
	assert.NoError(t, err)

	// Load the config
	cfg, err := Load()
	assert.NoError(t, err)

	// Assert the values
	assert.Equal(t, ":8081", cfg.Addr)
}

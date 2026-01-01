package config

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoadConfig(t *testing.T) {
	content := []byte("ADDR=0.0.0.0")
	tmpfile, err := os.Create(".env")
	assert.NoError(t, err)
	defer os.Remove(tmpfile.Name())

	_, err = tmpfile.Write(content)
	assert.NoError(t, err)
	err = tmpfile.Close()
	assert.NoError(t, err)

	cfg, err := Load()
	assert.NoError(t, err)

	assert.Equal(t, "0.0.0.0:8080", cfg.Addr)
}

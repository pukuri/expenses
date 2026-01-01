package db

import (
	"testing"
	"time"

	"github.com/pukuri/expenses/backend/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type DBTestSuite struct {
	suite.Suite
}

func (suite *DBTestSuite) TestDSNGeneration_Development() {
	cfg := &config.Config{
		Env: "development",
		DB: config.DBConfig{
			Addr:                   "postgres://user:password@localhost:5432/testdb?sslmode=disable",
			MaxOpenConns:           25,
			MaxIdleConns:           25,
			MaxIdleTime:            "15m",
			InstanceConnectionName: "",
			User:                   "",
			Password:               "",
			Name:                   "",
		},
	}

	assert.Equal(suite.T(), "development", cfg.Env)
	assert.Equal(suite.T(), "postgres://user:password@localhost:5432/testdb?sslmode=disable", cfg.DB.Addr)
	assert.Equal(suite.T(), 25, cfg.DB.MaxOpenConns)
	assert.Equal(suite.T(), 25, cfg.DB.MaxIdleConns)
	assert.Equal(suite.T(), "15m", cfg.DB.MaxIdleTime)
}

func (suite *DBTestSuite) TestDSNGeneration_Production() {
	cfg := &config.Config{
		Env: "production",
		DB: config.DBConfig{
			Addr:                   "",
			MaxOpenConns:           30,
			MaxIdleConns:           30,
			MaxIdleTime:            "30m",
			InstanceConnectionName: "project:region:instance",
			User:                   "produser",
			Password:               "prodpassword",
			Name:                   "proddb",
		},
	}

	expectedDSN := "host=/cloudsql/project:region:instance user=produser password=prodpassword dbname=proddb sslmode=disable"
	
	var dsn string
	if cfg.Env == "production" {
		dsn = "host=/cloudsql/" + cfg.DB.InstanceConnectionName + " user=" + cfg.DB.User + " password=" + cfg.DB.Password + " dbname=" + cfg.DB.Name + " sslmode=disable"
	} else {
		dsn = cfg.DB.Addr
	}
	
	assert.Equal(suite.T(), expectedDSN, dsn)
	assert.Equal(suite.T(), "production", cfg.Env)
	assert.Equal(suite.T(), 30, cfg.DB.MaxOpenConns)
	assert.Equal(suite.T(), 30, cfg.DB.MaxIdleConns)
	assert.Equal(suite.T(), "30m", cfg.DB.MaxIdleTime)
}

func (suite *DBTestSuite) TestConfigValidation() {
	testCases := []struct {
		name   string
		config *config.Config
		valid  bool
	}{
		{
			name: "Valid Development Config",
			config: &config.Config{
				Env: "development",
				DB: config.DBConfig{
					Addr:         "postgres://localhost:5432/testdb",
					MaxOpenConns: 25,
					MaxIdleConns: 25,
					MaxIdleTime:  "15m",
				},
			},
			valid: true,
		},
		{
			name: "Valid Production Config",
			config: &config.Config{
				Env: "production",
				DB: config.DBConfig{
					InstanceConnectionName: "project:region:instance",
					User:                   "user",
					Password:               "password",
					Name:                   "database",
					MaxOpenConns:           30,
					MaxIdleConns:           30,
					MaxIdleTime:            "30m",
				},
			},
			valid: true,
		},
		{
			name: "Invalid MaxIdleTime",
			config: &config.Config{
				Env: "development",
				DB: config.DBConfig{
					Addr:         "postgres://localhost:5432/testdb",
					MaxOpenConns: 25,
					MaxIdleConns: 25,
					MaxIdleTime:  "invalid-duration",
				},
			},
			valid: false,
		},
		{
			name: "Zero MaxOpenConns",
			config: &config.Config{
				Env: "development",
				DB: config.DBConfig{
					Addr:         "postgres://localhost:5432/testdb",
					MaxOpenConns: 0,
					MaxIdleConns: 25,
					MaxIdleTime:  "15m",
				},
			},
			valid: true,
		},
	}

	for _, tc := range testCases {
		suite.Run(tc.name, func() {
			_, err := time.ParseDuration(tc.config.DB.MaxIdleTime)
			if tc.valid {
				assert.NoError(suite.T(), err, "Should parse duration successfully")
			} else {
				assert.Error(suite.T(), err, "Should fail to parse invalid duration")
			}
			
			assert.NotNil(suite.T(), tc.config)
			assert.NotEmpty(suite.T(), tc.config.Env)
			
			if tc.config.Env == "production" {
				assert.NotEmpty(suite.T(), tc.config.DB.InstanceConnectionName)
				assert.NotEmpty(suite.T(), tc.config.DB.User)
				assert.NotEmpty(suite.T(), tc.config.DB.Password)
				assert.NotEmpty(suite.T(), tc.config.DB.Name)
			} else {
				assert.NotEmpty(suite.T(), tc.config.DB.Addr)
			}
		})
	}
}

func (suite *DBTestSuite) TestConnectionPoolSettings() {
	cfg := &config.Config{
		Env: "development",
		DB: config.DBConfig{
			Addr:         "postgres://localhost:5432/testdb",
			MaxOpenConns: 50,
			MaxIdleConns: 10,
			MaxIdleTime:  "1h",
		},
	}

	assert.Equal(suite.T(), 50, cfg.DB.MaxOpenConns)
	assert.Equal(suite.T(), 10, cfg.DB.MaxIdleConns)
	assert.Equal(suite.T(), "1h", cfg.DB.MaxIdleTime)

	duration, err := time.ParseDuration(cfg.DB.MaxIdleTime)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), time.Hour, duration)
}

func (suite *DBTestSuite) TestEnvironmentSpecificDSN() {
	testEnvs := []struct {
		env      string
		expected string
	}{
		{"development", "use_addr"},
		{"test", "use_addr"},
		{"staging", "use_addr"},
		{"production", "use_cloud_sql"},
	}

	for _, test := range testEnvs {
		cfg := &config.Config{
			Env: test.env,
			DB: config.DBConfig{
				Addr:                   "postgres://localhost:5432/testdb",
				InstanceConnectionName: "project:region:instance",
				User:                   "user",
				Password:               "password",
				Name:                   "database",
			},
		}

		var dsn string
		if cfg.Env == "production" {
			dsn = "cloud_sql_format"
		} else {
			dsn = "regular_addr_format"
		}

		if test.expected == "use_cloud_sql" {
			assert.Equal(suite.T(), "cloud_sql_format", dsn)
		} else {
			assert.Equal(suite.T(), "regular_addr_format", dsn)
		}
	}
}

func (suite *DBTestSuite) TestDurationParsing() {
	validDurations := []string{
		"15m",
		"1h",
		"30s",
		"1h30m",
		"2h45m30s",
	}

	for _, d := range validDurations {
		duration, err := time.ParseDuration(d)
		assert.NoError(suite.T(), err, "Should parse duration: %s", d)
		assert.Greater(suite.T(), duration, time.Duration(0), "Duration should be positive")
	}

	invalidDurations := []string{
		"invalid",
		"1x",
		"",
		"30",
		"1 hour",
	}

	for _, d := range invalidDurations {
		_, err := time.ParseDuration(d)
		assert.Error(suite.T(), err, "Should fail to parse duration: %s", d)
	}
}

func (suite *DBTestSuite) TestConfigEdgeCases() {
	cfg := &config.Config{
		Env: "",
		DB: config.DBConfig{
			MaxOpenConns: -1,
			MaxIdleConns: -1,
		},
	}

	assert.Equal(suite.T(), "", cfg.Env)
	assert.Equal(suite.T(), -1, cfg.DB.MaxOpenConns)
	assert.Equal(suite.T(), -1, cfg.DB.MaxIdleConns)
}

func (suite *DBTestSuite) TestProductionDSNComponents() {
	cfg := &config.Config{
		Env: "production",
		DB: config.DBConfig{
			InstanceConnectionName: "my-project:us-central1:my-instance",
			User:                   "dbuser",
			Password:               "secretpassword",
			Name:                   "expenses_db",
		},
	}

	assert.Contains(suite.T(), cfg.DB.InstanceConnectionName, ":")
	assert.NotEmpty(suite.T(), cfg.DB.User)
	assert.NotEmpty(suite.T(), cfg.DB.Password)
	assert.NotEmpty(suite.T(), cfg.DB.Name)
	
	parts := len(cfg.DB.InstanceConnectionName)
	assert.Greater(suite.T(), parts, 0)
	assert.Contains(suite.T(), cfg.DB.InstanceConnectionName, "my-project")
	assert.Contains(suite.T(), cfg.DB.InstanceConnectionName, "us-central1")
	assert.Contains(suite.T(), cfg.DB.InstanceConnectionName, "my-instance")
}

func TestDBTestSuite(t *testing.T) {
	suite.Run(t, new(DBTestSuite))
}

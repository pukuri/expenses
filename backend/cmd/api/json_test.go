package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/pukuri/expenses/backend/config"
	"github.com/pukuri/expenses/backend/internal/store"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type JSONTestSuite struct {
	suite.Suite
	app *application
}

func (suite *JSONTestSuite) SetupTest() {
	cfg := &config.Config{
		Addr: "0.0.0.0",
		Env:  "test",
	}
	suite.app = &application{config: cfg, store: store.NewStorage(nil)}
}

func (suite *JSONTestSuite) TestNullableInt64_UnmarshalJSON_ValidInteger() {
	var ni NullableInt64

	err := ni.UnmarshalJSON([]byte("123"))
	assert.NoError(suite.T(), err)
	assert.True(suite.T(), ni.Valid)
	assert.Equal(suite.T(), int64(123), ni.Int64)

	err = ni.UnmarshalJSON([]byte("-456"))
	assert.NoError(suite.T(), err)
	assert.True(suite.T(), ni.Valid)
	assert.Equal(suite.T(), int64(-456), ni.Int64)
}

func (suite *JSONTestSuite) TestNullableInt64_UnmarshalJSON_NullValue() {
	var ni NullableInt64

	err := ni.UnmarshalJSON([]byte("null"))
	assert.NoError(suite.T(), err)
	assert.False(suite.T(), ni.Valid)
}

func (suite *JSONTestSuite) TestNullableInt64_UnmarshalJSON_ZeroValue() {
	var ni NullableInt64

	err := ni.UnmarshalJSON([]byte("0"))
	assert.NoError(suite.T(), err)
	assert.False(suite.T(), ni.Valid)
}

func (suite *JSONTestSuite) TestNullableInt64_UnmarshalJSON_InvalidJSON() {
	var ni NullableInt64

	err := ni.UnmarshalJSON([]byte("invalid"))
	assert.Error(suite.T(), err)
}

func (suite *JSONTestSuite) TestNullableInt64_UnmarshalJSON_NonInteger() {
	var ni NullableInt64

	err := ni.UnmarshalJSON([]byte("\"string\""))
	assert.Error(suite.T(), err)

	err = ni.UnmarshalJSON([]byte("12.34"))
	assert.Error(suite.T(), err)
}

func (suite *JSONTestSuite) TestWriteJSON_Success() {
	rr := httptest.NewRecorder()
	data := map[string]string{"message": "test"}

	err := writeJSON(rr, http.StatusOK, data)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "test", response["message"])
}

func (suite *JSONTestSuite) TestWriteJSON_ComplexStruct() {
	rr := httptest.NewRecorder()
	data := struct {
		ID    int      `json:"id"`
		Name  string   `json:"name"`
		Tags  []string `json:"tags"`
		Valid bool     `json:"valid"`
	}{
		ID:    1,
		Name:  "test item",
		Tags:  []string{"tag1", "tag2"},
		Valid: true,
	}

	err := writeJSON(rr, http.StatusCreated, data)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), http.StatusCreated, rr.Code)

	var response map[string]interface{}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), float64(1), response["id"])
	assert.Equal(suite.T(), "test item", response["name"])
	assert.Equal(suite.T(), true, response["valid"])
}

func (suite *JSONTestSuite) TestWriteJSON_StatusCode() {
	testCases := []int{
		http.StatusOK,
		http.StatusCreated,
		http.StatusNoContent,
		http.StatusBadRequest,
		http.StatusInternalServerError,
	}

	for _, statusCode := range testCases {
		rr := httptest.NewRecorder()
		data := map[string]int{"status": statusCode}

		err := writeJSON(rr, statusCode, data)
		assert.NoError(suite.T(), err)
		assert.Equal(suite.T(), statusCode, rr.Code)
	}
}

func (suite *JSONTestSuite) TestReadJSON_Success() {
	data := map[string]string{"name": "test"}
	jsonData, _ := json.Marshal(data)

	req := httptest.NewRequest("POST", "/test", bytes.NewReader(jsonData))
	rr := httptest.NewRecorder()

	var result map[string]string
	err := readJSON(rr, req, &result)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "test", result["name"])
}

func (suite *JSONTestSuite) TestReadJSON_MaxSizeExceeded() {
	largeData := make(map[string]string)
	largeString := strings.Repeat("a", 1048579) // Just over 1MB
	largeData["large"] = largeString
	jsonData, _ := json.Marshal(largeData)

	req := httptest.NewRequest("POST", "/test", bytes.NewReader(jsonData))
	rr := httptest.NewRecorder()

	var result map[string]string
	err := readJSON(rr, req, &result)
	assert.Error(suite.T(), err)
}

func (suite *JSONTestSuite) TestReadJSON_UnknownFields() {
	type TestStruct struct {
		Name string `json:"name"`
	}

	jsonData := []byte(`{"name": "test", "unknown": "field"}`)

	req := httptest.NewRequest("POST", "/test", bytes.NewReader(jsonData))
	rr := httptest.NewRecorder()

	var result TestStruct
	err := readJSON(rr, req, &result)
	assert.Error(suite.T(), err)
}

func (suite *JSONTestSuite) TestReadJSON_InvalidJSON() {
	invalidJSON := []byte(`{"name": "test"`)

	req := httptest.NewRequest("POST", "/test", bytes.NewReader(invalidJSON))
	rr := httptest.NewRecorder()

	var result map[string]string
	err := readJSON(rr, req, &result)
	assert.Error(suite.T(), err)
}

func (suite *JSONTestSuite) TestReadJSON_EmptyBody() {
	req := httptest.NewRequest("POST", "/test", bytes.NewReader([]byte{}))
	rr := httptest.NewRecorder()

	var result map[string]string
	err := readJSON(rr, req, &result)
	assert.Error(suite.T(), err)
}

func (suite *JSONTestSuite) TestWriteJSONError_Success() {
	rr := httptest.NewRecorder()
	message := "Something went wrong"

	err := writeJSONError(rr, http.StatusBadRequest, message)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), message, response["error"])
}

func (suite *JSONTestSuite) TestWriteJSONError_StatusCodes() {
	testCases := []struct {
		status  int
		message string
	}{
		{http.StatusBadRequest, "Bad request"},
		{http.StatusUnauthorized, "Unauthorized"},
		{http.StatusForbidden, "Forbidden"},
		{http.StatusNotFound, "Not found"},
		{http.StatusInternalServerError, "Internal server error"},
	}

	for _, tc := range testCases {
		rr := httptest.NewRecorder()

		err := writeJSONError(rr, tc.status, tc.message)
		assert.NoError(suite.T(), err)
		assert.Equal(suite.T(), tc.status, rr.Code)

		var response map[string]string
		err = json.Unmarshal(rr.Body.Bytes(), &response)
		assert.NoError(suite.T(), err)
		assert.Equal(suite.T(), tc.message, response["error"])
	}
}

func (suite *JSONTestSuite) TestWriteJSONError_MessageContent() {
	rr := httptest.NewRecorder()
	message := "Test error message"

	err := writeJSONError(rr, http.StatusBadRequest, message)
	assert.NoError(suite.T(), err)

	var response struct {
		Error string `json:"error"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), message, response.Error)
}

func (suite *JSONTestSuite) TestJsonResponse_Success() {
	rr := httptest.NewRecorder()
	data := map[string]string{"message": "success"}

	err := suite.app.jsonResponse(rr, http.StatusOK, data)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, rr.Code)
	assert.Equal(suite.T(), "application/json", rr.Header().Get("Content-Type"))

	var response struct {
		Data map[string]string `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "success", response.Data["message"])
}

func (suite *JSONTestSuite) TestJsonResponse_NilData() {
	rr := httptest.NewRecorder()

	err := suite.app.jsonResponse(rr, http.StatusOK, nil)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data interface{} `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Nil(suite.T(), response.Data)
}

func (suite *JSONTestSuite) TestJsonResponse_ComplexData() {
	rr := httptest.NewRecorder()
	data := struct {
		Users []map[string]interface{} `json:"users"`
		Count int                      `json:"count"`
		Meta  map[string]string        `json:"meta"`
	}{
		Users: []map[string]interface{}{
			{"id": 1, "name": "John"},
			{"id": 2, "name": "Jane"},
		},
		Count: 2,
		Meta:  map[string]string{"page": "1", "limit": "10"},
	}

	err := suite.app.jsonResponse(rr, http.StatusOK, data)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, rr.Code)

	var response struct {
		Data struct {
			Users []map[string]interface{} `json:"users"`
			Count int                      `json:"count"`
			Meta  map[string]string        `json:"meta"`
		} `json:"data"`
	}
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), response.Data.Users, 2)
	assert.Equal(suite.T(), 2, response.Data.Count)
	assert.Equal(suite.T(), "1", response.Data.Meta["page"])
}

func (suite *JSONTestSuite) TestJsonResponse_StatusCode() {
	testCases := []int{
		http.StatusOK,
		http.StatusCreated,
		http.StatusAccepted,
	}

	for _, statusCode := range testCases {
		rr := httptest.NewRecorder()
		data := map[string]int{"status": statusCode}

		err := suite.app.jsonResponse(rr, statusCode, data)
		assert.NoError(suite.T(), err)
		assert.Equal(suite.T(), statusCode, rr.Code)

		var response struct {
			Data map[string]int `json:"data"`
		}
		err = json.Unmarshal(rr.Body.Bytes(), &response)
		assert.NoError(suite.T(), err)
		assert.Equal(suite.T(), statusCode, response.Data["status"])
	}
}

func TestJSONTestSuite(t *testing.T) {
	suite.Run(t, new(JSONTestSuite))
}

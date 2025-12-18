package main

import (
	"log"
	"net/http"
)

func (app *application) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("internal server error: %s path: %s error: %s", r.Method, r.URL.Path, err)
	writeJSONError(w, http.StatusInternalServerError, "the server encountered a problem")
}

func (app *application) badRequest(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("bad request: %s path: %s error: %s", r.Method, r.URL.Path, err)
	writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (app *application) notFound(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("not found: %s path: %s error: %s", r.Method, r.URL.Path, err)
	writeJSONError(w, http.StatusNotFound, "resource not found")
}

func (app *application) forbidden(w http.ResponseWriter, r *http.Request, err error) {
	log.Printf("forbidden: found: %s path: %s error: %s", r.Method, r.URL.Path, err)
	writeJSONError(w, http.StatusForbidden, "Access denied. Only authorized account allowed.")
}

FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.17.1/migrate.linux-amd64.tar.gz | tar xz -C /usr/local/bin migrate
COPY . .
WORKDIR /app/cmd/api
RUN go build -o /bin/api .
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /bin/api .
EXPOSE 8080
CMD ["./api"]
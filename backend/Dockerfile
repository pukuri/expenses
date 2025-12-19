FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
WORKDIR /app/cmd/api
RUN go build -o /bin/api .
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /bin/api .
EXPOSE 8080
CMD ["./api"]
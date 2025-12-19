FROM golang:1.25-alpine AS builder
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY . .
RUN go mod download

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
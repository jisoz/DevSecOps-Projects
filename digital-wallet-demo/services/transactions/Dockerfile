# Build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -o main .

# Final stage
FROM alpine:latest
WORKDIR /app

COPY --from=builder /app/main .
COPY --from=builder /app/config.docker.yaml .
COPY --from=builder /app/migrations ./migrations/

EXPOSE 8082
CMD ["./main", "server", "--config", "config.docker.yaml"]


# FROM golang:1.24-alpine
# → Start from lightweight Go image to build the app.

# WORKDIR /app
# → Create working folder inside the container.

# COPY go.mod go.sum
# → Copy dependency files.

# RUN go mod download
# → Download all Go dependencies into the container.

# COPY . .
# → Copy all source code (handlers, config, migrations, main.go …)

# RUN CGO_ENABLED=0 GOOS=linux go build
# → Build the Go application statically to a file named main.

# 👉 This creates a single compiled binary = /app/main


# FROM alpine:latest
# → The final container is super small (only 5 MB).

# COPY --from=builder /app/main .
# → Copy compiled app into this final container.

# COPY ... config & migrations
# → Copy configuration and database migrations.

# EXPOSE 8082
# → Tells Docker that the backend listens on port 8082 inside the container.

# CMD ["./main", "server", "--config", "config.docker.yaml"]
# → Start the Go application.
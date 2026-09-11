# syntax=docker/dockerfile:1
FROM golang:1.23-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/sana-api ./cmd/api \
    && CGO_ENABLED=0 GOOS=linux go build -o /out/sana-migrate ./cmd/sana-migrate

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata wget
COPY --from=build /out/sana-api /usr/local/bin/sana-api
COPY --from=build /out/sana-migrate /usr/local/bin/sana-migrate
EXPOSE 9000
ENTRYPOINT ["sana-api"]
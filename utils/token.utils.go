package utils

import (
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v4"
	"time"
)

type SignedDetails struct {
	Email    string
	name     string
	Uid      string
	UserType string
	jwt.RegisteredClaims
}
type RefreshDetails struct {
	Email string
	jwt.RegisteredClaims
}

func GenerateJWT(
	email string,
	fn string,
	ln string,
	id string,
	userType string) (tokenString string, err error) {
	//expirationTime := time.Now().Add(1 * time.Hour)
	claims := &SignedDetails{
		Email:    email,
		name:     fmt.Sprintf("%s %s", fn, ln),
		Uid:      id,
		UserType: userType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(EnvData.SkKey))
}

func GenerateRefreshJWT(email string) (string, error) {
	claims := &RefreshDetails{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(120 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(EnvData.SkRefreshKey))
}

func ValidateToken(signedToken string) (err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&SignedDetails{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(EnvData.SkKey), nil
		},
	)
	if err != nil {
		return nil
	}
	claims, ok := token.Claims.(*SignedDetails)
	if !ok {
		err = errors.New("couldn't parse claims")
		return err
	}
	if claims.ExpiresAt.Unix() < time.Now().Local().Unix() {
		err = errors.New("token expired")
		return err
	}
	return nil
}

func ValidateRefreshToken(signedToken string) (err error) {
	token, err := jwt.ParseWithClaims(
		signedToken,
		&RefreshDetails{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(EnvData.SkRefreshKey), nil
		},
	)
	if err != nil {
		return nil
	}
	claims, ok := token.Claims.(*RefreshDetails)
	if !ok {
		err = errors.New("couldn't parse claims")
		return err
	}
	if claims.ExpiresAt.Unix() < time.Now().Local().Unix() {
		err = errors.New("refresh token expired")
		return err
	}
	return nil
}

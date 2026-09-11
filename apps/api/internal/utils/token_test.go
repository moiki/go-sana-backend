package utils

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestGenerateJWTAndValidate(t *testing.T) {
	token, err := GenerateJWT("cashier@sana.app", "Ana", "Perez", "usr-123", "cashier")
	require.NoError(t, err)
	require.NotEmpty(t, token)

	require.NoError(t, ValidateToken(token))

	require.Error(t, ValidateToken("not-a-real-jwt"))
}

func TestGenerateRefreshJWTAndExtract(t *testing.T) {
	refresh, err := GenerateRefreshJWT("cashier@sana.app", 24*time.Hour)
	require.NoError(t, err)
	require.NotEmpty(t, refresh)

	require.NoError(t, ValidateRefreshToken(refresh))

	email, err := ExtractEmailFromRefreshToken(refresh)
	require.NoError(t, err)
	require.Equal(t, "cashier@sana.app", email)
}

func TestGenerateRefreshJWTsAreUnique(t *testing.T) {
	a, err := GenerateRefreshJWT("cashier@sana.app", 24*time.Hour)
	require.NoError(t, err)
	b, err := GenerateRefreshJWT("cashier@sana.app", 24*time.Hour)
	require.NoError(t, err)
	require.NotEqual(t, a, b, "refresh tokens must be unique (jti)")
}

func TestValidateRefreshTokenRejectsExpired(t *testing.T) {
	expired, err := GenerateRefreshJWT("cashier@sana.app", -time.Hour)
	require.NoError(t, err)
	require.Error(t, ValidateRefreshToken(expired))
}

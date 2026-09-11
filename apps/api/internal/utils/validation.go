package utils

import "gopkg.in/go-playground/validator.v9"

// ModelValidation validates structs tagged with `validate:"..."`.
var ModelValidation = validator.New()

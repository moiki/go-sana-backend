package config

import "testing"

func TestEnvOrFallback(t *testing.T) {
	t.Setenv("SANA_TEST_UNSET_VAR", "")
	if got := envOr("SANA_TEST_UNSET_VAR", "fallback"); got != "fallback" {
		t.Errorf("envOr() = %q, want fallback", got)
	}
}

func TestEnvOrValue(t *testing.T) {
	t.Setenv("SANA_TEST_SET_VAR", "present")
	if got := envOr("SANA_TEST_SET_VAR", "fallback"); got != "present" {
		t.Errorf("envOr() = %q, want present", got)
	}
}

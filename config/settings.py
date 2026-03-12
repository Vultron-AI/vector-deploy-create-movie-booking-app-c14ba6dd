import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# =============================================================================
# Core Settings
# =============================================================================
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-change-this-in-production")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# TODO: update this
ALLOWED_HOSTS = ["*"]

# =============================================================================
# Applications
# =============================================================================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    # Local apps
    "shared",
    "accounts",
]

# Custom User Model
AUTH_USER_MODEL = "accounts.User"

# =============================================================================
# Middleware
# =============================================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# =============================================================================
# URL & Template Configuration
# =============================================================================
ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# =============================================================================
# Database
# =============================================================================
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("libsql://"):
    # Turso/libSQL database (per-app isolated database)
    # Uses django-libsql backend (github.com/Vultron-AI/django-libsql)
    # DATABASE_URL format: libsql://{hostname}?authToken={token}
    import urllib.parse as _urlparse

    _parsed = _urlparse.urlparse(DATABASE_URL)
    _auth_token = _urlparse.parse_qs(_parsed.query).get("authToken", [""])[0]
    DATABASES = {
        "default": {
            "ENGINE": "django_libsql.db.backends.sqlite3",
            "NAME": f"libsql://{_parsed.hostname}",
            "PASSWORD": _auth_token,
        }
    }
elif DATABASE_URL:
    # PostgreSQL (legacy/fallback)
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
        )
    }
else:
    # Fallback to SQLite for offline/local development
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# =============================================================================
# Password Validation
# =============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# =============================================================================
# Internationalization
# =============================================================================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# =============================================================================
# Static Files
# =============================================================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Vite-built frontend assets live in frontend/dist/ after the build step.
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

# Django admin/DRF static files are collected via collectstatic to STATIC_ROOT.
# Frontend assets are NOT collected here — they're served at the web root via
# WHITENOISE_ROOT below so that Vite's default base='/' asset references
# (e.g. /assets/index-abc123.js) resolve correctly.
STATICFILES_DIRS = []

# Serve Vite build output at the web root.  WhiteNoise middleware handles these
# requests before Django URL dispatch, so /assets/*.js is served directly and
# never hits the SPA catch-all.  Without this, assets would only be reachable
# at /static/assets/ which doesn't match what index.html references.
if FRONTEND_DIST.exists():
    WHITENOISE_ROOT = str(FRONTEND_DIST)

# Storage backends (Django 5.x format)
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

APPEND_SLASH = True

# =============================================================================
# REST Framework
# =============================================================================
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # DevAutoAuthentication auto-authenticates in DEBUG mode when no JWT is provided
        "shared.authentication.DevAutoAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

# =============================================================================
# JWT Configuration
# =============================================================================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# =============================================================================
# CORS Settings
# =============================================================================
CORS_ALLOW_ALL_ORIGINS = True  # For development; restrict in production
CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# CSRF Settings
# =============================================================================
# Trust e2b sandbox origins (dynamic subdomains)
CSRF_TRUSTED_ORIGINS = [
    "https://*.e2b.app",
]

# =============================================================================
# Session Configuration
# =============================================================================
SESSION_COOKIE_AGE = 60 * 60 * 24 * 30  # 30 days
SESSION_COOKIE_HTTPONLY = True

# =============================================================================
# Logging
# =============================================================================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

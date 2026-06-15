"""
django_app/ml_app/api_auth_views.py
────────────────────────────────────
JSON-based authentication endpoints for the React frontend.

These are ADDITIONAL views that sit alongside the existing HTML-based
login/signup views — they do NOT replace or modify any existing functionality.

Usage
-----
Add to ml_app/urls.py:

    from .api_auth_views import api_login, api_signup, api_logout_json

    urlpatterns = [
        ...existing patterns...,
        path('api/auth/login/',  api_login,        name='api_auth_login'),
        path('api/auth/signup/', api_signup,        name='api_auth_signup'),
        path('api/auth/logout/', api_logout_json,   name='api_auth_logout'),
    ]
"""

import json
from django.http         import JsonResponse
from django.views.decorators.http   import require_POST, require_http_methods
from django.views.decorators.csrf   import csrf_protect
from django.contrib.auth            import authenticate, login, logout
from django.contrib.auth.models     import User
from .models  import UserProfile
from .forms   import SignUpForm


def _user_dict(user):
    """Return a safe user representation for JSON responses."""
    role_display = ""
    try:
        role_display = user.profile.get_role_display()
    except Exception:
        pass
    return {
        "username":   user.username,
        "first_name": user.first_name or user.username,
        "last_name":  user.last_name or "",
        "email":      user.email,
        "role":       role_display,
        "initials":   (user.first_name[0] if user.first_name else user.username[0]).upper(),
    }


@csrf_protect
@require_POST
def api_login(request):
    """
    POST /api/auth/login/
    Body (JSON or form-encoded): { username, password }
    Returns: user object on success | { error } on failure
    """
    try:
        # Support both JSON and form-encoded bodies
        if request.content_type and "application/json" in request.content_type:
            body = json.loads(request.body)
            username = body.get("username", "")
            password = body.get("password", "")
        else:
            username = request.POST.get("username", "")
            password = request.POST.get("password", "")
    except (json.JSONDecodeError, KeyError):
        return JsonResponse({"error": "Invalid request body."}, status=400)

    if not username or not password:
        return JsonResponse({"error": "Username and password are required."}, status=400)

    # Allow login by email
    try:
        user_obj = User.objects.get(email=username)
        username = user_obj.username
    except User.DoesNotExist:
        pass

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid username or password."}, status=401)

    login(request, user)
    return JsonResponse(_user_dict(user))


@csrf_protect
@require_POST
def api_signup(request):
    """
    POST /api/auth/signup/
    Body (JSON or form-encoded): same fields as SignUpForm
    Returns: user object on success | { error, details } on failure
    """
    try:
        if request.content_type and "application/json" in request.content_type:
            data = json.loads(request.body)
            # Django's QueryDict-like behaviour needed for forms:
            from django.http import QueryDict
            qd = QueryDict(mutable=True)
            qd.update(data)
            form = SignUpForm(qd)
        else:
            form = SignUpForm(request.POST)
    except Exception:
        return JsonResponse({"error": "Invalid request body."}, status=400)

    if not form.is_valid():
        return JsonResponse({"error": "Registration failed.", "details": form.errors}, status=400)

    user = form.save()
    login(request, user)
    return JsonResponse(_user_dict(user), status=201)


@require_http_methods(["GET", "POST"])
def api_logout_json(request):
    """
    GET or POST /api/auth/logout/
    Logs the user out and clears the session.
    """
    logout(request)
    return JsonResponse({"message": "Logged out successfully."})

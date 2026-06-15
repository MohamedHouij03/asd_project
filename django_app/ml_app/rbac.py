"""Role-Based Access Control (RBAC) decorators and utilities."""

from functools import wraps
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.contrib import messages


def get_user_role(user):
    """Get the role of a user, returns 'parent' or 'doctor' or None."""
    if hasattr(user, 'profile'):
        return user.profile.role
    return None


@login_required
def role_required(required_role):
    """
    Decorator to restrict access based on user role.
    
    Usage:
        @role_required('doctor')
        def view_function(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user_role = get_user_role(request.user)
            
            # Allow if role matches or is a superuser
            if request.user.is_superuser or user_role == required_role:
                return view_func(request, *args, **kwargs)
            
            messages.error(request, f"This feature is only available to {required_role}s.")
            return HttpResponseForbidden("Access denied. Insufficient permissions.")
        
        return wrapper
    return decorator


@login_required
def role_required_any(*allowed_roles):
    """
    Decorator to restrict access to multiple roles.
    
    Usage:
        @role_required_any('doctor', 'parent')
        def view_function(request):
            pass
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user_role = get_user_role(request.user)
            
            if request.user.is_superuser or user_role in allowed_roles:
                return view_func(request, *args, **kwargs)
            
            roles_str = " or ".join(allowed_roles)
            messages.error(request, f"Access denied. Only {roles_str}s can access this.")
            return HttpResponseForbidden(f"Access denied. Insufficient permissions.")
        
        return wrapper
    return decorator


def is_doctor(user):
    """Check if user is a doctor."""
    return get_user_role(user) == 'doctor'


def is_parent(user):
    """Check if user is a parent."""
    return get_user_role(user) == 'parent'

from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Permission check to allow access only to Placement Officers / Admins.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )


class IsStudentUserRole(permissions.BasePermission):
    """
    Permission check to allow access only to registered Students.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access for students/unauthenticated,
    and write access for admins.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )

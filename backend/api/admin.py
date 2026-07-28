from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, JobPosting, Application

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'department', 'cgpa', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Placement Info', {'fields': ('role', 'phone', 'department', 'cgpa', 'resume')}),
    )

@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'location', 'job_type', 'is_active', 'posted_by', 'created_at')
    list_filter = ('is_active', 'job_type', 'created_at')
    search_fields = ('title', 'company', 'description')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'job', 'status', 'applied_at', 'updated_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('student__username', 'job__title', 'job__company')

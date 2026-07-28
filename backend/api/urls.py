from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserProfileView,
    JobPostingListCreateView,
    JobPostingDetailView,
    ApplyJobView,
    ApplicationListView,
    ApplicationStatusUpdateView,
    PlacementStatsView
)

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', UserProfileView.as_view(), name='user_profile'),

    # Jobs Endpoints
    path('jobs/', JobPostingListCreateView.as_view(), name='job_list_create'),
    path('jobs/<int:pk>/', JobPostingDetailView.as_view(), name='job_detail'),
    path('jobs/<int:pk>/apply/', ApplyJobView.as_view(), name='job_apply'),

    # Applications & Pipeline Endpoints
    path('applications/', ApplicationListView.as_view(), name='application_list'),
    path('applications/<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application_status_update'),

    # Admin Analytics & Dashboard
    path('stats/', PlacementStatsView.as_view(), name='placement_stats'),
]

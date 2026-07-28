from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import IntegrityError, models
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import JobPosting, Application
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegisterSerializer,
    UserSerializer,
    JobPostingSerializer,
    ApplicationSerializer,
    ApplicationStatusUpdateSerializer
)
from .permissions import IsAdminUserRole, IsStudentUserRole, IsAdminOrReadOnly

User = get_user_model()


def ensure_seeded():
    """Ensure database has seed jobs and applications if empty"""
    if not JobPosting.objects.exists():
        try:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from seed import seed_database
            seed_database()
        except Exception as e:
            print(f"[!] Auto seed warning: {e}")


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        return self.request.user


class JobPostingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = JobPostingSerializer

    def get_queryset(self):
        ensure_seeded()
        queryset = JobPosting.objects.all()
        # Admin sees all, students see active jobs by default unless filtering
        search = self.request.query_params.get('search', None)
        job_type = self.request.query_params.get('job_type', None)
        
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(company__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(requirements__icontains=search)
            )
        if job_type:
            queryset = queryset.filter(job_type__iexact=job_type)

        if not (self.request.user.is_authenticated and (self.request.user.role == 'ADMIN' or self.request.user.is_superuser)):
            queryset = queryset.filter(is_active=True)

        return queryset

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class JobPostingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrReadOnly]
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer


class ApplyJobView(APIView):
    permission_classes = [IsStudentUserRole]

    def post(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk)
        
        if not job.is_active:
            return Response(
                {"detail": "This job posting is no longer active."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Explicit check before DB constraint for clear user error message
        if Application.objects.filter(job=job, student=request.user).exists():
            return Response(
                {"detail": "You have already applied to this position."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            application = Application.objects.create(
                job=job,
                student=request.user,
                status=Application.Status.APPLIED
            )
            serializer = ApplicationSerializer(application, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"detail": "You have already applied to this job posting."},
                status=status.HTTP_400_BAD_REQUEST
            )


class ApplicationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        ensure_seeded()
        user = self.request.user
        queryset = Application.objects.all()

        if user.role == 'ADMIN' or user.is_staff or user.is_superuser:
            # Filters for placement officer
            job_id = self.request.query_params.get('job_id', None)
            app_status = self.request.query_params.get('status', None)
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            if app_status:
                queryset = queryset.filter(status=app_status)
        else:
            # Student view - only their applications
            queryset = queryset.filter(student=user)

        return queryset


class ApplicationStatusUpdateView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            updated_app = ApplicationSerializer(application, context={'request': request})
            return Response(updated_app.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlacementStatsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        ensure_seeded()
        total_jobs = JobPosting.objects.count()
        total_applications = Application.objects.count()
        total_students = User.objects.filter(role=User.Role.STUDENT).count()
        
        status_counts = {
            'APPLIED': Application.objects.filter(status=Application.Status.APPLIED).count(),
            'IN_REVIEW': Application.objects.filter(status=Application.Status.IN_REVIEW).count(),
            'INTERVIEWING': Application.objects.filter(status=Application.Status.INTERVIEWING).count(),
            'SELECTED': Application.objects.filter(status=Application.Status.SELECTED).count(),
            'REJECTED': Application.objects.filter(status=Application.Status.REJECTED).count(),
        }

        placement_rate = (
            round((status_counts['SELECTED'] / total_students * 100), 1)
            if total_students > 0 else 0
        )

        return Response({
            'total_jobs': total_jobs,
            'total_applications': total_applications,
            'total_students': total_students,
            'placement_rate': placement_rate,
            'status_counts': status_counts,
        })

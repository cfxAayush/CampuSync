from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import JobPosting, Application

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token

    def validate(self, attrs):
        username_or_email = attrs.get('username')
        if username_or_email and '@' in username_or_email:
            user_obj = User.objects.filter(email__iexact=username_or_email).first()
            if user_obj:
                attrs['username'] = user_obj.username
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'department': self.user.department,
            'cgpa': self.user.cgpa,
            'phone': self.user.phone,
            'resume': self.user.resume.url if self.user.resume else None,
            'resume_url': self.user.resume.url if self.user.resume else None
        }
        return data


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'role', 'phone', 'department', 'cgpa'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'department', 'cgpa', 'resume', 'resume_url', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

    def get_resume_url(self, obj):
        if obj.resume:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.resume.url)
            return obj.resume.url
        return None


class JobPostingSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.ReadOnlyField(source='posted_by.username')
    applications_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    my_application = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = (
            'id', 'title', 'company', 'location', 'job_type', 'salary',
            'description', 'requirements', 'posted_by', 'posted_by_name',
            'is_active', 'applications_count', 'has_applied', 'my_application',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'posted_by', 'created_at', 'updated_at')

    def get_applications_count(self, obj):
        return obj.applications.count()

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'STUDENT':
            return Application.objects.filter(job=obj, student=request.user).exists()
        return False

    def get_my_application(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'STUDENT':
            app = Application.objects.filter(job=obj, student=request.user).first()
            if app:
                return {
                    'id': app.id,
                    'status': app.status,
                    'status_display': app.get_status_display(),
                    'applied_at': app.applied_at
                }
        return None


class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobPostingSerializer(source='job', read_only=True)
    student_details = UserSerializer(source='student', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'job', 'job_details', 'student', 'student_details',
            'status', 'status_display', 'notes', 'applied_at', 'updated_at'
        )
        read_only_fields = ('id', 'student', 'applied_at', 'updated_at')


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('status', 'notes')

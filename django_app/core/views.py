"""
core/views.py
─────────────
Django REST Framework viewsets and API views.
"""
import logging

from django.contrib.auth.models import User
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    ExtendedProfile, Assessment, AssessmentResult,
    SavedAssessment, Notification, Article, ArticleCategory,
    FAQ, ContactMessage, UserActivity,
)
from .serializers import (
    CustomTokenSerializer, RegisterSerializer, PasswordChangeSerializer,
    ExtendedProfileSerializer, AssessmentRunSerializer,
    AssessmentListSerializer, AssessmentDetailSerializer,
    SavedAssessmentSerializer, NotificationSerializer,
    ArticleCategorySerializer, ArticleListSerializer, ArticleDetailSerializer,
    FAQSerializer, ContactMessageSerializer,
)
from .ml_utils import run_prediction, risk_level_from_result, build_recommendations

logger = logging.getLogger(__name__)


# ── Auth ───────────────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ → {access, refresh, user}"""
    serializer_class = CustomTokenSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue tokens immediately so the user is logged in right away
        refresh = RefreshToken.for_user(user)
        try:
            prof = user.extended_profile
            role, initials, avatar = prof.role, prof.initials, prof.avatar_url
        except ExtendedProfile.DoesNotExist:
            role, initials, avatar = 'parent', user.username[:2].upper(), None

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':         user.pk,
                'username':   user.username,
                'email':      user.email,
                'first_name': user.first_name,
                'last_name':  user.last_name,
                'role':       role,
                'initials':   initials,
                'avatar':     avatar,
            },
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — blacklists the refresh token."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """POST /api/v1/auth/password/change/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Incorrect password.'},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password updated.'})


# ── Profile ────────────────────────────────────────────────────────────────────

class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/users/profile/"""
    serializer_class   = ExtendedProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        profile, _ = ExtendedProfile.objects.get_or_create(user=self.request.user)
        return profile

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        resp = super().update(request, *args, **kwargs)
        # Log the activity
        UserActivity.objects.create(user=request.user, action='profile_update')
        return resp


class AvatarUploadView(APIView):
    """POST /api/v1/users/avatar/"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser]

    def post(self, request):
        if 'avatar' not in request.FILES:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = ExtendedProfile.objects.get_or_create(user=request.user)
        profile.avatar = request.FILES['avatar']
        profile.save(update_fields=['avatar'])
        return Response({'avatar_url': profile.avatar_url})


class UserStatsView(APIView):
    """GET /api/v1/users/stats/ — aggregated stats for the current user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs   = Assessment.objects.filter(user=user)

        total     = qs.count()
        completed = qs.filter(status='completed').count()
        positive  = qs.filter(status='completed', result__prediction='YES').count()
        negative  = completed - positive
        avg_conf  = qs.filter(status='completed').aggregate(
            v=Avg('result__confidence'))['v']

        # Monthly breakdown (last 6 months)
        from datetime import date
        import calendar
        months = []
        now = date.today()
        for i in range(5, -1, -1):
            mo = (now.month - i - 1) % 12 + 1
            yr = now.year - ((now.month - i - 1) // 12)
            label = calendar.month_abbr[mo]
            c = qs.filter(created_at__year=yr, created_at__month=mo,
                          status='completed').count()
            p = qs.filter(created_at__year=yr, created_at__month=mo,
                          result__prediction='YES').count()
            months.append({'month': label, 'total': c,
                           'positive': p, 'negative': c - p})

        recent = AssessmentListSerializer(
            qs.filter(status='completed')[:5],
            many=True, context={'request': request},
        ).data

        unread_notifs = Notification.objects.filter(
            user=user, is_read=False).count()

        return Response({
            'total_assessments':    total,
            'completed':            completed,
            'positive_results':     positive,
            'negative_results':     negative,
            'avg_confidence':       round(avg_conf, 1) if avg_conf else None,
            'monthly':              months,
            'recent_assessments':   recent,
            'unread_notifications': unread_notifs,
        })


# ── Assessments ────────────────────────────────────────────────────────────────

class AssessmentViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/assessments/         → list
    POST   /api/v1/assessments/run/     → run new assessment
    GET    /api/v1/assessments/{id}/    → detail
    DELETE /api/v1/assessments/{id}/    → delete
    POST   /api/v1/assessments/{id}/save/    → bookmark
    DELETE /api/v1/assessments/{id}/save/    → remove bookmark
    """
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'delete', 'post', 'head', 'options']

    def get_queryset(self):
        return Assessment.objects.filter(user=self.request.user).select_related('result')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AssessmentDetailSerializer
        return AssessmentListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    # POST /api/v1/assessments/run/
    @action(detail=False, methods=['post'], url_path='run')
    def run(self, request):
        serializer = AssessmentRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        notes = data.pop('notes', '')

        # Create pending assessment
        assessment = Assessment.objects.create(
            user=request.user,
            status='pending',
            input_data=data,
            notes=notes,
        )

        # Build form_data dict expected by predict_api (all values as strings)
        form_data = {k: str(v) for k, v in data.items() if v is not None}

        ml_result = run_prediction(request.user, form_data)

        if ml_result is None:
            assessment.status = 'failed'
            assessment.save()
            return Response({'error': 'ML prediction failed. Please try again.'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        prediction  = ml_result.get('prediction', 'NO')
        confidence  = ml_result.get('confidence')
        top_factors = ml_result.get('top_factors', [])
        risk        = risk_level_from_result(prediction, confidence)

        AssessmentResult.objects.create(
            assessment       = assessment,
            prediction       = prediction,
            confidence       = confidence,
            explanation_text = ml_result.get('explanation_text', ''),
            top_factors      = top_factors,
            shap_data        = top_factors,
            contrib_chart    = ml_result.get('contrib_chart', ''),
            recommendations  = build_recommendations(prediction, top_factors),
            model_note       = ml_result.get('note', 'model'),
        )

        assessment.status     = 'completed'
        assessment.risk_level = risk
        assessment.save()

        # Create completion notification
        Notification.objects.create(
            user       = request.user,
            notif_type = 'assessment_completed',
            title      = 'Screening complete',
            message    = (f'Your ASD screening returned: '
                          f'{"indicators detected" if prediction == "YES" else "no strong indicators"}. '
                          f'Confidence: {confidence}%.'),
            action_url = f'/history/{assessment.id}',
        )

        # Log activity
        UserActivity.objects.create(
            user=request.user,
            action='assessment_complete',
            details={'assessment_id': str(assessment.id), 'prediction': prediction},
        )

        result_data = AssessmentDetailSerializer(assessment,
                                                 context={'request': request}).data
        return Response(result_data, status=status.HTTP_201_CREATED)

    # POST/DELETE /api/v1/assessments/{id}/save/
    @action(detail=True, methods=['post', 'delete'], url_path='save')
    def save_assessment(self, request, pk=None):
        assessment = self.get_object()
        if request.method == 'POST':
            obj, created = SavedAssessment.objects.get_or_create(
                user=request.user, assessment=assessment,
                defaults={'notes': request.data.get('notes', '')},
            )
            assessment.is_saved = True
            assessment.save(update_fields=['is_saved'])
            return Response(
                SavedAssessmentSerializer(obj).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        # DELETE
        SavedAssessment.objects.filter(user=request.user, assessment=assessment).delete()
        assessment.is_saved = False
        assessment.save(update_fields=['is_saved'])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Saved ──────────────────────────────────────────────────────────────────────

class SavedAssessmentViewSet(viewsets.ModelViewSet):
    """GET /api/v1/saved/ | DELETE /api/v1/saved/{id}/"""
    serializer_class   = SavedAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'delete', 'head', 'options']

    def get_queryset(self):
        return SavedAssessment.objects.filter(
            user=self.request.user).select_related('assessment', 'assessment__result')


# ── Notifications ──────────────────────────────────────────────────────────────

class NotificationViewSet(viewsets.GenericViewSet,
                          viewsets.mixins.ListModelMixin):
    """GET /api/v1/notifications/  |  POST /api/v1/notifications/mark-all-read/"""
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='read')
    def mark_read(self, request, pk=None):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notif).data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All marked read.'})

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread': count})


# ── Content ────────────────────────────────────────────────────────────────────

class ArticleCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = ArticleCategory.objects.all()
    serializer_class = ArticleCategorySerializer
    permission_classes = [permissions.AllowAny]


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Article.objects.filter(status='published').select_related('category', 'author')
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        if category:
            qs = qs.filter(category__slug=category)
        if featured:
            qs = qs.filter(is_featured=True)
        return qs

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleListSerializer

    def retrieve(self, request, *args, **kwargs):
        # Increment view count
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        return super().retrieve(request, *args, **kwargs)

    def get_object(self):
        # Support lookup by slug
        qs = self.get_queryset()
        pk = self.kwargs.get('pk')
        try:
            return qs.get(pk=pk)
        except (Article.DoesNotExist, ValueError):
            return get_object_or_404(qs, slug=pk)


class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = FAQ.objects.filter(is_active=True)
    serializer_class   = FAQSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields   = ['category']


class ContactView(generics.CreateAPIView):
    """POST /api/v1/contact/"""
    serializer_class   = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save()

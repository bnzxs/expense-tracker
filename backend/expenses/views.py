from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from django.contrib.auth.models import User
import uuid
from .models import Expense, Category, Merchant, Budget
from .serializers import (
    ExpenseSerializer, CategorySerializer, 
    MerchantSerializer, BudgetSerializer, UserSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AnalyticsSummaryView(APIView):
    def get(self, request):
        user = request.user
        
        # Calculate totals
        total_income = Expense.objects.filter(
            user=user, transaction_type='CREDIT'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        total_spent = Expense.objects.filter(
            user=user, transaction_type='DEBIT'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        wallet_balance = total_income - total_spent
        
        # Breakdown only for expenses (debits)
        category_breakdown = Expense.objects.filter(
            user=user, transaction_type='DEBIT'
        ).values(
            'category__name'
        ).annotate(total=Sum('amount')).order_by('-total')

        return Response({
            'total_income': total_income,
            'total_spent': total_spent,
            'wallet_balance': wallet_balance,
            'category_breakdown': category_breakdown
        })

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EmailWebhookView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        from .tasks import process_incoming_email
        
        # Flexibly handle paylods from SendGrid, Mailgun, etc.
        email_body = request.data.get('text', '') or request.data.get('body', '')
        subject = request.data.get('subject', 'No Subject')
        
        # Try to identify the user
        user_id = request.data.get('user_id')
        user_email = request.data.get('from_email') or request.data.get('from')
        
        target_user = None
        if user_id:
            target_user = User.objects.filter(id=user_id).first()
        elif user_email:
            # Clean email address if it's in "Name <email@example.com>" format
            import re
            match = re.search(r'[\w\.-]+@[\w\.-]+', str(user_email))
            clean_email = match.group(0) if match else user_email
            target_user = User.objects.filter(email=clean_email).first()
            if not target_user:
                target_user = User.objects.filter(username=clean_email).first()

        if not target_user:
            # Fallback to the first superuser or first user for demo/testing
            target_user = User.objects.filter(is_superuser=True).first() or User.objects.first()

        if not target_user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        msg_id = request.data.get('msg_id', str(uuid.uuid4()))
        process_incoming_email.delay(target_user.id, subject, email_body, msg_id)
        
        return Response({
            'status': 'processing',
            'user': target_user.username
        }, status=status.HTTP_202_ACCEPTED)

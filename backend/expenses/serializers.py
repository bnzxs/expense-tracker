from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Expense, Category, Merchant, Budget, Transaction, EmailLog

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['user']

class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    merchant_name = serializers.CharField(source='merchant.name', required=False)

    class Meta:
        model = Expense
        fields = [
            'id', 'user', 'category', 'category_name', 
            'merchant', 'merchant_name', 'amount', 'transaction_type',
            'description', 'date', 'is_automated', 'created_at'
        ]
        read_only_fields = ['user', 'is_automated']

    def create(self, validated_data):
        merchant_data = validated_data.pop('merchant', None)
        if merchant_data:
            m_name = merchant_data.get('name')
            merchant, _ = Merchant.objects.get_or_create(name=m_name)
            validated_data['merchant'] = merchant
        return super().create(validated_data)

    def update(self, instance, validated_data):
        merchant_data = validated_data.pop('merchant', None)
        if merchant_data:
            m_name = merchant_data.get('name')
            merchant, _ = Merchant.objects.get_or_create(name=m_name)
            instance.merchant = merchant
        
        # Manually update other fields since we might have popped merchant
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Budget
        fields = '__all__'

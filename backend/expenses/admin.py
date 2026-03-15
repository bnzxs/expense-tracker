from django.contrib import admin
from .models import Category, Merchant, Expense, Budget, EmailLog, Transaction

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')

@admin.register(Merchant)
class MerchantAdmin(admin.ModelAdmin):
    list_display = ('name', 'default_category')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('date', 'merchant', 'amount', 'category', 'user', 'is_automated')
    list_filter = ('is_automated', 'category', 'date')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'month', 'year', 'user')

admin.site.register(EmailLog)
admin.site.register(Transaction)

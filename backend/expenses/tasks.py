from celery import shared_task
from django.contrib.auth.models import User
from .models import Expense, Category, Merchant, EmailLog, Transaction
from .parser import TransactionParser
import logging

logger = logging.getLogger(__name__)

@shared_task
def process_incoming_email(user_id, subject, body, raw_msg_id=None):
    """
    Celery task to process an incoming forwarded transaction email.
    """
    try:
        user = User.objects.get(id=user_id)
        email_log = EmailLog.objects.create(
            user=user,
            subject=subject,
            status='pending'
        )

        # Parse the email
        parsed_data = TransactionParser.parse_email_body(body, subject)
        
        if not parsed_data:
            email_log.status = 'failed'
            email_log.error_message = 'Could not parse transaction details from body.'
            email_log.save()
            return f"Failed to parse email: {subject}"

        # Get or create merchant
        merchant, created = Merchant.objects.get_or_create(
            name=parsed_data['merchant']
        )

        # Try to find a sensible category (either from merchant or default)
        category = merchant.default_category
        if not category:
            # Simple fallback or auto-categorization logic could go here
            # For now, default to the first category found for the user or None
            category = Category.objects.filter(user=user).first()

        # Create the expense (now supports income/credits)
        expense = Expense.objects.create(
            user=user,
            category=category,
            merchant=merchant,
            amount=parsed_data['amount'],
            transaction_type=parsed_data['transaction_type'],
            date=parsed_data['date'],
            description=f"Auto-generated from email: {subject}",
            is_automated=True
        )

        # Link transaction details
        Transaction.objects.create(
            expense=expense,
            email=email_log,
            raw_msg_id=raw_msg_id,
            card_last_four=parsed_data['card_last_four']
        )

        email_log.status = 'processed'
        email_log.save()
        
        return f"Successfully processed transaction for {parsed_data['amount']} at {parsed_data['merchant']}"

    except Exception as e:
        logger.error(f"Error processing email: {str(e)}")
        if 'email_log' in locals():
            email_log.status = 'failed'
            email_log.error_message = str(e)
            email_log.save()
        return f"Error: {str(e)}"

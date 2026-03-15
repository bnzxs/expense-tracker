import re
from datetime import datetime
from decimal import Decimal

class TransactionParser:
    """
    Robust email parser for bank transaction emails.
    Uses regex patterns to identify key transaction details.
    """
    
    # Common patterns for bank transaction emails
    PATTERNS = [
        # Pattern 1: Amount, Merchant, Date (Generic Deduction)
        {
            'amount': r'[₱$]?(\d+\.\d{2})',
            'merchant': r'(?:at|from)\s+([A-Z0-9\s&*-]+?)\s+(?:on|at)',
            'date': r'(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})',
            'card': r'card\s+ending\s+(\d{4})',
            'type': 'DEBIT'
        },
        # Pattern 2: Salary/Deposit
        # e.g., "A deposit of ₱25,000.00 from COMPANY NAME has been credited"
        {
            'amount': r'(?:deposit|credited|received)\s+of\s+[₱$]?([\d,]+\.\d{2})',
            'merchant': r'(?:from|by)\s+([A-Z0-9\s&*-]+?)\s+(?:has|on)',
            'date': r'(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})',
            'type': 'CREDIT'
        },
        # Pattern 3: Amount, Merchant (Short Deduction)
        {
            'amount': r'(\d+\.\d{2})\s*(?:USD|GBP|EUR|PHP|\$|₱)',
            'merchant': r'at\s+([A-Za-z0-9\s&*-]+)$',
            'date': None,
            'type': 'DEBIT'
        },
        # Pattern 4: BDO Send Money (Deduction)
        {
            'amount': r'Amount\s*:\s*(?:PHP|₱)\s*([\d,]+\.\d{2})',
            'merchant': r'Destination Bank\s*:\s*([^\n\r]+)',
            'date': r'Transaction Date\s*:\s*(\d{2}/\d{2}/\d{4})',
            'card': None,
            'type': 'DEBIT'
        }
    ]

    @classmethod
    def parse_email_body(cls, body, subject=""):
        """
        Extracts transaction data from email body.
        """
        results = {
            'amount': None,
            'merchant': 'Unknown Merchant',
            'date': datetime.now().date(),
            'card_last_four': None,
            'currency': 'PHP',
            'transaction_type': 'DEBIT'
        }

        # Clean body (remove excessive whitespace and commas in amounts)
        clean_body = " ".join(body.split())
        
        # Also check subject for "Payroll" or "Salary"
        if re.search(r'payroll|salary|deposit|credited', subject, re.IGNORECASE):
            results['transaction_type'] = 'CREDIT'

        for pattern_set in cls.PATTERNS:
            # Try to match amount
            amount_match = re.search(pattern_set['amount'], clean_body, re.IGNORECASE)
            if amount_match:
                # Remove commas from amount string before conversion
                amount_str = amount_match.group(1).replace(',', '')
                results['amount'] = Decimal(amount_str)
                results['transaction_type'] = pattern_set.get('type', 'DEBIT')
            else:
                continue
            
            # Try to match merchant
            merchant_match = re.search(pattern_set['merchant'], clean_body)
            if merchant_match:
                results['merchant'] = merchant_match.group(1).strip()

            # Try to match date
            if pattern_set['date']:
                date_match = re.search(pattern_set['date'], clean_body)
                if date_match:
                    try:
                        date_str = date_match.group(1)
                        if '-' in date_str:
                            results['date'] = datetime.strptime(date_str, '%Y-%m-%d').date()
                        else:
                            results['date'] = datetime.strptime(date_str, '%m/%d/%Y').date()
                    except ValueError:
                        pass # Keep default date

            # Try to match card
            if pattern_set.get('card'):
                card_match = re.search(pattern_set['card'], clean_body)
                if card_match:
                    results['card_last_four'] = card_match.group(1)

            # If we found at least an amount, we consider it a hit
            if results['amount']:
                return results

        return None

"""Payment views for Przelewy24 integration."""

import hashlib
import logging
import requests
import uuid
from django.conf import settings
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Payment, PlatformUser
from .serializers import PaymentSerializer

logger = logging.getLogger(__name__)


def generate_p24_sign(data, crc_key):
    """Generate SHA-384 signature for Przelewy24 request."""
    sign_string = (
        f"{data.get('sessionId', '')}|"
        f"{data.get('merchantId', '')}|"
        f"{data.get('amount', '')}|"
        f"{data.get('currency', '')}|"
        f"{crc_key}"
    )
    return hashlib.sha384(sign_string.encode('utf-8')).hexdigest()


def generate_p24_verify_sign(data, crc_key):
    """Generate SHA-384 signature for Przelewy24 verification."""
    sign_string = (
        f"{data.get('sessionId', '')}|"
        f"{data.get('orderId', '')}|"
        f"{data.get('amount', '')}|"
        f"{data.get('currency', '')}|"
        f"{crc_key}"
    )
    return hashlib.sha384(sign_string.encode('utf-8')).hexdigest()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    Create a new payment transaction and get redirect URL.
    
    POST /api/v1/payments/create/
    Body:
    {
        "amount": 10000,  // in grosz (100 PLN)
        "description": "Plan PRO - miesięczna subskrypcja",
        "plan_id": "pro"
    }
    
    Returns:
    {
        "session_id": "unique-order-id",
        "payment_url": "https://sandbox.przelewy24.pl/trnRequest/TOKEN",
        "status": "pending"
    }
    """
    try:
        amount = request.data.get('amount')
        description = request.data.get('description', 'Płatność YourEasySite')
        plan_id = request.data.get('plan_id')
        
        if not amount or amount <= 0:
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique session ID
        session_id = f"YES-{uuid.uuid4().hex[:16].upper()}"
        
        # Create payment record
        payment = Payment.objects.create(
            user=request.user,
            session_id=session_id,
            amount=amount,
            currency='PLN',
            description=description,
            email=request.user.email,
            plan_id=plan_id,
            status=Payment.Status.PENDING
        )
        
        # Prepare Przelewy24 request
        merchant_id = settings.PRZELEWY24_MERCHANT_ID
        pos_id = settings.PRZELEWY24_POS_ID
        crc_key = settings.PRZELEWY24_CRC_KEY
        api_url = settings.PRZELEWY24_API_URL
        
        p24_data = {
            'merchantId': int(merchant_id),
            'posId': int(pos_id),
            'sessionId': session_id,
            'amount': amount,
            'currency': 'PLN',
            'description': description,
            'email': request.user.email,
            'country': 'PL',
            'language': 'pl',
            'urlReturn': settings.PRZELEWY24_RETURN_URL,
            'urlStatus': settings.PRZELEWY24_STATUS_URL,
        }
        
        # Generate signature
        p24_data['sign'] = generate_p24_sign(p24_data, crc_key)
        
        # Make request to Przelewy24
        response = requests.post(
            f'{api_url}/api/v1/transaction/register',
            json=p24_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 201:
            response_data = response.json()
            token = response_data.get('data', {}).get('token')
            
            if token:
                payment.token = token
                payment.save(update_fields=['token'])
                
                payment_url = f"{api_url}/trnRequest/{token}"
                
                logger.info(
                    f"Payment {session_id} created successfully for user {request.user.email}"
                )
                
                return Response({
                    'session_id': session_id,
                    'payment_url': payment_url,
                    'status': 'pending'
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"No token in P24 response: {response_data}")
                return Response(
                    {'error': 'Payment gateway error: no token received'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(
                f"P24 registration failed: {response.status_code} - {response.text}"
            )
            return Response(
                {'error': 'Payment gateway error', 'details': response.text},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.exception(f"Error creating payment: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def payment_webhook(request):
    """
    Receive payment notification from Przelewy24.
    
    POST /api/v1/payments/webhook/
    
    This endpoint receives notifications from Przelewy24 about payment status changes.
    It verifies the signature and updates the payment status in the database.
    """
    try:
        session_id = request.data.get('sessionId')
        order_id = request.data.get('orderId')
        amount = request.data.get('amount')
        currency = request.data.get('currency')
        received_sign = request.data.get('sign')
        
        if not all([session_id, order_id, amount, currency, received_sign]):
            logger.warning("Webhook received with missing data")
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify signature
        crc_key = settings.PRZELEWY24_CRC_KEY
        expected_sign = generate_p24_verify_sign(
            {
                'sessionId': session_id,
                'orderId': order_id,
                'amount': amount,
                'currency': currency
            },
            crc_key
        )
        
        if received_sign != expected_sign:
            logger.error(
                f"Invalid signature for payment {session_id}. "
                f"Expected: {expected_sign}, Got: {received_sign}"
            )
            return Response(
                {'error': 'Invalid signature'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Find payment
        try:
            payment = Payment.objects.get(session_id=session_id)
        except Payment.DoesNotExist:
            logger.error(f"Payment not found: {session_id}")
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify payment with Przelewy24
        merchant_id = settings.PRZELEWY24_MERCHANT_ID
        pos_id = settings.PRZELEWY24_POS_ID
        api_url = settings.PRZELEWY24_API_URL
        
        verify_data = {
            'merchantId': int(merchant_id),
            'posId': int(pos_id),
            'sessionId': session_id,
            'amount': amount,
            'currency': currency,
            'orderId': int(order_id),
        }
        verify_data['sign'] = generate_p24_verify_sign(verify_data, crc_key)
        
        verify_response = requests.put(
            f'{api_url}/api/v1/transaction/verify',
            json=verify_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if verify_response.status_code == 200:
            # Payment verified successfully
            with transaction.atomic():
                payment.status = Payment.Status.COMPLETED
                payment.p24_order_id = str(order_id)
                payment.save(update_fields=['status', 'p24_order_id', 'updated_at'])
                
                # Update user's plan if plan_id exists
                if payment.plan_id:
                    user = payment.user
                    plan_map = {
                        'pro': PlatformUser.AccountType.PRO,
                        'pro-plus': PlatformUser.AccountType.PRO_PLUS
                    }
                    if payment.plan_id in plan_map:
                        user.account_type = plan_map[payment.plan_id]
                        user.save(update_fields=['account_type'])
                        logger.info(
                            f"User {user.email} upgraded to {payment.plan_id}"
                        )
            
            logger.info(f"Payment {session_id} completed successfully")
            return Response({'status': 'OK'}, status=status.HTTP_200_OK)
        else:
            # Verification failed
            logger.error(
                f"P24 verification failed: {verify_response.status_code} - "
                f"{verify_response.text}"
            )
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=['status', 'updated_at'])
            
            return Response(
                {'error': 'Verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        logger.exception(f"Error processing webhook: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, session_id):
    """
    Get payment status by session ID.
    
    GET /api/v1/payments/status/<session_id>/
    
    Returns:
    {
        "session_id": "YES-ABC123",
        "status": "completed",
        "amount": 10000,
        "plan_id": "pro"
    }
    """
    try:
        payment = Payment.objects.get(
            session_id=session_id,
            user=request.user
        )
        
        return Response({
            'session_id': payment.session_id,
            'status': payment.status,
            'amount': payment.amount,
            'plan_id': payment.plan_id,
            'created_at': payment.created_at,
            'updated_at': payment.updated_at
        }, status=status.HTTP_200_OK)
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_history(request):
    """
    Get payment history for the authenticated user.
    
    GET /api/v1/payments/history/
    
    Returns list of all payments for the current user.
    """
    payments = Payment.objects.filter(user=request.user).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

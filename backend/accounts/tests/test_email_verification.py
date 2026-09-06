from datetime import timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import SecurityToken
from accounts.tokens import generate_security_token

User = get_user_model()


class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.verify_url = '/api/accounts/verify-email/'
        self.resend_url = '/api/accounts/resend-verification/'
        self.change_email_url = '/api/accounts/change-email/'
        self.verify_change_url = '/api/accounts/verify-email-change/'

        self.user = User.objects.create_user(
            username='unverifieduser',
            email='unverified@example.com',
            password='TestPassword123!',
            is_verified=False,
            user_type='buyer',
        )

    def test_verify_email_success_and_replay_failure(self):
        raw_token = generate_security_token(self.user, 'email_verification')

        # Verify email
        res = self.client.post(self.verify_url, {'token': raw_token})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)

        # Replay must fail
        replay_res = self.client.post(self.verify_url, {'token': raw_token})
        self.assertEqual(replay_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expired_email_verification_token_fails(self):
        raw_token = generate_security_token(
            self.user,
            'email_verification',
            expires_in=timedelta(seconds=-10),
        )
        res = self.client.post(self.verify_url, {'token': raw_token})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_resend_verification_anti_enumeration(self):
        res1 = self.client.post(self.resend_url, {'email': 'unverified@example.com'})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)

        res2 = self.client.post(self.resend_url, {'email': 'doesnotexist@example.com'})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['detail'], res2.data['detail'])

    def test_change_email_flow(self):
        login_res = self.client.post('/api/accounts/login/', {
            'email': 'unverified@example.com',
            'password': 'TestPassword123!',
        })
        access = login_res.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        change_res = self.client.post(self.change_email_url, {
            'new_email': 'newaddress@example.com',
            'password': 'TestPassword123!',
        })
        self.assertEqual(change_res.status_code, status.HTTP_200_OK)

        # Find the generated token for email_change
        token_obj = SecurityToken.objects.filter(user=self.user, token_type='email_change').first()
        self.assertIsNotNone(token_obj)
        self.assertEqual(token_obj.new_email, 'newaddress@example.com')

        # Generate a known raw token to verify confirmation
        raw_token = generate_security_token(self.user, 'email_change', new_email='confirmed@example.com')
        confirm_res = self.client.post(self.verify_change_url, {'token': raw_token})
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'confirmed@example.com')
        self.assertTrue(self.user.is_verified)

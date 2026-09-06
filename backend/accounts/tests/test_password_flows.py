from datetime import timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import SecurityToken, PasswordHistory
from accounts.tokens import generate_security_token

User = get_user_model()


class PasswordFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.reset_request_url = '/api/accounts/password-reset/'
        self.reset_confirm_url = '/api/accounts/password-reset-confirm/'
        self.change_password_url = '/api/accounts/change-password/'
        self.me_url = '/api/accounts/me/'

        self.user = User.objects.create_user(
            username='testuser',
            email='user@example.com',
            first_name='Test',
            last_name='User',
            password='InitialPassword123!',
            user_type='buyer',
        )

    def test_password_reset_request_anti_enumeration(self):
        # Existing email
        res1 = self.client.post(self.reset_request_url, {'email': 'user@example.com'})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertIn('If an account exists', res1.data['detail'])

        # Non-existing email returns identical response
        res2 = self.client.post(self.reset_request_url, {'email': 'nonexistent@example.com'})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(res1.data['detail'], res2.data['detail'])

    def test_password_reset_flow_success_and_replay_prevention(self):
        raw_token = generate_security_token(self.user, 'password_reset')

        # Confirm password reset
        confirm_res = self.client.post(self.reset_confirm_url, {
            'token': raw_token,
            'new_password': 'BrandNewPassword123!',
            'confirm_password': 'BrandNewPassword123!',
        })
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)

        # Verify password changed in DB
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNewPassword123!'))

        # Attempt to replay the same token must fail
        replay_res = self.client.post(self.reset_confirm_url, {
            'token': raw_token,
            'new_password': 'AnotherPassword123!',
            'confirm_password': 'AnotherPassword123!',
        })
        self.assertEqual(replay_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expired_reset_token_fails(self):
        raw_token = generate_security_token(
            self.user,
            'password_reset',
            expires_in=timedelta(seconds=-10),  # expired in past
        )

        res = self.client.post(self.reset_confirm_url, {
            'token': raw_token,
            'new_password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_history_reuse_prevention(self):
        # Change password once
        raw_token = generate_security_token(self.user, 'password_reset')
        self.client.post(self.reset_confirm_url, {
            'token': raw_token,
            'new_password': 'SecondPassword123!',
            'confirm_password': 'SecondPassword123!',
        })

        # Try to reset back to InitialPassword123! or SecondPassword123!
        raw_token2 = generate_security_token(self.user, 'password_reset')
        reuse_res = self.client.post(self.reset_confirm_url, {
            'token': raw_token2,
            'new_password': 'SecondPassword123!',
            'confirm_password': 'SecondPassword123!',
        })
        self.assertEqual(reuse_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', reuse_res.data)

    def test_change_password_authenticated_invalidates_other_sessions(self):
        # Login to get initial access token
        login_res = self.client.post('/api/accounts/login/', {
            'email': 'user@example.com',
            'password': 'InitialPassword123!',
        })
        old_access = login_res.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_access}')
        change_res = self.client.post(self.change_password_url, {
            'old_password': 'InitialPassword123!',
            'new_password': 'UpdatedPassword123!',
            'confirm_password': 'UpdatedPassword123!',
        })
        self.assertEqual(change_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', change_res.data)
        new_access = change_res.data['access']

        # Old access token must now be rejected
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_access}')
        me_fail = self.client.get(self.me_url)
        self.assertEqual(me_fail.status_code, status.HTTP_401_UNAUTHORIZED)

        # New access token must work
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access}')
        me_success = self.client.get(self.me_url)
        self.assertEqual(me_success.status_code, status.HTTP_200_OK)

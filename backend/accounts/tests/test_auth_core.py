from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from accounts.models import SecurityToken

User = get_user_model()


class AuthCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/accounts/register/'
        self.login_url = '/api/accounts/login/'
        self.refresh_url = '/api/accounts/login/refresh/'
        self.logout_url = '/api/accounts/logout/'
        self.logout_all_url = '/api/accounts/logout-all/'
        self.me_url = '/api/accounts/me/'

        self.user_data = {
            'username': 'testfarmer',
            'email': 'farmer@example.com',
            'first_name': 'Ramesh',
            'last_name': 'Kumar',
            'password': 'SecurePassword123!',
            'confirm_password': 'SecurePassword123!',
            'user_type': 'farmer',
            'phone_number': '+919876543210',
            'gender': 'male',
        }

    def test_registration_creates_user_and_sends_verification_token(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'farmer@example.com')
        self.assertFalse(response.data['user']['is_verified'])

        # Verify user in database
        user = User.objects.get(email='farmer@example.com')
        self.assertTrue(user.check_password('SecurePassword123!'))
        self.assertTrue(hasattr(user, 'farmer_profile'))

        # Verify security token was generated
        token_count = SecurityToken.objects.filter(user=user, token_type='email_verification').count()
        self.assertEqual(token_count, 1)

    def test_registration_password_mismatch(self):
        data = self.user_data.copy()
        data['confirm_password'] = 'DifferentPassword123!'
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', response.data)

    def test_login_success_and_invalid_credentials(self):
        # Register user first
        self.client.post(self.register_url, self.user_data)

        # Correct login
        response = self.client.post(self.login_url, {
            'email': 'farmer@example.com',
            'password': 'SecurePassword123!',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['first_name'], 'Ramesh')

        # Incorrect password
        fail_response = self.client.post(self.login_url, {
            'email': 'farmer@example.com',
            'password': 'WrongPassword123!',
        })
        self.assertEqual(fail_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh_and_rotation(self):
        reg_res = self.client.post(self.register_url, self.user_data)
        old_refresh = reg_res.data['refresh']

        # Refresh the token
        ref_res = self.client.post(self.refresh_url, {'refresh': old_refresh})
        self.assertEqual(ref_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', ref_res.data)
        self.assertIn('refresh', ref_res.data)
        new_refresh = ref_res.data['refresh']
        self.assertNotEqual(old_refresh, new_refresh)

        # Trying to use the old blacklisted refresh token must fail
        reuse_res = self.client.post(self.refresh_url, {'refresh': old_refresh})
        self.assertEqual(reuse_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        reg_res = self.client.post(self.register_url, self.user_data)
        access = reg_res.data['access']
        refresh = reg_res.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        logout_res = self.client.post(self.logout_url, {'refresh_token': refresh})
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        # Refreshing with the blacklisted token must fail
        ref_res = self.client.post(self.refresh_url, {'refresh': refresh})
        self.assertEqual(ref_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_all_devices_invalidates_active_access_tokens(self):
        reg_res = self.client.post(self.register_url, self.user_data)
        access1 = reg_res.data['access']

        # Verify access1 works
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access1}')
        me_res1 = self.client.get(self.me_url)
        self.assertEqual(me_res1.status_code, status.HTTP_200_OK)

        # Logout from all devices
        logout_all_res = self.client.post(self.logout_all_url)
        self.assertEqual(logout_all_res.status_code, status.HTTP_200_OK)

        # Now access1 must be immediately rejected because token_version was incremented
        me_res2 = self.client.get(self.me_url)
        self.assertEqual(me_res2.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(getattr(me_res2.data.get('detail'), 'code', None), 'token_invalidated')


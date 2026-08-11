from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserRole

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, validators=[validate_password])

    class Meta:
        model = User
        fields = ["email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Bu elektron pochta allaqachon ro'yxatdan o'tgan")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Authenticates with {email, password} instead of Django's default username field."""

    username_field = "email"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"] = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Noto'g'ri elektron pochta yoki parol")

        if not user.check_password(password):
            raise serializers.ValidationError("Noto'g'ri elektron pochta yoki parol")
        if not user.is_active:
            raise serializers.ValidationError("Hisob faol emas")

        role_entry = getattr(user, "role_entry", None)
        if role_entry is None:
            raise serializers.ValidationError(
                "Sizda admin roli mavjud emas. Administrator bilan bog'laning."
            )

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "role": role_entry.role,
            "email": user.email,
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        role_entry = getattr(user, "role_entry", None)
        token["role"] = role_entry.role if role_entry else None
        token["email"] = user.email
        return token


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "role"]

    def get_role(self, obj):
        role_entry = getattr(obj, "role_entry", None)
        return role_entry.role if role_entry else None

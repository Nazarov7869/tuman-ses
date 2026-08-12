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


class ChangePasswordSerializer(serializers.Serializer):
    """Self-service password change for the Settings page. Any authenticated
    admin (regardless of role) may change their own password."""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6, validators=[validate_password])

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Joriy parol noto'g'ri")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    """Row shape for the main-only user management list."""

    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "role", "is_active", "date_joined"]

    def get_role(self, obj):
        role_entry = getattr(obj, "role_entry", None)
        return role_entry.role if role_entry else None


class AdminCreateUserSerializer(serializers.ModelSerializer):
    """Lets a `main` admin create a new user and assign its role in one step,
    replacing the register-then-assign-via-/admin/ two-step flow."""

    password = serializers.CharField(write_only=True, min_length=6, validators=[validate_password])
    role = serializers.ChoiceField(choices=UserRole._meta.get_field("role").choices)

    class Meta:
        model = User
        fields = ["id", "email", "password", "role"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Bu elektron pochta allaqachon ro'yxatdan o'tgan")
        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserRole.objects.create(user=user, role=role)
        return user


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    """Lets a `main` admin change an existing user's role or active status."""

    role = serializers.ChoiceField(choices=UserRole._meta.get_field("role").choices, required=False)

    class Meta:
        model = User
        fields = ["role", "is_active"]

    def update(self, instance, validated_data):
        role = validated_data.pop("role", None)
        instance = super().update(instance, validated_data)
        if role is not None:
            UserRole.objects.update_or_create(user=instance, defaults={"role": role})
        return instance

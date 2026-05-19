from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import UserProfile

YES_NO_CHOICES = [("1", "Yes"), ("0", "No")]
SEX_CHOICES    = [("m", "Male"), ("f", "Female")]
SCORE_01       = [("0", "Never / rarely"), ("1", "Always / usually")]
SCORE_0_10     = [(str(i), str(i)) for i in range(11)]

ETHNICITY_CHOICES = [
    ("White European",  "White European"),
    ("Asian",           "Asian"),
    ("south asian",     "South Asian"),
    ("Middle Eastern",  "Middle Eastern"),
    ("Black",           "Black"),
    ("Latino",          "Latino"),
    ("Hispanic",        "Hispanic"),
    ("Others",          "Others"),
]


# ─────────────────────────────────────────────────────────────────────────────
# AUTHENTICATION FORMS
# ─────────────────────────────────────────────────────────────────────────────

class SignUpForm(UserCreationForm):
    """User registration form with role selection."""
    
    first_name = forms.CharField(max_length=30, required=True, label="First Name")
    last_name = forms.CharField(max_length=150, required=True, label="Last Name")
    email = forms.EmailField(required=True, label="Email Address")
    role = forms.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        widget=forms.RadioSelect(attrs={"class": "form-check-input"}),
        label="I am a..."
    )
    phone = forms.CharField(max_length=20, required=False, label="Phone Number")
    organization = forms.CharField(max_length=255, required=False, label="Organization/Clinic (For Doctors)")
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'username', 'password1', 'password2', 'role', 'phone', 'organization')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({"class": "form-control", "placeholder": "Username"})
        self.fields['first_name'].widget.attrs.update({"class": "form-control", "placeholder": "First Name"})
        self.fields['last_name'].widget.attrs.update({"class": "form-control", "placeholder": "Last Name"})
        self.fields['email'].widget.attrs.update({"class": "form-control", "placeholder": "Email"})
        self.fields['password1'].widget.attrs.update({"class": "form-control", "placeholder": "Password"})
        self.fields['password2'].widget.attrs.update({"class": "form-control", "placeholder": "Confirm Password"})
        self.fields['phone'].widget.attrs.update({"class": "form-control", "placeholder": "Phone (Optional)"})
        self.fields['organization'].widget.attrs.update({"class": "form-control", "placeholder": "Organization (For Doctors)"})
    
    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            UserProfile.objects.create(
                user=user,
                role=self.cleaned_data.get('role'),
                phone=self.cleaned_data.get('phone'),
                organization=self.cleaned_data.get('organization')
            )
        return user


class LoginForm(forms.Form):
    """User login form."""
    
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={
            "class": "form-control",
            "placeholder": "Username or Email",
            "autofocus": True
        })
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            "class": "form-control",
            "placeholder": "Password"
        })
    )


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTION FORM
# ─────────────────────────────────────────────────────────────────────────────

class PredictionForm(forms.Form):
    # ── AQ-10 (0 or 1 per question) ──────────────────────────────────────
    a1_score  = forms.ChoiceField(choices=SCORE_01, label="A1 — Notices small sounds others miss", widget=forms.Select(attrs={"class":"form-select"}))
    a2_score  = forms.ChoiceField(choices=SCORE_01, label="A2 — Focuses on whole picture vs details", widget=forms.Select(attrs={"class":"form-select"}))
    a3_score  = forms.ChoiceField(choices=SCORE_01, label="A3 — Can do more than one thing at once", widget=forms.Select(attrs={"class":"form-select"}))
    a4_score  = forms.ChoiceField(choices=SCORE_01, label="A4 — Switches back easily after interruption", widget=forms.Select(attrs={"class":"form-select"}))
    a5_score  = forms.ChoiceField(choices=SCORE_01, label="A5 — Reads between the lines in conversation", widget=forms.Select(attrs={"class":"form-select"}))
    a6_score  = forms.ChoiceField(choices=SCORE_01, label="A6 — Knows when listener is getting bored", widget=forms.Select(attrs={"class":"form-select"}))
    a7_score  = forms.ChoiceField(choices=SCORE_01, label="A7 — Fiction reading seems like a waste of time", widget=forms.Select(attrs={"class":"form-select"}))
    a8_score  = forms.ChoiceField(choices=SCORE_01, label="A8 — Difficulty imagining fictional characters", widget=forms.Select(attrs={"class":"form-select"}))
    a9_score  = forms.ChoiceField(choices=SCORE_01, label="A9 — Fascinated by dates", widget=forms.Select(attrs={"class":"form-select"}))
    a10_score = forms.ChoiceField(choices=SCORE_01, label="A10 — Can work out what someone is thinking/feeling by their face", widget=forms.Select(attrs={"class":"form-select"}))

    # ── Clinical ─────────────────────────────────────────────────────────
    age = forms.FloatField(
        min_value=0, max_value=18, label="Age (years)",
        widget=forms.NumberInput(attrs={"class":"form-control","step":"0.5","min":0,"max":18}))

    qchat_10_score = forms.IntegerField(
        min_value=0, max_value=10, label="Q-CHAT-10 Score (0–10)",
        widget=forms.NumberInput(attrs={
            "class": "form-control",
            "min": 0,
            "max": 10,
            "readonly": "readonly",
            "id": "id_qchat_10_score",
            "aria-readonly": "true",
        }))

    social_responsiveness_scale = forms.FloatField(
        min_value=0, max_value=10, required=False, label="Social Responsiveness Scale — SRS (0–10)",
        widget=forms.NumberInput(attrs={"class":"form-control","step":"0.5","min":0,"max":10}))

    childhood_autism_rating_scale = forms.FloatField(
        min_value=15, max_value=60, label="Childhood Autism Rating Scale — CARS (15–60)",
        widget=forms.NumberInput(attrs={"class":"form-control","step":"0.5","min":15,"max":60}))

    # ── Demographics ─────────────────────────────────────────────────────
    sex       = forms.ChoiceField(choices=SEX_CHOICES, label="Sex", widget=forms.Select(attrs={"class":"form-select"}))
    ethnicity = forms.ChoiceField(choices=ETHNICITY_CHOICES, label="Ethnicity", widget=forms.Select(attrs={"class":"form-select"}))
    jaundice  = forms.ChoiceField(choices=YES_NO_CHOICES, label="Born with Jaundice?", widget=forms.Select(attrs={"class":"form-select"}))
    family_mem_with_asd = forms.ChoiceField(choices=YES_NO_CHOICES, label="Family member with ASD?", widget=forms.Select(attrs={"class":"form-select"}))

    # ── Co-occurring conditions ───────────────────────────────────────────
    speech_delay              = forms.ChoiceField(choices=YES_NO_CHOICES, label="Speech Delay / Language Disorder?", widget=forms.Select(attrs={"class":"form-select"}))
    learning_disorder         = forms.ChoiceField(choices=YES_NO_CHOICES, label="Learning Disorder?", widget=forms.Select(attrs={"class":"form-select"}))
    genetic_disorders         = forms.ChoiceField(choices=YES_NO_CHOICES, label="Genetic Disorders?", widget=forms.Select(attrs={"class":"form-select"}))
    depression                = forms.ChoiceField(choices=YES_NO_CHOICES, label="Depression?", widget=forms.Select(attrs={"class":"form-select"}))
    global_developmental_delay= forms.ChoiceField(choices=YES_NO_CHOICES, label="Global Developmental Delay / Intellectual Disability?", widget=forms.Select(attrs={"class":"form-select"}))
    social_behavioural_issues = forms.ChoiceField(choices=YES_NO_CHOICES, label="Social / Behavioural Issues?", widget=forms.Select(attrs={"class":"form-select"}))
    anxiety_disorder          = forms.ChoiceField(choices=YES_NO_CHOICES, label="Anxiety Disorder?", widget=forms.Select(attrs={"class":"form-select"}))

    def clean(self):
        cleaned = super().clean()
        if cleaned:
            aq_total = sum(int(cleaned[f"a{i}_score"]) for i in range(1, 11))
            cleaned["qchat_10_score"] = min(10, max(0, aq_total))
        return cleaned

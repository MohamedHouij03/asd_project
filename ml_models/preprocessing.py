"""
Robust preprocessing for ASD dataset (clean unified version)
"""

import re
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer


# ─────────────────────────────────────────────
# 🔥 FINAL CLEAN COLUMN ALIASES
# ─────────────────────────────────────────────
COLUMN_ALIASES = {
    'A1': ['A1', 'A1_Score'],
    'A2': ['A2', 'A2_Score'],
    'A3': ['A3', 'A3_Score'],
    'A4': ['A4', 'A4_Score'],
    'A5': ['A5', 'A5_Score'],
    'A6': ['A6', 'A6_Score'],
    'A7': ['A7', 'A7_Score'],
    'A8': ['A8', 'A8_Score'],
    'A9': ['A9', 'A9_Score'],
    'A10': ['A10', 'A10_Score', 'A10_Autism_Spectrum_Quotient'],

    'Age_Years': ['Age_Years', 'Age', 'age'],
    'Qchat-10-Score': ['Qchat_10_Score', 'Qchat-10-Score'],
    'CARS': ['Childhood Autism Rating Scale', 'CARS'],

    'Sex': ['Sex', 'Gender'],
    'Ethnicity': ['Ethnicity'],

    'Jaundice': ['Jaundice'],
    'Family_mem_with_ASD': ['Family_mem_with_ASD'],

    'Speech Delay/Language Disorder': ['Speech Delay/Language Disorder'],
    'Learning disorder': ['Learning disorder'],
    'Genetic_Disorders': ['Genetic_Disorders'],
    'Depression': ['Depression'],
    'Global developmental delay/intellectual disability': [
        'Global developmental delay/intellectual disability'
    ],
    'Social/Behavioural Issues': ['Social/Behavioural Issues'],
    'Anxiety disorder': ['Anxiety_disorder', 'Anxiety disorder'],

    # ✅ FINAL TARGET (ONLY ONE)
    'ASD_traits': ['ASD_traits', 'Class/ASD', 'ASD']
}


# ─────────────────────────────────────────────
def _nk(x):
    return re.sub(r"\s+", " ", str(x).strip().lower())


_ALIAS_MAP = {}
for canon, aliases in COLUMN_ALIASES.items():
    for a in aliases:
        _ALIAS_MAP[_nk(a)] = canon


def build_column_map(cols):
    return {c: _ALIAS_MAP[_nk(c)] for c in cols if _nk(c) in _ALIAS_MAP}


# ─────────────────────────────────────────────
def clean_raw_dataframe(df):
    df = df.copy()

    df.columns = [c.strip() for c in df.columns]
    df.rename(columns=build_column_map(df.columns), inplace=True)

    # yes/no → 1/0
    yn_cols = [
        'Jaundice', 'Family_mem_with_ASD',
        'Speech Delay/Language Disorder', 'Learning disorder',
        'Genetic_Disorders', 'Depression',
        'Global developmental delay/intellectual disability',
        'Social/Behavioural Issues', 'Anxiety disorder'
    ]

    for c in yn_cols:
        if c in df.columns:
            df[c] = df[c].astype(str).str.lower().map({
                'yes': 1, 'no': 0, 'true': 1, 'false': 0,
                '1': 1, '0': 0
            }).fillna(0).astype(int)

    # sex
    if 'Sex' in df.columns:
        df['Sex'] = df['Sex'].astype(str).str.lower().map({
            'm': 1, 'male': 1, 'f': 0, 'female': 0
        }).fillna(0).astype(int)

    # AQ scores
    for i in range(1, 11):
        col = f'A{i}'
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # numeric
    for col in ['Age_Years', 'Qchat-10-Score']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df[col] = df[col].fillna(df[col].median())

    # target → FINAL FIX
    if 'ASD_traits' in df.columns:
        df['ASD_traits'] = df['ASD_traits'].astype(str).str.upper().map({
            'YES': 1, 'NO': 0, '1': 1, '0': 0,
            'TRUE': 1, 'FALSE': 0,
            'ASD': 1
        }).fillna(0).astype(int)

    return df


# ─────────────────────────────────────────────
NUMERIC_COLS = [f'A{i}' for i in range(1, 11)] + ['Age_Years', 'Qchat-10-Score']
BINARY_COLS = [
    'Sex', 'Jaundice', 'Family_mem_with_ASD',
    'Speech Delay/Language Disorder', 'Learning disorder',
    'Genetic_Disorders', 'Depression',
    'Global developmental delay/intellectual disability',
    'Social/Behavioural Issues', 'Anxiety disorder'
]
CATEGORICAL_COLS = ['Ethnicity']

TARGET_COL = 'ASD_traits'


def get_available_feature_cols(df):
    return (
        [c for c in NUMERIC_COLS if c in df.columns],
        [c for c in BINARY_COLS if c in df.columns],
        [c for c in CATEGORICAL_COLS if c in df.columns],
    )


def build_preprocessor(numeric_cols, binary_cols, categorical_cols):
    return ColumnTransformer([
        ('num', Pipeline([
            ('imp', SimpleImputer(strategy='median')),
            ('sc', StandardScaler())
        ]), numeric_cols),

        ('bin', Pipeline([
            ('imp', SimpleImputer(strategy='most_frequent'))
        ]), binary_cols),

        ('cat', Pipeline([
            ('imp', SimpleImputer(strategy='most_frequent')),
            ('ohe', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ]), categorical_cols),
    ])
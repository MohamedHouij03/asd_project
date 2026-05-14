#!/usr/bin/env python3
"""
scripts/inspect_columns.py
Run this FIRST to see your dataset's actual column names.
Usage: python scripts/inspect_columns.py
"""
import os, sys
import pandas as pd

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH    = os.path.join(PROJECT_ROOT, 'data', 'data_csv.csv')

df = pd.read_csv("./data/data_csv.csv")
print(f"\nShape: {df.shape[0]} rows × {df.shape[1]} columns\n")
print("─" * 60)
print(f"{'#':<4} {'Column Name':<45} {'Dtype':<12} {'Sample Values'}")
print("─" * 60)
for i, col in enumerate(df.columns):
    sample = df[col].dropna().unique()[:3].tolist()
    print(f"{i:<4} {repr(col):<45} {str(df[col].dtype):<12} {sample}")
print("─" * 60)

from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')
CORS_ALLOWED_ORIGINS = [
    'https://creative-studio-phi.vercel.app/',
    'https://creative-studio-production-01bd.up.railway.app/'
]
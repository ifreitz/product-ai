import json
import google.generativeai as genai

from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings

genai.configure(api_key=settings.GENAI_API_KEY)


def index(request):
    return render(request, 'index.html')


def get_response(request):
    data = json.loads(request.body)
    model = genai.GenerativeModel("tunedModels/finetune-v1-j3o4eebpphhb")

    messages = [f"{message.get('text')}" for message in data]
    
    # model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(messages)
    return JsonResponse({'response': response.text})

import os
import tempfile
import json

import google.generativeai as genai

from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings

genai.configure(api_key=settings.GENAI_API_KEY)


def index(request):
    return render(request, 'ocr_index.html')


def get_response(request):
    image = request.FILES.get('image')
    
    # Define the directory for temporary files
    temp_dir = os.getcwd()  # Use the current working directory
    
    # Get the file extension from the uploaded image's content type
    file_extension = os.path.splitext(image.name)[1]  # Get the extension from the original file name
    temp_file_name = f'temp_file{file_extension}'  # Create a temporary file name with the correct extension
    
    # Save the uploaded file to a temporary location in the specified directory
    with tempfile.NamedTemporaryFile(delete=False, dir=temp_dir, prefix='temp_file_', suffix=file_extension) as temp_file:
        for chunk in image.chunks():
            temp_file.write(chunk)
        temp_file.flush()  # Ensure all data is written
        
        # Use the temporary file's name for upload
        file_path = temp_file.name
    
    file = genai.upload_file(file_path)  # Pass the file path instead of the InMemoryUploadedFile
    
    # Note: Do not delete the temporary file to maintain the image file
    os.remove(file_path)  # Commented out to keep the temporary file
    
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    result = model.generate_content([file, "\n\n", "Based on the provided receipt in the image. Can you extract the information? Give me a response in a JSON format using this template:\n{\n  \"general_information\": {\n    \"receipt_number\": \"\",\n    \"date_of_receipt\": \"Use this format MM/DD/YYYY\",\n    \"issuer_name\": \"\",\n    \"issuer_tin\": \"\",\n    \"issuer_address\": \"\",\n    \"goods_or_services_description\": \"\",\n    \"total_amount\": 0.00,\n    \"payment_method\": \"\",\n    \"vat_amount\": 0.00,\n    \"vat_percentage\": 0.00,\n    \"payee_name\": \"\",\n    \"payee_tin\": \"\",\n    \"payee_address\": \"\",\n  },\n  \"accuracy\": {\n    \"accuracy_score\": \"Scale of 1-100\",\n    \"accuracy_message\": \"Message to user\"\n  }\n}"])
    
    try:
        result_json = json.loads(result.text)
    except json.JSONDecodeError:
        result_json = {"error": "Failed to decode JSON from the result."}

    return JsonResponse(result_json)

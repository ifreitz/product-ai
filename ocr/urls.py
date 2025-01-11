from django.urls import path
from ocr import views

urlpatterns = [
    path('', views.index, name='index'),
    path('get-response/', views.get_response, name='get_response'),
]

from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

def hello(request):
    return render(request,"calendar.html")

from django.http import JsonResponse
import json

@csrf_exempt
def add_event(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)   # parse JSON
            text = data.get("text")           # extract text

            print("User said:", text)

            # For now, just return it back
            return JsonResponse({
                "status": "success",
                "received_text": text
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

    return JsonResponse({"error": "Only POST allowed"}, status=405)


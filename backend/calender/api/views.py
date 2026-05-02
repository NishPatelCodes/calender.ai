from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from google import genai
from django.http import JsonResponse
import json
from google import genai


def hello(request):
    return render(request,"calendar.html")

@csrf_exempt
def ai_response(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)   # parse JSON
            user_input = data.get("user_input")           # extract user_input

            #AI integration

            #gemini client checks API key in your env variables
            client = genai.Client()

            #pass model and query
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"""
                Convert the following input into JSON.

                User input: {user_input}

                Return ONLY valid JSON:
                {{
                    "action": "add_event",
                    "title": "...",
                    "date": "YYYY-MM-DD"
                }}
                """
            )
            print(response.text)
            data = json.loads(response.text)
            return JsonResponse(data)


        except json.JSONDecodeError:
            return JsonResponse(
                {"error": "Invalid JSON returned by model"},
                status=500
            )
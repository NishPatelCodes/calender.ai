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
def add_event(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)   # parse JSON
            user_input = data.get("user_input")           # extract user_input

            #AI integration

            #gemini client checks API key in your env variables
            client = genai.Client()

            #pass model and query
            response = client.models.generate_content(
                model="gemini-3-flash-preview", 
                contents = f"""
                    Convert the following input into JSON.
                    User input: {user_input}
                    Return ONLY valid JSON in this format:
                    {{
                    "action": "add_event",
                    "title": "...",
                    "date": "YYYY-MM-DD"
                    }}
                    """)
            
            #Get the valid JSON from AI 
            print(response.text)





            #PENDING
            #return response.txt to frontend
            #In frontend, make logical function to execute json to action
            #Pass that json response to the function
            #Test




            print("User said:", user_input)

            # For now, just return it back
            return JsonResponse({
                "status": "success",
                "received_user_input": user_input
            })

        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e)
            }, status=400)

    return JsonResponse({"error": "Only POST allowed"}, status=405)
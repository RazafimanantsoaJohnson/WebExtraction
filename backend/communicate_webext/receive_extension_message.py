import json
from communicate_webext.register_new_project import register_project

def receive_message(text_message):
    try:
        json_message= json.loads(text_message)
        if json_message["command"] != None:
            command= json_message["command"]
            match command:
                case "register":
                    print("We were asked to register a new extraction")
                    register_project(json_message["url"])
    except Exception as exception:
        print(exception)
        raise Exception("We were unable to read the extension's message") 



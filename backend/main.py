from fastapi import FastAPI, WebSocket

from my_tests.test_ws import write_data_in_file
from communicate_webext.register_new_project import register_project
from communicate_webext.receive_extension_message import receive_message
from communicate_webext.send_actions import send_actions

app= FastAPI()

@app.get("/")
def hello_world():
    register_project("https://extraction_project_test2.com")
    return "Hello Jojo BG"

# make an endpoint for WebSockets
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data= await websocket.receive_text()
        # print(data)
        # receive_message(data)
        write_data_in_file(data)
        await websocket.send_text(f"Message received from backend: {data}")

@app.websocket("/command")
async def websocket_commands(websocket: WebSocket):
    await websocket.accept()
    # print("sending the first message")
    # await websocket.send_text("send")
    while True:
        data= await websocket.receive_json()
        match data["title"]:
            case "html_page":
                write_data_in_file(data["htmlPage"])
            case "page-status":
                print(data["url"])
                print("checking status")
                if data["state"]== "loaded":
                    print("sending actions")
                    await websocket.send_json({ "title": "actions" , "data": send_actions()})
            case "confirmation":
                print(data)
            case "return-data":
                print(data)
                write_data_in_file(data["data"])
            case "error":
                print(data)
        await websocket.send_text(f"We received: {data}")


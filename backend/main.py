from fastapi import FastAPI, WebSocket

from my_tests.test_ws import write_data_in_file
from communicate_webext.register_new_project import register_project
from communicate_webext.receive_extension_message import receive_message

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
    while True:
        data= await websocket.receive_text()
        print(data)
        receive_message(data)
        await websocket.send_text(f"We received: {data}")


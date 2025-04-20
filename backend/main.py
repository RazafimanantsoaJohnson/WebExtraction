from fastapi import FastAPI, WebSocket

from my_tests.test_ws import write_data_in_file

app= FastAPI()

@app.get("/")
def hello_world():
    return "Hello Jojo BG"

# make an endpoint for WebSockets
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data= await websocket.receive_text()
        write_data_in_file(data)
        await websocket.send_text(f"Message received from backend: {data}")

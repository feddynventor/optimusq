import websocket
try:
    import thread
except ImportError:
    import _thread as thread
import time

numero = -1

with open('C:/numcassa.bin', 'r') as filename:
  numero = int(filename.read())

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send("{\"cassa\":%d}" % numero)

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://10.0.0.4:7000/",
                              on_open = on_open,
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)

    ws.run_forever()
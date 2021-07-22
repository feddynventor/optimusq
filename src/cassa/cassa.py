import sys
import os
# from PyQt5.QtWidgets import QApplication, QWidget, QLabel, QGridLayout, QPushButton
# from PyQt5.QtWidgets import *
# from PyQt5.QtGui import QIcon
# from PyQt5.QtCore import pyqtSlot
from PyQt5.QtCore import *
from PyQt5.QtWidgets import * 
from PyQt5.QtGui import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5 import QtWidgets


global ws, t1, t2   #thread e websocket
numero = "-1"
busy = False
hostname = "127.0.0.1"
port = "7000"
size = "200x500"

if not os.path.isfile(os.path.abspath(os.path.dirname(sys.argv[0]))+'\\cassa.txt'):
    print("CREARE UN FILE cassa.txt NELLA DIRECTORY "+sys.path[0])
    input()
    exit()
with open(os.path.abspath(os.path.dirname(sys.argv[0]))+'\\cassa.txt', 'r') as ff:
    data = ff.readlines()
    numero = data[0].split("=")[-1].rstrip("\n\r")
    hostname = data[1].split("=")[-1].rstrip("\n\r")
    size = data[2].split("=")[-1].rstrip("\n\r")
    position = data[3].split("=")[-1].rstrip("\n\r")
    port = data[4].split("=")[-1].rstrip("\n\r")


def window():
    global closeBtn, nextBtn, prevBtn
    app = QApplication(sys.argv)
    grid = QGridLayout()

    win = QWidget()
    win.setWindowFlags(Qt.WindowStaysOnTopHint)
    win.setWindowFlag(Qt.FramelessWindowHint)

    pos_x = int(position.split(";")[0])
    pos_y = int(position.split(";")[1])
    if (pos_x<0):
        pos_x = app.primaryScreen().size().width()-int(size.split("x")[0])+pos_x
    if (pos_y<0):
        pos_y = app.primaryScreen().size().height()-int(size.split("x")[1])+pos_y
    win.setGeometry(pos_x,pos_y,int(size.split("x")[0]),int(size.split("x")[1]))

    grid.setContentsMargins(0,0,0,0)

    nextBtn = QPushButton("AVANTI")
    nextBtn.setFixedHeight(int(size.split("x")[1])*3/5)
    nextBtn.setStyleSheet("QPushButton {background-color: #EEEEF2; font-size: 20px}")
    grid.addWidget(nextBtn,1,1,1,2)  #r1 e c1 con span di 2 nella r1

    prevBtn = QPushButton("INDIETRO")
    prevBtn.setFixedHeight(int(size.split("x")[1])*1/5)
    prevBtn.setStyleSheet('QPushButton {background-color: #EEEEF2}')
    grid.addWidget(prevBtn,2,1)

    closeBtn = QPushButton("CHIUDI")
    closeBtn.setFixedHeight(int(size.split("x")[1])*1/5)
    closeBtn.setStyleSheet('QPushButton {background-color: #EEEEF2}')
    grid.addWidget(closeBtn,2,2)

    nextBtn.clicked.connect(ws_next)
    closeBtn.clicked.connect(ws_busy) 
    prevBtn.clicked.connect(ws_prev) 

    win.setLayout(grid)
    win.setWindowTitle("OptimusQ - Client")
    win.show()
    sys.exit(app.exec_())


import websocket
import time

try:
    import thread
except ImportError:
    import _thread as thread

def on_message(ws, message):
    print(message)

def on_error(wss, error):
    print(error)
    global nextBtn
    nextBtn.setText("ERRORE SISTEMA!")

def on_close():
    print("### closed ###")

def on_open(ws):
    ws.send("{\"cassa\":\"%s\", \"busy\":false}" % numero)

def ws_next():
    ws.send("{\"cassa\":\"%s\",\"dir\":1}" % numero)
    threading.Thread(target=lamp).start()

def lamp():
    global nextBtn
    t_end = time.time() + 2
    status = True
    while time.time() < t_end:
        if status:
            nextBtn.setStyleSheet('QPushButton {background-color: #EEEEF2; font-size: 20px}')
        else:
            nextBtn.setStyleSheet('QPushButton {background-color: #EE005F; font-size: 20px}')
        status = not status
        time.sleep(0.1)
    nextBtn.setStyleSheet('QPushButton {background-color: #EEEE5F; font-size: 20px}')
    exit()
    
def ws_prev():
    global ws
    ws.send("{\"cassa\":\"%s\",\"dir\":-1}" % numero)

def ws_busy():
    global closeBtn, nextBtn, prevBtn
    global ws
    global busy
    if busy:
        nextBtn.setEnabled(True)
        closeBtn.setStyleSheet('QPushButton {background-color: #EEEEF2}')
        closeBtn.setText("CHIUDI")
    else:
        nextBtn.setEnabled(False)
        closeBtn.setStyleSheet('QPushButton {background-color: #EE005F}')
        closeBtn.setText("APRI")
    busy = not busy
    ws.send("{\"cassa\":\"%s\", \"busy\":1}" % numero)


import threading
if __name__ == '__main__':
    # global ws, t1, t2
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://"+str(hostname)+":"+port+"/",
                              on_open = on_open,
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)

    t1 = threading.Thread(target=window)
    t2 = threading.Thread(target=ws.run_forever)
    t1.start()
    t2.start()
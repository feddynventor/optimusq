from tkthread import tk, TkThread
from tkinter import *
import tkinter.font as font
import os

import websocket
try:
    import thread
except ImportError:
    import _thread as thread
import time

global ws, t1, t2   #thread e websocket
numero = "-1"
busy = False
hostname = ""
size = "200x500"

if not os.path.isfile('C:/numcassa.bin'):
    print("CREARE UN FILE numcassa.bin NELLA DIRECTORY C:\\")
    input()
    exit()
with open('C:/numcassa.bin', 'r') as ff:
  data = ff.readlines()
  numero = data[0].rstrip("\n\r")
  hostname = data[1].rstrip("\n\r")
  size = data[2].rstrip("\n\r")

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    ws.send("{\"cassa\":\"%s\", \"busy\":false}" % numero)


def next():
    global ws
    ws.send("{\"cassa\":\"%s\"}" % numero)

def busy():
    global ws
    global busy
    busy = not busy
    if busy:
        closeBtn.configure(text="CHIUDI")
        closeBtn.configure(bg="white")
        nextBtn.configure(state="normal")
    else:
        closeBtn.configure(text="APRI")
        closeBtn.configure(bg="red")
        nextBtn.configure(state="disabled")
    ws.send("{\"cassa\":\"%s\", \"busy\":1}" % numero)

master_window = tk.Tk()
master_window.geometry(size)

master_window.attributes('-topmost', True)
master_window.wm_attributes('-toolwindow', True)
master_window.update()

master_window.columnconfigure(0, weight=1)
master_window.rowconfigure(1, weight=1)

buttons_frame = Frame(master_window)
buttons_frame.grid(row=0, column=0, columnspan=3, sticky=W+E)

buttons_frame.rowconfigure(0, weight=1)
buttons_frame.columnconfigure(0, weight=1)

closeBtn = Button(buttons_frame, text='CHIUDI', bg="white", font=font.Font(size=25), command=busy)
closeBtn.grid(row=0, column=0, padx=6, pady=4, sticky=E+W+N+S)

# Group1 Frame ----------------------------------------------------
group1 = Frame(master_window, padx=2, pady=0)
group1.grid(row=1, column=0, padx=4, pady=4, sticky=E+W+N+S)

group1.rowconfigure(0, weight=1)
group1.columnconfigure(0, weight=1)

nextBtn = Button(group1, text='AVANTI', font=font.Font(size=30), command=next)
nextBtn.grid(row=0, column=0, sticky=E+W+N+S)

# make the thread-safe callable
tkt = TkThread(master_window)

import threading, time
def run(func):
    global ws, t1, t2
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://"+str(hostname)+":7000/",
                              on_open = on_open,
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)

    t1 = threading.Thread(target=func)
    t2 = threading.Thread(target=ws.run_forever)
    t1.start()
    t2.start()

run(lambda: tkt(master_window.wm_title,''))

master_window.update()
def on_closing():
    lambda:None

master_window.protocol("WM_DELETE_WINDOW", on_closing)
master_window.mainloop()


from PyQt5.QtCore import *
from PyQt5.QtWidgets import * 
from PyQt5.QtGui import *
from PyQt5.QtWebEngineWidgets import *
from PyQt5 import QtWidgets

import sys
import os

# COMPILAZIONE - Copiare
# QtWebEngineProcess.exe da .\PyQt5\Qt\bin
# tutti i file da .\PyQt5\Qt\resources
# i file index.html e app.js e la dir assets\
# nella ROOT con l'eseguibile

class MainWindow(QMainWindow):

    def __init__(self, *args, **kwargs):
        super(MainWindow,self).__init__(*args, **kwargs)

        screenRes = QtWidgets.QDesktopWidget().screenGeometry(-1)

        self.setWindowFlags(Qt.WindowStaysOnTopHint)
        self.setWindowFlag(Qt.FramelessWindowHint)

        if not os.path.isfile(os.path.abspath(os.path.dirname(sys.argv[0]))+'\\display.conf'):
            print("CREARE UN FILE display.conf NELLA DIRECTORY "+sys.path[0])
            input()
            exit()
        with open(os.path.abspath(os.path.dirname(sys.argv[0]))+"\\display.conf", "r") as config:
            file_data = config.readlines()
            print(file_data[1].split("=")[-1])
            if ("no" in file_data[1].split("=")[-1]):
                dim = file_data[5].split("=")[-1].split("x")
                self.setFixedSize( float(dim[0]), float(dim[1]) )
                pos = file_data[6].split("=")[-1].split(";")
                self.move( float(pos[0]), float(pos[1]) )
            elif ("destra" in file_data[1].split("=")[-1]):
                self.setFixedSize(screenRes.width()/float(file_data[3].split("=")[-1]), screenRes.height()/float(file_data[4].split("=")[-1]))
                if ("sopra" in file_data[2].split("=")[-1]):
                    self.move(float(screenRes.width()-screenRes.width()/float(file_data[3].split("=")[-1]))+1,0)
                else:
                    self.move(float(screenRes.width()-screenRes.width()/float(file_data[3].split("=")[-1]))+1, screenRes.height()-screenRes.height()/float(file_data[4].split("=")[-1]))
            elif ("sinistra" in file_data[1].split("=")[-1]):
                self.setFixedSize(screenRes.width()/float(file_data[3].split("=")[-1]), screenRes.height()/float(file_data[4].split("=")[-1]))
                if ("sopra" in file_data[2].split("=")[-1]):
                    self.move(0,0)
                else:
                    self.move(0, screenRes.height()-screenRes.height()/float(file_data[4].split("=")[-1]))

        self.browser = QWebEngineView()
        self.browser.page().settings().setAttribute(QWebEngineSettings.PlaybackRequiresUserGesture, False)

        self.browser.page().setZoomFactor(0.5)

        self.browser.setUrl(QUrl.fromLocalFile(os.path.abspath(os.path.dirname(sys.argv[0]))+"\\index.html"))

        self.setCentralWidget(self.browser)

        self.show()

app = QApplication(sys.argv)
window = MainWindow()

app.exec_()
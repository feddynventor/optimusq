from tkinter import *

#------------------------------------

def addBox():
    # nomecassa = StringVar()
    # nomecassa.set(cassa)
    # numcassa = StringVar()
    # numcassa.set(numero)

    frame = Frame(root)
    frame.pack()

    ent1 = Entry(frame, borderwidth=5)
    # ent1.configure(textvariable=entryText)
    ent1.grid(row=0, column=0)

    # Label(frame, text='To').grid(row=0, column=1)

    ent2 = Entry(frame)
    ent2.grid(row=0, column=1)

    all_entries.append( (ent1, ent2) )

#------------------------------------

def showEntries():
    frame = Frame(root)

    for number, (ent1, ent2) in enumerate(all_entries):
        print( number, ent1.get(), ent2.get())

#------------------------------------

all_entries = []

root = Tk()

showButton = Button(root, text='Show all text', command=showEntries)
showButton.pack()

addboxButton = Button(root, text='<Add Time Input>', fg="Red", command=addBox)
addboxButton.pack()

root.attributes('-topmost', True)
root.wm_attributes('-toolwindow', True)
root.update()

root.mainloop()
from tkinter import *

master_window = Tk()
master_window.geometry("200x450")

master_window.attributes('-topmost', True)
master_window.wm_attributes('-toolwindow', True)
master_window.update()

master_window.columnconfigure(0, weight=1)
master_window.rowconfigure(1, weight=1)

buttons_frame = Frame(master_window)
buttons_frame.grid(row=0, column=0, sticky=W+E)

buttons_frame.rowconfigure(0, weight=1)
buttons_frame.columnconfigure(0, weight=1)

closeBtn = Button(buttons_frame, text='CHIUDI')
closeBtn.grid(row=0, column=0, padx=6, pady=4)

# Group1 Frame ----------------------------------------------------
group1 = Frame(master_window, padx=2, pady=0)
group1.grid(row=1, column=0, padx=4, pady=4, sticky=E+W+N+S)

group1.rowconfigure(0, weight=1)
group1.columnconfigure(0, weight=1)

nextBtn = btn_Image = Button(group1, text='AVANTI')
nextBtn.grid(row=0, column=0, sticky=E+W+N+S)

mainloop()
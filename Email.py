import requests
import smtplib
import ssl
import time
import datetime

url = 'https://api.thingspeak.com/channels/""/feeds.json?api_key=""'

# wait untill 12:01:00
while True:
    current_time = datetime.datetime.now()
    # print(current_time)
    hour = current_time.hour
    minute = current_time.minute
    second = current_time.second
    micro = current_time.microsecond
    if(hour == 0 and minute == 0 and second == 0):
        break
    time.sleep(0.001)

while(True):
    r = requests.get(url)
    my_json = r.json()
    data_points = my_json['feeds']

    volume_last_day = 0
    for i in range(0, len(data_points)//2):
        # print(data_points[i]['field1'])
        volume_last_day += int(data_points[i]['field1'])*120/1000

    volume = 0
    for i in range(len(data_points)//2, len(data_points)):
        # print(data_points[i]['field1'])
        volume += int(data_points[i]['field1'])*120/1000

    # reduce decimal places to 2
    volume = round(volume, 2)

    # send email of daily volume
    port = 587
    smtp_server = "smtp-mail.outlook.com"
    sender = "eswwaterflow@outlook.com"
    recipient = "siddhjain44@gmail.com"
    sender_password = "eswteam7"
    SUBJECT = "Water Wastage"
    TEXT = "Wasted water in last 24 hours: " + str(volume) + " L."
    message = 'Subject: {}\n\n{}'.format(SUBJECT, TEXT)

    SSL_context = ssl.create_default_context()
    with smtplib.SMTP(smtp_server, port) as server:
        server.starttls(context=SSL_context)
        server.login(sender, sender_password)
        server.sendmail(sender, recipient, message)

    # send email if no data in two  days
    if(volume_last_day < 0 and volume_last_day < 0):
        port = 587
        smtp_server = "smtp-mail.outlook.com"
        sender = "eswwaterflow@outlook.com"
        recipient = "siddhjain44@gmail.com"
        sender_password = "eswteam7"
        SUBJECT = "Water Wastage Sensor Alert"
        TEXT = "No water flow detected in last 48 hours. Please check the water flow sensor."
        message = 'Subject: {}\n\n{}'.format(SUBJECT, TEXT)
        SSL_context = ssl.create_default_context()
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls(context=SSL_context)
            server.login(sender, sender_password)
            server.sendmail(sender, recipient, message)

    # wait for 24 hours
    time.sleep(86400)
import paho.mqtt.client as mqtt
from imdb import imdb_search


MQTT_Topic = "Movies/test"
mqttBroker ="broker.mqttdashboard.com"

def on_message(client, userdata, message):
    print("received message: " ,str(message.payload.decode("utf-8")))
    if len(message.payload.decode("utf-8")) > 0:
        content= imdb_search(str(message.payload.decode("utf-8")))
        client.publish("Movies/content", str(content))

    
client = mqtt.Client("Sniffer")
client.connect(mqttBroker) 


client.subscribe(MQTT_Topic)
client.on_message=on_message
client.loop_forever() 


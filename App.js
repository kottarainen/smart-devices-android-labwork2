import React, { Component } from 'react';
import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
} from 'react-native';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

export default class App extends Component {

  constructor() {
    super();
    this.onMessageArrived = this.onMessageArrived.bind(this);
    this.onConnectionLost = this.onConnectionLost.bind(this);

    const client = new Paho.MQTT.Client('broker.mqttdashboard.com', 8000, 'clientId-jO8ppprP');
    client.onMessageArrived = this.onMessageArrived;
    client.onConnectionLost = this.onConnectionLost;
    client.connect({
      onSuccess: this.onConnect,
      useSSL: false,
      onFailure: (e) => { console.log("here is the error", e); }
    });

    this.state = {
      sentMessages: [''],
      receivedMessages: [''],
      client,
      messageToSend: '',
      isConnected: false,
    };
  }

  onMessageArrived(entry) {
    console.log("onMessageArrived:" + entry.payloadString);
    this.setState({ receivedMessages: [...this.state.receivedMessages, entry.payloadString] });
  }

  onConnect = () => {
    const { client } = this.state;
    console.log("Connected!!!!");
    client.subscribe('Movies/content');
    this.setState({ isConnected: true, error: '' });
  };

  sendMessage() {
    console.log(this.state.messageToSend);
    const message = new Paho.MQTT.Message(this.state.messageToSend);
    message.destinationName = "Movies/test";

    if (this.state.isConnected) {
      console.log("Sending messages...\n");
      this.setState({ sentMessages: [...this.state.sentMessages, this.state.messageToSend] });
      this.state.client.send(message);
    }
  }

  onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
      this.setState({ error: 'Lost Connection', isConnected: false });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native MQTT!
        </Text>
        <Text style={styles.instructions}>
          Sent Messages: {this.state.sentMessages.join(' --- ')}
        </Text>
        <Text style={styles.instructions}>
          Received Messages: {this.state.receivedMessages.join(' --- ')}
        </Text>
        <Text style={{ color: 'red' }}>
          {this.state.error}
        </Text>
        {this.state.isConnected ?
          <Text style={{ color: 'green' }}>
            Connected
          </Text> : null
        }
        <TextInput
          value={this.state.messageToSend}
          onChangeText={(value => this.setState({ messageToSend: value }))}
          placeholder="Your message..."
          style={styles.input} />
        <Button onPress={this.sendMessage.bind(this)} title="Send Message" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'blue',
  },
  input: {
    width: 300
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

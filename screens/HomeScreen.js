import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

//Dummy Screen
const HomeScreen = () => {
    return (
        <View style = {styles.container}>
            <Text style={styles.text}>HomeScreen</Text>
            <Button
                title="Click Here"
                onPress={() => alert('Button Clicked!')}
            />
        </View>
    )

}

export default HomeScreen;

const styles = StyleSheet.create({
    text: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    container: {
      flex: 1,
      backgroundColor: '#0c0129',
      justifyContent: 'center',
      alignItems: 'center',
    },


})
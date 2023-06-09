import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

//Dummy Screen
const AnalyticsScreen = () => {
    return (
        <View style = {styles.container}>
            <Text style={styles.text}>AnalyticsScreen</Text>
            <Button
                title="Click Here"
                onPress={() => alert('Button Clicked!')}
            />
        </View>
    )

}

export default AnalyticsScreen;

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
import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';

//Dummy Screen
const AnalyticsScreen = () => {
    return (
        <View style = {styles.container}>
            <Text>AnalyticsScreen</Text>
            <Button
                title="Click Here"
                onPress={() => alert('Button Clicked!')}
            />
        </View>
    )

}

export default AnalyticsScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E8EAED',
      justifyContent: 'center',
      alignItems: 'center',
    },


})